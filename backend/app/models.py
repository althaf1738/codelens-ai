from typing import List, Optional
from pydantic import BaseModel


class UploadResponse(BaseModel):
  project_id: str
  files: List[str]
  chunk_count: int | None = None


class ProjectInfo(BaseModel):
  id: str
  name: str
  created_at: str
  files: List[str]


class ListProjectsResponse(BaseModel):
  projects: List[ProjectInfo]


class ListFilesResponse(BaseModel):
  project_id: str
  files: List[str]


class FileResponse(BaseModel):
  project_id: str
  path: str
  content: str


class EmbedRequest(BaseModel):
  project_id: str
  path: str


class EmbedResponse(BaseModel):
  project_id: str
  path: str
  vector_dim: int
  stored_in_qdrant: bool


class EmbedRepoResponse(BaseModel):
  project_id: str
  files_total: int
  files_embedded: int
  stored_in_qdrant: bool


class ReviewRequest(BaseModel):
  project_id: str
  path: str
  query: Optional[str] = "Run a quick health review."


class Finding(BaseModel):
  severity: str
  line: int
  message: str


class ReviewResponse(BaseModel):
  project_id: str
  path: str
  findings: List[Finding]


class RepoReviewRequest(BaseModel):
  project_id: str
  query: Optional[str] = "Run a repo-level health review."


class RepoFinding(BaseModel):
  issue: str
  files: List[str]
  lines: List[int]
  severity: str
  explanation: str
  suggestion: str
  optional_patch: Optional[str] = None
  cross_file: bool = False


class RepoReviewResponse(BaseModel):
  project_id: str
  query: str
  findings: List[RepoFinding]
