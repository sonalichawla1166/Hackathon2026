from __future__ import annotations

from fastapi import APIRouter, Query

from ..data import USAGE, usd, usd0
from ..formulas import solar_numbers

router = APIRouter(tags=["simulate"])


@router.get("/simulate")
def get_simulate(solarKw: float = Query(default=6.0, ge=0, le=12)):
    sn = solar_numbers(solarKw)
    return {
        "solarKw": solarKw,
        "solarLabel": "None" if solarKw == 0 else f"{solarKw:g} kW",
        "billToday": usd(sn["base"]),
        "billWithSolar": usd(sn["bill"]),
        "rows": [
            {"k": "Annual generation", "v": f"{round(sn['kw'] * 1180):,} kWh"},
            {"k": "Monthly offset", "v": f"{round(min(100, sn['gen'] / USAGE * 100))}% of your use"},
            {"k": "Yearly saving", "v": usd0(max(0.0, sn["annual"]))},
            {"k": "Install cost after 30% credit", "v": usd0(sn["cost"])},
            {"k": "Simple payback", "v": f"{sn['payback']:.1f} years" if sn["payback"] > 0 else "—"},
        ],
    }
