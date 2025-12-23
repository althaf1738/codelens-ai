import { searchChunks } from "./qdrant";
import { embedText } from "./embeddings";
import { findProject, saveProject } from "./store";
import { ReviewFinding, ReviewResult } from "./types";
import { randomId } from "./utils";

export async function generateReview(projectId: string, query: string): Promise<ReviewResult> {
  const project = findProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const queryEmbedding = embedText(query || "general review");
  const collection = `project-${projectId}`;
  const results = await searchChunks(collection, queryEmbedding, project.chunks, 8);

  const findings: ReviewFinding[] = [];
  for (const { chunk } of results) {
    findings.push(...heuristicScan(chunk.text, chunk.path, chunk.startLine));
  }

  if (!findings.length) {
    findings.push({
      severity: "info",
      file: "general",
      line: 0,
      message: "No obvious issues detected in sampled chunks. Run a deeper review for certainty."
    });
  }

  const review: ReviewResult = {
    id: randomId(),
    projectId,
    createdAt: new Date().toISOString(),
    query,
    findings
  };

  project.reviews = [review, ...project.reviews];
  saveProject(project);
  return review;
}

function heuristicScan(text: string, path: string, startLine: number): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const lines = text.split("\n");
  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    const lineNumber = startLine + idx;
    if (lower.includes("todo") || lower.includes("fixme")) {
      findings.push({
        severity: "info",
        file: path,
        line: lineNumber,
        message: "TODO/FIXME left in code; track or resolve before release."
      });
    }
    if (lower.includes("console.log")) {
      findings.push({
        severity: "warning",
        file: path,
        line: lineNumber,
        message: "Console log present; consider removing or gating behind debug flag."
      });
    }
    if (/any\b/.test(lower)) {
      findings.push({
        severity: "warning",
        file: path,
        line: lineNumber,
        message: "Usage of 'any' weakens type safety; replace with precise types."
      });
    }
    if (/var\s+\w+/.test(line)) {
      findings.push({
        severity: "warning",
        file: path,
        line: lineNumber,
        message: "Avoid 'var'; prefer 'const' or 'let' for block scoping."
      });
    }
    if (line.length > 140) {
      findings.push({
        severity: "info",
        file: path,
        line: lineNumber,
        message: "Line is very long; consider breaking for readability."
      });
    }
  });
  return findings.slice(0, 6);
}
