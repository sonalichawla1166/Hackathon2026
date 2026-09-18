"""Field sales leads derived from the real customer base + the real program
eligibility engine (app.real.programs), instead of the original prototype's
fixed NYC lead list. Every lead is a real seeded PSEG-LI customer who scores
as a strong candidate for at least one program they aren't yet enrolled in —
door-to-door program enrollment, not basic-service prospecting, since every
customer in a monopoly utility's territory already has an account.

Program fit is expensive to compute per customer (reads ~90 days of AMI per
customer), so the result is built once per process and cached in memory —
the customer base and their usage history don't change during a run.
"""
from __future__ import annotations

from sqlalchemy import select

from . import features, store
from . import programs as real_programs
from . import db as models
from .db import SessionLocal
from .geo import distance_label, haversine_km, map_xy

# PSEG Long Island's actual home turf — Uniondale/Hicksville, Nassau County —
# used as the rep's default base instead of the prototype's Manhattan
# coordinates, so distance/radius filtering matches the real customer
# geography seeded across Nassau + Suffolk (see seed.py's LAT/LON box).
SALES_REP_BASE = {"lat": 40.7684, "lng": -73.5251}

KNOCK_OUTCOMES = ["Sold", "Not home", "Not interested", "Callback requested", "Do not contact"]
SALES_STAGES = ["New", "Contacted", "Qualified", "Proposal Sent", "Negotiating", "Won", "Lost"]

_MAX_LEADS = 28

_leads_cache: list[dict] | None = None


def _build_leads() -> list[dict]:
    db = SessionLocal()
    try:
        customers = db.scalars(select(models.Customer).order_by(models.Customer.id)).all()
        out: list[dict] = []
        for c in customers:
            _, readings = store.customer_electric_readings(db, c.id, days=90)
            if not readings:
                continue
            feats = features.usage_features(readings)
            recs = real_programs.recommend(db, feats)
            if not recs:
                continue
            top = recs[0]
            out.append({
                "id": f"LD-{c.id.split('-')[1]}",
                "address": c.address,
                "unit": None,
                "lat": c.lat,
                "lng": c.lon,
                "customer_name": c.name,
                "account_status": "Existing customer",
                "segment": f"{top['category'].replace('_', ' ').title()} — {top['name']}",
                "notes": f"{top['fit_reason']} Estimated value: ${top['estimated_benefit_usd_year']:,.0f}/yr.",
                "phone": c.phone,
                "match_score": top["score"],
                "stage": "New",
            })
        out.sort(key=lambda l: l["match_score"], reverse=True)
        return out[:_MAX_LEADS]
    finally:
        db.close()


def _leads() -> list[dict]:
    global _leads_cache
    if _leads_cache is None:
        _leads_cache = _build_leads()
    return _leads_cache


def _lead_by_id(lead_id: str) -> dict | None:
    for l in _leads():
        if l["id"] == lead_id:
            return l
    return None


def _summary(
    lead: dict,
    base_lat: float,
    base_lng: float,
    radius_km: float,
    extra_visits: list[dict],
    stage_overrides: dict[str, str] | None,
) -> dict:
    km = haversine_km(base_lat, base_lng, lead["lat"], lead["lng"])
    history = sorted(extra_visits, key=lambda v: v["date"], reverse=True)
    last = history[0] if history else None
    x, y = map_xy(lead["lat"], lead["lng"], base_lat, base_lng, radius_km)
    stage = (stage_overrides or {}).get(lead["id"], lead["stage"])
    return {
        "id": lead["id"],
        "address": lead["address"],
        "unit": lead["unit"],
        "lat": lead["lat"],
        "lng": lead["lng"],
        "mapX": x,
        "mapY": y,
        "distanceKm": round(km, 2),
        "distanceLabel": distance_label(km),
        "customerName": lead["customer_name"],
        "accountStatus": lead["account_status"],
        "stage": stage,
        "segment": lead["segment"],
        "phone": lead["phone"],
        "notes": lead["notes"],
        "visitCount": len(history),
        "lastOutcome": last["outcome"] if last else None,
        "lastVisitDate": last["date"] if last else None,
        "knockedToday": any(v["date"] == _today() for v in history),
    }


def _today() -> str:
    import datetime

    return datetime.date.today().isoformat()


def leads_in_range(
    base_lat: float,
    base_lng: float,
    radius_km: float,
    session_visits: dict[str, list[dict]],
    stage_overrides: dict[str, str] | None = None,
) -> list[dict]:
    out = [
        _summary(l, base_lat, base_lng, radius_km, session_visits.get(l["id"], []), stage_overrides)
        for l in _leads()
    ]
    out = [l for l in out if l["distanceKm"] <= radius_km]
    out.sort(key=lambda l: l["distanceKm"])
    return out


def lead_detail(
    lead_id: str,
    session_visits: dict[str, list[dict]],
    stage_overrides: dict[str, str] | None = None,
) -> dict | None:
    lead = _lead_by_id(lead_id)
    if lead is None:
        return None
    return _summary(
        lead, SALES_REP_BASE["lat"], SALES_REP_BASE["lng"], 999,
        session_visits.get(lead_id, []), stage_overrides,
    )


def lead_exists(lead_id: str) -> bool:
    return _lead_by_id(lead_id) is not None


def pipeline_board(
    stages: list[str],
    session_visits: dict[str, list[dict]],
    stage_overrides: dict[str, str] | None = None,
) -> dict:
    summaries = [
        _summary(l, SALES_REP_BASE["lat"], SALES_REP_BASE["lng"], 999, session_visits.get(l["id"], []), stage_overrides)
        for l in _leads()
    ]
    board: dict[str, list[dict]] = {s: [] for s in stages}
    for s in summaries:
        board.setdefault(s["stage"], []).append(s)
    counts = {s: len(board.get(s, [])) for s in stages}
    return {"board": board, "counts": counts}


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
