"""In-memory demo user store for signup/login. One process, one dict — same
tradeoff as session.py's _sessions; swap for a real user table before this
ever sees production traffic. Passwords are salted+hashed (PBKDF2, stdlib
only, no new dependency) rather than stored in plaintext.
"""
from __future__ import annotations

import hashlib
import os
from dataclasses import dataclass
from threading import Lock


@dataclass
class User:
    email: str
    salt: bytes
    password_hash: bytes


_users: dict[str, User] = {}
_lock = Lock()


def _hash(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)


def signup(email: str, password: str) -> None:
    email = email.strip().lower()
    with _lock:
        if email in _users:
            raise ValueError("An account with that email already exists")
        salt = os.urandom(16)
        _users[email] = User(email=email, salt=salt, password_hash=_hash(password, salt))


def verify_credentials(email: str, password: str) -> bool:
    email = email.strip().lower()
    with _lock:
        user = _users.get(email)
    if user is None:
        return False
    return _hash(password, user.salt) == user.password_hash
