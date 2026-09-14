from __future__ import annotations

from fastapi import APIRouter

from ..data import USAGE, bill_for, usd, PROGRAMS
from ..formulas import bill_history

router = APIRouter(tags=["account"])


@router.get("/account/summary")
def account_summary():
    base = bill_for(USAGE)
    top = PROGRAMS[0]
    return {
        "customer": {"name": "Maria Alvarez", "utility": "Con Edison", "accountLabel": "OneGridAI"},
        "billTotal": usd(base),
        "deltaPct": "+7.8%",
        "deltaLabel": "vs August",
        "history": bill_history(),
        "alert": {
            "title": "Continuous overnight draw on your meter",
            "detail": "Detected 2 hours ago, 11 days before your bill closes. Tap to review.",
        },
        "topProgram": {
            "name": top.name,
            "match": top.match,
            "blurb": "You charge between 11pm and 3am on 22 of the last 30 nights. Estimated saving $184 a year.",
        },
    }
