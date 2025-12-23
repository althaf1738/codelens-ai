from typing import Optional
from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.http import models as rest

from .config import settings


def get_qdrant() -> Optional[QdrantClient]:
  """Return a Qdrant client when URL is configured; otherwise None."""
  if not settings.qdrant_url:
    return None
  return QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)


def ensure_collection(client: QdrantClient, name: str, vector_size: int) -> None:
  try:
    client.get_collection(name)
  except UnexpectedResponse:
    client.create_collection(
      collection_name=name,
      vectors_config=rest.VectorParams(size=vector_size, distance=rest.Distance.COSINE),
    )
