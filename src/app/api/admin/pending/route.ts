import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "src/lib/supabase-server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from("confessions")
    .select("id, content, created_at, flag_reason")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}
