import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";

export default function GalleryLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <MainHeader />
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-16 pb-12">
          <div className="h-8 w-48 rounded bg-zinc-800/80 animate-pulse mb-12" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-lg bg-zinc-900/80 animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </div>
      </section>
      <MainFooter />
    </main>
  );
}
