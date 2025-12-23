import json
from pathlib import Path
from typing import Dict, Optional

from tree_sitter import Parser
from tree_sitter_languages import get_language

_CONFIG_PATH = Path(__file__).with_name("language_registry.json")


def _load_config() -> Dict:
  if _CONFIG_PATH.exists():
    return json.loads(_CONFIG_PATH.read_text())
  return {"extensions": {}, "fallback_languages": [], "shebangs": {}}


_CONFIG = _load_config()


def detect_language(path: Path, content: str) -> Optional[str]:
  ext = path.suffix.lower()
  ext_map = _CONFIG.get("extensions", {})
  if ext in ext_map:
    return ext_map[ext]

  shebang_lang = _detect_shebang_language(content)
  if shebang_lang:
    return shebang_lang

  # Try fallback languages by checking parse errors
  for lang in _CONFIG.get("fallback_languages", []):
    if _parse_ok(lang, content):
      return lang
  return None


def _detect_shebang_language(content: str) -> Optional[str]:
  first_line = content.splitlines()[:1]
  if not first_line:
    return None
  line = first_line[0]
  if not line.startswith("#!"):
    return None
  shebangs = _CONFIG.get("shebangs", {})
  for lang, tokens in shebangs.items():
    for token in tokens:
      if token in line:
        return lang
  return None


def _parse_ok(language: str, content: str) -> bool:
  try:
    parser = Parser()
    parser.set_language(get_language(language))
    tree = parser.parse(bytes(content, "utf-8"))
    return not tree.root_node.has_error
  except Exception:
    return False
