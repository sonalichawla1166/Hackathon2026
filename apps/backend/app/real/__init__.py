"""Real data engine: DB, PSEG-LI tariff math, hybrid RAG, anomaly detection,
usage features. Kept in its own package so it never collides with the
existing mock `app.data` / `app.formulas` modules the Expo app was already
integrated against. Routers import from here and reshape the output into the
exact response contract in API.md so the mobile app needs zero changes.

See the top-level docs/IMPLEMENTATION_PLAN.md (§1.1/§1.2) for why PSEG-LI is
the single provider and why RAG is hybrid (structured lookup + vector search).
"""
