"""Vector-store access for the RAG assistant (narrative-docs side of the
hybrid design). Chroma's persistent client with its default embedding
function (all-MiniLM via onnxruntime) — no separate embedding service."""
from __future__ import annotations

from functools import lru_cache
from typing import Any

from .config import settings

COLLECTION = "pseg_knowledge"


@lru_cache(maxsize=1)
def _collection():
    import chromadb

    client = chromadb.PersistentClient(path=str(settings.chroma_path))
    return client.get_or_create_collection(name=COLLECTION)


def is_ready() -> bool:
    try:
        return _collection().count() > 0
    except Exception:
        return False


def _is_junk(text: str) -> bool:
    """Table-of-contents pages from the tariff PDFs chunk into runs of dot
    leaders ("Underestimated Bills ........ 95") that embed close to almost
    any billing query but carry no answer. Drop them rather than let them
    surface as 'evidence'."""
    if not text:
        return True
    stripped = text.strip()
    if len(stripped) < 40:
        return True
    dots = stripped.count(".")
    return dots / len(stripped) > 0.15 or "....." in stripped


def search(query: str, k: int = 4, utility: str | None = None) -> list[dict[str, Any]]:
    try:
        col = _collection()
    except Exception:
        return []
    where = {"utility": utility or settings.utility}
    try:
        # Over-fetch so the junk filter below still leaves k real results.
        res = col.query(query_texts=[query], n_results=k * 3, where=where)
    except Exception:
        return []
    out: list[dict[str, Any]] = []
    docs = (res.get("documents") or [[]])[0]
    metas = (res.get("metadatas") or [[]])[0]
    dists = (res.get("distances") or [[]])[0]
    for text, meta, dist in zip(docs, metas, dists):
        if _is_junk(text):
            continue
        meta = meta or {}
        out.append({
            "text": text,
            "source_file": meta.get("source_file", "unknown"),
            "page": meta.get("page"),
            "doc_type": meta.get("doc_type"),
            "distance": dist,
        })
        if len(out) >= k:
            break
    return out
