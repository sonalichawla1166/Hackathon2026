from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from ..data import ASSETS
from ..formulas import assets_for_list, dr_cohort
from ..session import Session, current_session

router = APIRouter(tags=["ops"])

DR_WINDOW_LABELS = ["Oct 14, 2–6pm", "Oct 14, 4–8pm", "Oct 15, 3–7pm"]
DR_WINDOW_TIMES = ["14:00-18:00", "16:00-20:00", "15:00-19:00"]


@router.get("/ops/assets")
def get_assets(session: Session = Depends(current_session)):
    assets = assets_for_list()
    for a in assets:
        a["dispatched"] = a["id"] in session.dispatched_ids
        a["dispatchLabel"] = "Queued for crew 14" if a["dispatched"] else "Add to inspection queue"
    return {
        "kpis": [
            {"k": "Assets monitored", "v": "1,842"},
            {"k": "Avoided truck rolls, 90 d", "v": "38"},
            {"k": "Model AUC", "v": "0.91"},
        ],
        "columns": ["Asset", "Location", "Age", "30-day risk"],
        "assets": assets,
    }


@router.post("/ops/assets/{asset_id}/dispatch")
def dispatch_asset(asset_id: str, session: Session = Depends(current_session)):
    if not any(a.id == asset_id for a in ASSETS):
        raise HTTPException(status_code=404, detail="No such asset")
    session.dispatched_ids.add(asset_id)
    return {"id": asset_id, "dispatched": True, "dispatchLabel": "Queued for crew 14"}


@router.get("/ops/dr")
def get_dr(window: int = Query(default=1, ge=0, le=2), picks: str = Query(default="0,3")):
    pick_list = [int(p) for p in picks.split(",") if p.strip() != ""] if picks else []
    cohort = dr_cohort(pick_list)
    dr_count = cohort["drCount"]
    payload_json = (
        "{\n"
        '  "event": "DR-2026-10-14",\n'
        f'  "window": "{DR_WINDOW_TIMES[window]}",\n'
        f'  "cohort": {dr_count},\n'
        '  "channel": ["push", "sms"]\n'
        "}"
    )
    return {
        "windows": DR_WINDOW_LABELS,
        "drCount": f"{dr_count:,}",
        "curve": cohort["curve"],
        "stats": [
            {"k": "Expected curtailment", "v": f"{cohort['mw']:.1f} MW"},
            {"k": "Forecast opt-in", "v": f"{round(dr_count * 0.62):,} (62%)"},
            {"k": "Incentive cost", "v": f"${round(dr_count * 0.62 * 25):,}"},
        ],
        "payload": payload_json,
    }


@router.post("/ops/dr/queue")
def queue_dr(window: int = Query(default=1, ge=0, le=2), picks: str = Query(default="0,3")):
    # Nothing is persisted server-side for the queued flag — the source
    # design explicitly resets it the moment filters change, so the client
    # keeps it as local optimistic UI state after this call succeeds.
    return {"queued": True, "ctaLabel": "Event queued"}
