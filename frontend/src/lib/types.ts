export type Severity = "info" | "warning" | "error";

export interface CodeChunk {
  id: string;
  projectId: string;
  path: string;
  startLine: number;
  endLine: number;
  text: string;
  embedding: number[];
  lang?: string;
}

export interface Project {
  id: string;
  name: string;
  sourceName: string;
  createdAt: string;
  chunkCount: number;
  status: "ready" | "processing" | "failed";
  chunks: CodeChunk[];
  reviews: ReviewResult[];
}

export interface ReviewFinding {
  severity: Severity;
  file: string;
  line: number;
  message: string;
}

export interface ReviewResult {
  id: string;
  projectId: string;
  createdAt: string;
  query: string;
  findings: ReviewFinding[];
}

export interface UploadResult {
  projectId: string;
  chunkCount: number;
}
