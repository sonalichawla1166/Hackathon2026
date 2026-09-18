from __future__ import annotations

from fastapi import APIRouter, Depends

from ..real import chat_engine
from ..real.config import DEMO_CUSTOMER_ID
from ..real.db import SessionLocal
from ..schemas import ChatRequest
from ..session import Session, current_session

router = APIRouter(tags=["chat"])

# Curated starter prompts for the suggestion chips — every answer always
# comes from the real hybrid RAG engine (search_docs / lookup_tariff), never
# from this list; these are just plausible things a PSEG-LI residential
# customer would ask, to seed the "Ask" tab before the user types anything.
_SUGGESTED_QUESTIONS = [
    "Why is my bill higher this month?",
    "How do net metering credits work?",
    "What is the basic service charge?",
    "Am I on the cheapest rate plan?",
    "How do I stop service when I move?",
]


def _log_payload(session: Session):
    return [{"role": m.role, "text": m.text, "cites": m.cites} for m in session.log]


def _suggestions(session: Session):
    return [q for q in _SUGGESTED_QUESTIONS if q not in session.asked][:3]


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
