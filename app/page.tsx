import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <section className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">RSVP Events</h1>
        <p className="mt-3 text-gray-600">
          Create an event, share a link, and collect RSVPs — simple and fast.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/create"
            className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white"
          >
            + Create an event
          </Link>

          <p className="text-sm text-gray-500">
            No login for now — built as a learning MVP 🙂
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-2xl">🗓️</div>
          <h2 className="mt-2 font-semibold">Create</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add title, time, location and a note.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-2xl">🔗</div>
          <h2 className="mt-2 font-semibold">Share</h2>
          <p className="mt-1 text-sm text-gray-600">
            Send a short link to friends/family.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-2xl">✅</div>
          <h2 className="mt-2 font-semibold">Track</h2>
          <p className="mt-1 text-sm text-gray-600">
            View responses in a host-only dashboard.
          </p>
        </div>
      </section>
    </main>
  );
}
