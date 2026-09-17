"""In-memory demo user store for signup/login. One process, one dict — same
tradeoff as session.py's _sessions; swap for a real user table before this
ever sees production traffic. Passwords are salted+hashed (PBKDF2, stdlib
only, no new dependency) rather than stored in plaintext.

Every account has a fixed `role` chosen once at signup — the "which of the
five surfaces does this account open into" decision is made then, not at
every login. The one exception is the seeded admin account below: it isn't
tied to a surface, and after login the client lets it pick which surface to
view (see LoginScreen.tsx's post-login "Sign in as" screen).
"""
from __future__ import annotations

import hashlib
import os
from dataclasses import dataclass
from threading import Lock

ADMIN_ROLE = "admin"
ADMIN_EMAIL = "admin@onegridai.com"
ADMIN_PASSWORD = "admin1234"


@dataclass
class User:
    email: str
    salt: bytes
    password_hash: bytes
    role: str


_users: dict[str, User] = {}
_lock = Lock()


def _hash(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)


def _create(email: str, password: str, role: str) -> None:
    salt = os.urandom(16)
    _users[email] = User(email=email, salt=salt, password_hash=_hash(password, salt), role=role)


def signup(email: str, password: str, role: str) -> None:
    email = email.strip().lower()
    with _lock:
        if email in _users:
            raise ValueError("An account with that email already exists")
        _create(email, password, role)


def verify_credentials(email: str, password: str) -> bool:
    email = email.strip().lower()
    with _lock:
        user = _users.get(email)
    if user is None:
        return False
    return _hash(password, user.salt) == user.password_hash


def get_role(email: str) -> str | None:
    email = email.strip().lower()
    with _lock:
        user = _users.get(email)
    return user.role if user else None


def _seed_admin() -> None:
    """The one admin account, seeded at process start — not reachable through
    /auth/signup, which only ever accepts the five surface roles."""
    with _lock:
        if ADMIN_EMAIL not in _users:
            _create(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ROLE)


_seed_admin()
