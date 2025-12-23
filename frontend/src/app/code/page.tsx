"use client";

import { useEffect, useMemo, useState } from "react";
import { ReviewFinding } from "@/lib/types";
import { backendUrl } from "@/lib/backend";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface Project {
  id: string;
  name: string;
  chunks: { path: string; text: string; startLine: number; endLine: number }[];
}

export default function CodePage() {
  const [project, setProject] = useState<Project | null>(null);
  const [path, setPath] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [projects, setProjects] = useState<{ id: string; name: string; files: string[] }[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [query, setQuery] = useState("Give concise review notes for this file.");
  const [findings, setFindings] = useState<ReviewFinding[]>([]);
  const [message, setMessage] = useState<string>("");
  const defaultSeverities = ["critical", "high", "medium", "low", "error", "warning", "info"];
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [activeFindingLines, setActiveFindingLines] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`${backendUrl}/listProjects`)
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]));
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("projectId");
    const filePath = params.get("path") || "";
    setPath(filePath);
    if (projectId) {
      loadFilesAndFirst(projectId, filePath);
    }
  }, []);

  const lines = useMemo(() => code.split("\n"), [code]);

  function loadFilesAndFirst(projectId: string, preferredPath?: string) {
    fetch(`${backendUrl}/listFiles?project_id=${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        const fileList = data.files || [];
        setFiles(fileList);
        const nextPath = preferredPath && preferredPath.length ? preferredPath : fileList[0];
        if (nextPath) {
          setPath(nextPath);
          loadProject(projectId, nextPath);
        }
      })
      .catch(() => setFiles([]));
  }

  function loadProject(projectId: string, filePath: string) {
    fetch(`${backendUrl}/getFile?project_id=${projectId}&path=${encodeURIComponent(filePath)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProject({ id: projectId, name: filePath, chunks: [] });
        setCode(data.content || "// Empty file");
      })
      .catch(() => {
        setProject(null);
        setCode("// Failed to load project");
      });
  }

  async function handleReview() {
    if (!project || !path) {
      setMessage("Select a project and file first.");
      return;
    }
    setMessage("Running review...");
    const endpoint = "/reviewFile";
    const payload = { project_id: project.id, path, query };
    const res = await fetch(`${backendUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Review failed");
      return;
    }
    const all = (data.findings || []) as ReviewFinding[];
    setFindings(all.slice(0, 200));
    setMessage(`Review complete. ${all.length} findings.`);
  }

  function groupedFindings() {
    const groups: Record<string, ReviewFinding[]> = {};
    findings.forEach((f) => {
      const sev = (f.severity || "").toLowerCase();
      const key = defaultSeverities.includes(sev) ? sev : "other";
      groups[key] = groups[key] || [];
      groups[key].push(f);
    });
    return groups;
  }

  function scrollToLine(line: number, lineRange?: number[]) {
    setActiveLine(line);
    const lines = new Set<number>();
    if (lineRange && lineRange.length) {
      lineRange.forEach((ln) => lines.add(ln));
    } else {
      lines.add(line);
    }
    setActiveFindingLines(lines);
    const el = document.getElementById(`line-${line}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function languageFromPath(p: string) {
    const lower = p.toLowerCase();
    if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
    if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "javascript";
    if (lower.endsWith(".py")) return "python";
    if (lower.endsWith(".go")) return "go";
    if (lower.endsWith(".java")) return "java";
    return "text";
  }

  return (
    <div className="space-y-4">
      <div className="glass p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm uppercase text-emerald-300">Code reviewer</div>
            <h1 className="text-2xl font-semibold">{path || "Select a file from file tree"}</h1>
            <p className="text-slate-400 text-sm">Repo and file-level reviews with inline highlighting and filters.</p>
          </div>
          <div className="text-xs text-slate-400">
            {project ? `Project ${project.id.slice(0, 8)}…` : "No project loaded"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass p-4 space-y-3">
          <div className="text-sm font-semibold text-slate-200">Projects</div>
          <select
            className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-sm"
            value={project?.id || ""}
            onChange={(e) => {
              const projId = e.target.value;
              setProject(projId ? { id: projId, name: projId, chunks: [] } : null);
              setFindings([]);
              setPath("");
              if (projId) loadFilesAndFirst(projId);
            }}
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id.slice(0, 6)}…)
              </option>
            ))}
          </select>

          <div className="text-sm font-semibold text-slate-200">Files</div>
          <div className="max-h-80 overflow-auto rounded-lg border border-slate-800 bg-slate-900/40 p-2 text-sm">
            {files.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setPath(f);
                  if (project?.id) loadProject(project.id, f);
                }}
                className={`block w-full truncate text-left rounded px-2 py-1 hover:bg-slate-800 ${
                  path === f ? "bg-slate-800 text-blue-400" : "text-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
            {!files.length && <div className="text-xs text-slate-500">No files</div>}
          </div>

          {/* Severity grouping handled in comments list */}
        </div>

        <div className="glass p-4 md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-slate-400">Code</div>
            <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{lines.length} lines</div>
          </div>
          <div className="overflow-auto rounded-lg border border-slate-800 bg-[#0d1117] text-sm leading-relaxed">
            <SyntaxHighlighter
              language={languageFromPath(path)}
              style={atomDark}
              showLineNumbers
              wrapLines
              customStyle={{ background: "#0d1117", margin: 0, padding: "16px", fontSize: "13px" }}
              lineProps={(lineNumber: number) => ({
                id: `line-${lineNumber}`,
                style: {
                  cursor: "default",
                  backgroundColor:
                    activeLine === lineNumber
                      ? "rgba(255, 99, 132, 0.2)"
                      : activeFindingLines.has(lineNumber)
                        ? "rgba(255, 99, 132, 0.12)"
                        : "transparent",
                  borderLeft:
                    activeFindingLines.has(lineNumber) || activeLine === lineNumber
                      ? "3px solid rgba(255, 99, 132, 0.8)"
                      : undefined
                }
              })}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>

        <div className="glass p-3 space-y-3 md:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase text-emerald-300">AI comments</div>
              <p className="text-slate-400 text-xs">File scope review results.</p>
            </div>
            <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {findings.length} items
            </div>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-sm min-h-[120px]"
            rows={5}
          />
          <button
            onClick={handleReview}
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-white font-semibold hover:bg-blue-500 transition"
          >
            Run review
          </button>
          {message && <div className="text-xs text-slate-300">{message}</div>}
          <div className="space-y-3">
            {Object.entries(groupedFindings()).map(([sev, items]) => (
              <div key={sev} className="space-y-2">
                <div className="text-xs uppercase text-slate-400">
                  {sev} ({items.length})
                </div>
                {items.map((f, idx) => {
                  const lineRange: number[] = [];
                  if (f.line) lineRange.push(f.line);
                  return (
                    <div
                      key={`${sev}-${idx}`}
                      className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-left hover:border-blue-500"
                    >
                      <button
                        onClick={() => scrollToLine(f.line || 1, lineRange)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>
                            {f.severity?.toUpperCase() || sev.toUpperCase()} · {f.file}:{f.line || "-"}
                            {f.cross_file ? " · CROSS-FILE" : ""}
                      </span>
                      <span className="text-blue-400">Jump</span>
                    </div>
                    <div className="text-sm mt-1">{f.message}</div>
                  </button>
                  <button
                    onClick={() => {
                      const key = `${sev}-${idx}`;
                      const next = new Set(expanded);
                      next.has(idx) ? next.delete(idx) : next.add(idx);
                      setExpanded(next);
                    }}
                    className="mt-2 text-xs text-blue-400"
                  >
                    {expanded.has(idx) ? "Hide details" : "Show details"}
                  </button>
                      {expanded.has(idx) && (
                        <div className="mt-2 space-y-2 text-sm text-slate-300">
                          {f.explanation && <p className="text-slate-300">Explanation: {f.explanation}</p>}
                          {f.suggestion && <p className="text-emerald-300">Suggestion: {f.suggestion}</p>}
                          {f.optional_patch && (
                            <pre className="text-xs rounded border border-slate-800 bg-slate-950/70 p-2 overflow-auto">
                              {f.optional_patch}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {!findings.length && <div className="text-xs text-slate-500">No comments yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
