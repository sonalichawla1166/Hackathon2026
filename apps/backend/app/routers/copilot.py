"""Agent copilot surface — same knowledge base as the customer chat, agent-facing prompt.

The scripted transcript (CALL) seeds the call so the demo has a predictable
opening; from there the transcript is live — spoken questions (POST /ask)
and inserted answers (POST /use-suggestion) append to it, and POST /complete
closes the call with a generated wrap-up. Customer facts, bill figures,
anomaly status, and suggested answers are all real: backed by the DB, tariff
engine, anomaly detector, and hybrid RAG (chat_engine).
"""
from __future__ import annotations

import time
from datetime import timedelta

from fastapi import APIRouter, Depends

from ..data import CALL
from ..real import anomaly as real_anomaly
from ..real import chat_engine, rag, sarvam, store, tariff_engine
from ..real.config import ANOMALY_CUSTOMER_ID, DEMO_CUSTOMER_ID
from ..real.db import SessionLocal
from ..schemas import ActionToggleRequest, ChatRequest
from ..session import Session, current_session

router = APIRouter(tags=["copilot"])

# Customer questions at each step of the call — used as RAG queries.
# Indices mirror the CALL list: only Maria's lines are real questions.
_STEP_QUERIES = {
    0: "Why did my bill go up this month? What drove the increase?",
    1: "Why did my bill go up this month? What drove the increase?",
    2: "What is the basic service charge and why do I pay it when I'm away?",
    3: "What is the basic service charge and why do I pay it when I'm away?",
    4: "If I put solar panels on my roof, does the net metering credit come back as a cheque?",
}

# Agent next-best-action suggestions per step.
_NEXT_ACTIONS = {
    0: ["Pull up the September bill breakdown in the app", "Show the rate-tier explanation", "Log the bill inquiry on the account"],
    1: ["Pull up the September bill breakdown in the app", "Show the rate-tier explanation", "Log the bill inquiry on the account"],
    2: ["Explain the fixed service charge line item", "Offer to check if the customer qualifies for a low-income credit", "Confirm billing address is correct"],
    3: ["Explain the fixed service charge line item", "Offer to check if the customer qualifies for a low-income credit", "Confirm billing address is correct"],
    4: ["Open the solar simulator for a 6 kW array on this customer", "Send net-metering FAQ link via app notification", "Note solar interest flag on account"],
}


def _ensure_call(session: Session) -> None:
    """Seed the live transcript from the scripted opening the first time any
    copilot endpoint is hit for this session, and start the clock."""
    if session.copilot_seeded:
        return
    session.copilot_transcript = [{"who": c.who, "text": c.text, "source": "script"} for c in CALL[: session.call_idx + 1]]
    session.call_started_at = time.time()
    session.copilot_seeded = True


def _customer_label(db) -> str:
    cust = store.get_customer(db, DEMO_CUSTOMER_ID)
    return (cust.name.split()[0] if cust and cust.name else "Customer")


def _get_suggestion(session: Session, db, idx: int) -> dict:
    """Return cached suggestion for this step, generating it via real RAG if needed."""
    if idx in session.copilot_cache:
        return session.copilot_cache[idx]

    query = _STEP_QUERIES.get(idx, _STEP_QUERIES[4])
    answer, cites = chat_engine.ask(db, DEMO_CUSTOMER_ID, query)
    chunks = chat_engine.retrieve_for_display(query, k=3)
    result = {"text": answer, "cites": cites, "chunks": chunks}
    session.copilot_cache[idx] = result
    return result


def _real_facts(db) -> list[dict]:
    cust = store.get_customer(db, DEMO_CUSTOMER_ID)
    if not cust:
        return []
    meter, readings = store.customer_electric_readings(db, DEMO_CUSTOMER_ID)
    _, anom_readings = store.customer_electric_readings(db, ANOMALY_CUSTOMER_ID)
    open_tickets = 1 if real_anomaly.detect(anom_readings) else 0
    facts = [
        {"k": "Rate class", "v": f"Rate {cust.rate_code} (PSEG-LI Residential)"},
        {"k": "Account since", "v": str(meter.install_date.year) if meter else "-"},
        {"k": "Open tickets", "v": f"{open_tickets} anomaly" if open_tickets else "None"},
    ]
    if readings:
        latest_ts = max(ts for ts, _ in readings)
        cur_start = latest_ts - timedelta(days=30)
        cur = [(ts, v) for ts, v in readings if ts >= cur_start]
        if cur:
            bill = tariff_engine.compute_bill(cur, cust.rate_code, cur_start, latest_ts)
            prev_start = cur_start - timedelta(days=30)
            prev = [(ts, v) for ts, v in readings if prev_start <= ts < cur_start]
            facts.insert(0, {"k": "Latest bill", "v": f"${bill['total_usd']:,.2f}"})
            if prev:
                prev_bill = tariff_engine.compute_bill(prev, cust.rate_code, prev_start, cur_start)
                delta_pct = (bill["total_usd"] - prev_bill["total_usd"]) / max(prev_bill["total_usd"], 0.01) * 100
                sign = "+" if delta_pct >= 0 else ""
                facts.insert(1, {"k": "Change vs prior", "v": f"{sign}{delta_pct:.1f}%"})
    return facts


def _customer_question(idx: int) -> str | None:
    """Most recent thing the customer (not the agent) said, at or before idx —
    that's what the suggested answer should be responding to. Not currently
    wired into _payload (see _get_suggestion/_STEP_QUERIES below, which
    /copilot/rephrase also depends on) but kept as an alternate, more
    transcript-driven way to derive the RAG query if CALL grows past the
    steps _STEP_QUERIES covers."""
    for i in range(idx, -1, -1):
        if CALL[i].who == "Maria":
            return CALL[i].text
    return None


def _suggestion_for(session: Session, idx: int) -> dict:
    """Alternate suggestion path built around _customer_question() instead of
    _STEP_QUERIES, caching into session.copilot_suggestions. Not currently
    called by _payload — see _get_suggestion for the active path."""
    if idx in session.copilot_suggestions:
        return session.copilot_suggestions[idx]

    question = _customer_question(idx)
    if question is None:
        return {"text": "", "cites": [], "chunks": []}

    db = SessionLocal()
    try:
        answer, cites = chat_engine.ask(db, DEMO_CUSTOMER_ID, question)
    finally:
        db.close()

    hits = rag.search(question, k=2)
    chunks = [
        {"src": h["source_file"], "score": f"{max(0.0, 1 - h['distance']):.2f}", "text": (h["text"] or "")[:280]}
        for h in hits
    ]

    suggestion = {"text": answer, "cites": cites, "chunks": chunks}
    session.copilot_suggestions[idx] = suggestion
    return suggestion


def _real_anomaly_text(db) -> str:
    meter, readings = store.customer_electric_readings(db, ANOMALY_CUSTOMER_ID)
    if not readings:
        return "No open anomalies detected."
    detection = real_anomaly.detect(readings)
    if not detection:
        return "No open anomalies detected."
    return (
        f"Sustained {detection['avg_excess_kw']:.1f} kW above baseline in the {detection['time_of_day']} "
        f"on {detection['over_days']} of the last 7 days (~{detection['excess_kwh']:.0f} extra kWh). "
        f"Customer notified in-app, not yet acknowledged."
    )


def _elapsed_label(session: Session) -> str:
    if session.call_started_at is None:
        return "00:00"
    end = session.call_ended_at or time.time()
    secs = max(0, int(end - session.call_started_at))
    return f"{secs // 60:02d}:{secs % 60:02d}"


def _payload(session: Session, db) -> dict:
    _ensure_call(session)
    idx = session.call_idx
    suggestion = _get_suggestion(session, db, idx)
    cust = store.get_customer(db, DEMO_CUSTOMER_ID)
    script_done = idx >= len(CALL) - 1
    ended = session.call_ended_at is not None

    return {
        "callTimer": _elapsed_label(session),
        "callStartedAt": session.call_started_at,
        "callEndedAt": session.call_ended_at,
        "customer": {
            "name": cust.name if cust else "Maria Alvarez",
            "account": f"Acct {DEMO_CUSTOMER_ID} · Rate {cust.rate_code}" if cust else f"Acct {DEMO_CUSTOMER_ID}",
            "address": f"{cust.address}, {cust.city}" if cust else "-",
        },
        "transcript": [{"who": t["who"], "text": t["text"]} for t in session.copilot_transcript],
        "facts": _real_facts(db),
        "openAnomaly": _real_anomaly_text(db),
        "suggestion": {
            "text": suggestion["text"],
            "cites": suggestion["cites"],
            "chunks": suggestion["chunks"],
        },
        "advanceLabel": "Script complete" if script_done else "Advance call",
        "callComplete": script_done,
        "callEnded": ended,
        "used": session.used,
        "useLabel": "Inserted" if session.used else "Use this answer",
        "nextActions": [
            {"text": a, "done": a in session.copilot_actions_done}
            for a in _NEXT_ACTIONS.get(idx, _NEXT_ACTIONS[4])
        ],
        "summary": session.copilot_summary,
    }


def _respond(session: Session) -> dict:
    db = SessionLocal()
    try:
        return _payload(session, db)
    finally:
        db.close()


@router.get("/copilot/call")
def get_call(session: Session = Depends(current_session)):
    return _respond(session)


@router.post("/copilot/advance")
def advance_call(session: Session = Depends(current_session)):
    _ensure_call(session)
    if session.call_ended_at is None:
        new_idx = min(len(CALL) - 1, session.call_idx + 2)
        for c in CALL[session.call_idx + 1: new_idx + 1]:
            session.copilot_transcript.append({"who": c.who, "text": c.text, "source": "script"})
        session.call_idx = new_idx
        session.used = False
    return _respond(session)


@router.post("/copilot/use-suggestion")
def use_suggestion(session: Session = Depends(current_session)):
    """Insert the current suggestion into the call as what the agent said —
    the transcript is the record of the call, so 'using' an answer means it
    appears there, not just a label flip."""
    _ensure_call(session)
    if not session.used and session.call_ended_at is None:
        db = SessionLocal()
        try:
            suggestion = _get_suggestion(session, db, session.call_idx)
        finally:
            db.close()
        session.copilot_transcript.append({"who": "Agent", "text": suggestion["text"], "source": "copilot"})
        session.used = True
    return _respond(session)


@router.post("/copilot/ask")
def ask_by_voice(body: ChatRequest, session: Session = Depends(current_session)):
    """Live voice Q&A: the spoken question (transcribed client-side, see the
    mobile useVoiceInput hook) joins the transcript as the customer's line,
    is answered by the same real RAG engine as the scripted suggestions,
    cached into the current call step like /copilot/rephrase, and spoken
    back via Sarvam TTS so the panel both updates and reads the answer aloud."""
    _ensure_call(session)
    idx = session.call_idx
    db = SessionLocal()
    try:
        session.copilot_transcript.append({"who": _customer_label(db), "text": body.text, "source": "voice"})
        answer, cites = chat_engine.ask(db, DEMO_CUSTOMER_ID, body.text)
        chunks = chat_engine.retrieve_for_display(body.text, k=3)
        session.copilot_cache[idx] = {"text": answer, "cites": cites, "chunks": chunks}
        session.used = False
        payload = _payload(session, db)
    finally:
        db.close()
    payload["audio_b64"] = sarvam.tts(answer)
    return payload


@router.post("/copilot/rephrase")
def rephrase_suggestion(session: Session = Depends(current_session)):
    """Re-generate the suggestion for the current step, asking the LLM to
    simplify the language — clears the cache for this step so a fresh
    RAG call runs."""
    _ensure_call(session)
    idx = session.call_idx
    # Drop the cached answer so _get_suggestion re-calls the RAG.
    session.copilot_cache.pop(idx, None)
    query = _STEP_QUERIES.get(idx, _STEP_QUERIES[4])
    rephrase_query = f"Explain this in simpler, shorter language for a customer on the phone: {query}"
    db = SessionLocal()
    try:
        answer, cites = chat_engine.ask(db, DEMO_CUSTOMER_ID, rephrase_query)
        chunks = chat_engine.retrieve_for_display(query, k=3)
        session.copilot_cache[idx] = {"text": answer, "cites": cites, "chunks": chunks}
        session.used = False
        return _payload(session, db)
    finally:
        db.close()


@router.post("/copilot/actions/toggle")
def toggle_action(body: ActionToggleRequest, session: Session = Depends(current_session)):
    _ensure_call(session)
    if body.action in session.copilot_actions_done:
        session.copilot_actions_done.discard(body.action)
    else:
        session.copilot_actions_done.add(body.action)
    return _respond(session)


@router.post("/copilot/complete")
def complete_call(session: Session = Depends(current_session)):
    """End the call: freeze the clock and generate the after-call wrap-up
    once (idempotent — a second call just returns the existing summary)."""
    _ensure_call(session)
    if session.call_ended_at is None:
        session.call_ended_at = time.time()
        db = SessionLocal()
        try:
            name = store.get_customer(db, DEMO_CUSTOMER_ID)
            customer_name = name.name if name else "The customer"
        finally:
            db.close()
        transcript = session.copilot_transcript
        session.copilot_summary = {
            "headline": chat_engine.summarize_call(transcript, customer_name),
            "durationLabel": _elapsed_label(session),
            "stats": [
                {"k": "Customer questions", "v": str(sum(1 for t in transcript if t["who"] != "Agent"))},
                {"k": "Copilot answers used", "v": str(sum(1 for t in transcript if t.get("source") == "copilot"))},
                {"k": "Actions completed", "v": str(len(session.copilot_actions_done))},
            ],
        }
    return _respond(session)


@router.post("/copilot/reset")
def reset_call(session: Session = Depends(current_session)):
    """Start a fresh call in this session — the demo reset button."""
    session.call_idx = 2
    session.used = False
    session.copilot_cache.clear()
    session.copilot_suggestions.clear()
    session.copilot_transcript = []
    session.copilot_seeded = False
    session.call_started_at = None
    session.call_ended_at = None
    session.copilot_actions_done.clear()
    session.copilot_summary = None
    return _respond(session)
