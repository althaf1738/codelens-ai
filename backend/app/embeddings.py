import math
from typing import List


def embed_text(text: str, dim: int = 64) -> List[float]:
  """Deterministic stub embedding; replace with real model call."""
  vec = [0.0] * dim
  for i, ch in enumerate(text):
    vec[i % dim] += (ord(ch) * (i + 1)) % 97
  norm = math.sqrt(sum(v * v for v in vec)) or 1.0
  return [round(v / norm, 6) for v in vec]


def cosine_similarity(a: List[float], b: List[float]) -> float:
  dot = sum(x * y for x, y in zip(a, b))
  norm_a = math.sqrt(sum(x * x for x in a)) or 1.0
  norm_b = math.sqrt(sum(y * y for y in b)) or 1.0
  return dot / (norm_a * norm_b)
