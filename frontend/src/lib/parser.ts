import path from "path";
import { chunkCode } from "./chunking";
// Tree-sitter is currently flaky in this environment; we fallback to line-based chunking.
// import { TreeSitterCodeExtractor } from "./treeSitterParser";
import { embedText } from "./embeddings";
import { CodeChunk } from "./types";

interface ParsedFile {
  path: string;
  content: string;
}

// Minimal parser that treats the uploaded text as a single virtual file.
// Replace with unzip + directory walk for real repositories.
export function parseRepository(
  projectId: string,
  sourceName: string,
  content: string
): { files: ParsedFile[]; chunks: CodeChunk[] } {
  const normalized = normalizeContent(content);
  const files: ParsedFile[] = [
    {
      path: sourceName || "upload.txt",
      content: normalized
    }
  ];

  // const extractor = new TreeSitterCodeExtractor();
  const chunks: CodeChunk[] = [];

  for (const file of files) {
    const treeChunks: CodeChunk[] = []; // Tree-sitter disabled for stability
    const fallbackChunks = chunkCode({ projectId, path: file.path, text: file.content, maxTokens: 640 });
    const selected = Array.isArray(treeChunks) && treeChunks.length ? treeChunks : fallbackChunks;
    const combined = selected.map((chunk) => ({
      ...chunk,
      embedding: embedText(chunk.text)
    }));
    chunks.push(...combined);
  }

  return { files, chunks };
}

function normalizeContent(text: string) {
  // Strip null bytes and normalize newlines for safer tokenization.
  return text.replace(/\u0000/g, "").replace(/\r\n/g, "\n").trim();
}

function extractWithTreeSitter(extractor: TreeSitterCodeExtractor, projectId: string, file: ParsedFile): CodeChunk[] {
  try {
    const result = extractor.extract(file.content, "typescript", 300);
    if (!Array.isArray(result)) return [];
    return result.map((chunk) => ({
      id: randomId(),
      projectId,
      path: file.path,
      startLine: chunk.startLine + 1,
      endLine: chunk.endLine + 1,
      text: chunk.code,
      embedding: []
    }));
  } catch (err) {
    console.warn("Tree-sitter extraction failed, falling back:", err);
    return [];
  }
}

export function guessProjectName(filename?: string | null) {
  if (!filename) return "uploaded-project";
  return path.basename(filename).replace(/\.[^.]+$/, "") || "uploaded-project";
}
