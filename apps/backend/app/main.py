from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .real.db import init_db as init_real_db
from .real import rag as real_rag
from .routers import account, anomalies, auth, bill, chat, copilot, ops, outages, payments, portal, programs, sales, simulate

app = FastAPI(
    title="OneGridAI API",
    description=(
        "Backend for the OneGridAI concept (CG Infinity, Hackathon 2026). "
        "Same response contract the Expo app was already built against "
        "(API.md), now backed by a real DB, real PSEG-LI tariff math, and "
        "real hybrid RAG for account/chat/bill/simulate/anomalies/programs/"
        "ops-assets. Outages, payments, demand-response, copilot and field "
        "sales remain the original scripted mock (see README)."
    ),
    version="1.1.0",
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
    return {"status": "ok", "real_vector_store_ready": real_rag.is_ready()}
