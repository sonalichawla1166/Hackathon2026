from __future__ import annotations

from fastapi import APIRouter, Depends

from ..data import USAGE, PAY_OPTIONS, bill_for, usd
from ..schemas import PaymentRequest
from ..session import Session, current_session

router = APIRouter(tags=["payments"])


@router.get("/payments/methods")
def get_methods(session: Session = Depends(current_session)):
    return {
        "amountDue": usd(bill_for(USAGE)),
        "dueDate": "Oct 12",
        "options": PAY_OPTIONS,
        "paid": session.paid,
    }


@router.post("/payments/pay")
def pay(body: PaymentRequest, session: Session = Depends(current_session)):
    session.paid = True
    return {
        "paid": True,
        "confirmation": "7741-A",
        "note": "No gateway is wired in the prototype. This is where the receipt and the autopay upsell land.",
    }
