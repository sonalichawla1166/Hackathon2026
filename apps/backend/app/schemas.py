from __future__ import annotations

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    text: str


class LoginRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


class SignupRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=6)
    role: str = Field(min_length=1)


class OutageReportRequest(BaseModel):
    picks: list[int]


class PaymentRequest(BaseModel):
    method: int


class KnockRequest(BaseModel):
    outcome: str
    notes: str = ""


class StageRequest(BaseModel):
    stage: str


class ActionToggleRequest(BaseModel):
    action: str
