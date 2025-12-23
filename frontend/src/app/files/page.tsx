"use client";

import { useEffect, useState } from "react";
import { backendFetch } from "@/lib/backend";

export default function FilesPage() {
  const [projects, setProjects] = useState<{ id: string; name: string; files: string[] }[]>([]);

  useEffect(() => {
    backendFetch<{ projects: { id: string; name: string; files: string[] }[] }>("/listProjects")
      .then((data) => {
        const cleaned =
          data.projects?.map((p) => ({
            ...p,
            files: (p.files || []).filter((f) => !f.includes("__MACOSX") && !f.includes("._"))
          })) || [];
        setProjects(cleaned);
      })
      .catch(() => setProjects([]));
  }, []);

  return (
    <div className="glass p-6 space-y-4">
      <div>
        <div className="text-sm uppercase text-emerald-300">File tree</div>
        <h1 className="text-2xl font-semibold">Browse ingested projects</h1>
        <p className="text-slate-400 text-sm">Select a project to view its files and open in the code viewer.</p>
      </div>
      {projects.length === 0 && (
        <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-4 text-slate-400 text-sm">
          No projects ingested yet. Upload a repo first.
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {projects.map((project) => {
          const files = project.files || [];
          return (
            <div key={project.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{project.name}</div>
                  <div className="text-xs text-slate-400">{project.id.slice(0, 8)}…</div>
                </div>
                <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  {files.length} files
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {files.map((file) => (
                  <li key={file} className="flex items-center justify-between">
                    <span className="truncate">{file}</span>
                    <a
                      className="text-blue-600 hover:text-blue-500 text-xs"
                      href={`/code?projectId=${project.id}&path=${encodeURIComponent(file)}`}
                    >
                      Open
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
