import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
import { KonfiguratorPageClient } from "./KonfiguratorClient";

function KonfiguratorFallback() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <MainHeader />
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24 md:px-8">
        <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
      </div>
      <MainFooter />
    </main>
  );
}

export default function KonfiguratorPage() {
  return (
    <Suspense fallback={<KonfiguratorFallback />}>
      <KonfiguratorPageClient />
    </Suspense>
  );
}