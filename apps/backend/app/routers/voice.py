"""Voice agent endpoint — customer speaks, AI answers in voice.

Flow:
  1. Receive audio file from the app (multipart upload)
  2. Sarvam STT  → transcript text
  3. chat_engine.ask() → answer + citations (same hybrid RAG as the text chat)
  4. Sarvam TTS  → base64 WAV audio of the answer
  5. Return transcript + answer + cites + audio so the app can
     show both chat bubbles and play the voice response.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, UploadFile, File

from ..real import chat_engine, sarvam
from ..real.config import DEMO_CUSTOMER_ID
from ..real.db import SessionLocal
from ..session import Session, current_session

router = APIRouter(tags=["voice"])


@router.post("/voice/ask")
async def voice_ask(
    audio: UploadFile = File(...),
    session: Session = Depends(current_session),
):
    audio_bytes = await audio.read()
    filename = audio.filename or "audio.m4a"

    # Step 1: transcribe
    transcript = sarvam.stt(audio_bytes, filename)
    if not transcript:
        transcript = ""

    # Step 2: RAG answer (falls back to retrieval-only if no Azure OpenAI key)
    db = SessionLocal()
    try:
        if transcript:
            answer, cites = chat_engine.ask(db, DEMO_CUSTOMER_ID, transcript)
            session.real_ask(transcript, answer, cites)
        else:
            answer = "Sorry, I could not hear that clearly. Please try again."
            cites = []
    finally:
        db.close()

    # Step 3: synthesise response voice
    audio_b64 = sarvam.tts(answer)

    return {
        "transcript": transcript,
        "answer": answer,
        "cites": cites,
        "audio_b64": audio_b64,          # base64 WAV; empty string if TTS unavailable
        "tts_available": bool(audio_b64),
    }
