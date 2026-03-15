import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm space-y-8 text-center">
        <Image
          src="/λαζοσ-removebg-preview.png"
          alt="Λάζος - Λιθοδομικές Εργασίες"
          width={320}
          height={128}
          className="mx-auto h-36 w-auto object-contain sm:h-44"
          priority
        />

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
