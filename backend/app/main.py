from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4

from .config import settings
from .clients import get_qdrant, ensure_collection
from .storage import save_upload, list_files, read_file, store_embeddings, load_embeddings
from .embeddings import embed_text
from .reviewer import scan_content
from .models import (
  UploadResponse,
  ListProjectsResponse,
  ListFilesResponse,
  FileResponse,
  EmbedRequest,
  EmbedResponse,
  EmbedRepoResponse,
  ReviewRequest,
  ReviewResponse,
  RepoReviewRequest,
  RepoReviewResponse,
)
from .repo_parser import read_text_file, parse_file
from .embedding_store import EmbeddingStore, ChunkInput
from .rag_pipeline import run_rag_review, run_repo_review
from .db import init_db, save_project, list_projects, save_dependencies, neighbors
from .dependency_graph import build_dependency_edges


router = APIRouter()


def _embed_path(project_id: str, path: str) -> tuple[int, bool]:
  content = read_file(project_id, path)
  if content is None:
    raise HTTPException(status_code=404, detail="File not found")
  project_root = settings.storage_dir / project_id
  full_path = project_root / path
  file_content = read_text_file(full_path) or content
  chunks = parse_file(full_path, file_content, path)

  vector = embed_text(content, dim=settings.vector_size)
  existing = load_embeddings(project_id)
  existing[path] = vector
  store_embeddings(project_id, existing)

  stored_in_qdrant = False
  client = get_qdrant()
  if client:
    store = EmbeddingStore()
    chunk_inputs = [
      ChunkInput(
        id=str(uuid4()),  # ensure Qdrant-compatible UUID id
        project_id=project_id,
        path=path,
        text=chunk.text,
        start_line=chunk.start_line,
        end_line=chunk.end_line,
        metadata={
          "raw_id": f"{path}:{chunk.start_line}-{chunk.end_line}",
          "language": chunk.language,
        },
      )
      for chunk in chunks
    ]
    store.upsert_chunks(project_id, chunk_inputs)
    stored_in_qdrant = True

  return len(vector), stored_in_qdrant


@router.post("/uploadRepo", response_model=UploadResponse)
async def upload_repo(file: UploadFile = File(...)):
  """Accepts a repo archive or text file and stores it on disk."""
  data = await file.read()
  if not data:
    raise HTTPException(status_code=400, detail="Empty upload")
  project_id = uuid4().hex
  files = save_upload(project_id, file.filename or "upload.txt", data)
  save_project(project_id, file.filename or "upload.txt", created_at=_now_iso(), files=files)
  # Build dependency graph
  project_root = settings.storage_dir / project_id
  edges = build_dependency_edges(project_root, files)
  save_dependencies(project_id, edges)
  return UploadResponse(project_id=project_id, files=files, chunk_count=len(files))


@router.get("/listFiles", response_model=ListFilesResponse)
async def list_project_files(project_id: str):
  files = list_files(project_id)
  if not files:
    raise HTTPException(status_code=404, detail="Project not found or no files present")
  return ListFilesResponse(project_id=project_id, files=files)


@router.get("/listProjects", response_model=ListProjectsResponse)
async def list_projects_route():
  return ListProjectsResponse(projects=list_projects())


@router.get("/getFile", response_model=FileResponse)
async def get_file(project_id: str, path: str):
  content = read_file(project_id, path)
  if content is None:
    raise HTTPException(status_code=404, detail="File not found")
  return FileResponse(project_id=project_id, path=path, content=content)


@router.post("/embedFile", response_model=EmbedResponse)
async def embed_file(body: EmbedRequest):
  vector_dim, stored_in_qdrant = _embed_path(body.project_id, body.path)

  return EmbedResponse(
    project_id=body.project_id,
    path=body.path,
    vector_dim=vector_dim,
    stored_in_qdrant=stored_in_qdrant,
  )


@router.post("/embedRepo", response_model=EmbedRepoResponse)
async def embed_repo(project_id: str):
  files = list_files(project_id)
  if not files:
    raise HTTPException(status_code=404, detail="Project not found or no files present")
  embedded = 0
  stored_any = False
  for path in files:
    try:
      _, stored = _embed_path(project_id, path)
      embedded += 1
      stored_any = stored_any or stored
    except HTTPException:
      continue
  return EmbedRepoResponse(project_id=project_id, files_total=len(files), files_embedded=embedded, stored_in_qdrant=stored_any)


@router.post("/reviewFile", response_model=ReviewResponse)
async def review_file(body: ReviewRequest):
  content = read_file(body.project_id, body.path)
  if content is None:
    raise HTTPException(status_code=404, detail="File not found")

  # RAG review with retrieval scoped to this file when possible.
  rag_result = run_rag_review(body.project_id, body.query or "General review", k=6, path=body.path)
  findings = [
    {
      "severity": comment.severity,
      "file": (comment.file if comment.file not in ["general", "unknown", None, ""] else body.path),
      "line": comment.line or 0,
      "message": f"{comment.summary} {comment.recommendation}".strip(),
    }
    for comment in rag_result.comments
  ]

  # Heuristic fallback if no findings returned
  if not findings:
    findings = scan_content(body.path, content)

  return ReviewResponse(project_id=body.project_id, path=body.path, findings=findings)


@router.post("/reviewRepo", response_model=RepoReviewResponse)
async def review_repo(body: RepoReviewRequest):
  review = run_repo_review(body.project_id, body.query or "Repo review")
  findings = review.get("findings", [])
  return RepoReviewResponse(project_id=body.project_id, query=body.query or "Repo review", findings=findings)


def create_app() -> FastAPI:
  app = FastAPI(title="Minimal AI Code Reviewer Backend", version="0.1.0")
  app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )
  app.include_router(router)
  init_db()
  return app


app = create_app()


def _now_iso() -> str:
  from datetime import datetime

  return datetime.utcnow().isoformat()
