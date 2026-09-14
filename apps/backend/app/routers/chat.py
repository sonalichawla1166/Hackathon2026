from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends

from ..data import KB
from ..schemas import ChatRequest
from ..session import Session, current_session

router = APIRouter(tags=["chat"])


def _log_payload(session: Session):
    return [{"role": m.role, "text": m.text, "cites": m.cites} for m in session.log]


def _suggestions(session: Session):
    return [k.q for k in KB if k.q not in session.asked][:3]


@router.get("/chat")
def get_chat(session: Session = Depends(current_session)):
    return {"log": _log_payload(session), "suggestions": _suggestions(session)}


@router.post("/chat")
async def post_chat(body: ChatRequest, session: Session = Depends(current_session)):
    # Mirrors the prototype's 700ms "Searching tariff documents…" delay —
    # the network round trip itself is now that loading state.
    await asyncio.sleep(0.7)
    is_suggestion = any(k.q == body.text for k in KB)
    if is_suggestion:
        session.ask(body.text)
    else:
        session.free_ask(body.text)
    return {"log": _log_payload(session), "suggestions": _suggestions(session)}
