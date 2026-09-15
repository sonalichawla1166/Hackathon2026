"""Predictive maintenance risk scoring, returning structured {k,v,w} drivers
directly from the raw asset fields — matches the ops/assets screen's driver
format exactly, so no string-parsing round trip is needed.
"""
from __future__ import annotations

from . import db as models

# Same weights as the score breakdown below (age/load/failures/heat/health).
_WEIGHTS = {"age": 0.30, "load": 0.20, "failures": 0.20, "heat": 0.15, "health": 0.15}


def score(a: models.Asset) -> dict:
    age_n = min((a.age_years or 0) / 40.0, 1.0)
    load_n = min((a.load_factor or 0), 1.0)
    fails_n = min((a.failures_past or 0) / 3.0, 1.0)
    heat_n = min(max(((a.oil_temp_c or 40) - 40) / 40.0, 0.0), 1.0)
    health_n = 1.0 - (a.health_index if a.health_index is not None else 0.7)

    risk = (_WEIGHTS["age"] * age_n + _WEIGHTS["load"] * load_n + _WEIGHTS["failures"] * fails_n
            + _WEIGHTS["heat"] * heat_n + _WEIGHTS["health"] * health_n)
    risk = round(min(risk, 1.0), 3)

    drivers = [
        {"k": "Age vs. 40y horizon", "v": f"{a.age_years:.0f} yrs", "w": f"{round(age_n * _WEIGHTS['age'] * 100)}%"},
        {"k": "Load factor", "v": f"{(a.load_factor or 0):.2f}x rated", "w": f"{round(load_n * _WEIGHTS['load'] * 100)}%"},
        {"k": "Past failures", "v": f"{a.failures_past or 0}", "w": f"{round(fails_n * _WEIGHTS['failures'] * 100)}%"},
        {"k": "Oil temp above baseline", "v": f"+{max((a.oil_temp_c or 40) - 40, 0):.0f} C", "w": f"{round(heat_n * _WEIGHTS['heat'] * 100)}%"},
        {"k": "Health index", "v": f"{(a.health_index or 0.7):.2f}", "w": f"{round(health_n * _WEIGHTS['health'] * 100)}%"},
    ]
    drivers.sort(key=lambda d: float(d["w"].rstrip("%")), reverse=True)

    band = "high" if risk >= 0.66 else "medium" if risk >= 0.4 else "low"
    action = {
        "high": "Inspect within 7 days. Thermal scan plus oil sample; add to the next crew dispatch.",
        "medium": "Add to the next monthly inspection cycle. No emergency truck roll warranted.",
        "low": "Monitor; no action needed this cycle.",
    }[band]

    return {"risk": risk, "band": band, "drivers": drivers[:4], "action": action}
