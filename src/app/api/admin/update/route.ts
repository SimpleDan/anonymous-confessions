import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const { password, id, status } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("confessions")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update confession" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
