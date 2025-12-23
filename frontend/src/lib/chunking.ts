import { CodeChunk } from "./types";
import { randomId } from "./utils";

interface ChunkOptions {
  projectId: string;
  path: string;
  text: string;
  startLine?: number;
  maxTokens?: number;
}

// Naive line-based splitter. A production setup would use language-aware chunking.
export function chunkCode(options: ChunkOptions): CodeChunk[] {
  const { projectId, path, text, startLine = 1, maxTokens = 320 } = options;
  const lines = text.split("\n");
  const chunks: CodeChunk[] = [];
  let current: string[] = [];
  let currentStart = startLine;

  const flush = (endLine: number) => {
    if (!current.length) return;
    chunks.push({
      id: randomId(),
      projectId,
      path,
      startLine: currentStart,
      endLine: endLine,
      text: current.join("\n"),
      embedding: [], // populated later
      lang: detectLang(path)
    });
    current = [];
  };

  lines.forEach((line, idx) => {
    const tentative = [...current, line].join("\n");
    const overLimit = tentative.length > maxTokens;
    if (overLimit) {
      flush(currentStart + current.length - 1);
      current = [line];
      currentStart = startLine + idx;
    } else {
      current.push(line);
    }
  });

  flush(startLine + lines.length - 1);
  return chunks;
}

function detectLang(path: string): string | undefined {
  const lower = path.toLowerCase();
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "javascript";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".go")) return "go";
  if (lower.endsWith(".rs")) return "rust";
  return undefined;
}
