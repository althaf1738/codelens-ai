import { NextResponse } from "next/server";
import { parseRepository, guessProjectName } from "@/lib/parser";
import { randomId } from "@/lib/utils";
import { saveProject } from "@/lib/store";
import { upsertChunks } from "@/lib/qdrant";
import { UploadResult } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    const projectName = (formData.get("projectName") as string | null) ?? guessProjectName(file.name);
    const rawContent = await file.text();

    const projectId = randomId();
    const { chunks } = parseRepository(projectId, file.name, rawContent);

    const project = {
      id: projectId,
      name: projectName,
      sourceName: file.name || "upload.txt",
      createdAt: new Date().toISOString(),
      status: "ready" as const,
      chunkCount: chunks.length,
      chunks,
      reviews: []
    };

    saveProject(project);
    await upsertChunks(`project-${projectId}`, chunks);

    const result: UploadResult = { projectId, chunkCount: chunks.length };
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to ingest repository" }, { status: 500 });
  }
}
