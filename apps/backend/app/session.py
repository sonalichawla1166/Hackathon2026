"""In-memory per-session state for the handful of things that represent real
persisted facts about the demo customer/call (survive navigating between
screens and surfaces) — everything else (slider values, filter picks, which
row is selected) is treated as pure client-side UI state and passed to
stateless GET endpoints as query params instead. One process, one dict —
fine for a local/demo backend; swap for a real datastore before this ever
sees concurrent production traffic.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from threading import Lock

from fastapi import Header

from .data import find_kb_hit, free_ask_hit


@dataclass
class ChatMessage:
    role: str  # "bot" | "user"
    text: str
    cites: list[str] | None = None


@dataclass
class Session:
    log: list[ChatMessage] = field(default_factory=lambda: [
        ChatMessage(role="bot", text="Hi Maria. I can see your September bill and your meter data. What would you like to know?", cites=None)
    ])
    asked: list[str] = field(default_factory=list)

    alert_ack: bool = False
    enrolled: list[int] = field(default_factory=list)
    reported: bool = False
    paid: bool = False
    dispatched_ids: set[str] = field(default_factory=set)

    call_idx: int = 2
    used: bool = False

    def ask(self, question: str) -> ChatMessage:
        hit = find_kb_hit(question)
        self.log.append(ChatMessage(role="user", text=question))
        self.asked.append(question)
        reply = ChatMessage(role="bot", text=hit.a, cites=hit.cites)
        self.log.append(reply)
        return reply

    def free_ask(self, message: str) -> ChatMessage:
        hit = free_ask_hit(message)
        self.log.append(ChatMessage(role="user", text=message))
        if hit:
            reply = ChatMessage(role="bot", text=hit.a, cites=hit.cites)
        else:
            reply = ChatMessage(
                role="bot",
                text="I could not ground that in your account or the tariff index yet. In the built version this falls back to a handoff with the transcript attached.",
                cites=["Retrieval confidence below threshold"],
            )
        self.log.append(reply)
        return reply


_sessions: dict[str, Session] = {}
_lock = Lock()


def current_session(x_session_id: str | None = Header(default=None, alias="X-Session-Id")) -> Session:
    """FastAPI dependency: resolves (creating if needed) the Session for this
    client. Pass a stable `X-Session-Id` header per device/browser tab so
    concurrent demo users don't share state; omit it and everyone shares the
    "default" session, matching the original single-customer prototype."""
    session_id = x_session_id or "default"
    with _lock:
        if session_id not in _sessions:
            _sessions[session_id] = Session()
        return _sessions[session_id]
