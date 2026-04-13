import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { hashIdentifier } from "@/lib/security";

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

    if (!confessionId) {
      return NextResponse.json({ error: "Missing confessionId" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";
    const voterHash = hashIdentifier(`${ip}:${userAgent}:vote`);

    const { error: voteInsertError } = await supabaseServer.from("votes").insert({
      confession_id: confessionId,
      voter_hash: voterHash,
    });

    if (voteInsertError) {
      if (voteInsertError.message.toLowerCase().includes("duplicate")) {
        return NextResponse.json({ error: "You already voted for this" }, { status: 409 });
      }

      return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
    }

    const { data: currentConfession, error: readError } = await supabaseServer
      .from("confessions")
      .select("score")
      .eq("id", confessionId)
      .single();

    if (readError || !currentConfession) {
      return NextResponse.json({ error: "Confession not found" }, { status: 404 });
    }

    const { error: updateError } = await supabaseServer
      .from("confessions")
      .update({ score: currentConfession.score + 1 })
      .eq("id", confessionId);

    if (updateError) {
      return NextResponse.json({ error: "Vote recorded, but score failed to update" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
