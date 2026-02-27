import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";

export default function ResetHaslaLoading() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <MainHeader />
      <div className="mx-auto flex max-w-md items-center justify-center px-4 py-24">
        <div className="h-12 w-12 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
      </div>
      <MainFooter />
    </main>
  );
}
