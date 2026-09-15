"""Deterministic PSEG-LI bill calculator + plan/solar simulator.

Source of truth for rate numbers is data/tariffs.json (structured side of the
hybrid RAG design, docs/IMPLEMENTATION_PLAN.md §1.2). The /chat lookup_tariff
tool and the bill/simulate endpoints all read it here — one place rates live.
"""
from __future__ import annotations

import json
from datetime import datetime
from functools import lru_cache
from typing import Any

from .config import settings

SOLAR_KWH_PER_KW_YEAR = 1250.0
SOLAR_SELF_CONSUMPTION = 0.55
SOLAR_COST_PER_KW = 3000.0


@lru_cache(maxsize=1)
def _tariffs() -> dict[str, Any]:
    with open(settings.data_path / "tariffs.json", encoding="utf-8") as f:
        return json.load(f)


def meta() -> dict[str, Any]:
    return _tariffs()["meta"]


def get_tariff(code: str) -> dict[str, Any]:
    for t in _tariffs()["tariffs"]:
        if t["code"] == code:
            return t
    raise KeyError(f"Unknown rate code: {code}")


def all_codes() -> list[str]:
    return [t["code"] for t in _tariffs()["tariffs"]]


def _classify(ts: datetime, m: dict) -> tuple[str, bool, bool]:
    season = "summer" if ts.month in m["summer_months"] else "winter"
    is_weekday = ts.weekday() < 5
    is_peak = is_weekday and ts.hour in m["peak_hours"]
    is_sop = ts.hour in m["super_offpeak_hours"]
    return season, is_peak, is_sop


def _period_for(tariff: dict, is_peak: bool, is_sop: bool) -> dict:
    for p in tariff["periods"]:
        if p["match"] == "peak_hours_weekday" and is_peak:
            return p
        if p["match"] == "super_offpeak_hours" and is_sop and not is_peak:
            return p
    for p in tariff["periods"]:
        if p["match"] == "otherwise":
            return p
    return tariff["periods"][-1]


def _tiered_delivery(total_kwh: float, tiers: list[dict]) -> float:
    cost, remaining, prior = 0.0, total_kwh, 0.0
    for tier in tiers:
        upto = tier["upto"]
        span = remaining if upto is None else min(remaining, upto - prior)
        span = max(span, 0.0)
        cost += span * tier["delivery"]
        remaining -= span
        prior = upto if upto is not None else prior
        if remaining <= 0:
            break
    return cost


def compute_bill(
    readings: list[tuple[datetime, float]],
    rate_code: str,
    period_start: datetime,
    period_end: datetime,
    exported_kwh: float = 0.0,
) -> dict[str, Any]:
    m = meta()
    tariff = get_tariff(rate_code)
    published = m["published_power_supply_rate_per_kwh"]
    days = max((period_end - period_start).days, 1)
    usage_kwh = sum(v for _, v in readings)

    line_items: list[dict] = []
    service = tariff["daily_service_charge"] * days
    line_items.append({
        "group": "service", "label": "Basic Service Charge",
        "detail": f"{days} days x ${tariff['daily_service_charge']:.4f}/day",
        "amount_usd": round(service, 2),
    })

    if tariff["type"] == "tiered":
        season = "summer" if period_start.month in m["summer_months"] else "winter"
        tiers = tariff["tiers"][season]
        delivery = _tiered_delivery(usage_kwh, tiers)
        supply = published * tariff["supply_pct"][season] * usage_kwh
        line_items.append({
            "group": "delivery", "label": f"Delivery ({season}, tiered)",
            "detail": f"{usage_kwh:.0f} kWh across {len(tiers)} tier(s)",
            "amount_usd": round(delivery, 2),
        })
        line_items.append({
            "group": "supply", "label": "Power Supply",
            "detail": f"{usage_kwh:.0f} kWh x ${published * tariff['supply_pct'][season]:.4f}",
            "amount_usd": round(supply, 2),
        })
    else:
        by_period_kwh: dict[str, float] = {}
        by_period_delivery: dict[str, float] = {}
        supply = 0.0
        for ts, v in readings:
            season, is_peak, is_sop = _classify(ts, m)
            p = _period_for(tariff, is_peak, is_sop)
            by_period_kwh[p["name"]] = by_period_kwh.get(p["name"], 0.0) + v
            by_period_delivery[p["name"]] = (
                by_period_delivery.get(p["name"], 0.0) + v * p["delivery"][season]
            )
            supply += v * published * p["supply_pct"][season]
        for pname, kwh in by_period_kwh.items():
            line_items.append({
                "group": "delivery", "label": f"{pname.replace('_', ' ').title()} Delivery",
                "detail": f"{kwh:.0f} kWh", "amount_usd": round(by_period_delivery[pname], 2),
            })
        line_items.append({
            "group": "supply", "label": "Power Supply",
            "detail": f"Time-varying % of ${published:.4f} published rate",
            "amount_usd": round(supply, 2),
        })

    if exported_kwh > 0:
        credit = exported_kwh * m["net_metering"]["credit_per_kwh"]
        line_items.append({
            "group": "credits", "label": "Net Metering Credit",
            "detail": f"-{exported_kwh:.0f} kWh exported x ${m['net_metering']['credit_per_kwh']:.4f}",
            "amount_usd": -round(credit, 2),
        })

    total = sum(li["amount_usd"] for li in line_items)
    return {"usage_kwh": round(usage_kwh, 1), "total_usd": round(total, 2), "line_items": line_items}


def annualize(readings: list[tuple[datetime, float]], rate_code: str,
              exported_kwh_annual: float = 0.0) -> float:
    if not readings:
        return 0.0
    start = min(ts for ts, _ in readings)
    end = max(ts for ts, _ in readings)
    days = max((end - start).days, 1)
    export_window = exported_kwh_annual * days / 365.0
    bill = compute_bill(readings, rate_code, start, end, exported_kwh=export_window)
    return round(bill["total_usd"] * 365.0 / days, 2)


def simulate_solar(readings: list[tuple[datetime, float]], rate_code: str, solar_kw: float) -> dict[str, Any]:
    baseline_annual = annualize(readings, rate_code)
    generation = solar_kw * SOLAR_KWH_PER_KW_YEAR
    self_consumed = generation * SOLAR_SELF_CONSUMPTION
    exported = generation - self_consumed
    m = meta()
    usage = sum(v for _, v in readings)
    start = min(ts for ts, _ in readings) if readings else datetime.now()
    end = max(ts for ts, _ in readings) if readings else datetime.now()
    days = max((end - start).days, 1)
    annual_usage = usage * 365.0 / days if usage else 1.0
    avg_rate = baseline_annual / annual_usage if annual_usage else 0.15
    credit = exported * m["net_metering"]["credit_per_kwh"]
    savings = self_consumed * avg_rate + credit
    new_annual = max(baseline_annual - savings, 0.0)
    system_cost = solar_kw * SOLAR_COST_PER_KW
    payback = round(system_cost / savings, 1) if savings > 0 else None
    return {
        "annual_generation_kwh": round(generation, 0),
        "self_consumed_kwh": round(self_consumed, 0),
        "exported_kwh": round(exported, 0),
        "net_metering_credit_usd": round(credit, 2),
        "baseline_annual_usd": baseline_annual,
        "new_annual_usd": round(new_annual, 2),
        "annual_savings_usd": round(savings, 2),
        "system_cost_usd": round(system_cost, 0),
        "payback_years": payback,
    }
