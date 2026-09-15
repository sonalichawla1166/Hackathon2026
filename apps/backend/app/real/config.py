"""Settings for the real data engine, loaded from apps/backend/.env."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent  # .../apps/backend


class RealSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"), env_file_encoding="utf-8", extra="ignore"
    )

    anthropic_api_key: str = ""
    chat_model: str = "claude-sonnet-5"
    cheap_model: str = "claude-haiku-4-5-20251001"

    corpus_dir: str = "D:/projects/utility-rag/data"
    provider_folder: str = "PSEG Long Island"

    db_url: str = "sqlite:///./utility.db"
    chroma_dir: str = "./chroma_db"
    data_dir: str = "./data"

    utility: str = "PSEG-LI"

    @property
    def data_path(self) -> Path:
        return (BACKEND_DIR / self.data_dir).resolve()

    @property
    def chroma_path(self) -> Path:
        return (BACKEND_DIR / self.chroma_dir).resolve()

    @property
    def provider_corpus_path(self) -> Path:
        return Path(self.corpus_dir) / self.provider_folder


settings = RealSettings()

# The single demo customer the existing session/UI model is built around
# ("Maria Alvarez" everywhere in the mobile app copy). Her billing/solar/
# programs data comes from this customer. Real anomaly numbers come from a
# second seeded customer (see ANOMALY_CUSTOMER_ID) because Maria's own hero
# persona is the solar candidate, not the anomaly one — see real/db.py HEROES.
DEMO_CUSTOMER_ID = "CUST-0001"
ANOMALY_CUSTOMER_ID = "CUST-0004"  # appliance_fault persona
