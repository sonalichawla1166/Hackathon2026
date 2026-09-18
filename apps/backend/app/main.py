from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .real.db import init_db as init_real_db
from .real import llm as real_llm, rag as real_rag, sarvam as real_sarvam
from .routers import account, anomalies, auth, bill, chat, copilot, ops, outages, payments, portal, programs, sales, simulate, voice

app = FastAPI(
    title="OneGridAI API",
    description=(
        "Backend for the OneGridAI concept (CG Infinity, Hackathon 2026). "
        "Same response contract the Expo app was already built against "
        "(API.md), backed end-to-end by a real DB, real PSEG-LI tariff math, "
        "real hybrid RAG, and real per-customer usage features: account, "
        "chat, bill, simulate, anomalies, programs, ops-assets, copilot, "
        "outages, payments, demand response, portal FAQs and field sales "
        "leads are all derived from the seeded customer/AMI/asset data — "
        "see README.md."
    ),
    version="1.2.0",
)


@app.on_event("startup")
def _startup():
    # Idempotent: creates tables only if missing. Run seed.py separately to
    # populate real data, and ingest.py to build the PSEG-LI vector index.
    init_real_db()

# Dev-friendly CORS: the Expo web build and Expo Go both hit this from
# unpredictable local origins (localhost:8081, a LAN IP, exp://...), so allow
# everything rather than hand-maintaining an allowlist. Tighten this before
# any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(voice.router)
app.include_router(account.router)
app.include_router(chat.router)
app.include_router(bill.router)
app.include_router(simulate.router)
app.include_router(anomalies.router)
app.include_router(programs.router)
app.include_router(outages.router)
app.include_router(payments.router)
app.include_router(portal.router)
app.include_router(ops.router)
app.include_router(copilot.router)
app.include_router(sales.router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "real_vector_store_ready": real_rag.is_ready(),
        # Quick self-diagnosis for "AI narration is offline" — check these
        # are both true before assuming there's a code bug. False usually
        # means the running process needs a restart (env vars load once at
        # startup) or `pip install -r requirements.txt` hasn't been re-run.
        "azure_openai_available": real_llm.available(),
        "sarvam_available": real_sarvam.available(),
    }
