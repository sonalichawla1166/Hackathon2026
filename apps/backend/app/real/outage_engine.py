"""Real outage data: the DB has always had an `Outage` table (id, ts_start,
ts_end, lat/lon, area, cause, customers_affected, status) but nothing ever
seeded or queried it, so /outages/* served four fixed schematic pins
instead. seed.py now seeds ~8 events across the same Nassau/Suffolk
footprint as the customers; this module queries them and returns each pin's
real lat/lon (for the tiled MapCanvas) alongside the legacy 0-1 x/y layout
(for the schematic overlay), both centered on the demo customer's real
location, plus lets a customer report a new outage that's actually persisted.
"""
from __future__ import annotations

import random
import string
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import db as models
from .geo import distance_label, haversine_km, map_xy

MAP_RADIUS_KM = 20.0
NEARBY_KM = 3.2  # ~2 miles
RESTORING_WINDOW_HOURS = 3  # how long a resolved event still shows as "restoring"


def _active(db: Session) -> list[models.Outage]:
    return list(db.scalars(select(models.Outage).where(models.Outage.status == "active")).all())


def _recently_restored(db: Session) -> list[models.Outage]:
    cutoff = datetime.utcnow() - timedelta(hours=RESTORING_WINDOW_HOURS)
    return list(db.scalars(
        select(models.Outage).where(models.Outage.status == "resolved", models.Outage.ts_end >= cutoff)
    ).all())


def _clock_label(dt: datetime) -> str:
    """'%-I' (no leading zero) isn't portable to Windows strftime."""
    hour12 = dt.hour % 12 or 12
    return f"{hour12}:{dt.minute:02d}{'am' if dt.hour < 12 else 'pm'}"


def _event_detail(o: models.Outage) -> dict:
    """Derive the richer per-event fields the outages UI wants (severity,
    display status, crew count, ETA) from what's actually on the row —
    there's no separate 'severity'/'crews' column, so these are modeling
    assumptions over real fields, same as the maintenance risk score or the
    anomaly detector elsewhere: crew count scales with customers affected,
    ETA scales with event size, and the labels are just readable names for
    real status/cause/elapsed-time buckets."""
    restored = o.status == "resolved"
    planned = o.cause == "Planned maintenance"
    crews = max(1, round(o.customers_affected / 400))

    if restored:
        severity, status, eta = "restoring", "Restoring", "Power restored"
    elif planned:
        severity, status = "planned", "Scheduled"
        eta = _clock_label(o.ts_start)
    else:
        severity = "major" if o.customers_affected >= 500 else "minor"
        elapsed_min = max(0, (datetime.utcnow() - o.ts_start).total_seconds() / 60)
        status = "Crew dispatched" if elapsed_min < 60 else "Crew on site"
        duration_hours = 1.5 + o.customers_affected / 800
        eta = _clock_label(o.ts_start + timedelta(hours=duration_hours))

    return {
        "id": o.id, "area": o.area, "cause": o.cause,
        "customers": o.customers_affected, "crews": crews, "eta": eta,
        "status": status, "severity": severity, "lat": o.lat, "lng": o.lon,
    }


def map_payload(db: Session, cust: models.Customer, meter_label: str) -> dict:
    active = _active(db)
    visible = active + _recently_restored(db)
    events = [_event_detail(o) for o in visible]

    pins = []
    nearby = 0
    for o in active:
        km = haversine_km(cust.lat, cust.lon, o.lat, o.lon)
        if km <= NEARBY_KM:
            nearby += 1
        x, y = map_xy(o.lat, o.lon, cust.lat, cust.lon, MAP_RADIUS_KM)
        pins.append({
            "x": x, "y": y, "d": o.customers_affected, "danger": km <= NEARBY_KM,
            "lat": o.lat, "lng": o.lon,
        })

    total_affected = sum(e["customers"] for e in events)
    crews = sum(e["crews"] for e in events)

    if nearby:
        caption = f"{nearby} active outage{'s' if nearby != 1 else ''} within 2 miles of your address. Yours is not one of them, so this is likely inside your home."
    else:
        caption = f"{len(active)} active outages on the grid, none within 2 miles of your address."

    return {
        "pins": pins,
        "events": events,
        "center": {"lat": cust.lat, "lng": cust.lon},
        "caption": caption,
        "portalCaption": f"{len(events)} active events, {total_affected:,} customers affected, {crews} crews assigned.",
        "options": None,  # filled by the router from data.OUTAGE_OPTIONS
        "address": f"{cust.address}, {cust.city}",
        "meter": meter_label,
    }


def report_outage(db: Session, cust: models.Customer, meter_label: str, cause: str) -> dict:
    """Persist a new outage centered on the reporting customer's real
    location, and estimate restoration from the nearest active crew
    (the nearest already-active outage event, as a proxy for crew presence)."""
    active = _active(db)
    if active:
        nearest = min(active, key=lambda o: haversine_km(cust.lat, cust.lon, o.lat, o.lon))
        km = haversine_km(cust.lat, cust.lon, nearest.lat, nearest.lon)
        eta_minutes = max(20, round(km * 12))
    else:
        km, eta_minutes = None, 90

    ticket = "OUT-" + "".join(random.choices(string.digits, k=5))
    outage = models.Outage(
        id=ticket, utility=cust.utility, ts_start=datetime.utcnow(), ts_end=None,
        lat=cust.lat, lon=cust.lon, area=cust.city or "Long Island",
        cause=cause, customers_affected=1, status="active",
    )
    db.add(outage)
    db.commit()

    eta_label = f"{eta_minutes} min" if eta_minutes < 60 else f"{eta_minutes / 60:.1f} hr"
    detail = (
        f"Nearest crew is {distance_label(km)} away. Estimated restoration {eta_label}. "
        f"We will notify you when meter {meter_label} reports power again."
        if km is not None else
        f"No crew currently active nearby. Estimated restoration {eta_label}. "
        f"We will notify you when meter {meter_label} reports power again."
    )
    return {
        "reported": True,
        "ticket": ticket,
        "detail": detail,
        "note": "Notification payload shown in the demo, no SMS sent.",
        "address": cust.address,
        "meter": meter_label,
    }
