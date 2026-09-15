"""Ingest the PSEG Long Island document subset into Chroma. Only the PSEG-LI
folder of the secured corpus is indexed (see docs/IMPLEMENTATION_PLAN.md §1.1)
— every chunk tagged {utility, commodity, doc_type, source_file, page} so
retrieval can filter and cite. Image-only pages (0 extractable chars) skipped.

Run from apps/backend/:  py ingest.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import chromadb  # noqa: E402
import pdfplumber  # noqa: E402

from app.real.config import settings  # noqa: E402
from app.real.rag import COLLECTION  # noqa: E402

CHUNK_CHARS = 900
CHUNK_OVERLAP = 150


def classify(filename: str) -> tuple[str, str]:
    f = filename.lower()
    if "tariff" in f:
        doc_type = "tariff"
    elif "rates" in f or "rate" in f:
        doc_type = "rate-schedule"
    elif "rights" in f:
        doc_type = "rights"
    elif "faq" in f:
        doc_type = "faq"
    else:
        doc_type = "general"
    commodity = "gas" if "gas" in f else "electric"
    return doc_type, commodity


def chunk(text: str) -> list[str]:
    text = " ".join(text.split())
    if not text:
        return []
    out, i = [], 0
    while i < len(text):
        out.append(text[i : i + CHUNK_CHARS])
        i += CHUNK_CHARS - CHUNK_OVERLAP
    return out


def main() -> None:
    folder = settings.provider_corpus_path
    if not folder.exists():
        raise SystemExit(f"Corpus folder not found: {folder}\n"
                         f"Set CORPUS_DIR / PROVIDER_FOLDER in apps/backend/.env")

    client = chromadb.PersistentClient(path=str(settings.chroma_path))
    try:
        client.delete_collection(COLLECTION)
    except Exception:
        pass
    col = client.create_collection(name=COLLECTION)

    pdfs = sorted(folder.glob("*.pdf"))
    print(f"Ingesting {len(pdfs)} PDFs from {folder} ...")
    docs, metas, ids = [], [], []
    skipped_pages = 0

    for pdf_path in pdfs:
        doc_type, commodity = classify(pdf_path.name)
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for pnum, page in enumerate(pdf.pages, start=1):
                    text = page.extract_text() or ""
                    if len(text.strip()) < 40:
                        skipped_pages += 1
                        continue
                    for cnum, ch in enumerate(chunk(text)):
                        docs.append(ch)
                        metas.append({
                            "utility": settings.utility, "commodity": commodity,
                            "doc_type": doc_type, "source_file": pdf_path.name, "page": pnum,
                        })
                        ids.append(f"{pdf_path.stem}-p{pnum}-c{cnum}")
        except Exception as e:  # noqa: BLE001
            print(f"  ! failed {pdf_path.name}: {e}")

    print(f"  {len(docs)} chunks, {skipped_pages} image/empty pages skipped.")
    B = 200
    for i in range(0, len(docs), B):
        col.add(documents=docs[i:i + B], metadatas=metas[i:i + B], ids=ids[i:i + B])
        print(f"  embedded {min(i + B, len(docs))}/{len(docs)}")

    print(f"Done. Collection '{COLLECTION}' now holds {col.count()} chunks.")


if __name__ == "__main__":
    main()
