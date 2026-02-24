import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;

  const { searchParams } = new URL(req.url);
  const key = String(searchParams.get("key") ?? "").trim();

  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const { data: event, error: eventErr } = await supabaseAdmin
    .from("events")
    .select("id, title, manage_key")
    .eq("slug", slug)
    .single();

  if (eventErr || !event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.manage_key !== key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: rsvps, error } = await supabaseAdmin
    .from("rsvps")
    .select("id, guest_name, status, note, created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totals = { YES: 0, NO: 0, MAYBE: 0 };
  for (const r of rsvps ?? []) totals[r.status as "YES" | "NO" | "MAYBE"]++;

  return NextResponse.json({ eventTitle: event.title, totals, rsvps: rsvps ?? [] });
}