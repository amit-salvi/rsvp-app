"use client";

import { useEffect, useState } from "react";

type Rsvp = {
  id: string;
  guest_name: string;
  guest_email: string;
  status: "YES" | "NO" | "MAYBE";
  note: string | null;
  num_guests: number;
  num_under5: number;
  created_at: string;
};

export default function ManageClient({ slug, keyValue }: { slug: string; keyValue: string }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [totals, setTotals] = useState<{ YES: number; NO: number; MAYBE: number } | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/events/${slug}/rsvps?key=${encodeURIComponent(keyValue)}`);
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErr(data.error ?? "Failed to load RSVPs");
        return;
      }
      setEventTitle(data.eventTitle);
      setTotals(data.totals);
      setRsvps(data.rsvps);
    })();
  }, [slug, keyValue]);

  if (!keyValue) return <main className="mx-auto max-w-2xl p-6">Missing key.</main>;
  if (loading) return <main className="mx-auto max-w-2xl p-6">Loading...</main>;
  if (err) return <main className="mx-auto max-w-2xl p-6 text-red-600">{err}</main>;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Manage RSVPs</h1>
      <p className="mt-1 text-gray-600">{eventTitle}</p>

      {totals && (
        <div className="mt-4 flex gap-3">
          <div className="rounded border p-3">✅ Yes: {totals.YES}</div>
          <div className="rounded border p-3">🤔 Maybe: {totals.MAYBE}</div>
          <div className="rounded border p-3">❌ No: {totals.NO}</div>
        </div>
      )}

      <div className="mt-6 rounded border">
        <div className="grid grid-cols-12 gap-2 border-b p-3 font-semibold">
          <div className="col-span-2">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Guests</div>
          <div className="col-span-2">Under 5</div>
          <div className="col-span-2">Time</div>
        </div>

        {rsvps.map((r) => (
          <div key={r.id} className="grid grid-cols-12 gap-2 border-b p-3 text-sm">
            <div className="col-span-2">{r.guest_name}</div>
            <div className="col-span-3">{r.guest_email}</div>
            <div className="col-span-1">{r.status}</div>
            <div className="col-span-2">{r.num_guests}</div>
            <div className="col-span-2">{r.num_under5}</div>
            <div className="col-span-2">{new Date(r.created_at).toLocaleString()}</div>
          </div>
        ))}

        {rsvps.length === 0 && <p className="p-3 text-gray-600">No RSVPs yet.</p>}
      </div>
    </main>
  );
}