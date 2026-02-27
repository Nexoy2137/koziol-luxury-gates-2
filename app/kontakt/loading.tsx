import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";

export default function KontaktLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <MainHeader />
      <section className="mx-auto max-w-2xl px-4 py-24 md:px-8">
        <div className="h-10 w-64 rounded bg-zinc-900/80 animate-pulse mb-8" />
        <div className="space-y-4">
          <div className="h-4 w-full rounded bg-zinc-800/60 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-zinc-800/60 animate-pulse" />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="h-24 rounded-xl bg-zinc-900/80 animate-pulse" />
          <div className="h-24 rounded-xl bg-zinc-900/80 animate-pulse" />
        </div>
      </section>
      <MainFooter />
    </main>
  );
}
