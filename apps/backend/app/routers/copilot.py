from __future__ import annotations

from fastapi import APIRouter, Depends

from ..data import CALL, SUGGESTIONS, USAGE, bill_for, usd
from ..session import Session, current_session

router = APIRouter(tags=["copilot"])


def _payload(session: Session):
    idx = session.call_idx
    suggestion = SUGGESTIONS[min(len(SUGGESTIONS) - 1, idx // 2)]
    return {
        "callTimer": f"02:{10 + idx * 9:02d}",
        "customer": {
            "name": "Maria Alvarez",
            "account": "Acct 4471-882-01 · SC 1",
            "address": "412 W 47th St, Apt 6B",
        },
        "transcript": [{"who": c.who, "text": c.text} for c in CALL[: idx + 1]],
        "facts": [
            {"k": "Sept bill", "v": usd(bill_for(USAGE))},
            {"k": "Change vs Aug", "v": "+7.8%"},
            {"k": "Rate class", "v": "SC 1 tiered"},
            {"k": "Payment history", "v": "On time, 24 mo"},
            {"k": "Open tickets", "v": "1 anomaly"},
            {"k": "Best next offer", "v": "EV TOU rate"},
        ],
        "openAnomaly": "Continuous 0.4 kW overnight draw since Sept 21. Customer was notified in-app and has not acknowledged.",
        "suggestion": {
            "text": suggestion.text,
            "cites": suggestion.cites,
            "chunks": [{"src": c.src, "score": c.score, "text": c.text} for c in suggestion.chunks],
        },
        "advanceLabel": "Call complete" if idx >= len(CALL) - 1 else "Advance call",
        "callComplete": idx >= len(CALL) - 1,
        "used": session.used,
        "useLabel": "Inserted" if session.used else "Use this answer",
        "nextActions": [
            "Send the September bill breakdown to the app",
            "Offer the EV Time-of-Use comparison, $184 a year",
            "Log the anomaly acknowledgement on the account",
        ],
    }


@router.get("/copilot/call")
def get_call(session: Session = Depends(current_session)):
    return _payload(session)


@router.post("/copilot/advance")
def advance_call(session: Session = Depends(current_session)):
    session.call_idx = min(len(CALL) - 1, session.call_idx + 2)
    session.used = False
    return _payload(session)


@router.post("/copilot/use-suggestion")
def use_suggestion(session: Session = Depends(current_session)):
    session.used = True
    return _payload(session)
