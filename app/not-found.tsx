import Link from "next/link";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050505] text-white" role="main" aria-labelledby="not-found-title">
      <MainHeader />
      <section className="mx-auto max-w-xl px-4 py-24 md:px-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 mb-8" aria-hidden>
          <FileQuestion className="h-8 w-8 text-[#D4AF37]" />
        </div>
        <h1 id="not-found-title" className="text-2xl font-light text-white mb-4">
          Strona nie istnieje
        </h1>
        <p className="text-zinc-400 text-sm mb-8">
          Adres może być nieprawidłowy lub strona została przeniesiona.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-[#E8C97A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37] focus-visible:outline-offset-2"
        >
          Strona główna
        </Link>
      </section>
      <MainFooter />
    </main>
  );
}
