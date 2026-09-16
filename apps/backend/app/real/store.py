"""Thin query helpers over the real DB, shared by the adapter layer in routers."""
from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import db as models


def get_customer(db: Session, customer_id: str) -> models.Customer | None:
    return db.get(models.Customer, customer_id)


def customer_count(db: Session) -> int:
    return db.scalar(select(func.count()).select_from(models.Customer)) or 0


def electric_meter(db: Session, customer_id: str) -> models.Meter | None:
    return db.scalars(
        select(models.Meter).where(
            models.Meter.customer_id == customer_id,
            models.Meter.commodity == "electric",
        )
    ).first()


def meter_by_commodity(db: Session, customer_id: str, commodity: str) -> models.Meter | None:
    return db.scalars(
        select(models.Meter).where(
            models.Meter.customer_id == customer_id,
            models.Meter.commodity == commodity,
        )
    ).first()


def meter_readings(db: Session, meter_id: str, days: int | None = None) -> list[tuple[datetime, float]]:
    stmt = select(models.AmiReading.ts, models.AmiReading.value).where(
        models.AmiReading.meter_id == meter_id
    )
    if days:
        latest = db.scalars(
            select(models.AmiReading.ts)
            .where(models.AmiReading.meter_id == meter_id)
            .order_by(models.AmiReading.ts.desc())
        ).first()
        if latest:
            stmt = stmt.where(models.AmiReading.ts >= latest - timedelta(days=days))
    stmt = stmt.order_by(models.AmiReading.ts)
    return [(ts, v) for ts, v in db.execute(stmt).all()]


def customer_electric_readings(
    db: Session, customer_id: str, days: int | None = None
) -> tuple[models.Meter | None, list[tuple[datetime, float]]]:
    meter = electric_meter(db, customer_id)
    if not meter:
        return None, []
    return meter, meter_readings(db, meter.id, days=days)
