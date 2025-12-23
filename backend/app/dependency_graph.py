import re
from pathlib import Path
from typing import Dict, List, Set, Tuple

REL_IMPORT_RE = re.compile(r"""from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]""")
JS_IMPORT_RE = re.compile(r"""(?:import|require)\s*(?:[\w\{\}\*\s,]+from\s*)?['"]([^'"]+)['"]""")
PY_IMPORT_RE = re.compile(r"""^(?:from\s+([a-zA-Z0-9_\.]+)\s+import|import\s+([a-zA-Z0-9_\.]+))""", re.MULTILINE)
GO_IMPORT_RE = re.compile(r'^\s*import\s+"([^"]+)"|^\s*"([^"]+)"', re.MULTILINE)
JAVA_IMPORT_RE = re.compile(r"""^\s*import\s+([a-zA-Z0-9\._]+);""", re.MULTILINE)


def build_dependency_edges(root: Path, files: List[str]) -> List[Tuple[str, str]]:
  file_set: Set[str] = set(files)
  edges: Set[Tuple[str, str]] = set()
  for rel in files:
    full = root / rel
    if not full.exists():
      continue
    try:
      content = full.read_text(encoding="utf-8", errors="ignore")
    except Exception:
      continue
    lang = _language_for_path(rel)
    targets: Set[str] = set()
    if lang in {"javascript", "typescript", "tsx"}:
      targets |= _resolve_js_imports(rel, content, file_set)
    elif lang == "python":
      targets |= _resolve_python_imports(rel, content, file_set)
    elif lang == "go":
      targets |= _resolve_go_imports(rel, content, file_set)
    elif lang == "java":
      targets |= _resolve_java_imports(rel, content, file_set)
    edges |= {(rel, t) for t in targets if t in file_set and t != rel}
  return sorted(edges)


def _language_for_path(path: str) -> str:
  ext = Path(path).suffix.lower()
  if ext in {".js", ".jsx"}:
    return "javascript"
  if ext in {".ts", ".tsx"}:
    return "typescript"
  if ext == ".py":
    return "python"
  if ext == ".go":
    return "go"
  if ext == ".java":
    return "java"
  return "unknown"


def _resolve_js_imports(rel_path: str, content: str, file_set: Set[str]) -> Set[str]:
  targets: Set[str] = set()
  dir_path = Path(rel_path).parent
  for match in JS_IMPORT_RE.finditer(content):
    mod = match.group(1)
    if not mod:
      continue
    resolved = _resolve_rel_path(dir_path, mod, [".ts", ".tsx", ".js", ".jsx"])
    if resolved in file_set:
      targets.add(resolved)
  return targets


def _resolve_python_imports(rel_path: str, content: str, file_set: Set[str]) -> Set[str]:
  targets: Set[str] = set()
  dir_path = Path(rel_path).parent
  for match in PY_IMPORT_RE.finditer(content):
    mod = match.group(1) or match.group(2)
    if not mod:
      continue
    candidate = Path(*mod.split(".")).with_suffix(".py")
    # absolute import
    if str(candidate) in file_set:
      targets.add(str(candidate))
    else:
      rel_candidate = (dir_path / candidate).as_posix()
      if rel_candidate in file_set:
        targets.add(rel_candidate)
  return targets


def _resolve_go_imports(rel_path: str, content: str, file_set: Set[str]) -> Set[str]:
  targets: Set[str] = set()
  dir_path = Path(rel_path).parent
  for match in GO_IMPORT_RE.finditer(content):
    mod = match.group(1) or match.group(2)
    if not mod:
      continue
    # local import like "./pkg" or "../pkg"
    if mod.startswith("."):
      candidate = (dir_path / mod / "index.go").resolve().relative_to(Path.cwd()).as_posix()
      if candidate in file_set:
        targets.add(candidate)
      continue
    # try match file names
    candidate = "/".join(mod.split("/")) + ".go"
    if candidate in file_set:
      targets.add(candidate)
  return targets


def _resolve_java_imports(rel_path: str, content: str, file_set: Set[str]) -> Set[str]:
  targets: Set[str] = set()
  for match in JAVA_IMPORT_RE.finditer(content):
    mod = match.group(1)
    if not mod:
      continue
    candidate = "/".join(mod.split(".")) + ".java"
    if candidate in file_set:
      targets.add(candidate)
  return targets


def _resolve_rel_path(base: Path, mod: str, exts: List[str]) -> str:
  p = Path(mod)
  if not p.suffix:
    for ext in exts:
      candidate = (base / (mod + ext)).as_posix()
      if candidate:
        return candidate
  return (base / mod).as_posix()
