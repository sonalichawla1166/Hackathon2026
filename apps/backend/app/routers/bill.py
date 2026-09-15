from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter

from ..real import store, tariff_engine
from ..real.config import DEMO_CUSTOMER_ID
from ..real.db import SessionLocal

router = APIRouter(tags=["bill"])

# label/plain-language text + chart color per line-item group, mirroring the
# original mock's {label, amount, plain, bg, v, pct} shape.
_GROUP_META = {
    "service": {"plain": "Fixed monthly charge for the meter and service connection. Does not move with usage.", "bg": "#938DA6"},
    "delivery": {"plain": "The cost to bring electricity to you. PSEG Long Island's Time-of-Day rate: cheaper off-peak, pricier 3-7pm weekdays.", "bg": "#9FC6D6"},
    "supply": {"plain": "The energy itself. This portion moves monthly with wholesale market prices.", "bg": "#7A6F9E"},
    "credits": {"plain": "Net metering credit for energy you exported to the grid.", "bg": "#93BFA0"},
}


@router.get("/bill/explain")
def bill_explain():
    db = SessionLocal()
    try:
        cust = store.get_customer(db, DEMO_CUSTOMER_ID)
        meter, readings = store.customer_electric_readings(db, DEMO_CUSTOMER_ID)
        if not cust or not readings:
            return {"period": "No data", "total": "$0.00", "lines": [], "whyItMoved": "No AMI readings seeded yet."}

        latest_ts = max(ts for ts, _ in readings)
        cur_start = latest_ts - timedelta(days=30)
        cur = [(ts, v) for ts, v in readings if ts >= cur_start]
        prev = [(ts, v) for ts, v in readings
                if cur_start - timedelta(days=30) <= ts < cur_start]

        bill = tariff_engine.compute_bill(cur, cust.rate_code, cur_start, latest_ts)
        total = bill["total_usd"]

        lines = []
        for li in bill["line_items"]:
            meta = _GROUP_META.get(li["group"], {"plain": li["detail"], "bg": "#938DA6"})
            lines.append({
                "label": li["label"], "amount": f"${abs(li['amount_usd']):,.2f}",
                "plain": meta["plain"], "bg": meta["bg"],
                "v": li["amount_usd"], "pct": round(abs(li["amount_usd"]) / total * 100, 1) if total else 0.0,
            })

        why = f"{bill['usage_kwh']:.0f} kWh this period on Rate {cust.rate_code}."
        if prev:
            prev_bill = tariff_engine.compute_bill(prev, cust.rate_code,
                                                    cur_start - timedelta(days=30), cur_start)
            delta_kwh = bill["usage_kwh"] - prev_bill["usage_kwh"]
            delta_usd = total - prev_bill["total_usd"]
            direction = "more" if delta_kwh >= 0 else "less"
            why = (f"{abs(delta_kwh):.0f} kWh {direction} than the prior period "
                  f"({'up' if delta_usd >= 0 else 'down'} ${abs(delta_usd):.2f}). "
                  f"Peak-hour usage (3-7pm weekdays) is billed at a premium on Rate {cust.rate_code}.")

        return {
            "period": f"{cur_start.strftime('%B %d')}-{latest_ts.strftime('%B %d')}, "
                     f"{bill['usage_kwh']:.0f} kWh, Rate {cust.rate_code}",
            "total": f"${total:,.2f}", "lines": lines, "whyItMoved": why,
        }
    finally:
        db.close()
