import sqlite3
from pathlib import Path
from typing import Dict, List

from .config import settings


def _db_path() -> Path:
  return settings.database_path


def init_db():
  path = _db_path()
  conn = sqlite3.connect(path)
  cur = conn.cursor()
  cur.execute(
    """
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
    """
  )
  cur.execute(
    """
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      path TEXT NOT NULL
    )
    """
  )
  cur.execute(
    """
    CREATE TABLE IF NOT EXISTS dependencies (
      project_id TEXT NOT NULL,
      src TEXT NOT NULL,
      dst TEXT NOT NULL
    )
    """
  )
  conn.commit()
  conn.close()


def save_project(project_id: str, name: str, created_at: str, files: List[str]):
  conn = sqlite3.connect(_db_path())
  cur = conn.cursor()
  cur.execute(
    "INSERT OR REPLACE INTO projects (id, name, created_at) VALUES (?, ?, ?)",
    (project_id, name, created_at),
  )
  cur.execute("DELETE FROM files WHERE project_id = ?", (project_id,))
  cur.executemany(
    "INSERT INTO files (project_id, path) VALUES (?, ?)",
    [(project_id, path) for path in files],
  )
  conn.commit()
  conn.close()


def save_dependencies(project_id: str, edges: List[tuple[str, str]]):
  conn = sqlite3.connect(_db_path())
  cur = conn.cursor()
  cur.execute("DELETE FROM dependencies WHERE project_id = ?", (project_id,))
  cur.executemany(
    "INSERT INTO dependencies (project_id, src, dst) VALUES (?, ?, ?)",
    [(project_id, src, dst) for src, dst in edges],
  )
  conn.commit()
  conn.close()


def neighbors(project_id: str, path: str) -> List[str]:
  conn = sqlite3.connect(_db_path())
  cur = conn.cursor()
  cur.execute("SELECT dst FROM dependencies WHERE project_id = ? AND src = ?", (project_id, path))
  res = [row[0] for row in cur.fetchall()]
  conn.close()
  return res


def list_projects() -> List[Dict]:
  conn = sqlite3.connect(_db_path())
  cur = conn.cursor()
  cur.execute("SELECT id, name, created_at FROM projects ORDER BY created_at DESC")
  projects = cur.fetchall()
  result = []
  for project_id, name, created_at in projects:
    cur.execute("SELECT path FROM files WHERE project_id = ? ORDER BY path", (project_id,))
    files = [row[0] for row in cur.fetchall()]
    result.append({"id": project_id, "name": name, "created_at": created_at, "files": files})
  conn.close()
  return result
