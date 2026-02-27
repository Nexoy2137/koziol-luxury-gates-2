"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";

const KonfiguratorPageClient = dynamic(
  () =>
    import("./KonfiguratorClient").then((m) => ({
      default: m.KonfiguratorPageClient,
    })),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-screen bg-[#050505] text-white">
        <MainHeader />
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24 md:px-8">
          <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
        </div>
        <MainFooter />
      </main>
    ),
  }
);

export function KonfiguratorDynamic() {
  return <KonfiguratorPageClient />;
}
