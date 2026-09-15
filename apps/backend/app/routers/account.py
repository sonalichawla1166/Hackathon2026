from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter

from ..real import anomaly, features, programs as real_programs, store, tariff_engine
from ..real.config import ANOMALY_CUSTOMER_ID, DEMO_CUSTOMER_ID
from ..real.db import SessionLocal

router = APIRouter(tags=["account"])


def _monthly_history(readings: list, months: int = 6) -> list[dict]:
    """Aggregate readings into the trailing N calendar months, {m, v} pairs,
    then reshape to {m, hPx, active} like the original bill_history()."""
    if not readings:
        return []
    by_month: dict[tuple[int, int], float] = {}
    for ts, v in readings:
        key = (ts.year, ts.month)
        by_month[key] = by_month.get(key, 0.0) + v
    keys = sorted(by_month.keys())[-months:]
    vmax = max(by_month[k] for k in keys) or 1.0
    out = []
    for i, k in enumerate(keys):
        month_name = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][k[1] - 1]
        out.append({"m": month_name, "hPx": round(by_month[k] / vmax * 56), "active": i == len(keys) - 1})
    return out


@router.get("/account/summary")
def account_summary():
    db = SessionLocal()
    try:
        cust = store.get_customer(db, DEMO_CUSTOMER_ID)
        meter, readings = store.customer_electric_readings(db, DEMO_CUSTOMER_ID)
        if not cust or not readings:
            return {"customer": {"name": "Maria Alvarez", "utility": "PSEG Long Island", "accountLabel": "OneGridAI"},
                    "billTotal": "$0.00", "deltaPct": "0%", "deltaLabel": "vs last month",
                    "history": [], "alert": {"title": "No data", "detail": "Run seed.py first."},
                    "topProgram": {"name": "-", "match": 0, "blurb": "-"}}

        latest_ts = max(ts for ts, _ in readings)
        cur_start = latest_ts - timedelta(days=30)
        cur = [(ts, v) for ts, v in readings if ts >= cur_start]
        prev = [(ts, v) for ts, v in readings
                if cur_start - timedelta(days=30) <= ts < cur_start]
        cur_bill = tariff_engine.compute_bill(cur, cust.rate_code, cur_start, latest_ts)

        delta_pct = "0%"
        if prev:
            prev_bill = tariff_engine.compute_bill(prev, cust.rate_code,
                                                    cur_start - timedelta(days=30), cur_start)
            if prev_bill["total_usd"]:
                pct = (cur_bill["total_usd"] - prev_bill["total_usd"]) / prev_bill["total_usd"] * 100
                delta_pct = f"{'+' if pct >= 0 else ''}{pct:.1f}%"

        # Alert banner: real detector on the anomaly-persona customer.
        _, anom_readings = store.customer_electric_readings(db, ANOMALY_CUSTOMER_ID)
        det = anomaly.detect(anom_readings)
        if det:
            alert = {"title": "Elevated afternoon load on your meter",
                     "detail": f"Detected across {det['over_days']} of the last 7 days. Tap to review."}
        else:
            alert = {"title": "No anomalies detected", "detail": "Your meter's usage looks normal."}

        # Top program: real recommender.
        feats = features.usage_features(readings)
        recs = real_programs.recommend(db, feats)
        if recs:
            top = recs[0]
            top_program = {"name": top["name"], "match": round(top["score"] * 100), "blurb": top["fit_reason"]}
        else:
            top_program = {"name": "No match yet", "match": 0, "blurb": "-"}

        return {
            "customer": {"name": cust.name, "utility": "PSEG Long Island", "accountLabel": "OneGridAI"},
            "billTotal": f"${cur_bill['total_usd']:,.2f}",
            "deltaPct": delta_pct, "deltaLabel": "vs prior period",
            "history": _monthly_history(readings),
            "alert": alert, "topProgram": top_program,
        }
    finally:
        db.close()
