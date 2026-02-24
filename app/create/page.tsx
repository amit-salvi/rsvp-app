"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create an event</h1>
          <p className="mt-1 text-gray-600">
            Fill in the basics — you can share the link right after.
          </p>
        </div>

        <Link href="/" className="text-sm text-gray-600 underline">
          Back
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <form className="space-y-5" onSubmit={onSubmit}>
          <Field label="Title" hint="E.g. Tea & snacks at my place">
            <input
              name="title"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400
           focus:outline-none focus:ring-2 focus:ring-black/20
           dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-white/20"
              required
            />
          </Field>

          <Field label="Description" hint="Optional message for guests">
            <textarea
              name="description"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400
           focus:outline-none focus:ring-2 focus:ring-black/20
           dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-white/20"
              rows={4}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date & time" hint="Local time">
              <input
                name="startTimeLocal"
                type="datetime-local"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400
           focus:outline-none focus:ring-2 focus:ring-black/20
           dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-white/20"
                required
              />
            </Field>

            <Field label="Timezone" hint="Default: Europe/London">
              <input
                name="timezone"
                defaultValue="Europe/London"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400
           focus:outline-none focus:ring-2 focus:ring-black/20
           dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-white/20"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location" hint="Optional">
              <input
                name="location"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400
           focus:outline-none focus:ring-2 focus:ring-black/20
           dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-white/20"
              />
            </Field>

            <Field label="Host name" hint="Optional">
              <input
                name="hostName"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400
           focus:outline-none focus:ring-2 focus:ring-black/20
           dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-white/20"
              />
            </Field>
          </div>

          {err && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create event"}
          </button>

          <p className="text-center text-xs text-gray-500">
            You’ll get a share link and a host-only manage link next.
          </p>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {children}
    </div>
  );
}
