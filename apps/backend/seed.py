"""Seed the real data layer deterministically: customers, meters, AMI interval
readings (with injected anomalies for hero customers), tariffs, programs, grid
assets. Synthetic AMI with realistic daily/weekly/seasonal shape - deterministic,
download-free. CUST-0001 is named "Maria Alvarez" to match the existing
OneGridAI mobile-app persona/copy.

Run from apps/backend/:  py seed.py
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import numpy as np  # noqa: E402
from faker import Faker  # noqa: E402

from app.real.config import settings  # noqa: E402
from app.real.db import (  # noqa: E402
    AmiReading, Asset, Base, Customer, Meter, Program, Tariff,
    SessionLocal, engine,
)

SEED = 42
N_CUSTOMERS = 120
DAYS = 365
END = datetime(2026, 9, 14, 0, 0, 0)
START = END - timedelta(days=DAYS)

fake = Faker()
Faker.seed(SEED)
rng = np.random.default_rng(SEED)

LAT = (40.63, 40.95)  # Long Island bounding box (Nassau + Suffolk)
LON = (-73.65, -72.90)

HOUR_SHAPE = np.array([
    0.45, 0.40, 0.38, 0.37, 0.40, 0.55, 0.80, 1.05, 1.00, 0.85, 0.80, 0.82,
    0.85, 0.88, 0.90, 1.00, 1.20, 1.45, 1.55, 1.45, 1.25, 1.00, 0.75, 0.55,
])

# id -> (persona, rate_code, display_name override)
HEROES = {
    "CUST-0001": ("solar_candidate", "194", "Maria Alvarez"),  # the app's demo customer
    "CUST-0002": ("ev_owner", "195", None),
    "CUST-0003": ("leak", "194", None),
    "CUST-0004": ("appliance_fault", "194", None),  # backs the /anomalies alert
    "CUST-0005": ("dr_candidate", "194", None),
    "CUST-0006": ("theft", "180", None),
}


def timestamps() -> list[datetime]:
    return [START + timedelta(hours=h) for h in range(DAYS * 24)]


def profile(ts: list[datetime], base: float, persona: str) -> np.ndarray:
    hours = np.array([t.hour for t in ts])
    months = np.array([t.month for t in ts])
    weekend = np.array([t.weekday() >= 5 for t in ts])

    shape = HOUR_SHAPE[hours]
    season = np.where(np.isin(months, [6, 7, 8, 9]), 1.35, 1.0)
    season = np.where(np.isin(months, [12, 1, 2]), 1.15, season)
    wk = np.where(weekend, 1.12, 1.0)
    noise = rng.normal(1.0, 0.12, len(ts)).clip(0.6, 1.5)
    vals = base * shape * season * wk * noise

    if persona == "solar_candidate":
        vals *= np.where((hours >= 9) & (hours <= 16), 1.8, 1.0)
    elif persona == "ev_owner":
        vals += np.where((hours >= 22) | (hours <= 5), base * 2.2, 0.0)
    elif persona == "dr_candidate":
        vals *= np.where((hours >= 15) & (hours <= 18), 2.1, 1.0)

    return vals.clip(0.02, None)


def inject_electric_anomaly(ts, vals, persona):
    hours = np.array([t.hour for t in ts])
    days_from_end = np.array([(END - t).days for t in ts])
    if persona == "appliance_fault":
        mask = (days_from_end <= 10) & (hours >= 13) & (hours <= 18)
        vals = vals.copy()
        vals[mask] *= 2.6
    elif persona == "theft":
        mask = days_from_end <= 4
        vals = vals.copy()
        vals[mask] *= 0.05
    return vals


def water_profile(ts, persona) -> np.ndarray:
    hours = np.array([t.hour for t in ts])
    days_from_end = np.array([(END - t).days for t in ts])
    base = np.where((hours >= 6) & (hours <= 22),
                    rng.uniform(0.5, 3.0, len(ts)), rng.uniform(0.0, 0.3, len(ts)))
    if persona == "leak":
        leak = (days_from_end <= 7) & ((hours < 6) | (hours > 22))
        base = base + np.where(leak, 5.5, 0.0)
    return base.clip(0.0, None)


def main() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    ts = timestamps()

    tdata = json.loads((settings.data_path / "tariffs.json").read_text(encoding="utf-8"))
    for t in tdata["tariffs"]:
        db.add(Tariff(code=t["code"], utility=settings.utility, name=t["name"],
                      commodity="electric", type=t["type"],
                      description=t.get("description", ""), structure=t))

    pdata = json.loads((settings.data_path / "programs.json").read_text(encoding="utf-8"))
    for p in pdata["programs"]:
        db.add(Program(program_id=p["program_id"], utility=settings.utility,
                       name=p["name"], category=p["category"],
                       description=p["description"], eligibility=p["eligibility"],
                       fit_template=p["fit_template"],
                       estimated_benefit_usd_year=p["estimated_benefit_usd_year"]))
    db.commit()

    reading_rows: list[dict] = []

    for i in range(1, N_CUSTOMERS + 1):
        cid = f"CUST-{i:04d}"
        if cid in HEROES:
            persona, rate, name_override = HEROES[cid]
            is_hero = 1
            name = name_override or fake.name()
        else:
            persona, is_hero, name_override = "normal", 0, None
            rate = str(rng.choice(["180", "194", "195"], p=[0.2, 0.6, 0.2]))
            name = fake.name()
        lat = float(rng.uniform(*LAT))
        lon = float(rng.uniform(*LON))
        db.add(Customer(
            id=cid, utility=settings.utility, name=name,
            email=fake.email(), address=fake.street_address(),
            city=fake.city(), zip=fake.zipcode(), lat=lat, lon=lon,
            account_type="residential", rate_code=rate, persona=persona,
            is_hero=is_hero,
        ))

        emid = f"MTR-{i:04d}-E"
        db.add(Meter(id=emid, utility=settings.utility, customer_id=cid,
                     commodity="electric", unit="kWh", install_date=START))
        base = float(rng.uniform(0.28, 0.7))
        vals = profile(ts, base, persona)
        vals = inject_electric_anomaly(ts, vals, persona)
        for t, v in zip(ts, vals):
            reading_rows.append({"meter_id": emid, "ts": t, "value": round(float(v), 4)})

        if persona == "leak":
            wmid = f"MTR-{i:04d}-W"
            db.add(Meter(id=wmid, utility=settings.utility, customer_id=cid,
                         commodity="water", unit="gallons", install_date=START))
            wvals = water_profile(ts, persona)
            for t, v in zip(ts, wvals):
                reading_rows.append({"meter_id": wmid, "ts": t, "value": round(float(v), 4)})

    db.commit()

    print(f"Inserting {len(reading_rows):,} AMI readings ...")
    B = 10000
    for i in range(0, len(reading_rows), B):
        db.bulk_insert_mappings(AmiReading, reading_rows[i:i + B])
        db.commit()

    # ---- grid assets (backs /ops/assets) ----
    regions = ["Nassau", "Suffolk", "Nassau", "Suffolk", "Queens-border"]
    types = ["transformer", "feeder", "switch"]
    for a in range(1, 61):
        age = float(rng.uniform(2, 42))
        fails = int(rng.integers(0, 4)) if age > 20 else 0
        load = float(rng.uniform(0.35, 0.95))
        health = float(np.clip(1.0 - age / 50 - 0.1 * fails + rng.normal(0, 0.05), 0.1, 0.99))
        db.add(Asset(
            id=f"ASSET-{a:04d}", utility=settings.utility,
            type=str(rng.choice(types)), region=str(rng.choice(regions)),
            install_date=END - timedelta(days=int(age * 365)),
            age_years=round(age, 1), load_factor=round(load, 3),
            oil_temp_c=round(float(rng.uniform(35, 85)), 1),
            last_maintenance=END - timedelta(days=int(rng.integers(30, 900))),
            failures_past=fails, health_index=round(health, 3), risk_score=0.0,
            lat=float(rng.uniform(*LAT)), lon=float(rng.uniform(*LON)),
            customers_served=int(rng.integers(40, 3200)),
        ))

    db.commit()
    db.close()
    print(f"Seeded {N_CUSTOMERS} customers, {len(reading_rows):,} readings, 60 assets. "
          f"Heroes: {list(HEROES.keys())} (CUST-0001 = Maria Alvarez, the app's demo customer)")


if __name__ == "__main__":
    main()
