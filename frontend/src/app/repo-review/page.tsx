"use client";

import { useEffect, useState } from "react";
import { backendFetch, backendUrl } from "@/lib/backend";

interface ProjectInfo {
  id: string;
  name: string;
  files: string[];
}

interface RepoFinding {
  issue: string;
  files: string[];
  lines: number[];
  severity: string;
  explanation: string;
  suggestion: string;
  optional_patch?: string;
  cross_file?: boolean;
}

export default function RepoReviewPage() {
  const defaultSeverities = ["critical", "high", "medium", "low", "error", "warning", "info"];
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [projectId, setProjectId] = useState("");
  const [query, setQuery] = useState("Run a repo-level health review.");
  const [findings, setFindings] = useState<RepoFinding[]>([]);
  const [status, setStatus] = useState("");
  const [active, setActive] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<Set<string>>(new Set(defaultSeverities));
  const [activeFile, setActiveFile] = useState<string>("");
  const [activeFileContent, setActiveFileContent] = useState<string>("");

  useEffect(() => {
    backendFetch<{ projects: ProjectInfo[] }>("/listProjects")
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]));
  }, []);

  async function handleReview() {
    if (!projectId) {
      setStatus("Select a project first.");
      return;
    }
    setStatus("Running repo review...");
    const res = await backendFetch<{ findings: RepoFinding[]; query: string }>(
      "/reviewRepo",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, query })
      }
    ).catch((err) => {
      setStatus(err.message || "Review failed");
      return null;
    });
    if (!res) return;
    setFindings(res.findings || []);
    setStatus("Repo review complete.");
  }

  return (
    <div className="glass p-4 space-y-4">
      <div>
        <div className="text-sm uppercase text-emerald-300">Repo review</div>
        <h1 className="text-2xl font-semibold">Cross-file review</h1>
        <p className="text-slate-400 text-sm">Runs retrieval across the full project and surfaces cross-file issues.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <label className="text-xs text-slate-400">Review intent</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-sm"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Project</label>
          <select
            className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-sm"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id.slice(0, 6)}…)
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2 text-sm">
            {defaultSeverities.map((sev) => (
              <label key={sev} className="flex items-center gap-1 text-slate-300">
                <input
                  type="checkbox"
                  checked={severityFilter.has(sev)}
                  onChange={() => {
                    const next = new Set(severityFilter);
                    const key = sev.toLowerCase();
                    next.has(key) ? next.delete(key) : next.add(key);
                    setSeverityFilter(next);
                  }}
                  className="accent-blue-500"
                />
                {sev}
              </label>
            ))}
          </div>
          <button
            onClick={handleReview}
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-white font-semibold hover:bg-blue-500 transition"
          >
            Run repo review
          </button>
          {status && <div className="text-xs text-slate-300">{status}</div>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 space-y-3">
          {(findings || [])
            .filter((f) => {
              const sev = (f.severity || "").toLowerCase();
              return severityFilter.has(sev) || !defaultSeverities.includes(sev);
            })
            .map((f, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActive(idx);
                  const file = f.files?.[0] || "";
                  if (projectId && file) {
                    fetch(`${backendUrl}/getFile?project_id=${projectId}&path=${encodeURIComponent(file)}`)
                      .then((res) => res.json())
                      .then((data) => {
                        setActiveFile(file);
                        setActiveFileContent(data.content || "");
                      })
                      .catch(() => {
                        setActiveFile(file);
                        setActiveFileContent("// failed to load");
                      });
                  }
                }}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  active === idx ? "border-blue-500 bg-slate-900/80" : "border-slate-800 bg-slate-900/60"
                }`}
              >
                <div className="text-xs text-slate-400">
                  {f.severity.toUpperCase()} · {f.cross_file ? "Cross-file" : "Single-file"}
                </div>
                <div className="text-sm font-semibold">{f.issue}</div>
                <div className="text-xs text-slate-400">Files: {f.files?.join(", ") || "n/a"}</div>
              </button>
            ))}
          {(!findings || !findings.length) && <div className="text-xs text-slate-500">No repo findings yet.</div>}
        </div>

        <div className="md:col-span-2 glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Preview</div>
              <div className="text-lg font-semibold">
                {activeFile ? activeFile : active !== null ? "Select a finding" : "No file selected"}
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#0d1117] p-2 text-sm text-slate-200 min-h-[200px]">
            {activeFileContent ? (
              <pre className="whitespace-pre-wrap text-xs overflow-auto">{activeFileContent}</pre>
            ) : (
              <div className="text-xs text-slate-500">Select a finding to preview its first file.</div>
            )}
          </div>
          {active !== null && findings[active] && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-xs text-slate-400">
                {findings[active].severity.toUpperCase()} · {findings[active].cross_file ? "Cross-file" : "Single-file"}
              </div>
              <div className="text-sm font-semibold">{findings[active].issue}</div>
              <div className="text-xs text-slate-400">Files: {findings[active].files?.join(", ") || "n/a"}</div>
              <p className="text-sm mt-2">{findings[active].explanation}</p>
              <p className="text-sm text-emerald-200 mt-1">Suggestion: {findings[active].suggestion}</p>
              {findings[active].optional_patch && (
                <pre className="text-xs rounded border border-slate-800 bg-slate-950/70 p-2 overflow-auto mt-2">
                  {findings[active].optional_patch}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
