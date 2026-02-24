import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">RSVP Events</h1>
      <p className="mt-2 text-gray-600">Create an event, share a link, and collect RSVPs.</p>

      <div className="mt-6">
        <Link className="rounded bg-black px-4 py-2 text-white inline-block" href="/create">
          Create an Event
        </Link>
      </div>
    </main>
  );
}