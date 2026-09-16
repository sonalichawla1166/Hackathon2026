# OneGridAI backend

FastAPI backend for the OneGridAI concept. The Expo app (`apps/mobile`) is
already fully integrated against the response contract in [`API.md`](./API.md)
— every endpoint below returns exactly that shape, so **the mobile app
required zero changes** for this merge.

## Real data vs. mock

Two engines sit behind the same contract:

- **`app/real/`** — a real SQLAlchemy DB (PSEG Long Island customers, meters,
  365 days of AMI interval data, tariffs, programs, grid assets), the actual
  PSEG-LI 2026 residential tariff (`data/tariffs.json`, hand-encoded from the
  real rate guide), a statistical anomaly detector, an explainable
  maintenance risk model, and a hybrid RAG assistant (Claude tool-use over
  `search_docs` for narrative PSEG-LI documents + `lookup_tariff` for exact
  rate numbers — see `docs/IMPLEMENTATION_PLAN.md` §1.2 at the repo root).
- **`app/data.py` / `app/formulas.py`** — the original scripted mock content.

| Endpoint | Backed by |
|---|---|
| `/account/summary`, `/chat`, `/bill/explain`, `/simulate`, `/anomalies*`, `/programs*`, `/ops/assets`, `/ops/assets/{id}/dispatch`, `/portal/rates`, `/portal/solar` | **real** (`app/real/`) |
| `/outages/*`, `/payments/*`, `/ops/dr*`, `/copilot/*`, `/sales/*`, `/portal/nav`, `/portal/faqs` | mock (`app/data.py`) — no real backing yet, candidates for the same treatment later |

The demo customer behind every real-data screen is **CUST-0001 = "Maria
Alvarez"** (matches the existing app copy/persona), on PSEG-LI Rate 194. The
`/anomalies` alert is backed by a second seeded customer (CUST-0004) whose
persona actually has an anomaly — see `app/real/config.py`.

## Prerequisites

- Python 3.11+
- The document corpus at `D:\projects\utility-rag\data` (PSEG Long Island
  subfolder) for `ingest.py` — see `CORPUS_DIR`/`PROVIDER_FOLDER` in `.env`.

## Setup

```bash
cd apps/backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env        # add ANTHROPIC_API_KEY for live chat narration (optional)
python seed.py               # builds utility.db (deterministic, ~1M AMI rows)
python ingest.py             # embeds the PSEG-LI corpus into chroma_db/
```

### If `pip install` fails on `chroma-hnswlib`

On Windows (and any machine without a C++ toolchain) the `chromadb` wheel has
to be compiled and the install aborts with
`Microsoft Visual C++ 14.0 or greater is required`. **pip installs nothing when
that happens**, so the whole list looks broken.

`chromadb` is only used by the RAG document search (`app/real/rag.py`), which
imports it lazily and falls back to an empty result set. Everything else — the
API, the database, every screen in the app — runs fine without it. To skip it:

```bash
grep -v "^chromadb" requirements.txt > requirements.nochroma.txt
pip install -r requirements.nochroma.txt
```

Skip `python ingest.py` too — it needs Chroma. To get the document search
working later, install the
[Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
and then `pip install chromadb`.

`/chat` works even without `ANTHROPIC_API_KEY` — it falls back to
retrieval-only (a real citation + passage, no LLM narration).

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
  main.py       FastAPI app, CORS, router registration, real-DB init on startup
  data.py       mock content/constants — ported verbatim from the prototype
  formulas.py   mock bill/solar/rate-plan/demand-response math (still used by
                the endpoints not yet migrated to app/real/)
  session.py    in-memory per-session state (chat log, enrollments, payment/
                report/dispatch/call-progress flags)
  schemas.py    Pydantic request bodies
  routers/      one module per resource — each imports from app/real/ or
                app/data.py depending on the table above
  real/         real data engine: db.py (SQLAlchemy models), tariff_engine.py
                (PSEG-LI bill/solar math), rag.py + chat_engine.py (hybrid
                RAG), anomaly.py, maintenance.py, programs.py, features.py
data/
  tariffs.json  real PSEG-LI 2026 residential rates (180/194/195)
  programs.json program catalog + eligibility rules
seed.py         builds utility.db deterministically
ingest.py       embeds the PSEG-LI document corpus into chroma_db/
```

## Notes

- Session state (chat log, enrollments, payment/report/dispatch flags) stays
  in-memory and per-process, as before. The **real** data (customers, AMI
  readings, tariffs, assets, the vector index) lives in `utility.db` /
  `chroma_db/` and survives restarts.
- CORS is wide open (`allow_origins=["*"]`) for local development across
  Expo's unpredictable dev origins (web, LAN IP, `exp://`). Tighten this
  before any real deployment.
- No authentication. Every request is "Maria Alvarez" (CUST-0001) unless you
  set a different `X-Session-Id` header for session-scoped state (chat log,
  enrollments, dispatch flags) — the underlying real customer is still fixed.
