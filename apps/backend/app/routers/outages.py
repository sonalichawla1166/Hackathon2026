from __future__ import annotations

from fastapi import APIRouter, Depends

from ..data import OUTAGE_OPTIONS, OUTAGE_PINS
from ..schemas import OutageReportRequest
from ..session import Session, current_session

router = APIRouter(tags=["outages"])


@router.get("/outages/map")
def outage_map():
    return {
        "pins": OUTAGE_PINS,
        "caption": "3 active outages within 2 miles. Yours is not one of them, so this is likely inside your home.",
        "portalCaption": "7 active events, 2,140 customers affected, 6 crews assigned.",
        "options": OUTAGE_OPTIONS,
    }


@router.post("/outages/report")
def report_outage(body: OutageReportRequest, session: Session = Depends(current_session)):
    session.report_picks = body.picks
    session.reported = True
    ticket = "OUT-40912"
    return {
        "reported": True,
        "ticket": ticket,
        "detail": "Crew 14 is 1.2 miles away. Estimated restoration 4:40pm. We will notify you when the meter reports power again.",
        "note": "Notification payload shown in the demo, no SMS sent.",
        "address": "412 W 47th St, Apt 6B",
        "meter": "8841-220-C",
    }
