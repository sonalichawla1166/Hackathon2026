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
    per_day: dict = {}
    for ts, v in recent:
        exp = mean[ts.hour]
        hi = exp + 2.5 * std[ts.hour]
        d = ts.date()
        per_day.setdefault(d, 0)
        if v > hi and exp > 0:
            per_day[d] += 1
            excess_total += v - exp
    for d, n in per_day.items():
        if n >= 4:
            over_days += 1

    if over_days < 3:
        return None
    return {
        "window_start": window_start, "detected_at": latest,
        "excess_kwh": excess_total, "over_days": over_days,
        "severity": "high" if over_days >= 5 else "medium",
    }


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
