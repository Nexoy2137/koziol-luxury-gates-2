"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/",             label: "Strona główna" },
  { href: "/konfigurator", label: "Konfigurator" },
  { href: "/galeria",      label: "Galeria" },
  { href: "/lokalizacja",  label: "Lokalizacja" },
  { href: "/kontakt",      label: "Kontakt" },
];

export function MainHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(0,0,0,0.92)] backdrop-blur-2xl"
          : "bg-[rgba(0,0,0,0.55)] backdrop-blur-lg"
      }`}
      style={{
        boxShadow: scrolled ? "0 1px 0 rgba(212,175,55,0.12), 0 4px 32px rgba(0,0,0,0.6)" : "none",
      }}
    >
      {/* ── ROW 1: Brand ─────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid rgba(39,39,42,0.7)" }}>
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: 1280, padding: "12px 32px" }}
        >
          {/* Logo + brand text */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
            <Image
              src="/logo.jpg"
              alt="Koziol Luxury Gates"
              width={220}
              height={70}
              priority
              style={{ height: 44, width: "auto", borderRadius: 4, display: "block" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: "0.45em",
                textTransform: "uppercase", color: "#D4AF37", display: "block",
              }}>
                Koziol Luxury Gates
              </span>
              <span style={{
                fontSize: 8, letterSpacing: "0.35em", textTransform: "uppercase",
                color: "#52525b", display: "block",
              }}>
                Bespoke gates &amp; fences
              </span>
            </div>
          </Link>

          {/* Right CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href="/login"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 999,
                border: "1px solid #27272a", color: "#71717a",
                fontSize: 10, fontWeight: 500, letterSpacing: "0.06em",
                textDecoration: "none", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#d4d4d8";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#3f3f46";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#71717a";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#27272a";
              }}
            >
              <Lock size={11} />
              Panel
            </Link>

            <Link
              href="/konfigurator"
              className="group"
              style={{
                position: "relative", overflow: "hidden",
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 20px", borderRadius: 999,
                background: "#D4AF37", color: "#000",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                textDecoration: "none",
                boxShadow: "0 0 22px rgba(212,175,55,0.38)",
                transition: "all 0.25s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "#C9A227";
                el.style.boxShadow = "0 0 42px rgba(212,175,55,0.65)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "#D4AF37";
                el.style.boxShadow = "0 0 22px rgba(212,175,55,0.38)";
              }}
            >
              Konfiguruj bramę
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Navigation — always visible ───────────────────────────────── */}
      <div style={{ background: "rgba(9,9,11,0.5)", borderBottom: "1px solid rgba(39,39,42,0.5)" }}>
        <div
          className="mx-auto"
          style={{ maxWidth: 1280, padding: "0 20px", overflowX: "auto", scrollbarWidth: "none" }}
        >
          <nav style={{ display: "flex", alignItems: "center" }}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    padding: "13px 20px",
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                    color: active ? "#D4AF37" : "#a1a1aa",
                    textDecoration: "none",
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "#a1a1aa";
                  }}
                >
                  {/* Active gold underline */}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      style={{
                        position: "absolute",
                        bottom: 0, left: 12, right: 12,
                        height: 2,
                        borderRadius: 2,
                        background: "#D4AF37",
                        boxShadow: "0 0 12px rgba(212,175,55,1)",
                        display: "block",
                      }}
                      transition={{ type: "spring", bounce: 0.15, duration: 0.38 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
