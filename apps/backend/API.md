# OneGridAI API

FastAPI backend for the OneGridAI concept. Serves the same scripted
copy/numbers/formulas the Expo app used to compute client-side
(`apps/mobile/src/data/content.ts` + `state/selectors.ts`), now over HTTP.
Interactive docs at `/docs` once running (see `README.md`).

**Base URL** (dev): `http://localhost:8000`

**Session header**: `X-Session-Id: <any stable string>` — identifies "this
customer" for the handful of endpoints that persist state (chat log, program
enrollment, payment/report/dispatch status, call progress). Omit it and
everyone shares one `"default"` session, matching the original single-customer
prototype. The Expo app generates one random id per app load and sends it on
every request (`src/api/client.ts`).

Everything else (slider positions, filter checkboxes, which row is selected,
which FAQ is open) is **not** server state — it's passed as query params to
stateless GET endpoints that just compute-and-return, and the client is free
to keep it in local UI state (Zustand) between renders.

All responses are JSON. All amounts are pre-formatted strings (e.g. `"$328.78"`)
— the backend owns formatting, same as it owns the formulas.

---

## Account (Home screen)

### `GET /account/summary`
No params. Static home-screen data: customer identity, projected bill total,
6-month usage bar chart, the proactive-alert banner copy, and a teaser for
the top matched program.

## Chat (Customer app "Ask" tab + Public portal "Ask OneGridAI" panel)

Both surfaces share one conversation (same session, same log) — "same brain,
same retrieval index" per the source design.

### `GET /chat`
Returns `{ log: [{role, text, cites}], suggestions: string[] }` — current
conversation and up to 3 not-yet-asked canned questions to show as suggestion
chips.

### `POST /chat`
Body: `{ text: string }`. If `text` exactly matches one of the suggestion
questions, or free text matches by keyword, returns the matching canned
answer; otherwise a graceful "couldn't ground that" fallback. Takes ~700ms
(mirrors the source prototype's "Searching tariff documents…" delay) — treat
the request's in-flight state as that loading indicator. Returns the same
shape as `GET /chat`.

## Bill

### `GET /bill/explain`
No params. Returns `{ period, total, lines: [{label, amount, plain, bg, v, pct}], whyItMoved }`.

## Solar simulator (Customer app "Model solar" + Public portal solar block)

### `GET /simulate?solarKw=6`
`solarKw` (float, 0–12, default 6). Returns
`{ solarKw, solarLabel, billToday, billWithSolar, rows: [{k, v}] }`.
Stateless — call it again whenever the slider moves.

## Anomaly alert

### `GET /anomalies`
No params. Returns `{ title, detail, intervals: [{hPx, flagged}], impact, ack, ctaLabel, ackNote }`.
`ack`/`ctaLabel`/`ackNote` reflect this session's persisted acknowledgement state.

### `POST /anomalies/ack`
No body. Persists `ack = true` for this session. Returns the same shape as `GET /anomalies`.

### `POST /anomalies/dismiss`
No body. Persists `ack = false`. Returns the same shape as `GET /anomalies`.

## Programs ("For you" tab)

### `GET /programs/recommend`
No params. Returns `{ intro, programs: [{name, why, value, match, matchLabel, enrolled}] }`.
`enrolled` reflects this session.

### `POST /programs/{index}/enroll`
Path param `index` (0-based, into the array `GET /programs/recommend` returns).
Toggles enrollment for that program. Returns the same shape as `GET /programs/recommend`.

## Outages (Customer app "Report" tab + Public portal map widget)

### `GET /outages/map`
No params. Returns `{ pins: [{x, y, d, danger}], caption, portalCaption, options: string[] }`.
`options` are the report-a-problem chip labels.

### `POST /outages/report`
Body: `{ picks: number[] }` (indices into `options` the user checked). Persists
`reported = true` for this session. Returns `{ reported, ticket, detail, note, address, meter }`.

## Payments

### `GET /payments/methods`
No params. Returns `{ amountDue, dueDate, options: [{label, detail}], paid }`.
`paid` reflects this session.

### `POST /payments/pay`
Body: `{ method: number }` (index into `options`). Persists `paid = true`.
Returns `{ paid, confirmation, note }`.

## Public portal

### `GET /portal/nav`
No params. Returns `{ nav: string[], poweredBy }`.

### `GET /portal/rates?usage=1240`
`usage` (float, 200–2600, default 1240). Returns `{ usage, plans: [{name, desc, monthly, annual, isBest, delta, deltaColor}] }`.
Stateless — call it again whenever the usage slider moves.

### `GET /portal/solar?kw=6`
`kw` (float, 0–12, default 6). Returns `{ solarKw, note, stats: [{k, v}] }`.

### `GET /portal/faqs`
No params. Returns `{ faqs: [{q, a, cite}] }`. Which FAQ is expanded is pure
client UI state — no server round trip needed for that.

## Ops dashboard — predictive maintenance

### `GET /ops/assets`
No params. Returns `{ kpis: [{k, v}], columns: string[], assets: [{id, type, loc, age, installed, customers, action, drivers: [{k, v, w}], riskLabel, riskPct, riskColorValue, dispatched, dispatchLabel}] }`.
Fetch once; the client picks which asset's detail panel to show locally by
indexing into this array (no separate "select" endpoint) — `dispatched`/`dispatchLabel`
per asset reflect this session.

### `POST /ops/assets/{asset_id}/dispatch`
Path param `asset_id` (e.g. `"TX-4471"`). Persists that asset as dispatched
for this session. Returns `{ id, dispatched, dispatchLabel }` — merge into
the locally-held asset list, or just refetch `GET /ops/assets`.

## Ops dashboard — demand response

### `GET /ops/dr?window=1&picks=0,3`
`window` (int 0–2, default 1), `picks` (comma-separated ints into `DR_FILTERS`,
default `"0,3"`, empty string for none). Returns
`{ windows: string[], drCount, curve: [{base, cut}], stats: [{k, v}], payload }`.
Stateless — call it again whenever the window or filter chips change.
`payload` is the pretty-printed JSON notification body to render verbatim.

### `POST /ops/dr/queue?window=1&picks=0,3`
Same query params as above (for logging/echo purposes only — nothing is
persisted server-side). Returns `{ queued: true, ctaLabel: "Event queued" }`.
The source design resets the "queued" flag the instant filters change again,
so keep that as local optimistic client state rather than re-fetching.

## Agent copilot

### `GET /copilot/call`
No params. Returns
`{ callTimer, customer, transcript: [{who, text}], facts: [{k, v}], openAnomaly, suggestion: {text, cites, chunks}, advanceLabel, callComplete, used, useLabel, nextActions }`.
`transcript` length and `suggestion` both reflect this session's call progress.

### `POST /copilot/advance`
No body. Advances the call by one exchange (capped at the end). Returns the
same shape as `GET /copilot/call`.

### `POST /copilot/use-suggestion`
No body. Marks the current suggested answer as used. Returns the same shape
as `GET /copilot/call`.

---

## Health

### `GET /health` → `{ "status": "ok" }`
