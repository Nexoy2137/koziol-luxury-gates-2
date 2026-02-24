"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Strona główna" },
  { href: "/konfigurator", label: "Konfigurator" },
  { href: "/galeria", label: "Galeria" },
  { href: "/lokalizacja", label: "Lokalizacja" },
  { href: "/kontakt", label: "Kontakt" },
];

export function MainHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8 md:py-5">
        <Link href="/" className="flex items-center gap-4">
          <div className="flex items-center justify-center overflow-hidden rounded-sm border border-[#D4AF37]/40 bg-black/60 px-4 py-2 md:px-5 md:py-3">
            <Image
              src="/logo.svg"
              alt="Koziol Luxury Gates"
              width={300}
              height={48}
              className="h-8 w-auto md:h-10"
            />
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
              Koziol Luxury Gates
            </span>
            <span className="text-[9px] uppercase tracking-[0.35em] text-zinc-500">
              Bespoke gates & fences
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-[9px] font-medium uppercase tracking-[0.28em] text-zinc-400 md:gap-6 md:text-[10px]">
          {navItems
            .filter((item) => !(pathname === "/" && item.href === "/"))
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-[#D4AF37]"
              >
                {item.label}
              </Link>
            ))}
        </nav>

        <Link
          href="/login"
          className="group flex items-center gap-2 rounded-full border border-zinc-800 bg-black/60 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-zinc-500 transition-all hover:border-[#D4AF37]/70 hover:text-[#D4AF37]"
        >
          <Lock className="h-3 w-3 text-zinc-600 group-hover:text-[#D4AF37]" />
          <span>Panel admin</span>
        </Link>
      </div>
    </header>
  );
}

