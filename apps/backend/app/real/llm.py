"""Claude client wrapper. Degrades gracefully when no API key is configured."""
from __future__ import annotations

from typing import Any, Optional

from .config import settings

_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client
    if not settings.anthropic_api_key:
        return None
    try:
        import anthropic

        _client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        return _client
    except Exception:
        return None


def available() -> bool:
    return _get_client() is not None


def complete(
    system: str,
    messages: list[dict[str, Any]],
    tools: Optional[list[dict[str, Any]]] = None,
    model: Optional[str] = None,
    max_tokens: int = 1024,
) -> Any:
    client = _get_client()
    if client is None:
        return None
    kwargs: dict[str, Any] = {
        "model": model or settings.chat_model,
        "max_tokens": max_tokens,
        "system": system,
        "messages": messages,
    }
    if tools:
        kwargs["tools"] = tools
    return client.messages.create(**kwargs)
