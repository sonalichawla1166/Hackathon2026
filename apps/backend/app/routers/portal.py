from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Query

from ..data import FAQ_DATA, PORTAL_NAV
from ..real import store, tariff_engine
from ..real.config import DEMO_CUSTOMER_ID
from ..real.db import SessionLocal

router = APIRouter(tags=["portal"])

_PLAN_DESC = {
    "180": "Same price all day. The simple, predictable option.",
    "194": "Standard Time-of-Day rate. Cheaper off-peak, pricier 3-7pm weekdays.",
    "195": "Deep overnight (10pm-6am) discount. Best if you charge an EV or run big loads late.",
}
_PLAN_NAME = {"180": "General Use (Flat)", "194": "Time-of-Day, Off-Peak (Standard)", "195": "Time-of-Day, Super Off-Peak (EV)"}


def _scaled_readings(usage_target: float):
    """Take the demo customer's most recent 30-day reading shape and scale it
    so its total matches `usage_target` - lets the rate comparison respond to
    the portal's usage slider while keeping a realistic hourly distribution."""
    db = SessionLocal()
    try:
        _, readings = store.customer_electric_readings(db, DEMO_CUSTOMER_ID, days=30)
    finally:
        db.close()
    if not readings:
        return []
    actual_total = sum(v for _, v in readings)
    if actual_total <= 0:
        return readings
    ratio = usage_target / actual_total
    return [(ts, v * ratio) for ts, v in readings]


@router.get("/portal/nav")
def get_nav():
    return {"nav": PORTAL_NAV, "poweredBy": "Powered by OneGridAI"}


@router.get("/portal/rates")
def get_rates(usage: float = Query(default=1240.0, ge=200, le=2600)):
    readings = _scaled_readings(usage)
    if not readings:
        return {"usage": usage, "plans": []}
    start = min(ts for ts, _ in readings)
    end = max(ts for ts, _ in readings)
    plans = []
    for code in tariff_engine.all_codes():
        bill = tariff_engine.compute_bill(readings, code, start, end)
        plans.append({"code": code, "monthlyV": bill["total_usd"]})
    best = min(plans, key=lambda p: p["monthlyV"])
    out = []
    for p in plans:
        is_best = p["code"] == best["code"]
        out.append({
            "name": f"Rate {p['code']}: {_PLAN_NAME[p['code']]}", "desc": _PLAN_DESC[p["code"]],
            "monthly": f"${p['monthlyV']:,.2f}", "annual": f"${p['monthlyV'] * 12:,.0f}",
            "isBest": is_best,
            "delta": "Lowest cost at this usage" if is_best
                    else f"+${(p['monthlyV'] - best['monthlyV']) * 12:,.0f} a year vs the best plan",
            "deltaColor": "#93BFA0" if is_best else "#938DA6",
        })
    return {"usage": usage, "plans": out}


@router.get("/portal/solar")
def get_portal_solar(kw: float = Query(default=6.0, ge=0, le=12)):
    db = SessionLocal()
    try:
        cust = store.get_customer(db, DEMO_CUSTOMER_ID)
        _, readings = store.customer_electric_readings(db, DEMO_CUSTOMER_ID)
    finally:
        db.close()
    if not cust or not readings or kw == 0:
        return {"solarKw": kw, "note": "PSEG Long Island net-metering model", "stats": []}
    sn = tariff_engine.simulate_solar(readings, cust.rate_code, kw)
    return {
        "solarKw": kw,
        "note": "Generation modelled at ~1,250 kWh/kW/yr for Long Island, 55% self-consumption",
        "stats": [
            {"k": "Annual generation", "v": f"{sn['annual_generation_kwh']:,.0f} kWh"},
            {"k": "New monthly bill", "v": f"${sn['new_annual_usd'] / 12:,.2f}"},
            {"k": "Simple payback", "v": f"{sn['payback_years']:.1f} yrs" if sn["payback_years"] else "-"},
        ],
    }


@router.get("/portal/faqs")
def get_faqs():
    return {"faqs": FAQ_DATA}
