"""SQLAlchemy models + engine/session — the real shared data layer.

Every table carries a `utility` column even though only PSEG-LI is populated,
so onboarding another provider later is a data task, not a schema change.
"""
from __future__ import annotations

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    create_engine,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from .config import settings

engine = create_engine(settings.db_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Customer(Base):
    __tablename__ = "customers"
    id = Column(String, primary_key=True)
    utility = Column(String, index=True, default="PSEG-LI")
    name = Column(String)
    email = Column(String)
    address = Column(String)
    city = Column(String)
    zip = Column(String)
    lat = Column(Float)
    lon = Column(Float)
    account_type = Column(String)
    rate_code = Column(String)
    persona = Column(String)
    is_hero = Column(Integer, default=0)

    meters = relationship("Meter", back_populates="customer")


class Meter(Base):
    __tablename__ = "meters"
    id = Column(String, primary_key=True)
    utility = Column(String, index=True, default="PSEG-LI")
    customer_id = Column(String, ForeignKey("customers.id"), index=True)
    commodity = Column(String)
    unit = Column(String)
    install_date = Column(DateTime)

    customer = relationship("Customer", back_populates="meters")


class AmiReading(Base):
    __tablename__ = "ami_readings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    meter_id = Column(String, ForeignKey("meters.id"), index=True)
    ts = Column(DateTime, index=True)
    value = Column(Float)


class Tariff(Base):
    __tablename__ = "tariffs"
    code = Column(String, primary_key=True)
    utility = Column(String, index=True, default="PSEG-LI")
    name = Column(String)
    commodity = Column(String)
    type = Column(String)
    description = Column(String)
    structure = Column(JSON)


class Asset(Base):
    __tablename__ = "assets"
    id = Column(String, primary_key=True)
    utility = Column(String, index=True, default="PSEG-LI")
    type = Column(String)
    region = Column(String)
    install_date = Column(DateTime)
    age_years = Column(Float)
    load_factor = Column(Float)
    oil_temp_c = Column(Float)
    last_maintenance = Column(DateTime)
    failures_past = Column(Integer)
    health_index = Column(Float)
    risk_score = Column(Float)
    lat = Column(Float)
    lon = Column(Float)
    customers_served = Column(Integer)


class Program(Base):
    __tablename__ = "programs"
    program_id = Column(String, primary_key=True)
    utility = Column(String, index=True, default="PSEG-LI")
    name = Column(String)
    category = Column(String)
    description = Column(String)
    eligibility = Column(JSON)
    fit_template = Column(String)
    estimated_benefit_usd_year = Column(Float)


class Outage(Base):
    __tablename__ = "outages"
    id = Column(String, primary_key=True)
    utility = Column(String, index=True, default="PSEG-LI")
    ts_start = Column(DateTime)
    ts_end = Column(DateTime, nullable=True)
    lat = Column(Float)
    lon = Column(Float)
    area = Column(String)
    cause = Column(String)
    customers_affected = Column(Integer)
    status = Column(String)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
