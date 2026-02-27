"use client";

import Link from "next/link";
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
      style={{
        position: "sticky", top: 0, zIndex: 50,
        transition: "background 0.35s, box-shadow 0.35s",
        background: scrolled ? "rgba(0,0,0,0.94)" : "rgba(0,0,0,0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: scrolled
          ? "0 2px 40px rgba(0,0,0,0.8), 0 1px 0 rgba(212,175,55,0.14)"
          : "none",
      }}
    >
      <div style={{ borderBottom: "1px solid rgba(39,39,42,0.65)" }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
          minWidth: 0, overflow: "hidden",
          isolation: "isolate",
        }}
        className="header-row"
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", minWidth: 0, flexShrink: 1, overflow: "hidden" }} className="header-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Kozioł Luxury Gates"
              style={{ height: 56, width: 56, display: "block", borderRadius: 6, flexShrink: 0, objectFit: "contain" }}
              className="header-logo-img"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }} className="header-brand-text">
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                color: "#D4AF37", display: "block", lineHeight: 1.2,
              }}
              className="header-brand-name"
              >
                Kozioł Luxury Gates
              </span>
              <span style={{
                fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase",
                color: "#52525b", display: "block", lineHeight: 1.2,
              }}
              className="header-brand-sub"
              >
                Bespoke gates &amp; fences
              </span>
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }} className="header-cta-panel-wrap">
            <Link href="/login" style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 10px", borderRadius: 999,
              border: "1px solid #27272a", color: "#71717a",
              fontSize: 10, fontWeight: 500, letterSpacing: "0.03em",
              textDecoration: "none", transition: "all 0.2s", whiteSpace: "nowrap",
            }}
              className="header-cta-panel"
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#d4d4d8"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#3f3f46"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#71717a"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#27272a"; }}
            >
              <Lock size={11} />
              Panel
            </Link>

            <Link href="/konfigurator" style={{
              position: "relative", overflow: "hidden",
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "6px 12px", borderRadius: 999,
              background: "#D4AF37", color: "#000",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
              textDecoration: "none", whiteSpace: "nowrap",
              boxShadow: "0 0 22px rgba(212,175,55,0.38)",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
              className="header-cta-konfig"
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#C9A227"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 42px rgba(212,175,55,0.65)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#D4AF37"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 22px rgba(212,175,55,0.38)"; }}
            >
              <span className="header-konfig-text-long">Konfiguruj bramę</span>
              <span className="header-konfig-text-short" style={{ display: "none" }}>Konfiguruj</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      <div style={{
        background: "rgba(9,9,11,0.55)",
        borderBottom: "1px solid rgba(39,39,42,0.5)",
      }}>
        <div className="header-nav-container" style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "0 16px",
        }}>
          <nav className="header-nav" style={{ display: "flex", alignItems: "center" }} aria-label="Główna nawigacja">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`header-nav-link${active ? " header-nav-link-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    padding: "12px 18px",
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    letterSpacing: "0.01em",
                    color: active ? "#D4AF37" : "#a1a1aa",
                    textDecoration: "none",
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "#a1a1aa";
                  }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="nav-indicator"
                      style={{
                        position: "absolute", bottom: 0, left: 12, right: 12,
                        height: 2, borderRadius: 2, background: "#D4AF37",
                        boxShadow: "0 0 10px rgba(212,175,55,0.9)", display: "block",
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
