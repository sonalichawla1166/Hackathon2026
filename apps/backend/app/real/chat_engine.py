"""Hybrid RAG orchestration (docs/IMPLEMENTATION_PLAN.md §1.2): Azure OpenAI
tool-calling over two tools — search_docs (vector search over PSEG-LI
narrative docs) and lookup_tariff (exact numbers from tariffs.json). Returns
(answer, cites) where cites is a list of plain display strings, matching
OneGridAI's simple `cites: string[]` chat shape (vs. the richer
{source_file,page,...} objects used in the original Phase 0 API.md).
"""
from __future__ import annotations

import json

from sqlalchemy.orm import Session

from . import llm, rag, store, tariff_engine
from .config import settings

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_docs",
            "description": "Search PSEG Long Island tariff, FAQ, rights and rate documents for narrative/explanatory content (how net metering works, service rules, definitions). Use for anything except looking up an exact rate number.",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "lookup_tariff",
            "description": "Get exact PSEG-LI rate figures (delivery charges, TOU windows, daily service charge, net-metering credit). Pass a rate_code (180, 194, or 195) for that plan, or omit it for global meta (peak hours, published power supply rate, net metering).",
            "parameters": {
                "type": "object",
                "properties": {"rate_code": {"type": "string", "enum": ["180", "194", "195"]}},
            },
        },
    },
]

SYSTEM = (
    "You are the PSEG Long Island customer assistant, embedded in the OneGridAI app. "
    "Answer billing, rate-plan, net-metering and service questions in plain, friendly "
    "language for a residential customer. ALWAYS ground factual claims in the tools: "
    "use lookup_tariff for exact rate numbers and search_docs for explanations. Never "
    "invent rate figures. Keep answers to 2-4 sentences."
)

# Pretty display names for the PSEG-LI source files (used in chat citations).
_PRETTY_SOURCE = {
    "PSEG_Rates_Resident-2025.pdf": "PSEG-LI Residential Electric Rates Guide",
    "PSEG_Rates_Commercial-2025.pdf": "PSEG-LI Commercial Electric Rates Guide",
    "LIPA-Tariff-January-2026.pdf": "LIPA Tariff for Electric Service",
    "PSEG_Customer Rights.pdf": "PSEG-LI Customer Rights",
    "PSEG_rights-resi.pdf": "PSEG-LI Residential Rights",
    "PSEG_commrights.pdf": "PSEG-LI Commercial Rights",
}


def _cite_str(source_file: str, page: int | None) -> str:
    name = _PRETTY_SOURCE.get(source_file, source_file)
    return f"{name} · p.{page}" if page else name


def _run_tool(name: str, args: dict, cites: list[str]) -> str:
    if name == "lookup_tariff":
        code = args.get("rate_code")
        if code:
            try:
                cites.append(f"PSEG-LI Residential Electric Rates Guide · Rate {code}")
                return json.dumps(tariff_engine.get_tariff(code))
            except KeyError:
                return json.dumps({"error": "unknown rate_code"})
        return json.dumps(tariff_engine.meta())
    if name == "search_docs":
        hits = rag.search(args.get("query", ""), k=4)
        for h in hits[:2]:
            cite = _cite_str(h["source_file"], h.get("page"))
            if cite not in cites:
                cites.append(cite)
        return json.dumps([{"source": h["source_file"], "page": h.get("page"),
                            "text": (h["text"] or "")[:600]} for h in hits])
    return json.dumps({"error": "unknown tool"})


def summarize_call(transcript: list[dict], customer_name: str) -> str:
    """One-paragraph agent-facing wrap-up of a call transcript. No tools —
    this is condensing what was already said, not answering anything new —
    so it deliberately bypasses ask()'s forced first-turn tool call. Falls
    back to a plain template when the LLM isn't configured."""
    customer_lines = [t["text"] for t in transcript if t.get("who") != "Agent"]
    if not llm.available() or not transcript:
        topics = "; ".join(customer_lines[:3]) or "no customer questions logged"
        return f"{customer_name} called about: {topics}. Answers were grounded in PSEG-LI tariff documents."
    lines = "\n".join(f"{t.get('who', '?')}: {t.get('text', '')}" for t in transcript)
    resp = llm.complete(
        system=("You write terse after-call notes for a utility support agent. Summarize the call "
                "in 2-3 sentences: what the customer asked, what was resolved, and any follow-up. "
                "Plain prose, no bullet points, no preamble."),
        messages=[{"role": "user", "content": f"Customer: {customer_name}\n\nTranscript:\n{lines}"}],
        max_tokens=200,
    )
    if resp is None:
        return f"{customer_name} called about: {'; '.join(customer_lines[:3])}."
    return (resp.choices[0].message.content or "").strip()


def _tidy_fragment(text: str, limit: int = 280) -> str:
    """Chunks are cut at fixed character offsets, so they routinely start and
    end mid-word ("llowing additional charges"). Trim to word boundaries and
    mark the cuts so the evidence panel reads as quoted text, not noise."""
    t = " ".join((text or "").split())
    lead = ""
    if t and t[0].islower() and " " in t:
        t = t.split(" ", 1)[1]
        lead = "…"
    if len(t) > limit:
        t = t[:limit].rsplit(" ", 1)[0] + "…"
    return lead + t


def retrieve_for_display(query: str, k: int = 3) -> list[dict]:
    """Return raw chunks for display in the agent copilot UI: [{src, score, text}]."""
    hits = rag.search(query, k=k)
    out = []
    for h in hits:
        name = _PRETTY_SOURCE.get(h["source_file"], h["source_file"])
        page = h.get("page")
        src = f"{name} · p.{page}" if page else name
        dist = h.get("distance", 0.0)
        score = f"{max(0.0, 1.0 - dist):.2f}"
        out.append({"src": src, "score": score, "text": _tidy_fragment(h["text"])})
    return out


def ask(db: Session, customer_id: str, message: str) -> tuple[str, list[str]]:
    """Return (answer, cites) for one message, grounded in real PSEG-LI data."""
    cites: list[str] = []
    cust = store.get_customer(db, customer_id)
    system = SYSTEM
    if cust:
        system += f"\n\nCurrent customer: {cust.name}, on Rate {cust.rate_code}, {cust.city}."

    if not llm.available():
        hits = rag.search(message, k=3)
        for h in hits[:2]:
            cites.append(_cite_str(h["source_file"], h.get("page")))
        if hits:
            answer = (
                "AI narration is offline (no AZURE_OPENAI_ENDPOINT/AZURE_OPENAI_KEY set) — "
                f"here is the most relevant passage: {hits[0]['text'][:280].strip()}..."
            )
        else:
            answer = ("AI narration is offline and no indexed documents were found. "
                      "Run backend/ingest.py to build the PSEG-LI knowledge base.")
        return answer, cites

    messages: list[dict] = [{"role": "user", "content": message}]
    for i in range(4):
        # Force a tool call on the first turn only — gpt-4o-mini will
        # otherwise sometimes answer straight from its own knowledge despite
        # the system prompt, which breaks the "always grounded" guarantee.
        # Once real tool results are in context, leave it to "auto" so the
        # model can actually conclude with a text answer.
        tool_choice = "required" if i == 0 else "auto"
        resp = llm.complete(system=system, messages=messages, tools=TOOLS, tool_choice=tool_choice)
        if resp is None:
            break
        msg = resp.choices[0].message
        tool_calls = msg.tool_calls or []
        if not tool_calls:
            return (msg.content or "").strip(), cites
        messages.append({
            "role": "assistant",
            "content": msg.content,
            "tool_calls": [
                {"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                for tc in tool_calls
            ],
        })
        for tc in tool_calls:
            args = json.loads(tc.function.arguments or "{}")
            output = _run_tool(tc.function.name, args, cites)
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": output})

    return "Sorry, I could not complete that request.", cites
