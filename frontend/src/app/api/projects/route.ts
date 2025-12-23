import { listProjects } from "@/lib/store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const projects = listProjects();
  return NextResponse.json({ projects });
}
