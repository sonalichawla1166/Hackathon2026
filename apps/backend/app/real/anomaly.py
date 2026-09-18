"""AMI anomaly detection: hour-of-day expected-band baseline + sustained-
deviation logic. Returns a detection dict, or None if nothing stands out."""
from __future__ import annotations

from datetime import datetime, timedelta

import numpy as np

IMPACT_PER_KWH = 0.22  # rough all-in $/kWh for impact estimates


def _hourly_baseline(readings: list[tuple[datetime, float]]):
    buckets: dict[int, list[float]] = {h: [] for h in range(24)}
    for ts, v in readings:
        buckets[ts.hour].append(v)
    mean = np.array([np.mean(buckets[h]) if buckets[h] else 0.0 for h in range(24)])
    std = np.array([np.std(buckets[h]) if buckets[h] else 0.0 for h in range(24)])
    return mean, std


def detect(readings: list[tuple[datetime, float]]) -> dict | None:
    """Detect one dominant sustained-high anomaly in the trailing week."""
    if len(readings) < 24 * 14:
        return None
    mean, std = _hourly_baseline(readings[: len(readings) // 2])
    latest = max(ts for ts, _ in readings)
    window_start = latest - timedelta(days=7)
    recent = [(ts, v) for ts, v in readings if ts >= window_start]

    over_days = 0
    excess_total = 0.0
    flagged_hours = 0
    hour_hits: dict[int, int] = {}
    per_day: dict = {}
    for ts, v in recent:
        exp = mean[ts.hour]
        hi = exp + 2.5 * std[ts.hour]
        d = ts.date()
        per_day.setdefault(d, 0)
        if v > hi and exp > 0:
            per_day[d] += 1
            excess_total += v - exp
            flagged_hours += 1
            hour_hits[ts.hour] = hour_hits.get(ts.hour, 0) + 1
    for d, n in per_day.items():
        if n >= 4:
            over_days += 1

    if over_days < 3:
        return None
    return {
        "window_start": window_start, "detected_at": latest,
        "excess_kwh": excess_total, "over_days": over_days,
        "severity": "high" if over_days >= 5 else "medium",
        # Average excess per flagged interval (kW, since readings are hourly
        # kWh) and the hour-of-day band the excess concentrates in, so
        # narrative text can say "afternoon" instead of guessing.
        "avg_excess_kw": excess_total / flagged_hours if flagged_hours else 0.0,
        "time_of_day": _time_of_day_label(hour_hits),
    }


def _time_of_day_label(hour_hits: dict[int, int]) -> str:
    if not hour_hits:
        return "daytime"
    bands = {"overnight": range(0, 6), "morning": range(6, 12), "afternoon": range(12, 18), "evening": range(18, 24)}
    weight = {name: sum(n for h, n in hour_hits.items() if h in hours) for name, hours in bands.items()}
    return max(weight, key=weight.get)


def interval_bars(readings: list[tuple[datetime, float]], detection: dict, n: int = 14) -> list[dict]:
    """Sample n evenly-spaced points across [window_start-n_days, detected_at]
    (peak-of-day value each day) and scale to 20-90px bar heights, flagged =
    inside the detected window."""
    if not readings:
        return []
    mean, std = _hourly_baseline(readings)
    end = detection["detected_at"]
    start = end - timedelta(days=n)
    days = [start + timedelta(days=i) for i in range(n)]
    daily_peak = {}
    for ts, v in readings:
        if start <= ts <= end:
            d = ts.date()
            daily_peak[d] = max(daily_peak.get(d, 0.0), v)
    vals = [daily_peak.get(d.date(), 0.0) for d in days]
    vmax = max(vals) if any(vals) else 1.0
    bars = []
    for d, v in zip(days, vals):
        h = round(20 + (v / vmax) * 70) if vmax else 20
        bars.append({"hPx": h, "flagged": d.date() >= detection["window_start"].date()})
    return bars
