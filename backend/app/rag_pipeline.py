import json
from dataclasses import dataclass
from typing import List, Optional

from .embedding_store import EmbeddingStore
from .embeddings import embed_text, cosine_similarity
from .db import neighbors
from .storage import read_file, load_embeddings, list_files
from .config import settings
from .llm_clients import generate_with_provider, have_llm_provider
from .review_intent import parse_intent


@dataclass
class ReviewComment:
  file: str
  line: int
  severity: str
  summary: str
  recommendation: str
  explanation: str = ""
  suggestion: str = ""
  optional_patch: str = ""
  lines: Optional[List[int]] = None
  cross_file: bool = False


@dataclass
class RagReviewResult:
  project_id: str
  query: str
  comments: List[ReviewComment]


def _llm_available() -> bool:
  return have_llm_provider()


def retrieve_top_k(project_id: str, query: str, k: int = 5, path: Optional[str] = None) -> List[dict]:
  """
  Retrieve top-k relevant chunks.
  Prefers Qdrant via EmbeddingStore; falls back to local embeddings.json cosine similarity.
  """
  try:
    store = EmbeddingStore()
    paths = [path] if path else None
    if path:
      paths = list({path, *neighbors(project_id, path)})
    hits = []
    if paths:
      for p in paths:
        hits.extend(store.search(project_id, query, limit=max(2, k // len(paths)), path=p))
    else:
      hits = store.search(project_id, query, limit=k, path=path)
    results = []
    for hit in hits:
      content = read_file(project_id, hit.path) or ""
      snippet = content[:400]
      start_line = hit.metadata.get("start_line", 1)
      end_line = hit.metadata.get("end_line")
      results.append(
        {
          "path": hit.path,
          "score": hit.score,
          "snippet": snippet,
          "line": start_line,
          "end_line": end_line,
        }
      )
    return [r for r in results if not _skip_path(r["path"])]
  except Exception:
    # Fallback to local embeddings.json similarity over whole files.
    vectors = load_embeddings(project_id)
    if not vectors:
      return []
    query_vec = embed_text(query, dim=settings.vector_size)
    scored = []
    for p, vec in vectors.items():
      score = cosine_similarity(query_vec, vec)
      content = read_file(project_id, p) or ""
      scored.append({"path": p, "score": score, "snippet": content[:400], "line": 1})
    scored = [r for r in scored if not _skip_path(r["path"])]
    return sorted(scored, key=lambda x: x["score"], reverse=True)[:k]


def build_prompt_context(chunks: List[dict]) -> str:
  parts = []
  for chunk in chunks:
    snippet = chunk["snippet"][:400]
    parts.append(f"File: {chunk['path']} (score {chunk.get('score', 0):.3f})\n{snippet}")
  return "\n\n".join(parts)


def build_repo_prompt(query: str, chunks: List[dict], intent) -> str:
  context = build_prompt_context(chunks)
  intent_name = getattr(intent, "name", query)
  checks = [
    "credentials validated before login success",
    "authentication flags/configs enforced",
    "tokens are validated and expired",
    "security utilities are used",
    "cross-file data flows are consistent",
  ]
  checks_text = "\n".join([f"- {c}" for c in checks])

  return f"""
You are an AI code reviewer performing a repository-level review.

Analyze the provided code context and return structured findings.
Context snippets may come from multiple files. Always reference file paths and line ranges.
If an issue spans multiple files, set cross_file=true and include all affected files.
If issues require understanding interactions across files, reconstruct the execution flow before reporting.

Return JSON with key "findings" as an array.
Each finding must include: issue, files, lines, severity, explanation, suggestion, optional_patch, cross_file.

Review query:
{query}

Review intent:
{intent_name}

Intent focus (non-exhaustive):
categories: {intent.categories}
paths: {intent.focus_paths}
languages: {intent.languages}

Intent checks to verify:
{checks_text}

Context (grouped by file):
{context}
"""


def generate_comments(query: str, context: str) -> List[ReviewComment]:
  """
  Generate structured review comments via LLM; falls back to heuristic JSON when LLM unavailable.
  """
  system_prompt = (
    "You are an AI code reviewer. Return JSON array under key 'comments'. "
    "Each item: {file, line, lines (array), severity (info|warning|error|low|medium|high|critical), "
    "summary, explanation, recommendation, suggestion, optional_patch, cross_file}."
  )

  if _llm_available():
    prompt = (
      f"{system_prompt}\n"
      'Respond ONLY with JSON, e.g. {"comments":[{"file":"file.ts","line":12,"lines":[12,13],"severity":"warning","summary":"...","explanation":"...","recommendation":"...","suggestion":"...","optional_patch":"...","cross_file":false}]}.\n'
      f"Query: {query}\n\nContext:\n{context}"
    )
    raw = generate_with_provider(prompt, system="")
    if raw:
      parsed = _safe_parse_json(raw)
      if parsed is not None:
        return [
          ReviewComment(
            file=item.get("file", "unknown"),
            line=int(item.get("line", 0)),
            severity=item.get("severity", "info"),
            summary=item.get("summary", ""),
            recommendation=item.get("recommendation", ""),
            explanation=item.get("explanation", ""),
            suggestion=item.get("suggestion", item.get("recommendation", "")),
            optional_patch=item.get("optional_patch", ""),
            lines=[int(x) for x in item.get("lines", []) if isinstance(x, int)],
            cross_file=bool(item.get("cross_file", False)),
          )
          for item in parsed.get("comments", [])
        ]
      else:
        print("[llm] JSON parse failed, falling back to heuristic review.")
  else:
    print("[llm] generation skipped: no provider configured; using heuristic review.")

  # Heuristic fallback if no LLM
  comment = ReviewComment(
    file="general",
    line=0,
    severity="info",
    summary="No LLM key provided; returning placeholder review.",
    recommendation="Configure LLM provider env (LLM_PROVIDER + key/model) to enable structured review generation.",
  )
  return [comment]


def run_rag_review(project_id: str, query: str, k: int = 5, path: Optional[str] = None) -> RagReviewResult:
  chunks = retrieve_top_k(project_id, query, k, path)
  context = build_prompt_context(chunks)
  comments = generate_comments(query, context)
  return RagReviewResult(project_id=project_id, query=query, comments=comments)


def run_repo_review(project_id: str, query: str, k: int = 20) -> dict:
  intent = parse_intent(query)
  chunks = retrieve_top_k(project_id, query, k)
  # add one representative chunk per file to broaden coverage
  extra_chunks = []
  for path in list_files(project_id)[:50]:
    content = read_file(project_id, path) or ""
    if content:
      extra_chunks.append({"path": path, "score": 0, "snippet": content[:200], "line": 1})
  chunks.extend(extra_chunks)
  chunks = [c for c in chunks if not _skip_path(c["path"])]
  prompt = build_repo_prompt(query, chunks, intent)
  raw = generate_with_provider(prompt)
  parsed = _safe_parse_json(raw or "{}")
  findings = parsed.get("findings", []) if parsed else []
  findings = _normalize_repo_findings(findings)
  findings = [f for f in findings if not any(_skip_path(p) for p in f.get("files", []))]
  findings += _heuristic_repo_findings(project_id)
  return {"findings": findings}


def _safe_parse_json(raw: str) -> Optional[dict]:
  try:
    return json.loads(raw)
  except Exception:
    pass
  # try to extract first {...} block
  start = raw.find("{")
  end = raw.rfind("}")
  if start != -1 and end != -1 and end > start:
    try:
      return json.loads(raw[start : end + 1])
    except Exception:
      return None
  return None


def _normalize_repo_findings(findings: List[dict]) -> List[dict]:
  normed = []
  for f in findings:
    files = f.get("files", [])
    if isinstance(files, str):
      files = [files]
    lines = f.get("lines", [])
    lines_list: List[int] = []
    if isinstance(lines, str):
      for token in lines.split(","):
        token = token.strip()
        if "-" in token:
          start, end = token.split("-", 1)
          if start.isdigit() and end.isdigit():
            lines_list.extend([int(start), int(end)])
        elif token.isdigit():
          lines_list.append(int(token))
    elif isinstance(lines, list):
      for item in lines:
        if isinstance(item, int):
          lines_list.append(item)
        elif isinstance(item, str) and item.isdigit():
          lines_list.append(int(item))
    f["files"] = files
    f["lines"] = lines_list
    f.setdefault("severity", "info")
    f.setdefault("explanation", "")
    f.setdefault("suggestion", "")
    f.setdefault("optional_patch", None)
    f.setdefault("cross_file", len(files) > 1)
    normed.append(f)
  return normed


def _heuristic_repo_findings(project_id: str) -> List[dict]:
  """Lightweight cross-file heuristics to flag unused functions/configs."""
  files = list_files(project_id)
  defs = {}
  refs = {}
  for path in files:
    content = read_file(project_id, path) or ""
    for name in _extract_function_names(content, path):
      defs.setdefault(name, set()).add(path)
    for name in defs.keys():
      if name in content:
        refs.setdefault(name, set()).add(path)

  findings = []
  for name, def_paths in defs.items():
    ref_paths = refs.get(name, set())
    if not ref_paths:
      findings.append(
        {
          "issue": f"Function or method '{name}' is defined but never referenced",
          "files": sorted(def_paths),
          "lines": [],
          "severity": "info",
          "explanation": f"'{name}' appears to be unused across the repository.",
          "suggestion": "Remove if dead code or ensure it is called where intended.",
          "optional_patch": None,
          "cross_file": True,
        }
      )
  return findings


def _extract_function_names(content: str, path: str) -> List[str]:
  import re

  names = set()
  if path.endswith((".js", ".jsx", ".ts", ".tsx")):
    for pat in [
      r"function\s+(\w+)",
      r"const\s+(\w+)\s*=\s*\(",
      r"(\w+)\s*=\s*\(.*?\)\s*=>",
      r"class\s+(\w+)",
    ]:
      names.update(re.findall(pat, content))
  elif path.endswith(".py"):
    names.update(re.findall(r"def\s+(\w+)\s*\(", content))
    names.update(re.findall(r"class\s+(\w+)\s*:", content))
  elif path.endswith(".go"):
    names.update(re.findall(r"func\s+(\w+)\s*\(", content))
  elif path.endswith(".java"):
    names.update(re.findall(r"(?:class|interface)\s+(\w+)", content))
    names.update(re.findall(r"(?:public|private|protected)\s+(?:static\s+)?[\w<>\[\]]+\s+(\w+)\s*\(", content))
  return list(names)


def _skip_path(path: str) -> bool:
  return "__MACOSX" in path or "/._" in path or path.startswith("._")
