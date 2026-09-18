from __future__ import annotations

from sqlalchemy import select

from fastapi import APIRouter, Depends, HTTPException, Query

from ..real import anomaly, dr_engine, maintenance as real_maintenance, sales_engine, store
from ..real.config import ANOMALY_CUSTOMER_ID
from ..real.db import Asset, SessionLocal
from ..session import Session, current_session

router = APIRouter(tags=["ops"])

DR_WINDOW_LABELS = ["Oct 14, 2-6pm", "Oct 14, 4-8pm", "Oct 15, 3-7pm"]
DR_WINDOW_TIMES = ["14:00-18:00", "16:00-20:00", "15:00-19:00"]


def _real_assets() -> list[Asset]:
    db = SessionLocal()
    try:
        return db.scalars(select(Asset).order_by(Asset.id)).all()
    finally:
        db.close()


@router.get("/ops/assets")
def get_assets(session: Session = Depends(current_session)):
    rows = _real_assets()
    scored = []
    for a in rows:
        s = real_maintenance.score(a)
        scored.append({
            "id": a.id, "type": f"{a.type.title()}, {a.region}", "loc": a.region,
            "age": f"{a.age_years:.0f} yrs", "installed": str(a.install_date.year),
            "customers": a.customers_served, "action": s["action"],
            "drivers": s["drivers"], "riskLabel": f"{s['risk']:.2f}",
            "riskPct": round(s["risk"] * 100),
            "riskColorValue": "#D98D95" if s["band"] == "high" else "#D9B98A" if s["band"] == "medium" else "#938DA6",
            "dispatched": a.id in session.dispatched_ids,
            "dispatchLabel": "Queued for crew 14" if a.id in session.dispatched_ids else "Add to inspection queue",
            "snoozed": a.id in session.snoozed_ids,
            "snoozeLabel": "Snoozed 7 days" if a.id in session.snoozed_ids else "Snooze 7 days",
        })
    scored.sort(key=lambda x: x["riskPct"], reverse=True)
    return {
        "kpis": [
            {"k": "Assets monitored", "v": f"{len(rows):,}"},
            {"k": "High-risk assets", "v": str(sum(1 for a in scored if a["riskPct"] >= 66))},
            {"k": "Model", "v": "Weighted risk score (age/load/failures/heat/health)"},
        ],
        "columns": ["Asset", "Location", "Age", "30-day risk"],
        "assets": scored,
    }


@router.post("/ops/assets/{asset_id}/dispatch")
def dispatch_asset(asset_id: str, session: Session = Depends(current_session)):
    if not any(a.id == asset_id for a in _real_assets()):
        raise HTTPException(status_code=404, detail="No such asset")
    session.dispatched_ids.add(asset_id)
    return {"id": asset_id, "dispatched": True, "dispatchLabel": "Queued for crew 14"}


@router.post("/ops/assets/{asset_id}/snooze")
def snooze_asset(asset_id: str, session: Session = Depends(current_session)):
    if not any(a.id == asset_id for a in _real_assets()):
        raise HTTPException(status_code=404, detail="No such asset")
    session.snoozed_ids.add(asset_id)
    return {"id": asset_id, "snoozed": True, "snoozeLabel": "Snoozed 7 days"}


@router.get("/ops/dr")
def get_dr(window: int = Query(default=1, ge=0, le=2), picks: str = Query(default="0,3")):
    pick_list = [int(p) for p in picks.split(",") if p.strip() != ""] if picks else []
    result = dr_engine.cohort(pick_list)
    dr_count = result["drCount"]
    payload_json = (
        "{\n"
        '  "event": "DR-2026-10-14",\n'
        f'  "window": "{DR_WINDOW_TIMES[window]}",\n'
        f'  "cohort": {dr_count},\n'
        '  "channel": ["push", "sms"]\n'
        "}"
    )
    return {
        "windows": DR_WINDOW_LABELS,
        "drCount": f"{dr_count:,}",
        "curve": result["curve"],
        "stats": [
            {"k": "Expected curtailment", "v": f"{result['mw']:.1f} MW"},
            {"k": "Forecast opt-in", "v": f"{result['optIn']:,} (62%)"},
            {"k": "Incentive cost", "v": f"${result['incentiveCost']:,}"},
        ],
        "payload": payload_json,
    }


@router.post("/ops/dr/queue")
def queue_dr(window: int = Query(default=1, ge=0, le=2), picks: str = Query(default="0,3")):
    return {"queued": True, "ctaLabel": "Event queued"}


# --- Impact/ROI summary: aggregates numbers already computed above and by
# the programs/sales/anomalies routers into one business-case view. No new
# models — see the per-group comments for what's live vs. extrapolated. ---

@router.get("/ops/impact")
def get_impact(session: Session = Depends(current_session)):
    rows = _real_assets()
    high_risk = sum(1 for a in rows if real_maintenance.score(a)["risk"] >= 0.66)

    cohort = dr_engine.cohort([0, 3])

    leads = sales_engine.leads_in_range(
        sales_engine.SALES_REP_BASE["lat"], sales_engine.SALES_REP_BASE["lng"], 10.0,
        session.sales_visits, session.lead_stage_overrides,
    )
    knocked_today = [l for l in leads if l["knockedToday"]]
    sold_today = [l for l in knocked_today if l["lastOutcome"] == "Sold"]
    conversion = round(len(sold_today) / len(knocked_today) * 100) if knocked_today else 0

    db = SessionLocal()
    try:
        n_customers = store.customer_count(db)
        _, readings = store.customer_electric_readings(db, ANOMALY_CUSTOMER_ID)
    finally:
        db.close()
    det = anomaly.detect(readings)
    if det:
        # One customer's weekly excess cost, annualized and extrapolated
        # across the seeded customer base — a single multiply, not a new
        # model. Presented as an estimate, not a measured fleet figure.
        weekly_usd = det["excess_kwh"] * anomaly.IMPACT_PER_KWH
        fleet_annual_usd = weekly_usd * 52 * n_customers
        anomaly_stat = f"${fleet_annual_usd:,.0f}/yr (extrapolated across {n_customers} customers)"
    else:
        anomaly_stat = "No active anomalies detected"

    return {
        "note": "Some figures below are live (assets, DR, sales, this session); others are modeled for the demo (chat deflection, fleet-wide anomaly savings) — see API.md.",
        "groups": [
            {
                "title": "Cost reduction",
                "stats": [{"k": "Chat call-deflection rate", "v": "40-60%"}],
            },
            {
                "title": "Revenue protection",
                "stats": [{"k": "Est. anomaly savings, fleet-wide", "v": anomaly_stat}],
            },
            {
                "title": "Grid reliability",
                "stats": [
                    {"k": "Assets monitored", "v": f"{len(rows):,}"},
                    {"k": "High-risk assets", "v": str(high_risk)},
                ],
            },
            {
                "title": "Demand response",
                "stats": [
                    {"k": "Expected curtailment", "v": f"{cohort['mw']:.1f} MW"},
                    {"k": "Incentive cost avoided", "v": f"${cohort['incentiveCost']:,}"},
                ],
            },
            {
                "title": "Field sales",
                "stats": [
                    {"k": "Doors knocked today", "v": str(len(knocked_today))},
                    {"k": "Conversion", "v": f"{conversion}%"},
                ],
            },
            {
                "title": "This session's activity",
                "stats": [
                    {"k": "Programs enrolled", "v": str(len(session.enrolled))},
                    {"k": "Anomaly acknowledged", "v": "Yes" if session.alert_ack else "No"},
                    {"k": "Assets dispatched", "v": str(len(session.dispatched_ids))},
                ],
            },
        ],
    }
