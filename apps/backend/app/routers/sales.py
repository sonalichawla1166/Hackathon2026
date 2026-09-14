from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from ..data import KNOCK_OUTCOMES, LEADS, LEADS_BY_ID, SALES_REP_BASE
from ..formulas import lead_summary, leads_in_range, suggested_route
from ..schemas import KnockRequest
from ..session import Session, current_session

router = APIRouter(tags=["sales"])


@router.get("/sales/leads")
def get_leads(
    lat: float = Query(default=SALES_REP_BASE["lat"]),
    lng: float = Query(default=SALES_REP_BASE["lng"]),
    radiusKm: float = Query(default=10.0, ge=1, le=50),
    session: Session = Depends(current_session),
):
    leads = leads_in_range(LEADS, lat, lng, radiusKm, session.sales_visits)
    knocked_today = [l for l in leads if l["knockedToday"]]
    sold_today = [l for l in knocked_today if l["lastOutcome"] == "Sold"]
    return {
        "repBase": {"lat": lat, "lng": lng},
        "radiusKm": radiusKm,
        "kpis": [
            {"k": "Leads in range", "v": str(len(leads))},
            {"k": "Knocked today", "v": str(len(knocked_today))},
            {"k": "Sold today", "v": str(len(sold_today))},
        ],
        "knockOutcomes": KNOCK_OUTCOMES,
        "leads": leads,
    }


@router.get("/sales/leads/{lead_id}")
def get_lead_detail(lead_id: str, session: Session = Depends(current_session)):
    lead = LEADS_BY_ID.get(lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="No such lead")
    summary = lead_summary(lead, SALES_REP_BASE["lat"], SALES_REP_BASE["lng"], 10.0, session.sales_visits.get(lead_id, []))
    history = [{"date": v.date, "outcome": v.outcome, "rep": v.rep, "notes": v.notes} for v in lead.history]
    history += session.sales_visits.get(lead_id, [])
    history.sort(key=lambda v: v["date"], reverse=True)
    return {**summary, "history": history}


@router.post("/sales/leads/{lead_id}/knock")
def knock_lead(lead_id: str, body: KnockRequest, session: Session = Depends(current_session)):
    lead = LEADS_BY_ID.get(lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="No such lead")
    if body.outcome not in KNOCK_OUTCOMES:
        raise HTTPException(status_code=422, detail=f"outcome must be one of {KNOCK_OUTCOMES}")
    session.log_knock(lead_id, body.outcome, body.notes)
    detail = get_lead_detail(lead_id, session)
    return {"lead": detail, "ctaLabel": "Logged"}


@router.get("/sales/stats")
def get_stats(
    lat: float = Query(default=SALES_REP_BASE["lat"]),
    lng: float = Query(default=SALES_REP_BASE["lng"]),
    radiusKm: float = Query(default=10.0, ge=1, le=50),
    session: Session = Depends(current_session),
):
    leads = leads_in_range(LEADS, lat, lng, radiusKm, session.sales_visits)
    knocked_today = [l for l in leads if l["knockedToday"]]
    sold_today = [l for l in knocked_today if l["lastOutcome"] == "Sold"]
    conversion = round(len(sold_today) / len(knocked_today) * 100) if knocked_today else 0
    remaining = [l for l in leads if not l["knockedToday"]]
    route = suggested_route(remaining, lat, lng)
    return {
        "today": [
            {"k": "Doors knocked", "v": str(len(knocked_today))},
            {"k": "Sold", "v": str(len(sold_today))},
            {"k": "Conversion", "v": f"{conversion}%"},
        ],
        "knockedToday": [
            {"id": l["id"], "address": l["address"], "outcome": l["lastOutcome"]} for l in knocked_today
        ],
        "suggestedRoute": [
            {"id": l["id"], "address": l["address"], "distanceLabel": l["distanceLabel"]} for l in route
        ],
    }
