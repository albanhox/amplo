import { NextRequest, NextResponse } from "next/server";
import { generatePosts } from "@/lib/agents/contentAgent";
import type { GenerateRequest } from "@/lib/agents/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.brand?.businessName || !body?.brand?.nicheId || !body?.type) {
    return NextResponse.json(
      { error: "brand.businessName, brand.nicheId and type are required" },
      { status: 400 }
    );
  }

  const result = await generatePosts({ ...body, count: Math.min(body.count ?? 3, 6) });
  return NextResponse.json(result);
}
