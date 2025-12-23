from dataclasses import dataclass
from typing import Dict, List, Optional

from tree_sitter_languages import get_parser


@dataclass
class AstChunk:
  path: str
  language: str
  text: str
  start_line: int
  end_line: int


NODE_TYPES: Dict[str, List[str]] = {
  "python": [
    "function_definition",
    "class_definition",
  ],
  "javascript": [
    "function_declaration",
    "class_declaration",
    "method_definition",
  ],
  "typescript": [
    "function_declaration",
    "class_declaration",
    "method_definition",
  ],
  "tsx": [
    "function_declaration",
    "class_declaration",
    "method_definition",
  ],
  "go": [
    "function_declaration",
    "method_declaration",
  ],
  "java": [
    "class_declaration",
    "method_declaration",
    "constructor_declaration",
  ],
}


def extract_ast_chunks(language: str, source: str, path: str) -> List[AstChunk]:
  try:
    parser = get_parser(language)
  except Exception:
    return []

  tree = parser.parse(bytes(source, "utf-8"))
  if tree.root_node.has_error:
    return []

  target_types = set(NODE_TYPES.get(language, []))
  if not target_types:
    return []

  chunks: List[AstChunk] = []
  for node in walk(tree.root_node):
    if node.type not in target_types:
      continue
    start_line = node.start_point[0] + 1
    end_line = node.end_point[0] + 1
    text = source[node.start_byte : node.end_byte]
    chunks.append(
      AstChunk(
        path=path,
        language=language,
        text=text,
        start_line=start_line,
        end_line=end_line,
      )
    )

  return chunks


def chunk_by_lines(
  content: str, max_lines: int = 80, base_line: int = 1, path: Optional[str] = None, language: Optional[str] = None
) -> List[AstChunk]:
  lines = content.splitlines()
  chunks: List[AstChunk] = []
  offset = 0
  while offset < len(lines):
    segment = lines[offset : offset + max_lines]
    chunks.append(
      AstChunk(
        path=path or "",
        language=language or "unknown",
        text="\n".join(segment),
        start_line=base_line + offset,
        end_line=base_line + offset + len(segment) - 1,
      )
    )
    offset += max_lines
  if chunks:
    return chunks
  return [
    AstChunk(
      path=path or "",
      language=language or "unknown",
      text=content,
      start_line=base_line,
      end_line=base_line,
    )
  ]


def walk(node):
  stack = [node]
  while stack:
    current = stack.pop()
    if current.is_named:
      yield current
    for child in current.children:
      stack.append(child)
