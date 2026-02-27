"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const AdminPanelClient = dynamic(
  () =>
    import("./AdminPanelClient").then((m) => ({
      default: m.AdminPanelClient,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    ),
  }
);

export function AdminDynamic() {
  return <AdminPanelClient />;
}
