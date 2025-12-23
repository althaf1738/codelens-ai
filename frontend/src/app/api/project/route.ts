import { NextResponse } from "next/server";
import { findProject } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const project = findProject(id);
  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }
  return NextResponse.json({ project });
}
