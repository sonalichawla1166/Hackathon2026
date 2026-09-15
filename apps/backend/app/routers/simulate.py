from __future__ import annotations

from fastapi import APIRouter, Query

from ..real import store, tariff_engine
from ..real.config import DEMO_CUSTOMER_ID
from ..real.db import SessionLocal

router = APIRouter(tags=["simulate"])


def _annual_usage_kwh(readings: list) -> float:
    if not readings:
        return 0.0
    total = sum(v for _, v in readings)
    start = min(ts for ts, _ in readings)
    end = max(ts for ts, _ in readings)
    days = max((end - start).days, 1)
    return total * 365.0 / days


@router.get("/simulate")
def get_simulate(solarKw: float = Query(default=6.0, ge=0, le=12)):
    db = SessionLocal()
    try:
        cust = store.get_customer(db, DEMO_CUSTOMER_ID)
        _, readings = store.customer_electric_readings(db, DEMO_CUSTOMER_ID)
        if not cust or not readings:
            return {"solarKw": solarKw, "solarLabel": "None", "billToday": "$0.00",
                    "billWithSolar": "$0.00", "rows": []}

        annual_usage = _annual_usage_kwh(readings)
        sn = tariff_engine.simulate_solar(readings, cust.rate_code, solarKw) if solarKw > 0 else None
        baseline = tariff_engine.annualize(readings, cust.rate_code) / 12
        bill_with_solar = (sn["new_annual_usd"] / 12) if sn else baseline
        offset_pct = round(min(100, (sn["self_consumed_kwh"] / annual_usage) * 100)) if sn and annual_usage else 0

        return {
            "solarKw": solarKw,
            "solarLabel": "None" if solarKw == 0 else f"{solarKw:g} kW",
            "billToday": f"${baseline:,.2f}",
            "billWithSolar": f"${bill_with_solar:,.2f}",
            "rows": [
                {"k": "Annual generation", "v": f"{sn['annual_generation_kwh']:,.0f} kWh" if sn else "0 kWh"},
                {"k": "Monthly offset", "v": f"{offset_pct}% of your use"},
                {"k": "Yearly saving", "v": f"${sn['annual_savings_usd']:,.0f}" if sn else "$0"},
                {"k": "Install cost after 30% credit", "v": f"${sn['system_cost_usd'] * 0.7:,.0f}" if sn else "$0"},
                {"k": "Simple payback", "v": f"{sn['payback_years']:.1f} years" if sn and sn["payback_years"] else "-"},
            ],
        }
    finally:
        db.close()
