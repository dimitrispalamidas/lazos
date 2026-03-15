import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
          </svg>
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Λάζος
          </h1>
          <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
            Διαχείριση Έργων Τοιχοποιίας
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          Σύνδεση
        </Link>
      </div>
    </div>
  );
}
