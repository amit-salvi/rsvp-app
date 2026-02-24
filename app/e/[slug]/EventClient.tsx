"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type EventDto = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    start_time: string;
    timezone: string;
    location: string | null;
    host_name: string | null;
};

export default function EventClient({ slug, manageKey }: { slug: string; manageKey: string }) {
    const [event, setEvent] = useState<EventDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [guestName, setGuestName] = useState("");
    const [status, setStatus] = useState<"YES" | "NO" | "MAYBE">("YES");
    const [note, setNote] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = useMemo(() => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/e/${slug}`;
    }, [slug]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/events/${slug}`);
            const data = await res.json();
            setLoading(false);

            if (!res.ok) {
                setErr(data.error ?? "Event not found");
                return;
            }
            setEvent(data.event);
        })();
    }, [slug]);

    async function submitRsvp(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);

        const res = await fetch(`/api/events/${slug}/rsvp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guestName, status, note }),
        });

        const data = await res.json();
        if (!res.ok) {
            setErr(data.error ?? "Failed to RSVP");
            return;
        }

        setSubmitted(true);
        setGuestName("");
        setNote("");
        setStatus("YES");
    }

    if (loading) return <main className="mx-auto max-w-2xl space-y-6 p-6">Loading...</main>;
    if (err) return <main className="mx-auto max-w-2xl space-y-6 p-6 text-red-600">{err}</main>;
    if (!event) return null;

    return (
        <main className="mx-auto max-w-2xl space-y-6 p-6">
            <h1 className="text-3xl font-bold">{event.title}</h1>

            <p className="mt-2 text-gray-600">
                {new Date(event.start_time).toLocaleString()} ({event.timezone})
            </p>

            {event.location && <p className="mt-1">📍 {event.location}</p>}
            {event.host_name && <p className="mt-1 text-gray-700">Host: {event.host_name}</p>}

            {event.description && <p className="mt-4 whitespace-pre-wrap">{event.description}</p>}

            <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">Share</h2>
                    <button
                        type="button"
                        className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
                        onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                    >
                        {copied ? "Copied!" : "Copy link"}
                    </button>

                </div>
                <p className="mt-2 break-all text-sm text-gray-600">{shareUrl}</p>

                {manageKey && (
                    <p className="mt-3 text-sm">
                        Host link:{" "}
                        <Link className="underline" href={`/e/${slug}/manage?key=${encodeURIComponent(manageKey)}`}>
                            Manage RSVPs
                        </Link>
                    </p>
                )}
            </div>

            <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold">RSVP</h2>

                {submitted && <p className="mt-2 rounded bg-green-50 p-2">Thanks! Your RSVP was submitted.</p>}

                <form className="mt-4 space-y-3" onSubmit={submitRsvp}>
                    <div>
                        <label className="block text-sm font-medium">Your name</label>
                        <input className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400
           focus:outline-none focus:ring-2 focus:ring-black/20
           dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-white/20" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Response</label>
                        <div className="mt-2 flex gap-2">
                            {(["YES", "MAYBE", "NO"] as const).map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setStatus(v)}
                                    className={[
                                        "rounded-full border px-4 py-2 text-sm",
                                        status === v ? "bg-black text-white" : "bg-white hover:bg-gray-50",
                                    ].join(" ")}
                                >
                                    {v === "YES" ? "Yes" : v === "NO" ? "No" : "Maybe"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Note (optional)</label>
                        <textarea className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400
           focus:outline-none focus:ring-2 focus:ring-black/20
           dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-white/20" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>

                    {err && <p className="text-red-600">{err}</p>}
                    <button className="rounded bg-black px-4 py-2 text-white">Submit RSVP</button>
                </form>
            </div>
        </main>
    );
}