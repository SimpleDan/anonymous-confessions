import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabase-server";
import { containsBlockedContent, hashIdentifier, validateConfession } from "@/src/lib/security";
import { verifyTurnstileToken } from "@/src/lib/turnstile";

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
    const content = String(body.content || "").trim();
    const turnstileToken = String(body.turnstileToken || "");

    if (!turnstileToken) {
      return NextResponse.json({ error: "Captcha required" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    const captchaResult = await verifyTurnstileToken(turnstileToken, ip);

    if (!captchaResult.success) {
      return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
    }

    const validation = validateConfession(content);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const submitterHash = hashIdentifier(`${ip}:${userAgent}`);

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: recentSubmissions, error: recentError } = await supabaseServer
      .from("confessions")
      .select("id")
      .eq("submitter_hash", submitterHash)
      .gte("created_at", tenMinutesAgo);

    if (recentError) {
      return NextResponse.json({ error: "Failed to check rate limit" }, { status: 500 });
    }

    if ((recentSubmissions?.length || 0) >= 3) {
      return NextResponse.json(
        { error: "Too many submissions. Try again later." },
        { status: 429 }
      );
    }

    const blockedCheck = containsBlockedContent(content);
    const status = blockedCheck.blocked ? "pending" : "approved";

    const { error: insertError } = await supabaseServer.from("confessions").insert({
      content,
      status,
      is_flagged: blockedCheck.blocked,
      flag_reason: blockedCheck.reason ?? null,
      submitter_hash: submitterHash,
    });

    if (insertError) {
      return NextResponse.json({ error: "Failed to save confession" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message:
        status === "approved"
          ? "Confession submitted successfully"
          : "Confession submitted for review",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
