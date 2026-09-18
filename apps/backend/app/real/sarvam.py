"""Sarvam AI helpers — speech-to-text and text-to-speech.

Both functions degrade gracefully when SARVAM_API_KEY is not set:
- stt() returns an empty string (caller should surface a "voice unavailable" message)
- tts() returns an empty string (caller skips playback)

Sarvam docs: https://docs.sarvam.ai
"""
from __future__ import annotations

import logging

import httpx

from .config import settings

logger = logging.getLogger(__name__)

_BASE = "https://api.sarvam.ai"
_TIMEOUT = 30.0


def available() -> bool:
    return bool(settings.sarvam_api_key)


def _headers() -> dict[str, str]:
    return {"api-subscription-key": settings.sarvam_api_key}


def stt(audio_bytes: bytes, filename: str = "audio.m4a") -> str:
    """Transcribe audio bytes → plain text.
    Returns empty string if the API key is missing or the call fails."""
    if not available():
        return ""
    # Infer content type from extension.
    ext = filename.rsplit(".", 1)[-1].lower()
    mime = {"m4a": "audio/m4a", "mp4": "audio/mp4", "wav": "audio/wav",
            "mp3": "audio/mpeg", "ogg": "audio/ogg", "webm": "audio/webm"}.get(ext, "audio/m4a")
    try:
        resp = httpx.post(
            f"{_BASE}/speech-to-text",
            headers=_headers(),
            files={"file": (filename, audio_bytes, mime)},
            data={"model": "saaras:v3", "language_code": "en-IN"},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json().get("transcript", "")
    except Exception:
        logger.exception("Sarvam speech-to-text call failed")
        return ""


def tts(text: str, speaker: str = "priya") -> str:
    """Synthesise text → base64-encoded WAV string.
    Returns empty string if the API key is missing or the call fails."""
    if not available():
        return ""
    # Sarvam TTS has a 500-char limit per input chunk; truncate to be safe.
    chunk = text[:500]
    try:
        resp = httpx.post(
            f"{_BASE}/text-to-speech",
            headers={**_headers(), "Content-Type": "application/json"},
            json={
                "inputs": [chunk],
                "target_language_code": "en-IN",
                "speaker": speaker,
                "model": "bulbul:v3",
                "enable_preprocessing": True,
            },
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        audios = resp.json().get("audios", [])
        return audios[0] if audios else ""
    except Exception:
        logger.exception("Sarvam text-to-speech call failed")
        return ""
