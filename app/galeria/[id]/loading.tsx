import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";

export default function GalleryDetailLoading() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <MainHeader />
      <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] rounded-xl bg-zinc-900/80 animate-pulse" />
          <div className="space-y-6">
            <div className="h-8 w-3/4 rounded bg-zinc-800/80 animate-pulse" />
            <div className="h-4 w-full rounded bg-zinc-800/60 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-zinc-800/60 animate-pulse" />
            <div className="flex gap-4 pt-4">
              <div className="h-12 w-32 rounded-full bg-zinc-800/80 animate-pulse" />
              <div className="h-12 w-32 rounded-full bg-zinc-800/80 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
      <MainFooter />
    </main>
  );
}
