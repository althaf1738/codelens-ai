from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional
import os

from .ast_chunker import extract_ast_chunks, chunk_by_lines, AstChunk
from .language_registry import detect_language

IGNORED_DIRS = {
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  "out",
  "__pycache__",
  ".venv",
  "__MACOSX",
}

ALLOWED_EXTS = {
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".md",
  ".json",
  ".yml",
  ".yaml",
}

MAX_FILE_BYTES = 400_000


ParsedChunk = AstChunk


def list_repo_files(root: Path) -> List[str]:
  files: List[str] = []
  for path in walk_repo(root):
    rel = path.relative_to(root)
    files.append(str(rel))
  return sorted(files)


def walk_repo(root: Path) -> Iterable[Path]:
  for current_root, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS]
    for filename in filenames:
      path = Path(current_root) / filename
      if _is_allowed(path):
        yield path


def read_text_file(path: Path) -> Optional[str]:
  if path.stat().st_size > MAX_FILE_BYTES:
    return None
  try:
    return path.read_text(encoding="utf-8", errors="ignore")
  except Exception:
    return None


def parse_file(path: Path, content: str, rel_path: str) -> List[ParsedChunk]:
  lang = detect_language(path, content)
  if lang:
    chunks = extract_ast_chunks(lang, content, rel_path)
    if chunks:
      return chunks
  return chunk_by_lines(content, max_lines=80, path=rel_path, language=lang or "unknown")




def _is_allowed(path: Path) -> bool:
  if path.suffix.lower() not in ALLOWED_EXTS:
    return False
  for part in path.parts:
    if part in IGNORED_DIRS:
      return False
  return True
