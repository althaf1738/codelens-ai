from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_404():
  """Root path is not defined; ensure the API starts and returns 404."""
  resp = client.get("/")
  assert resp.status_code == 404


def test_list_projects_empty_ok():
  """listProjects should respond even when no projects exist."""
  resp = client.get("/listProjects")
  assert resp.status_code == 200
  assert isinstance(resp.json(), list)
