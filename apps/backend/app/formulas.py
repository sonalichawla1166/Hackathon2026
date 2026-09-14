"""Derived view-model calculations, ported from `apps/mobile/src/state/selectors.ts`
(itself ported from the `renderVals()` method in the source prototype)."""
from __future__ import annotations

import math

from .data import (
    ASSETS,
    DR_FILTERS,
    FAQ_DATA,
    FIXED,
    DELIV,
    SUPPLY,
    TAXRATE,
    RETAIL,
    USAGE,
    usd,
    usd0,
    bill_for,
    risk_color,
    KWH_HISTORY,
    LeadEntry,
)


def bill_lines() -> list[dict]:
    lines = [
        {"label": "Basic service charge", "amount": usd(FIXED), "plain": "Fixed monthly charge for the meter and service line. Does not move with usage.", "bg": "#DCD8D1", "v": FIXED},
        {"label": "Delivery, 1,240 kWh", "amount": usd(USAGE * DELIV), "plain": "Getting the electricity to you. Billed in two tiers, and 990 kWh landed in the higher one.", "bg": "#1E5B71", "v": USAGE * DELIV},
        {"label": "Supply, 1,240 kWh", "amount": usd(USAGE * SUPPLY), "plain": "The energy itself at 11.28¢ per kWh. You are on the utility default supply, not an ESCO.", "bg": "#0F2835", "v": USAGE * SUPPLY},
        {"label": "Taxes and surcharges", "amount": usd((FIXED + USAGE * RETAIL) * TAXRATE), "plain": "State and city taxes plus system benefit charges, applied to everything above.", "bg": "#17824A", "v": (FIXED + USAGE * RETAIL) * TAXRATE},
    ]
    total = sum(l["v"] for l in lines)
    for l in lines:
        l["pct"] = round(l["v"] / total * 100, 1)
    return lines


def bill_history() -> list[dict]:
    return [{"m": h["m"], "hPx": round(h["v"] / 1310 * 56), "active": i == 5} for i, h in enumerate(KWH_HISTORY)]


def meter_intervals() -> list[dict]:
    out = []
    for i in range(14):
        flagged = i >= 7
        h = round(62 + (i % 3) * 6) if flagged else round(30 + (i % 4) * 5)
        out.append({"hPx": h, "flagged": flagged})
    return out


def solar_numbers(kw: float) -> dict:
    gen = kw * 1180 / 12
    net = max(0.0, USAGE - gen)
    exported = max(0.0, gen - USAGE)
    gross = FIXED + net * RETAIL - exported * RETAIL
    bill = max(FIXED, gross) * (1 + TAXRATE)
    base = bill_for(USAGE)
    annual = (base - bill) * 12
    cost = kw * 2850 * 0.7
    payback = cost / annual if annual > 0 else 0.0
    return {"kw": kw, "gen": gen, "net": net, "bill": bill, "base": base, "annual": annual, "cost": cost, "payback": payback}


def rate_plans(portal_usage: float) -> list[dict]:
    flat = bill_for(portal_usage)
    tou_off = 0.61
    tou = (FIXED + portal_usage * (tou_off * 0.0782 + (1 - tou_off) * 0.1691) + portal_usage * DELIV) * (1 + TAXRATE)
    budget = bill_for(1200) * 0.995
    plans = [
        {"name": "SC 1 tiered, current", "monthlyV": flat, "desc": "Two delivery tiers, flat supply. The default residential plan."},
        {"name": "EV Time-of-Use", "monthlyV": tou, "desc": "Cheap after 11pm, expensive 2pm to 8pm. Rewards overnight charging."},
        {"name": "Budget billing", "monthlyV": budget, "desc": "Same amount every month, trued up once a year. No saving, just no surprises."},
    ]
    best = min(plans, key=lambda p: p["monthlyV"])
    out = []
    for p in plans:
        is_best = p is best
        out.append({
            "name": p["name"], "desc": p["desc"],
            "monthly": usd(p["monthlyV"]), "annual": usd0(p["monthlyV"] * 12),
            "isBest": is_best,
            "delta": "Lowest cost at this usage" if is_best else f"+{usd0((p['monthlyV'] - best['monthlyV']) * 12)} a year vs the best plan",
            "deltaColor": "#17824A" if is_best else "#373B3D",
        })
    return out


def faqs(faq_open: int) -> list[dict]:
    return [{**f, "open": faq_open == i} for i, f in enumerate(FAQ_DATA)]


def assets_for_list() -> list[dict]:
    """Full asset list with every field the detail panel needs — the client
    picks which one to display locally (indexing into this array) rather
    than asking the server to track a "selected" row."""
    out = []
    for a in ASSETS:
        out.append({
            "id": a.id, "type": a.type, "loc": a.loc, "age": a.age, "installed": a.installed,
            "customers": a.customers, "action": a.action,
            "drivers": [{"k": d.k, "v": d.v, "w": d.w} for d in a.drivers],
            "riskLabel": f"{a.risk:.2f}", "riskPct": round(a.risk * 100), "riskColorValue": risk_color(a.risk),
        })
    return out


def dr_cohort(dr_picks: list[int]) -> dict:
    picks = [DR_FILTERS[i] for i in dr_picks if 0 <= i < len(DR_FILTERS)]
    if picks:
        dr_count = round(min(f.n for f in picks) * (1 - 0.08 * (len(picks) - 1)))
        avg_kw = sum(f.kw for f in picks) / len(picks)
    else:
        dr_count = 12480
        avg_kw = 1.6
    mw = dr_count * avg_kw / 1000

    loads = [52, 58, 66, 78, 92, 100, 96, 84, 70, 60, 54, 48]
    curve = []
    for i, load in enumerate(loads):
        in_window = 4 <= i <= 7
        cut = round(load * min(0.24, mw / 40)) if in_window else 0
        curve.append({"base": round(load - cut), "cut": cut})

    return {"drCount": dr_count, "mw": mw, "curve": curve}


# ---------------------------------------------------------------------------
# Field sales / door-to-door
# ---------------------------------------------------------------------------

EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(min(1.0, math.sqrt(a)))


def distance_label(km: float) -> str:
    if km < 1:
        return f"{round(km * 1000)} m"
    return f"{km:.1f} km"


def _map_xy(lat: float, lng: float, base_lat: float, base_lng: float, radius_km: float) -> tuple[float, float]:
    """Projects a lead onto the [0,1] schematic-map square used by the mobile
    UI (same convention as OUTAGE_PINS): the rep's base sits at the centre,
    and the edge of the radius circle sits at 0.42 from centre, leaving a
    margin. Purely illustrative — not a real map projection."""
    dx_km = (lng - base_lng) * 111.32 * math.cos(math.radians(base_lat))
    dy_km = (lat - base_lat) * 110.57
    scale = 0.42 / radius_km if radius_km > 0 else 0
    x = 0.5 + dx_km * scale
    y = 0.5 - dy_km * scale
    return max(0.04, min(0.96, x)), max(0.04, min(0.96, y))


def lead_summary(lead: LeadEntry, base_lat: float, base_lng: float, radius_km: float, extra_visits: list[dict]) -> dict:
    km = haversine_km(base_lat, base_lng, lead.lat, lead.lng)
    history = [{"date": v.date, "outcome": v.outcome, "rep": v.rep, "notes": v.notes} for v in lead.history] + extra_visits
    history.sort(key=lambda v: v["date"], reverse=True)
    last = history[0] if history else None
    x, y = _map_xy(lead.lat, lead.lng, base_lat, base_lng, radius_km)
    return {
        "id": lead.id,
        "address": lead.address,
        "unit": lead.unit,
        "lat": lead.lat,
        "lng": lead.lng,
        "mapX": x,
        "mapY": y,
        "distanceKm": round(km, 2),
        "distanceLabel": distance_label(km),
        "customerName": lead.customer_name,
        "accountStatus": lead.account_status,
        "segment": lead.segment,
        "phone": lead.phone,
        "notes": lead.notes,
        "visitCount": len(history),
        "lastOutcome": last["outcome"] if last else None,
        "lastVisitDate": last["date"] if last else None,
        "knockedToday": any(v["date"] == _today() for v in history),
    }


def _today() -> str:
    import datetime

    return datetime.date.today().isoformat()


def leads_in_range(leads: list[LeadEntry], base_lat: float, base_lng: float, radius_km: float, session_visits: dict[str, list[dict]]) -> list[dict]:
    out = [lead_summary(l, base_lat, base_lng, radius_km, session_visits.get(l.id, [])) for l in leads]
    out = [l for l in out if l["distanceKm"] <= radius_km]
    out.sort(key=lambda l: l["distanceKm"])
    return out


def suggested_route(remaining: list[dict], base_lat: float, base_lng: float) -> list[dict]:
    """Nearest-neighbour walking order over leads not yet knocked, starting
    from the rep's current position. Good enough for a demo route summary —
    not a real TSP solver."""
    pool = list(remaining)
    order: list[dict] = []
    cur_lat, cur_lng = base_lat, base_lng
    while pool:
        nxt = min(pool, key=lambda l: haversine_km(cur_lat, cur_lng, l["lat"], l["lng"]))
        order.append(nxt)
        cur_lat, cur_lng = nxt["lat"], nxt["lng"]
        pool.remove(nxt)
    return order
