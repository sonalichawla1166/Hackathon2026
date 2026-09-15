from __future__ import annotations

from fastapi import APIRouter, Depends

from ..real import anomaly, store
from ..real.config import ANOMALY_CUSTOMER_ID
from ..real.db import SessionLocal
from ..session import Session, current_session

router = APIRouter(tags=["anomalies"])


def _detect():
    """Runs the real detector against ANOMALY_CUSTOMER_ID's electric meter.
    Falls back to a static description if nothing is detected (e.g. before
    seed.py has run) so the endpoint never 500s."""
    db = SessionLocal()
    try:
        _, readings = store.customer_electric_readings(db, ANOMALY_CUSTOMER_ID)
        det = anomaly.detect(readings)
        if not det:
            return None, []
        bars = anomaly.interval_bars(readings, det)
        return det, bars
    finally:
        db.close()


def _payload(session: Session):
    det, bars = _detect()
    acked = session.alert_ack

    if det:
        title = f"Elevated afternoon load on your meter for {det['over_days']} of the last 7 days"
        detail = (
            "Your 1-6pm usage has run well above your normal pattern for several straight days. "
            "That pattern usually means an appliance (AC, water heater, fridge) is malfunctioning "
            "and drawing far more power than it should."
        )
        impact = (f"About {det['excess_kwh']:.0f} extra kWh this week, roughly "
                  f"${det['excess_kwh'] * anomaly.IMPACT_PER_KWH:.0f} on this bill. "
                  f"Detected via hour-of-day baseline + sustained-deviation model.")
        intervals = bars
    else:
        title = "No anomaly currently detected"
        detail = "Your meter's usage pattern is within its normal range."
        impact = "-"
        intervals = []

    return {
        "title": title, "detail": detail, "intervals": intervals, "impact": impact,
        "ack": acked,
        "ctaLabel": "Technician request sent" if acked else "Find a technician near me",
        "ackNote": "Request queued for three vetted technicians in your area. Payload shown in the demo, nothing dispatched." if acked else None,
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
