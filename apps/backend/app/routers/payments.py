from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Depends

from ..data import PAY_OPTIONS
from ..real import store, tariff_engine
from ..real.config import DEMO_CUSTOMER_ID
from ..real.db import SessionLocal
from ..schemas import PaymentRequest
from ..session import Session, current_session

router = APIRouter(tags=["payments"])

# Standard PSEG-LI residential payment terms: due 21 days after the bill
# period closes. Card/bank instrument labels stay illustrative — there's no
# real payment gateway behind this demo, same as any sandboxed billing UI.
DUE_DAYS = 21


def _current_bill() -> dict:
    db = SessionLocal()
    try:
        cust = store.get_customer(db, DEMO_CUSTOMER_ID)
        _, readings = store.customer_electric_readings(db, DEMO_CUSTOMER_ID)
        if not cust or not readings:
            return {"amount_usd": 0.0, "due_date": "-"}
        latest_ts = max(ts for ts, _ in readings)
        cur_start = latest_ts - timedelta(days=30)
        cur = [(ts, v) for ts, v in readings if ts >= cur_start]
        bill = tariff_engine.compute_bill(cur, cust.rate_code, cur_start, latest_ts)
        due = latest_ts + timedelta(days=DUE_DAYS)
        return {"amount_usd": bill["total_usd"], "due_date": f"{due.strftime('%b')} {due.day}"}
    finally:
        db.close()


@router.get("/payments/methods")
def get_methods(session: Session = Depends(current_session)):
    bill = _current_bill()
    return {
        "amountDue": f"${bill['amount_usd']:,.2f}",
        "dueDate": bill["due_date"],
        "options": PAY_OPTIONS,
        "paid": session.paid,
    }


@router.post("/payments/pay")
def pay(body: PaymentRequest, session: Session = Depends(current_session)):
    session.paid = True
    bill = _current_bill()
    confirmation = f"PSEG-{abs(hash((DEMO_CUSTOMER_ID, bill['due_date']))) % 100000:05d}"
    return {
        "paid": True,
        "confirmation": confirmation,
        "note": f"${bill['amount_usd']:,.2f} applied to your account. No live gateway is wired in this demo — this is where the receipt and autopay upsell land.",
    }
