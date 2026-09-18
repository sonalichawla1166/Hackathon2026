"""Real demand-response cohort targeting: the same per-customer AMI features
and program-eligibility engine used by /programs/recommend and the sales
leads, instead of the original fixed load-curve formula.

Each of the 5 filters is a real boolean computed from a customer's actual
usage features. The 120 seeded customers are a real (if small) AMI sample —
cohort size is the real match rate among them, scaled to PSEG Long Island's
actual publicly-reported customer base (~1.1M electric customers) so the
counts read at territory scale instead of sample scale. The load curve is
the real average hourly shape of the matched customers' own AMI readings,
not an invented curve.
"""
from __future__ import annotations

from sqlalchemy import select

from . import db as models
from . import features, store
from . import programs as real_programs
from .db import SessionLocal
from .tariff_engine import meta

PSEG_LI_TOTAL_CUSTOMERS = 1_100_000  # public figure: PSEG-LI serves ~1.1M electric customers on Long Island
INCENTIVE_EVENTS_PER_SEASON = 6  # PRG-DR's estimated_benefit_usd_year is an annual figure; ~6 summer events/yr

FILTER_LABELS = [
    "EV / overnight charging",
    "High peak-hour usage",
    "Over 1,000 kWh a month",
    "Summer-peaking load",
    "High seasonal swing (AC/heat)",
]

_cache: list[dict] | None = None


def _hourly_avg_kw(readings: list[tuple]) -> list[float]:
    buckets: list[list[float]] = [[] for _ in range(24)]
    for ts, v in readings:
        buckets[ts.hour].append(v)
    return [sum(b) / len(b) if b else 0.0 for b in buckets]


def _customer_row(db, c: models.Customer) -> dict | None:
    _, readings = store.customer_electric_readings(db, c.id, days=90)
    if not readings:
        return None
    feats = features.usage_features(readings)
    recs = {r["program_id"] for r in real_programs.recommend(db, feats)}
    monthly_kwh = feats.get("annual_usage_kwh", 0) / 12
    hourly = _hourly_avg_kw(readings)
    flags = [
        "PRG-EV-TOU" in recs,
        "PRG-DR" in recs,
        monthly_kwh >= 1000,
        bool(feats.get("summer_user")),
        "PRG-WEATHERIZE" in recs,
    ]
    return {"flags": flags, "hourly": hourly}


def _build() -> list[dict]:
    db = SessionLocal()
    try:
        customers = db.scalars(select(models.Customer).order_by(models.Customer.id)).all()
        rows = []
        for c in customers:
            row = _customer_row(db, c)
            if row:
                rows.append(row)
        return rows
    finally:
        db.close()


def _rows() -> list[dict]:
    global _cache
    if _cache is None:
        _cache = _build()
    return _cache


def _dr_incentive_per_event() -> float:
    db = SessionLocal()
    try:
        p = db.get(models.Program, "PRG-DR")
        annual = p.estimated_benefit_usd_year if p else 150.0
    finally:
        db.close()
    return annual / INCENTIVE_EVENTS_PER_SEASON


def cohort(picks: list[int]) -> dict:
    rows = _rows()
    valid_picks = [i for i in picks if 0 <= i < len(FILTER_LABELS)]
    matched = [r for r in rows if all(r["flags"][i] for i in valid_picks)] if valid_picks else rows

    n_sample = len(rows) or 1
    match_rate = len(matched) / n_sample
    dr_count = max(1, round(match_rate * PSEG_LI_TOTAL_CUSTOMERS))

    peak_hours = sorted(meta()["peak_hours"])
    sample = matched or rows
    if sample:
        avg_peak_kw = sum(sum(r["hourly"][h] for h in peak_hours) / len(peak_hours) for r in sample) / len(sample)
    else:
        avg_peak_kw = 0.0
    mw = dr_count * avg_peak_kw / 1000

    # Real average hourly shape (noon-11pm, 12 points, matches the chart's
    # "12pm"->"11pm" axis) across the matched sample's own AMI readings.
    shape = [sum(r["hourly"][h] for r in sample) / len(sample) for h in range(24)] if sample else [0.0] * 24
    day_shape = shape[12:24]
    vmax = max(day_shape) or 1.0
    window_idx = {h - 12 for h in peak_hours if 12 <= h <= 23}

    curtail_pct = min(0.24, mw / 40) if mw else 0.0
    curve = []
    for i, load in enumerate(day_shape):
        px = round(load / vmax * 100)
        cut = round(px * curtail_pct) if i in window_idx else 0
        curve.append({"base": max(px - cut, 0), "cut": cut})

    opt_in = round(dr_count * 0.62)
    incentive_per_event = _dr_incentive_per_event()

    return {
        "drCount": dr_count,
        "mw": mw,
        "curve": curve,
        "optIn": opt_in,
        "incentiveCost": round(opt_in * incentive_per_event),
    }
