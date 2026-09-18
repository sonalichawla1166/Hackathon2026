"""Azure OpenAI client wrapper. Degrades gracefully when no API key is
configured — callers check `available()` first and fall back to
retrieval-only behavior (see chat_engine.ask())."""
from __future__ import annotations

import logging
from typing import Any, Optional

from .config import settings

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client
    if not settings.azure_openai_endpoint or not settings.azure_openai_key:
        logger.warning(
            "Azure OpenAI not configured: azure_openai_endpoint=%r azure_openai_key=%s "
            "(check apps/backend/.env is being loaded)",
            settings.azure_openai_endpoint, "set" if settings.azure_openai_key else "MISSING",
        )
        return None
    try:
        from openai import AzureOpenAI

        _client = AzureOpenAI(
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_key,
            api_version=settings.azure_openai_api_version,
        )
        return _client
    except Exception:
        logger.exception("Failed to construct the Azure OpenAI client")
        return None


def available() -> bool:
    return _get_client() is not None


def complete(
    system: str,
    messages: list[dict[str, Any]],
    tools: Optional[list[dict[str, Any]]] = None,
    tool_choice: Optional[str] = None,
    model: Optional[str] = None,
    max_tokens: int = 1024,
) -> Any:
    """Returns the raw ChatCompletion, or None if no client is configured.
    `model` is the Azure *deployment* name (see config.py). `tool_choice`
    lets a caller pass "required" to force a tool call — gpt-4o-mini, unlike
    Claude, often skips available tools on the first turn even when the
    system prompt says to always use them."""
    client = _get_client()
    if client is None:
        return None
    kwargs: dict[str, Any] = {
        "model": model or settings.chat_model,
        "max_completion_tokens": max_tokens,
        "messages": [{"role": "system", "content": system}, *messages],
    }
    if tools:
        kwargs["tools"] = tools
        if tool_choice:
            kwargs["tool_choice"] = tool_choice
    return client.chat.completions.create(**kwargs)
