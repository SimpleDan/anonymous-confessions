import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase-server";
import { hashIdentifier } from "../../../lib/security";

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const confessionId = String(body.confessionId || "");
    const rating = Number(body.rating);

    if (!confessionId) {
      return NextResponse.json({ error: "Missing confessionId" }, { status: 400 });
    }

    if (![1, 2, 3].includes(rating)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";
    const reactorHash = hashIdentifier(`${ip}:${userAgent}:reaction`);

    const { error } = await supabaseServer
      .from("reactions")
      .upsert(
        {
          confession_id: confessionId,
          reactor_hash: reactorHash,
          rating,
        },
        {
          onConflict: "confession_id,reactor_hash",
        }
      );

    if (error) {
      return NextResponse.json({ error: "Failed to save reaction" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
