from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from ..real import features, programs as real_programs, store
from ..real.config import DEMO_CUSTOMER_ID
from ..real.db import SessionLocal
from ..session import Session, current_session

router = APIRouter(tags=["programs"])


def _recommend() -> list[dict]:
    db = SessionLocal()
    try:
        _, readings = store.customer_electric_readings(db, DEMO_CUSTOMER_ID)
        feats = features.usage_features(readings)
        return real_programs.recommend(db, feats)
    finally:
        db.close()


def _payload(session: Session):
    recs = _recommend()
    out = []
    for i, r in enumerate(recs):
        out.append({
            "name": r["name"], "why": r["fit_reason"],
            "value": f"Saves about ${r['estimated_benefit_usd_year']:,.0f} a year"
                    if r["category"] != "efficiency" else f"Estimated ${r['estimated_benefit_usd_year']:,.0f}/yr value",
            "match": round(r["score"] * 100),
            "matchLabel": f"{round(r['score'] * 100)}% match",
            "enrolled": i in session.enrolled,
        })
    return {"intro": "Ranked against your last 12 months of interval data, not a mailing list.", "programs": out}


@router.get("/programs/recommend")
def get_programs(session: Session = Depends(current_session)):
    return _payload(session)


@router.post("/programs/{index}/enroll")
def toggle_enroll(index: int, session: Session = Depends(current_session)):
    n = len(_recommend())
    if not 0 <= index < n:
        raise HTTPException(status_code=404, detail="No such program")
    if index in session.enrolled:
        session.enrolled.remove(index)
    else:
        session.enrolled.append(index)
    return _payload(session)
