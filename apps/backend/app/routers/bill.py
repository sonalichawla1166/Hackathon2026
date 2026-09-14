from __future__ import annotations

from fastapi import APIRouter

from ..data import USAGE, bill_for, usd
from ..formulas import bill_lines

router = APIRouter(tags=["bill"])


@router.get("/bill/explain")
def bill_explain():
    return {
        "period": "September, 1,240 kWh, Service Class 1 tiered",
        "total": usd(bill_for(USAGE)),
        "lines": bill_lines(),
        "whyItMoved": (
            "90 kWh more than August. Cooling ran 14% longer during the Sept 3–9 heat, "
            "and the extra use crossed into the higher delivery tier. Your rate did not change."
        ),
    }
