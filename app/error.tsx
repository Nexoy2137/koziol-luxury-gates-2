"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#050505] text-white" role="main">
      <MainHeader />
      <section className="mx-auto max-w-xl px-4 py-24 md:px-8 text-center" aria-labelledby="error-title">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 mb-8" aria-hidden>
          <AlertCircle className="h-8 w-8 text-[#D4AF37]" />
        </div>
        <h1 id="error-title" className="text-2xl font-light text-white mb-4">
          Coś poszło nie tak
        </h1>
        <p role="alert" className="text-zinc-400 text-sm mb-8">
          Wystąpił błąd. Możesz spróbować ponownie lub wrócić na stronę główną.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[#D4AF37] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-[#E8C97A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37] focus-visible:outline-offset-2"
          >
            Spróbuj ponownie
          </button>
          <Link
            href="/"
            className="rounded-full border border-zinc-600 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-[#D4AF37]/60 hover:text-[#D4AF37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37] focus-visible:outline-offset-2"
          >
            Strona główna
          </Link>
        </div>
      </section>
      <MainFooter />
    </main>
  );
}
