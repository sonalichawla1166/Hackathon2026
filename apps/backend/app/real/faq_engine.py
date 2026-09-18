"""Portal FAQ content generated from the real hybrid RAG engine (same
search_docs/lookup_tariff path as /chat), replacing the prototype's
hardcoded Q&A — which, being ported verbatim from the original Con Edison
prototype, cited "Con Edison SC 1 tariff" for a PSEG Long Island product.

The FAQ panel doesn't take live input, so these are asked once and cached
rather than re-asking the LLM on every page load.
"""
from __future__ import annotations

from . import chat_engine
from .config import DEMO_CUSTOMER_ID
from .db import SessionLocal

_QUESTIONS = [
    "How is my delivery charge calculated?",
    "How do net metering credits work if I install rooftop solar?",
    "What is the basic service charge, and does it change if I use less power?",
    "What are my rights as a customer if I have a billing dispute?",
]

_cache: list[dict] | None = None


def _build() -> list[dict]:
    db = SessionLocal()
    try:
        out = []
        for q in _QUESTIONS:
            answer, cites = chat_engine.ask(db, DEMO_CUSTOMER_ID, q)
            out.append({"q": q, "a": answer, "cite": cites[0] if cites else "PSEG Long Island rate guide"})
        return out
    finally:
        db.close()


def faqs() -> list[dict]:
    global _cache
    if _cache is None:
        _cache = _build()
    return _cache
