"use client";

import { useState } from "react";
import { backendUrl, backendFetch } from "@/lib/backend";

interface UploadResponse {
  projectId?: string;
  project_id?: string;
  chunkCount?: number;
  chunk_count?: number;
  error?: string;
  files?: string[];
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  async function handleUpload() {
    if (!file) {
      setStatus("Pick a file to upload.");
      return;
    }
    setStatus("Uploading and embedding...");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${backendUrl}/uploadRepo`, { method: "POST", body: form });
      const data: UploadResponse & { files?: string[] } = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const projectId = data.projectId || data.project_id;
      const chunkCount = data.chunkCount || data.chunk_count || 0;
      const files = data.files || [];
      await backendFetch(`/embedRepo?project_id=${projectId}`, { method: "POST" });
      setStatus(
        `Uploaded project ${projectId?.slice(0, 8)}… and triggered embedding for ${files.length} files (${chunkCount} files detected)`
      );

      // File tree is now backed by backend SQLite; no local storage needed.
    } catch (err: any) {
      setStatus(err.message || "Upload failed");
    }
  }

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm uppercase text-emerald-300">Repo upload</div>
          <h1 className="text-2xl font-semibold">Upload a repo archive</h1>
          <p className="text-slate-400 text-sm">We parse, chunk, and embed your code for AI review.</p>
        </div>
        <div className="rounded-full bg-emerald-400/10 px-4 py-2 text-emerald-200 text-sm">
          Step 1/3
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
          accept=".zip,.tar,.txt,.ts,.js,.tsx,.py,.go,.rs,.java"
        />
        <button
          onClick={handleUpload}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-500 transition"
        >
          Upload & Embed
        </button>
        {status && <div className="text-sm text-slate-300">{status}</div>}
      </div>
    </div>
  );
}
