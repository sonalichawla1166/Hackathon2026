from __future__ import annotations

from pydantic import BaseModel


class ChatRequest(BaseModel):
    text: str


class OutageReportRequest(BaseModel):
    picks: list[int]


class PaymentRequest(BaseModel):
    method: int


class KnockRequest(BaseModel):
    outcome: str
    notes: str = ""


class StageRequest(BaseModel):
    stage: str
