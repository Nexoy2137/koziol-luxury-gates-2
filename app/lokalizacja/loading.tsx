import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";

export default function LokalizacjaLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <MainHeader />
      <section className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <div className="h-10 w-56 rounded bg-zinc-900/80 animate-pulse mb-12" />
        <div className="aspect-video rounded-xl bg-zinc-900/80 animate-pulse" />
      </section>
      <MainFooter />
    </main>
  );
}
