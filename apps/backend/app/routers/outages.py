from __future__ import annotations

from fastapi import APIRouter, Depends

from ..data import OUTAGE_OPTIONS
from ..real import outage_engine, store
from ..real.config import DEMO_CUSTOMER_ID
from ..real.db import SessionLocal
from ..schemas import OutageReportRequest
from ..session import Session, current_session

router = APIRouter(tags=["outages"])


@router.get("/outages/map")
def outage_map():
    db = SessionLocal()
    try:
        cust = store.get_customer(db, DEMO_CUSTOMER_ID)
        meter = store.electric_meter(db, DEMO_CUSTOMER_ID)
        if not cust:
            return {"pins": [], "events": [], "center": {"lat": 0, "lng": 0}, "caption": "No data", "portalCaption": "No data", "options": OUTAGE_OPTIONS, "address": "-", "meter": "-"}
        payload = outage_engine.map_payload(db, cust, meter.id if meter else "unknown")
        payload["options"] = OUTAGE_OPTIONS
        return payload
    finally:
        db.close()


@router.post("/outages/report")
def report_outage(body: OutageReportRequest, session: Session = Depends(current_session)):
    db = SessionLocal()
    try:
        cust = store.get_customer(db, DEMO_CUSTOMER_ID)
        meter = store.electric_meter(db, DEMO_CUSTOMER_ID)
        session.reported = True
        picked = [OUTAGE_OPTIONS[i] for i in body.picks if 0 <= i < len(OUTAGE_OPTIONS)]
        cause = "Customer-reported: " + ", ".join(picked) if picked else "Customer-reported"
        return outage_engine.report_outage(db, cust, meter.id if meter else "unknown", cause)
    finally:
        db.close()
