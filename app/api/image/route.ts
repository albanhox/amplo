import { NextRequest, NextResponse } from "next/server";
import { generatePostImage } from "@/lib/agents/imageAgent";
import type { ImageRequest } from "@/lib/agents/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Image generation can take several seconds — give it room.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: ImageRequest;
  try {
    body = (await req.json()) as ImageRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.brand?.businessName || !body?.brand?.nicheId) {
    return NextResponse.json(
      { error: "brand.businessName and brand.nicheId are required" },
      { status: 400 }
    );
  }

  const { imageUrl, live } = await generatePostImage(body);
  return NextResponse.json({ imageUrl, live });
}
