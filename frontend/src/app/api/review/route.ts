import { NextResponse } from "next/server";
import { generateReview } from "@/lib/reviewer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, query } = body as { projectId?: string; query?: string };
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    const review = await generateReview(projectId, query || "Run a general health review of this codebase.");
    return NextResponse.json(review);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate review" }, { status: 500 });
  }
}
