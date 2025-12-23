from dataclasses import dataclass
from typing import List

from tree_sitter import Language, Parser

_TS_LANGUAGE = Language.build_library(
  # Build a temporary shared library in memory to load TS; tree-sitter-languages ships grammars.
  # The path is arbitrary; the library is loaded immediately after build.
  "build/tree-sitter-languages.so",
  ["tree_sitter_languages"]  # Provided by tree-sitter-languages package
) if False else None  # Avoid building at import; languages provided below.

try:
  from tree_sitter_languages import get_language
except Exception as e:  # pragma: no cover
  raise RuntimeError("tree-sitter-languages is required for chunk extraction") from e


@dataclass
class TsChunk:
  code: str
  start_line: int
  end_line: int
  kind: str
  name: str


def extract_ts_chunks(source: str, max_lines: int = 80) -> List[TsChunk]:
  """
  Extract functions, methods, classes, and blocks from TypeScript/JavaScript using tree-sitter.
  Falls back to a single chunk if parsing fails.
  """
  try:
    parser = Parser()
    language = get_language("typescript")
    parser.set_language(language)
    tree = parser.parse(bytes(source, "utf-8"))
    root = tree.root_node
    lines = source.splitlines()
    targets = [n for n in walk(root) if is_target(n)]
    chunks: List[TsChunk] = []
    for node in targets:
      start = node.start_point[0]
      end = node.end_point[0]
      code = "\n".join(lines[start : end + 1])
      # further split large chunks by lines
      if end - start + 1 > max_lines:
        slices = slice_by_lines(code, start, max_lines)
        chunks.extend(slices)
      else:
        chunks.append(
          TsChunk(
            code=code,
            start_line=start + 1,
            end_line=end + 1,
            kind=node.type,
            name=get_name(node),
          )
        )
    return chunks or [TsChunk(code=source, start_line=1, end_line=len(lines), kind="file", name="root")]
  except Exception:
    return [TsChunk(code=source, start_line=1, end_line=len(source.splitlines()), kind="file", name="root")]


def walk(node):
  stack = [node]
  result = []
  while stack:
    current = stack.pop()
    result.append(current)
    for child in current.children:
      if child.is_named:
        stack.append(child)
  return result


def is_target(node) -> bool:
  return node.type in {
    "function_declaration",
    "method_definition",
    "arrow_function",
    "class_declaration",
    "function",
  }


def get_name(node) -> str:
  name_field = node.child_by_field_name("name")
  if name_field:
    return name_field.text.decode("utf-8")
  return node.type


def slice_by_lines(code: str, start_line_zero: int, max_lines: int) -> List[TsChunk]:
  lines = code.splitlines()
  chunks: List[TsChunk] = []
  offset = 0
  while offset < len(lines):
    segment = lines[offset : offset + max_lines]
    chunks.append(
      TsChunk(
        code="\n".join(segment),
        start_line=start_line_zero + offset + 1,
        end_line=min(start_line_zero + offset + len(segment), start_line_zero + len(lines)),
        kind="block",
        name="segment",
      )
    )
    offset += max_lines
  return chunks
