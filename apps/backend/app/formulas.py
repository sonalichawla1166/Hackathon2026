"""Derived view-model calculations, ported from `apps/mobile/src/state/selectors.ts`
(itself ported from the `renderVals()` method in the source prototype)."""
from __future__ import annotations

from .data import (
    ASSETS,
    DR_FILTERS,
    FAQ_DATA,
    FIXED,
    DELIV,
    SUPPLY,
    TAXRATE,
    RETAIL,
    USAGE,
    usd,
    usd0,
    bill_for,
    risk_color,
    KWH_HISTORY,
)


def bill_lines() -> list[dict]:
    lines = [
        {"label": "Basic service charge", "amount": usd(FIXED), "plain": "Fixed monthly charge for the meter and service line. Does not move with usage.", "bg": "#DCD8D1", "v": FIXED},
        {"label": "Delivery, 1,240 kWh", "amount": usd(USAGE * DELIV), "plain": "Getting the electricity to you. Billed in two tiers, and 990 kWh landed in the higher one.", "bg": "#1E5B71", "v": USAGE * DELIV},
        {"label": "Supply, 1,240 kWh", "amount": usd(USAGE * SUPPLY), "plain": "The energy itself at 11.28¢ per kWh. You are on the utility default supply, not an ESCO.", "bg": "#0F2835", "v": USAGE * SUPPLY},
        {"label": "Taxes and surcharges", "amount": usd((FIXED + USAGE * RETAIL) * TAXRATE), "plain": "State and city taxes plus system benefit charges, applied to everything above.", "bg": "#17824A", "v": (FIXED + USAGE * RETAIL) * TAXRATE},
    ]
    total = sum(l["v"] for l in lines)
    for l in lines:
        l["pct"] = round(l["v"] / total * 100, 1)
    return lines


def bill_history() -> list[dict]:
    return [{"m": h["m"], "hPx": round(h["v"] / 1310 * 56), "active": i == 5} for i, h in enumerate(KWH_HISTORY)]


def meter_intervals() -> list[dict]:
    out = []
    for i in range(14):
        flagged = i >= 7
        h = round(62 + (i % 3) * 6) if flagged else round(30 + (i % 4) * 5)
        out.append({"hPx": h, "flagged": flagged})
    return out


def solar_numbers(kw: float) -> dict:
    gen = kw * 1180 / 12
    net = max(0.0, USAGE - gen)
    exported = max(0.0, gen - USAGE)
    gross = FIXED + net * RETAIL - exported * RETAIL
    bill = max(FIXED, gross) * (1 + TAXRATE)
    base = bill_for(USAGE)
    annual = (base - bill) * 12
    cost = kw * 2850 * 0.7
    payback = cost / annual if annual > 0 else 0.0
    return {"kw": kw, "gen": gen, "net": net, "bill": bill, "base": base, "annual": annual, "cost": cost, "payback": payback}


def rate_plans(portal_usage: float) -> list[dict]:
    flat = bill_for(portal_usage)
    tou_off = 0.61
    tou = (FIXED + portal_usage * (tou_off * 0.0782 + (1 - tou_off) * 0.1691) + portal_usage * DELIV) * (1 + TAXRATE)
    budget = bill_for(1200) * 0.995
    plans = [
        {"name": "SC 1 tiered, current", "monthlyV": flat, "desc": "Two delivery tiers, flat supply. The default residential plan."},
        {"name": "EV Time-of-Use", "monthlyV": tou, "desc": "Cheap after 11pm, expensive 2pm to 8pm. Rewards overnight charging."},
        {"name": "Budget billing", "monthlyV": budget, "desc": "Same amount every month, trued up once a year. No saving, just no surprises."},
    ]
    best = min(plans, key=lambda p: p["monthlyV"])
    out = []
    for p in plans:
        is_best = p is best
        out.append({
            "name": p["name"], "desc": p["desc"],
            "monthly": usd(p["monthlyV"]), "annual": usd0(p["monthlyV"] * 12),
            "isBest": is_best,
            "delta": "Lowest cost at this usage" if is_best else f"+{usd0((p['monthlyV'] - best['monthlyV']) * 12)} a year vs the best plan",
            "deltaColor": "#17824A" if is_best else "#373B3D",
        })
    return out


def faqs(faq_open: int) -> list[dict]:
    return [{**f, "open": faq_open == i} for i, f in enumerate(FAQ_DATA)]


def assets_for_list() -> list[dict]:
    """Full asset list with every field the detail panel needs — the client
    picks which one to display locally (indexing into this array) rather
    than asking the server to track a "selected" row."""
    out = []
    for a in ASSETS:
        out.append({
            "id": a.id, "type": a.type, "loc": a.loc, "age": a.age, "installed": a.installed,
            "customers": a.customers, "action": a.action,
            "drivers": [{"k": d.k, "v": d.v, "w": d.w} for d in a.drivers],
            "riskLabel": f"{a.risk:.2f}", "riskPct": round(a.risk * 100), "riskColorValue": risk_color(a.risk),
        })
    return out


def dr_cohort(dr_picks: list[int]) -> dict:
    picks = [DR_FILTERS[i] for i in dr_picks if 0 <= i < len(DR_FILTERS)]
    if picks:
        dr_count = round(min(f.n for f in picks) * (1 - 0.08 * (len(picks) - 1)))
        avg_kw = sum(f.kw for f in picks) / len(picks)
    else:
        dr_count = 12480
        avg_kw = 1.6
    mw = dr_count * avg_kw / 1000

    loads = [52, 58, 66, 78, 92, 100, 96, 84, 70, 60, 54, 48]
    curve = []
    for i, load in enumerate(loads):
        in_window = 4 <= i <= 7
        cut = round(load * min(0.24, mw / 40)) if in_window else 0
        curve.append({"base": round(load - cut), "cut": cut})

    return {"drCount": dr_count, "mw": mw, "curve": curve}
