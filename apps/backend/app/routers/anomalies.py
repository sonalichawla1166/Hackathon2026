from __future__ import annotations

from fastapi import APIRouter, Depends

from ..formulas import meter_intervals
from ..session import Session, current_session

router = APIRouter(tags=["anomalies"])


def _payload(session: Session):
    acked = session.alert_ack
    return {
        "title": "A constant 0.4 kW load has run every night since Sept 21",
        "detail": (
            "Your overnight floor used to drop to 0.1 kW. It no longer does. That pattern usually "
            "means a pump, heater or well that stopped cycling off."
        ),
        "intervals": meter_intervals(),
        "impact": "About 134 kWh, roughly $31 on this bill and $376 a year. Model confidence 0.91 on an isolation-forest score.",
        "ack": acked,
        "ctaLabel": "Plumber request sent" if acked else "Find a plumber near me",
        "ackNote": "Request queued for three vetted plumbers in 10036. Payload shown in the demo, nothing dispatched." if acked else None,
    }


@router.get("/anomalies")
def get_anomalies(session: Session = Depends(current_session)):
    return _payload(session)


@router.post("/anomalies/ack")
def ack_anomaly(session: Session = Depends(current_session)):
    session.alert_ack = True
    return _payload(session)


@router.post("/anomalies/dismiss")
def dismiss_anomaly(session: Session = Depends(current_session)):
    session.alert_ack = False
    return _payload(session)
