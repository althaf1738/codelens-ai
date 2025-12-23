from dataclasses import dataclass
from typing import Dict, List, Optional

from qdrant_client.http import models as rest

from .clients import get_qdrant, ensure_collection
from .config import settings
from .embeddings import embed_text
from .llm_clients import embed_with_provider, have_embedding_provider


@dataclass
class ChunkInput:
  id: str
  project_id: str
  path: str
  text: str
  start_line: Optional[int] = None
  end_line: Optional[int] = None
  metadata: Optional[Dict] = None


@dataclass
class SearchResult:
  id: str
  score: float
  path: str
  metadata: Dict


class EmbeddingStore:
  """Utility to embed code chunks and store/search them in Qdrant with metadata."""

  def __init__(self, collection_prefix: str = "project") -> None:
    self.collection_prefix = collection_prefix
    self.client = get_qdrant()
    if not self.client:
      raise RuntimeError("Qdrant client is not configured; set QDRANT_URL to enable vector storage.")

  def _collection(self, project_id: str) -> str:
    return f"{self.collection_prefix}-{project_id}"

  def embed(self, text: str) -> List[float]:
    if have_embedding_provider():
      vec = embed_with_provider(text)
      if vec:
        return vec
    return embed_text(text, dim=settings.vector_size)

  def upsert_chunks(self, project_id: str, chunks: List[ChunkInput]) -> None:
    if not self.client:
      raise RuntimeError("Qdrant client missing.")
    collection = self._collection(project_id)
    # Align collection vector size to the actual embedding dimension.
    sample_vec = self.embed(chunks[0].text) if chunks else embed_text("", dim=settings.vector_size)
    ensure_collection(self.client, collection, len(sample_vec))

    points = []
    approx_total_tokens = 0
    provider_enabled = have_embedding_provider()
    for chunk in chunks:
      approx_tokens = _approx_tokens(chunk.text)
      approx_total_tokens += approx_tokens
      print(
        f"[embed] project={project_id} path={chunk.path} lines={chunk.start_line}-{chunk.end_line} "
        f"chars={len(chunk.text)} tokens~{approx_tokens} using={'provider' if provider_enabled else 'local'}"
      )
      vector = self.embed(chunk.text)
      payload = {
        "project_id": chunk.project_id,
        "path": chunk.path,
        "start_line": chunk.start_line,
        "end_line": chunk.end_line,
        **(chunk.metadata or {}),
      }
      points.append({"id": chunk.id, "vector": vector, "payload": payload})

    print(
      f"[embed] summary project={project_id} chunks={len(chunks)} approx_tokens_total={approx_total_tokens} "
      f"using={'provider' if provider_enabled else 'local'}"
    )

    self.client.upsert(collection_name=collection, points=points, wait=True)

  def search(self, project_id: str, query: str, limit: int = 5, path: Optional[str] = None) -> List[SearchResult]:
    if not self.client:
      raise RuntimeError("Qdrant client missing.")
    collection = self._collection(project_id)
    query_vector = self.embed(query)
    ensure_collection(self.client, collection, len(query_vector))
    must_filters = [rest.FieldCondition(key="project_id", match=rest.MatchValue(value=project_id))]
    if path:
      must_filters.append(rest.FieldCondition(key="path", match=rest.MatchValue(value=path)))
    hits = self.client.search(
      collection_name=collection,
      query_vector=query_vector,
      limit=limit,
      query_filter=rest.Filter(must=must_filters),
      with_payload=True,
    )

    results: List[SearchResult] = []
    for hit in hits:
      payload = hit.payload or {}
      results.append(
        SearchResult(
          id=str(hit.id),
          score=hit.score or 0.0,
          path=str(payload.get("path", "")),
          metadata=payload,
        )
      )
    return results


def _get_openai_key() -> Optional[str]:
  import os

  return os.getenv("OPENAI_API_KEY")


def _approx_tokens(text: str) -> int:
  # Rough heuristic: ~4 chars per token for English-like text.
  return max(1, len(text) // 4)
