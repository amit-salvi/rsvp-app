import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <header className="border-b bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
            <Link href="/" className="text-lg font-semibold">
              RSVP Events
            </Link>
            <Link
              href="/create"
              className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
            >
              + Create Event
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-4xl p-4">{children}</main>

        <footer className="mt-10 border-t bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-4xl p-4 text-sm text-gray-500">
            Built as a learning project · Next.js + Supabase
          </div>
        </footer>
      </body>
    </html>
  );
}