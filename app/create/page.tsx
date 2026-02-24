"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      startTimeLocal: form.get("startTimeLocal"),
      timezone: form.get("timezone"),
      location: form.get("location"),
      hostName: form.get("hostName"),
    };

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErr(data.error ?? "Failed to create event");
      return;
    }

    router.push(`/e/${data.slug}?manageKey=${encodeURIComponent(data.manageKey)}`);
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Create Event</h1>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input name="title" className="mt-1 w-full rounded border p-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea name="description" className="mt-1 w-full rounded border p-2" rows={4} />
        </div>

        <div>
          <label className="block text-sm font-medium">Date & time</label>
          <input name="startTimeLocal" type="datetime-local" className="mt-1 w-full rounded border p-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium">Timezone</label>
          <input name="timezone" defaultValue="Europe/London" className="mt-1 w-full rounded border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <input name="location" className="mt-1 w-full rounded border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Host name</label>
          <input name="hostName" className="mt-1 w-full rounded border p-2" />
        </div>

        {err && <p className="text-red-600">{err}</p>}

        <button disabled={loading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-60">
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </main>
  );
}