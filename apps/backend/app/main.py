from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import account, anomalies, bill, chat, copilot, ops, outages, payments, portal, programs, sales, simulate

app = FastAPI(
    title="OneGridAI API",
    description=(
        "Mock backend for the OneGridAI concept (CG Infinity, Hackathon 2026). "
        "Serves the same scripted data/formulas the Expo app used to compute "
        "client-side, now over HTTP so the app is a real full-stack client."
    ),
    version="1.0.0",
)

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
    return {"status": "ok"}
