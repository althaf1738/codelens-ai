from dataclasses import dataclass
from typing import List


@dataclass
class ReviewIntent:
  name: str
  categories: List[str]
  focus_paths: List[str]
  languages: List[str]


def parse_intent(query: str) -> ReviewIntent:
  q = query.lower()
  categories = []
  if any(word in q for word in ["security", "auth", "token", "jwt", "secret"]):
    categories.append("security")
  if any(word in q for word in ["performance", "slow", "optimize", "latency"]):
    categories.append("performance")
  if any(word in q for word in ["reliability", "error", "exception", "resilience"]):
    categories.append("reliability")
  if any(word in q for word in ["style", "lint", "format", "readability"]):
    categories.append("style")

  focus_paths = []
  for token in ["api", "routes", "controllers", "db", "database", "auth", "config", "frontend", "backend"]:
    if token in q:
      focus_paths.append(token)

  languages = []
  if "python" in q:
    languages.append("python")
  if "typescript" in q or "ts" in q:
    languages.append("typescript")
  if "javascript" in q or "js" in q:
    languages.append("javascript")
  if "go" in q:
    languages.append("go")
  if "java" in q:
    languages.append("java")

  return ReviewIntent(name=query, categories=categories, focus_paths=focus_paths, languages=languages)
