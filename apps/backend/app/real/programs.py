"""Program recommendation: explainable rule-based matching over usage
features, read from data/programs.json (loaded into the DB by seed.py)."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import db as models


def _fit(program: models.Program, feats: dict) -> tuple[bool, float, str]:
    rules = program.eligibility or {}
    fit_score, checks = 0.0, 0
    for key, threshold in rules.items():
        if key.endswith("_min"):
            feat = key[:-4]
            val = feats.get(feat, 0.0)
            checks += 1
            if val >= threshold:
                fit_score += min(val / threshold, 2.0)
            else:
                return False, 0.0, ""
        elif key == "summer_user":
            checks += 1
            if bool(feats.get("summer_user")) != bool(threshold):
                return False, 0.0, ""
            fit_score += 1.0
    fit_score = fit_score / checks if checks else 0.5
    reason = (program.fit_template or program.name).format(
        night_pct=round(feats.get("night_load_ratio", 0) * 100),
        day_pct=round(feats.get("daytime_load_ratio", 0) * 100),
        peak_pct=round(feats.get("peak_load_ratio", 0) * 100),
        alwayson_pct=round(feats.get("always_on_ratio", 0) * 100),
        swing=feats.get("seasonal_swing_ratio", 1.0),
    )
    return True, round(min(fit_score, 1.0), 2), reason


def recommend(db: Session, feats: dict) -> list[dict]:
    out = []
    for p in db.scalars(select(models.Program)).all():
        eligible, fit_score, reason = _fit(p, feats)
        if eligible:
            out.append({
                "program_id": p.program_id, "name": p.name, "category": p.category,
                "fit_reason": reason, "estimated_benefit_usd_year": p.estimated_benefit_usd_year,
                "score": fit_score,
            })
    out.sort(key=lambda r: r["score"], reverse=True)
    return out
