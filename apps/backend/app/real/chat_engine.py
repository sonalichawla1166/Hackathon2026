"""Hybrid RAG orchestration (docs/IMPLEMENTATION_PLAN.md §1.2): Claude with two
tools — search_docs (vector search over PSEG-LI narrative docs) and
lookup_tariff (exact numbers from tariffs.json). Returns (answer, cites) where
cites is a list of plain display strings, matching OneGridAI's simple
`cites: string[]` chat shape (vs. the richer {source_file,page,...} objects
used in the original Phase 0 API.md).
"""
from __future__ import annotations

import json

from sqlalchemy.orm import Session

from . import llm, rag, store, tariff_engine
from .config import settings

TOOLS = [
    {
        "name": "search_docs",
        "description": "Search PSEG Long Island tariff, FAQ, rights and rate documents for narrative/explanatory content (how net metering works, service rules, definitions). Use for anything except looking up an exact rate number.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
    {
        "name": "lookup_tariff",
        "description": "Get exact PSEG-LI rate figures (delivery charges, TOU windows, daily service charge, net-metering credit). Pass a rate_code (180, 194, or 195) for that plan, or omit it for global meta (peak hours, published power supply rate, net metering).",
        "input_schema": {
            "type": "object",
            "properties": {"rate_code": {"type": "string", "enum": ["180", "194", "195"]}},
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
                "AI narration is offline (no ANTHROPIC_API_KEY set) — here is the most "
                f"relevant passage: {hits[0]['text'][:280].strip()}..."
            )
        else:
            answer = ("AI narration is offline and no indexed documents were found. "
                      "Run backend/ingest.py to build the PSEG-LI knowledge base.")
        return answer, cites

    messages: list[dict] = [{"role": "user", "content": message}]
    for _ in range(4):
        resp = llm.complete(system=system, messages=messages, tools=TOOLS)
        if resp is None:
            break
        blocks = resp.content
        tool_uses = [b for b in blocks if getattr(b, "type", None) == "tool_use"]
        if not tool_uses:
            text = "".join(getattr(b, "text", "") for b in blocks
                           if getattr(b, "type", None) == "text")
            return text.strip(), cites
        messages.append({"role": "assistant", "content": blocks})
        results = []
        for tu in tool_uses:
            output = _run_tool(tu.name, tu.input or {}, cites)
            results.append({"type": "tool_result", "tool_use_id": tu.id, "content": output})
        messages.append({"role": "user", "content": results})

    return "Sorry, I could not complete that request.", cites
