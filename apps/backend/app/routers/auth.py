from __future__ import annotations

import re

from fastapi import APIRouter, Header, HTTPException

from .. import auth_store
from ..schemas import LoginRequest, SignupRequest
from ..session import login as create_login_session
from ..session import logout as destroy_session

router = APIRouter(tags=["auth"])

# Matches the mobile app's Surface type (state/store.ts) — the five roles a
# self-service account can be created as. Chosen once at signup and stored on
# the account (see auth_store.py); a login no longer sends one. "admin" is
# deliberately excluded here — it's a separate seeded account, not something
# signup can create (see auth_store.ADMIN_ROLE).
VALID_ROLES = {"app", "portal", "ops", "copilot", "sales"}
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


@router.post("/auth/signup")
def signup(body: SignupRequest):
    if not EMAIL_RE.match(body.email):
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=422, detail=f"role must be one of {sorted(VALID_ROLES)}")
    try:
        auth_store.signup(body.email, body.password, body.role)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    return {"message": "Account created. You can now log in."}


@router.post("/auth/login")
def login(body: LoginRequest):
    if not EMAIL_RE.match(body.email):
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    if not auth_store.verify_credentials(body.email, body.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    role = auth_store.get_role(body.email)
    token, session = create_login_session(role, body.email)
    return {"token": token, "role": session.role, "email": session.email, "isAdmin": role == auth_store.ADMIN_ROLE}


@router.post("/auth/logout")
def logout(x_session_id: str | None = Header(default=None, alias="X-Session-Id")):
    if x_session_id:
        destroy_session(x_session_id)
    return {"status": "ok"}
