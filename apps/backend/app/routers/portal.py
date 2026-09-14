from __future__ import annotations

from fastapi import APIRouter, Query

from ..data import PORTAL_NAV, FAQ_DATA, usd
from ..formulas import rate_plans, solar_numbers

router = APIRouter(tags=["portal"])


@router.get("/portal/nav")
def get_nav():
    return {"nav": PORTAL_NAV, "poweredBy": "Powered by OneGridAI"}


@router.get("/portal/rates")
def get_rates(usage: float = Query(default=1240.0, ge=200, le=2600)):
    return {"usage": usage, "plans": rate_plans(usage)}


@router.get("/portal/solar")
def get_portal_solar(kw: float = Query(default=6.0, ge=0, le=12)):
    sn = solar_numbers(kw)
    return {
        "solarKw": kw,
        "note": "Generation modelled from PVWatts v8 for ZIP 10036",
        "stats": [
            {"k": "Annual generation", "v": f"{round(sn['kw'] * 1180):,} kWh"},
            {"k": "New monthly bill", "v": usd(sn["bill"])},
            {"k": "Simple payback", "v": f"{sn['payback']:.1f} yrs" if sn["payback"] > 0 else "—"},
        ],
    }


@router.get("/portal/faqs")
def get_faqs():
    return {"faqs": FAQ_DATA}
