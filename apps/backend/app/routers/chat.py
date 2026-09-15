from __future__ import annotations

from fastapi import APIRouter, Depends

from ..data import KB
from ..real import chat_engine
from ..real.config import DEMO_CUSTOMER_ID
from ..real.db import SessionLocal
from ..schemas import ChatRequest
from ..session import Session, current_session

router = APIRouter(tags=["chat"])


def _log_payload(session: Session):
    return [{"role": m.role, "text": m.text, "cites": m.cites} for m in session.log]


def _suggestions(session: Session):
    # Question text kept as curated demo prompts; answers now always come
    # from the real hybrid RAG engine (search_docs / lookup_tariff), not the
    # static KB — see app/real/chat_engine.py.
    return [k.q for k in KB if k.q not in session.asked][:3]


@router.get("/chat")
def get_chat(session: Session = Depends(current_session)):
    return {"log": _log_payload(session), "suggestions": _suggestions(session)}


@router.post("/chat")
async def post_chat(body: ChatRequest, session: Session = Depends(current_session)):
    db = SessionLocal()
    try:
        answer, cites = chat_engine.ask(db, DEMO_CUSTOMER_ID, body.text)
    finally:
        db.close()
    session.real_ask(body.text, answer, cites)
    return {"log": _log_payload(session), "suggestions": _suggestions(session)}
