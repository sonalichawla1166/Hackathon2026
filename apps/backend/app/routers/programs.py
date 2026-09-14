from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from ..data import PROGRAMS
from ..session import Session, current_session

router = APIRouter(tags=["programs"])


def _payload(session: Session):
    out = []
    for i, p in enumerate(PROGRAMS):
        on = i in session.enrolled
        out.append({
            "name": p.name, "why": p.why, "value": p.value,
            "match": p.match,
            "matchLabel": f"{p.match}% match",
            "enrolled": on,
        })
    return {"intro": "Ranked against your last 90 days of interval data, not a mailing list.", "programs": out}


@router.get("/programs/recommend")
def get_programs(session: Session = Depends(current_session)):
    return _payload(session)


@router.post("/programs/{index}/enroll")
def toggle_enroll(index: int, session: Session = Depends(current_session)):
    if not 0 <= index < len(PROGRAMS):
        raise HTTPException(status_code=404, detail="No such program")
    if index in session.enrolled:
        session.enrolled.remove(index)
    else:
        session.enrolled.append(index)
    return _payload(session)
