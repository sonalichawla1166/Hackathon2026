# OneGridAI backend

FastAPI backend for the OneGridAI concept — serves the same scripted
copy/numbers/formulas the Expo app (`apps/mobile`) previously computed
client-side, now as a real HTTP API. See [`API.md`](./API.md) for the full
endpoint reference.

## Prerequisites

- Python 3.11+

## Setup

```bash
cd apps/backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run it

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API root: `http://localhost:8000`
- Interactive docs (Swagger UI): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

`--host 0.0.0.0` matters if you're testing the Expo app on a physical phone
via Expo Go — the phone needs to reach your dev machine's LAN IP, not just
`localhost`. The Expo app auto-detects this (see `apps/mobile/README.md`);
just make sure the backend is listening on `0.0.0.0`, not `127.0.0.1`.

## Project structure

```
app/
  main.py       FastAPI app, CORS, router registration
  data.py       mock content/constants — ported verbatim from the prototype
  formulas.py   bill/solar/rate-plan/demand-response math — ported from
                apps/mobile/src/state/selectors.ts
  session.py    in-memory per-session state (chat log, enrollments, payment/
                report/dispatch/call-progress flags) — see API.md for what's
                session-backed vs. stateless
  schemas.py    Pydantic request bodies
  routers/      one module per resource (account, chat, bill, simulate,
                anomalies, programs, outages, payments, portal, ops, copilot)
```

## Notes

- State is in-memory and per-process — restarting the server resets
  everything. There's no database; this is a concept/demo backend.
- CORS is wide open (`allow_origins=["*"]`) for local development across
  Expo's unpredictable dev origins (web, LAN IP, `exp://`). Tighten this
  before any real deployment.
- No authentication. Every request is "Maria Alvarez" unless you set a
  different `X-Session-Id` header.
