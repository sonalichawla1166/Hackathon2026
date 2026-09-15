"""Per-customer usage features derived from AMI readings, shared by the
program recommender. Every feature maps to a program eligibility rule."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from .tariff_engine import meta


def usage_features(readings: list[tuple[datetime, float]]) -> dict[str, Any]:
    if not readings:
        return {}
    m = meta()
    peak_hours = set(m["peak_hours"])
    sop_hours = set(m["super_offpeak_hours"])
    summer_months = set(m["summer_months"])

    total = sum(v for _, v in readings)
    peak = sum(v for ts, v in readings if ts.weekday() < 5 and ts.hour in peak_hours)
    night = sum(v for ts, v in readings if ts.hour in sop_hours)
    day = sum(v for ts, v in readings if 9 <= ts.hour <= 16)
    summer = sum(v for ts, v in readings if ts.month in summer_months)
    winter = total - summer

    hourly = [v for _, v in readings]
    baseline = sorted(hourly)[max(0, len(hourly) // 20)]
    mean = total / len(hourly)
    always_on_ratio = round(baseline / mean, 3) if mean else 0.0

    start = min(ts for ts, _ in readings)
    end = max(ts for ts, _ in readings)
    days = max((end - start).days, 1)
    annual_usage = total * 365.0 / days

    summer_n = sum(1 for ts, _ in readings if ts.month in summer_months)
    winter_n = len(readings) - summer_n
    summer_avg = summer / summer_n if summer_n else 0.0
    winter_avg = winter / winter_n if winter_n else 0.0
    if summer_n == 0 or winter_n == 0 or min(summer_avg, winter_avg) <= 0:
        swing = 1.0
    else:
        swing = round(max(summer_avg, winter_avg) / min(summer_avg, winter_avg), 2)

    return {
        "total_kwh_window": round(total, 1),
        "annual_usage_kwh": round(annual_usage, 0),
        "peak_load_ratio": round(peak / total, 3) if total else 0.0,
        "night_load_ratio": round(night / total, 3) if total else 0.0,
        "daytime_load_ratio": round(day / total, 3) if total else 0.0,
        "always_on_ratio": always_on_ratio,
        "seasonal_swing_ratio": swing,
        "summer_user": summer_avg >= winter_avg,
    }
