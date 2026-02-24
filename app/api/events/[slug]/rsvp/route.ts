import { NextResponse } from "next/server";
import { supabaseAnon, supabaseAdmin } from "@/lib/supabase";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;

    const body = await req.json();
    const guestName = String(body.guestName ?? "").trim();
    const guestEmailRaw = String(body.guestEmail ?? "").trim();
    const guestEmail = guestEmailRaw ? guestEmailRaw.toLowerCase() : "";
    const status = String(body.status ?? "").trim().toUpperCase();
    const note = String(body.note ?? "").trim();

    if (!guestName)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // Make email required to prevent duplicates
    if (!guestEmail)
      return NextResponse.json(
        { error: "Email is required to avoid duplicates" },
        { status: 400 }
      );

    if (!["YES", "NO", "MAYBE"].includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const { data: event, error: eventErr } = await supabaseAnon
      .from("events")
      .select("id")
      .eq("slug", slug)
      .single();

    if (eventErr || !event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    console.log("RSVP Payload:", body, "event id:", event.id);

    // Upsert: same (event_id, guest_email) updates instead of creating duplicates
    const { error } = await supabaseAdmin
      .from("rsvps")
      .upsert(
        {
          event_id: event.id,
          guest_name: guestName,
          guest_email: guestEmail,
          status,
          note: note || null,
        },
        { onConflict: "event_id,guest_email" }
      );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
