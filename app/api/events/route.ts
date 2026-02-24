import { NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase";
import { nanoid } from "nanoid";

function toIso(dtLocal: string) {
  // "YYYY-MM-DDTHH:mm" -> ISO
  return new Date(dtLocal).toISOString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const startTimeLocal = String(body.startTimeLocal ?? "").trim();
    const timezone = String(body.timezone ?? "Europe/London").trim();
    const location = String(body.location ?? "").trim();
    const hostName = String(body.hostName ?? "").trim();

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!startTimeLocal) return NextResponse.json({ error: "Date/time is required" }, { status: 400 });

    const slug = nanoid(7);
    const manageKey = nanoid(32);

    const { data, error } = await supabaseAnon
      .from("events")
      .insert({
        slug,
        title,
        description,
        start_time: toIso(startTimeLocal),
        timezone,
        location,
        host_name: hostName,
        manage_key: manageKey,
      })
      .select("slug, manage_key")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ slug: data.slug, manageKey: data.manage_key });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}