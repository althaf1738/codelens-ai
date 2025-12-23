import json
import zipfile
from pathlib import Path
from typing import Dict, List, Optional

from .config import settings
from .repo_parser import list_repo_files, _is_allowed, IGNORED_DIRS


def _project_dir(project_id: str) -> Path:
  return settings.storage_dir / project_id


def save_upload(project_id: str, upload_name: str, data: bytes) -> List[str]:
  """Persist uploaded archive or file and return relative file paths."""
  project_path = _project_dir(project_id)
  project_path.mkdir(parents=True, exist_ok=True)
  upload_path = project_path / upload_name
  upload_path.write_bytes(data)

  file_paths: List[str] = []
  if zipfile.is_zipfile(upload_path):
    with zipfile.ZipFile(upload_path, "r") as zf:
      zf.extractall(project_path)
      file_paths = list_repo_files(project_path)
  else:
    # Treat as single file content; also write to a normalized path.
    rel_path = Path(upload_name).name
    normalized_path = project_path / rel_path
    normalized_path.write_bytes(data)
    file_paths = [rel_path] if _is_allowed(normalized_path) else []

  _write_manifest(project_path, file_paths)
  return file_paths


def list_files(project_id: str) -> List[str]:
  project_path = _project_dir(project_id)
  manifest = project_path / "manifest.json"
  if manifest.exists():
    files = json.loads(manifest.read_text())
  else:
    files = [str(p.relative_to(project_path)) for p in project_path.rglob("*") if p.is_file()]
  return [
    f
    for f in files
    if _is_allowed(project_path / f) and not any(part in IGNORED_DIRS for part in Path(f).parts)
  ]


def read_file(project_id: str, rel_path: str) -> Optional[str]:
  path = _project_dir(project_id) / rel_path
  if not path.exists() or not path.is_file():
    return None
  return path.read_text(encoding="utf-8", errors="ignore")


def store_embeddings(project_id: str, embeddings: Dict[str, list]) -> None:
  project_path = _project_dir(project_id)
  project_path.mkdir(parents=True, exist_ok=True)
  (project_path / "embeddings.json").write_text(json.dumps(embeddings), encoding="utf-8")


def load_embeddings(project_id: str) -> Dict[str, list]:
  path = _project_dir(project_id) / "embeddings.json"
  if not path.exists():
    return {}
  return json.loads(path.read_text())


def _write_manifest(project_path: Path, files: List[str]) -> None:
  (project_path / "manifest.json").write_text(json.dumps(files, indent=2), encoding="utf-8")
