import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


class Settings:
  """Simple settings holder sourced from environment variables."""

  def __init__(self) -> None:
    self.qdrant_url = os.getenv("QDRANT_URL")
    self.qdrant_api_key = os.getenv("QDRANT_API_KEY")
    self.storage_dir = Path(os.getenv("STORAGE_DIR", ".data/python-backend")).resolve()
    self.storage_dir.mkdir(parents=True, exist_ok=True)
    db_path_env = os.getenv("DATABASE_PATH")
    self.database_path = Path(db_path_env).resolve() if db_path_env else self.storage_dir / "projects.db"
    self.vector_size = 64


settings = Settings()
