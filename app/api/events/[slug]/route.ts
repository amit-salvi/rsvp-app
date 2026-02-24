import { NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;

  const { data, error } = await supabaseAnon
    .from("events")
    .select("id, slug, title, description, start_time, timezone, location, host_name, created_at")
    .eq("slug", slug)
    .single();

  if (error) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  return NextResponse.json({ event: data });
}