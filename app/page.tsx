"use client";

import { motion } from "framer-motion";
import { ArrowRight, Box, ShieldCheck, Ruler, Zap } from "lucide-react";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
import { LuxButton } from "@/components/ui/LuxButton";
import { GateReveal } from "@/components/ui/GateReveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";

/* ── Deterministic particles (no SSR mismatch) ───────────────────────────────── */
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: ((i * 13.7 + 5) % 92).toFixed(1),
  top:  ((i * 9.3  + 8) % 85).toFixed(1),
  size: [3, 4, 2.5, 5, 3.5][i % 5],
  dur:  [7, 9, 6, 11, 8][i % 5],
  delay: ((i * 0.55) % 8),
  y: -(90 + (i % 6) * 35),
}));

/* ── Ticker content ──────────────────────────────────────────────────────────── */
const TICKER = [
  "Cynkowanie ogniowe", "Malowanie proszkowe RAL", "Automatyka FAAC & BFT",
  "Stal S355 JR", "15 lat doświadczenia", "Realizacje w całej Polsce",
  "Od projektu do montażu", "Indywidualny projekt", "Smart Gate",
  "Profile zamknięte", "Gwarancja 20 lat", "Showroom Ozorków",
];

const FEATURES = [
  { Icon: Box,         eyebrow: "Materiał",   title: "Konstrukcje stalowe",   desc: "Spawane profile 60×60 do 100×100, przygotowane pod automatykę. Cynkowanie ogniowe jako standard." },
  { Icon: ShieldCheck, eyebrow: "Trwałość",   title: "Ochrona przed korozją", desc: "Cynkowanie ogniowe + malowanie proszkowe RAL. Odporność na polskie warunki przez minimum 20 lat." },
  { Icon: Ruler,       eyebrow: "Precyzja",   title: "Pełne dopasowanie",     desc: "Każdy projekt robimy od zera — rzut działki, wymiary wjazdu i architektura budynku." },
  { Icon: Zap,         eyebrow: "Automatyka", title: "Smart Gate",            desc: "Integracja z domem, aplikacją i domofonikiem IP. Otwarcie głosem, telefonem lub breloczkiem RF." },
];

const PROCESS = [
  { num: "01", title: "Konfiguracja online",  desc: "Wybierz typ, materiał i wymiary. Wstępna wycena w 2 minuty.",            href: "/konfigurator", cta: "Otwórz konfigurator" },
  { num: "02", title: "Projekt i detale",     desc: "Dopracowujemy podział przęseł, wypełnienie i kolorystykę do architektury.", href: "/galeria",     cta: "Zobacz realizacje" },
  { num: "03", title: "Produkcja i montaż",   desc: "Produkcja w Ozorkowie, montaż pod klucz — z automatyką i furtką.",        href: "/kontakt",     cta: "Skontaktuj się" },
];

const STATS = [
  { value: 15,  suffix: "+", label: "Lat doświadczenia" },
  { value: 200, suffix: "+", label: "Realizacji" },
  { value: 100, suffix: "%", label: "Pod klucz" },
];

/* ════════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      <GateReveal />

      <main className="min-h-screen bg-black text-white overflow-x-hidden" style={{ maxWidth: "100vw" }}>
        {/* ─ Real CSS responsive rules (Tailwind responsive broken in this project) ─ */}
        <style>{`
          .hero-cols { display:flex; flex-direction:column; gap:48px; min-width:0; }
          .hero-brand { width:100%; max-width:460px; margin:0 auto; min-width:0; }
          .hero-padding { padding: 48px 16px 56px; max-width:100%; box-sizing:border-box; }
          .about-cols { display:flex; flex-direction:column; gap:48px; }
          .about-side { flex-shrink:0; }
          .stats-grid { display:grid; grid-template-columns:1fr; gap:16px; }
          .features-grid { display:grid; grid-template-columns:1fr; gap:20px; }
          .process-grid { display:grid; grid-template-columns:1fr; gap:20px; }
          .portfolio-cols { display:flex; flex-direction:column; gap:48px; }
          .portfolio-tiles { display:grid; grid-template-columns:1fr; gap:16px; align-items:stretch; }
          .portfolio-tiles .page-card-stat { height:100%; }
          .portfolio-tile-label { min-height: 2.6em; display: flex; align-items: center; justify-content: center; }
          @media(min-width:640px){ .portfolio-tiles { grid-template-columns:repeat(2,1fr); gap:20px; } }
          @media(min-width:768px){
            .stats-grid { grid-template-columns:repeat(3,1fr); }
            .features-grid { grid-template-columns:repeat(2,1fr); }
            .process-grid { grid-template-columns:repeat(3,1fr); }
            .portfolio-tiles { grid-template-columns:repeat(3,1fr); }
          }
          @media(min-width:768px){ .hero-padding { padding: 72px 32px 80px; } }
          @media(min-width:1024px){
            .hero-cols { flex-direction:row; align-items:center; gap:80px; }
            .hero-brand { width:420px; margin:0; }
            .hero-padding { padding: 96px 32px; }
            .about-cols { flex-direction:row; align-items:flex-start; gap:80px; }
            .about-side { width:288px; position:sticky; top:112px; }
            .features-grid { grid-template-columns:repeat(4,1fr); }
            .portfolio-cols { flex-direction:row; align-items:center; justify-content:space-between; }
          }
          .cta-finale-inner { max-width: min(48rem, 100%); padding: 20px 20px 24px; box-sizing: border-box; }
          .cta-finale-buttons { margin-top: 36px; display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; width: 100%; padding: 0 4px; }
          .cta-finale-buttons a { min-width: 0; flex: 1 1 auto; max-width: 100%; }
          @media (min-width: 768px) { .cta-finale-buttons a { flex: 0 0 auto; } }
          @media (max-width: 480px) {
            .cta-finale-buttons { flex-direction: column; width: 100%; }
            .cta-finale-buttons a { width: 100%; justify-content: center; }
          }
          .portfolio-section-inner { position: relative; max-width: 1280px; margin: 0 auto; padding: 48px 16px; box-sizing: border-box; }
          @media (min-width: 640px) { .portfolio-section-inner { padding: 64px 24px; } }
          @media (min-width: 768px) { .portfolio-section-inner { padding: 96px 32px; } }
          .about-section-inner { position: relative; max-width: 1280px; margin: 0 auto; padding: 48px 16px; box-sizing: border-box; }
          @media (min-width: 640px) { .about-section-inner { padding: 64px 24px; } }
          @media (min-width: 768px) { .about-section-inner { padding: 96px 32px; } }
          @media (min-width: 640px) { .cta-finale-inner { padding: 28px 24px 28px; } }
          @media (min-width: 768px) { .cta-finale-inner { padding: 28px 24px 36px; } }
          @media (min-width: 768px) { .cta-finale-buttons { gap: 24px; } }
          .cta-finale-eyebrow { margin-bottom: 6px !important; }
          .cta-finale-heading { font-size: clamp(2rem, 5.5vw, 4rem) !important; }
          .tech-section-inner { padding: 48px 16px !important; }
          .tech-section-header { gap: 12px !important; }
          .tech-section-eyebrow { margin-bottom: 6px !important; }
          .tech-section-grid { margin-top: 24px !important; }
          .process-section-inner { padding: 48px 16px !important; }
          .process-section-eyebrow { margin-bottom: 6px !important; }
          .process-section-grid { margin-top: 24px !important; }
          @media (min-width: 640px) {
            .tech-section-inner { padding: 64px 24px !important; }
            .tech-section-header { gap: 18px !important; }
            .tech-section-eyebrow { margin-bottom: 12px !important; }
            .tech-section-grid { margin-top: 36px !important; }
            .process-section-inner { padding: 64px 24px !important; }
            .process-section-eyebrow { margin-bottom: 12px !important; }
            .process-section-grid { margin-top: 36px !important; }
          }
          @media (min-width: 768px) {
            .tech-section-inner { padding: 96px 32px !important; }
            .tech-section-header { gap: 24px !important; }
            .tech-section-eyebrow { margin-bottom: 12px !important; }
            .tech-section-grid { margin-top: 48px !important; }
            .process-section-inner { padding: 96px 32px !important; }
            .process-section-eyebrow { margin-bottom: 12px !important; }
            .process-section-grid { margin-top: 48px !important; }
          }
        `}</style>
        <MainHeader />

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* HERO                                                                  */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-b border-zinc-800">

          {/* Floating gold particles ─ USE absolute with explicit left/top so framer
              motion only controls Y and opacity (no transform conflict) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-[#D4AF37]"
                style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
                animate={{ y: [0, p.y, 0], opacity: [0, 0.75, 0] }}
                transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>

          {/* Rotating golden rings — CRITICAL: use separate wrapper for centering
              so framer-motion rotate doesn't conflict with translate classes */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
            {/* Outer ring */}
            <motion.div
              style={{ width: "min(130vw, 130vh)", height: "min(130vw, 130vh)", flexShrink: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full opacity-[0.07]">
                <circle cx="100" cy="100" r="90" stroke="#D4AF37" strokeWidth="0.4" />
                <circle cx="100" cy="100" r="86" stroke="#D4AF37" strokeWidth="0.15" strokeDasharray="3 6" />
                {Array.from({ length: 36 }, (_, i) => {
                  const a = (i * 10 * Math.PI) / 180;
                  return (
                    <line key={i}
                      x1={100 + 88 * Math.cos(a)} y1={100 + 88 * Math.sin(a)}
                      x2={100 + 93 * Math.cos(a)} y2={100 + 93 * Math.sin(a)}
                      stroke="#D4AF37" strokeWidth={i % 3 === 0 ? "0.6" : "0.25"}
                    />
                  );
                })}
              </svg>
            </motion.div>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
            {/* Inner ring — counter-rotate */}
            <motion.div
              style={{ width: "min(70vw, 70vh)", height: "min(70vw, 70vh)", flexShrink: 0 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full opacity-[0.055]">
                <circle cx="100" cy="100" r="88" stroke="#D4AF37" strokeWidth="0.3" strokeDasharray="1 5" />
                <circle cx="100" cy="100" r="70" stroke="#D4AF37" strokeWidth="0.25" />
                <circle cx="100" cy="100" r="52" stroke="#D4AF37" strokeWidth="0.2" strokeDasharray="2 4" />
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i * 30 * Math.PI) / 180;
                  return (
                    <line key={i}
                      x1={100 + 52 * Math.cos(a)} y1={100 + 52 * Math.sin(a)}
                      x2={100 + 88 * Math.cos(a)} y2={100 + 88 * Math.sin(a)}
                      stroke="#D4AF37" strokeWidth="0.2"
                    />
                  );
                })}
              </svg>
            </motion.div>
          </div>

          {/* Breathing orb — FIX: outer div positions it, inner motion.div animates
              scale only, so the positioning transform is never overwritten */}
          <div className="pointer-events-none absolute inset-x-0 top-[-10%] flex justify-center" aria-hidden="true">
            <motion.div
              style={{
                width: "80vw", height: "80vw", maxWidth: "900px", maxHeight: "900px", flexShrink: 0,
                background: "radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(133,102,47,0.12) 35%, transparent 70%)",
                borderRadius: "50%",
              }}
              animate={{ scale: [1, 1.18, 1], opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Content */}
          <div className="hero-padding" style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
            <div className="hero-cols">

              {/* Text column */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 28 }}>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-[10px] font-semibold uppercase tracking-[0.6em] text-[#D4AF37]"
                >
                  Producent ekskluzywnych bram · Ozorków · Est. 2009
                </motion.p>

                <h1 className="font-display text-[clamp(3rem,7vw,6rem)] font-normal italic leading-[1.04] tracking-tight">
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.75, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    Twoja brama
                  </motion.span>
                  <br />
                  <motion.span
                    className="inline-block text-gold-gradient not-italic"
                    initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.75, delay: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    to pierwsze
                  </motion.span>
                  <br />
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.75, delay: 0.34, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    wrażenie.
                  </motion.span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.7 }}
                  className="hero-paragraph max-w-lg text-[16px] font-light leading-relaxed text-zinc-400"
                >
                  Projektujemy i realizujemy ekskluzywne bramy, furtki i ogrodzenia dla wymagających
                  inwestorów. Precyzja, trwała stal, minimalistyczny design — od projektu do montażu.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.85 }}
                  style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}
                >
                  <LuxButton href="/konfigurator" variant="gold" size="lg">
                    Otwórz konfigurator
                    <ArrowRight className="h-4 w-4" />
                  </LuxButton>
                  <LuxButton href="/galeria" variant="outline" size="lg">
                    Zobacz realizacje
                  </LuxButton>
                </motion.div>

                {/* Stats — direct values (no CountUp flash bug) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  style={{
                    display: "flex", flexWrap: "wrap",
                    gap: "20px 40px",
                    borderTop: "1px solid rgba(63,63,70,0.7)",
                    paddingTop: 28,
                    marginTop: 8,
                  }}
                >
                  {STATS.map((s) => (
                    <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <span style={{
                        fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                        fontSize: "2.4rem", fontWeight: 700, lineHeight: 1,
                        background: "linear-gradient(135deg,#C9A227,#E8C97A,#D4AF37,#B8961F)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}>
                        {s.value}{s.suffix}
                      </span>
                      <span style={{ fontSize: 10, letterSpacing: "0.38em", textTransform: "uppercase", color: "#71717a" }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Brand card — right column */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="hero-brand" style={{ flexShrink: 0 }}
              >
                <TiltCard intensity={7} className="h-full">
                  {/* Beam wrapper via inline padding trick */}
                  <div className="beam-wrapper">
                    <div className="beam-inner rounded-2xl" style={{ padding: "36px 32px", display: "flex", flexDirection: "column", gap: 22 }}>

                      {/* Inner glow */}
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: 16, pointerEvents: "none",
                        background: "radial-gradient(ellipse 75% 55% at 50% 20%, rgba(133,102,47,0.20) 0%, transparent 65%)",
                      }} />

                      {/* Logo */}
                      <div style={{
                        position: "relative", width: "100%",
                        padding: "24px 22px",
                        border: "1px solid rgba(63,63,70,0.6)",
                        borderRadius: 14,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex", justifyContent: "center", alignItems: "center",
                        overflow: "hidden",
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.svg" alt="Koziol Luxury Gates" style={{ height: 210, width: 210, display: "block", objectFit: "contain" }} />
                      </div>

                      {/* Gold divider */}
                      <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(212,175,55,0.5), transparent)" }} />

                      {/* Info grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                          { label: "Siedziba",      value: "Ozorków" },
                          { label: "Rok założenia", value: "2009" },
                          { label: "Zasięg",        value: "Cała Polska" },
                          { label: "Gwarancja",     value: "20 lat" },
                        ].map((item) => (
                          <div key={item.label} style={{
                            padding: "16px 18px",
                            border: "1px solid rgba(63,63,70,0.5)",
                            borderRadius: 12,
                            background: "rgba(9,9,11,0.7)",
                            display: "flex", flexDirection: "column", gap: 6,
                          }}>
                            <span style={{ fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase", color: "#52525b" }}>
                              {item.label}
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#e4e4e7" }}>
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA link */}
                      <LuxButton href="/kontakt" variant="outline" size="lg">
                        Umów spotkanie w showroomie
                        <ArrowRight size={14} />
                      </LuxButton>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ TICKER ═════════════════════════════════════════════════════════════ */}
        <div className="ticker-section" style={{ overflow: "hidden", borderBottom: "1px solid #27272a", background: "rgba(9,9,11,0.8)", padding: "14px 0" }}>
          {/* Desktop: marquee | Mobile: flex-wrap grid */}
          <div className="ticker-desktop marquee-track" style={{ display: "flex", gap: 48, whiteSpace: "nowrap" }}>
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={`d-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4AF37", flexShrink: 0, display: "block" }} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a1a1aa" }}>
                  {item}
                </span>
              </span>
            ))}
          </div>
          <div className="ticker-mobile" style={{ display: "none", flexWrap: "wrap", gap: "12px 20px", justifyContent: "center", padding: "0 16px" }}>
            {TICKER.map((item, i) => (
              <span key={`m-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#D4AF37", flexShrink: 0, display: "block" }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa" }}>
                  {item}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* ══ O NAS ══════════════════════════════════════════════════════════════ */}
        <section className="relative border-b border-zinc-800 bg-[#030303] grid-overlay">
          <div className="pointer-events-none absolute inset-0 gold-glow-left" />

          <div className="about-section-inner">
            <div className="about-cols">

              {/* Sticky label */}
              <ScrollReveal className="about-side">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">O nas</p>
                <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.2rem)] font-normal italic leading-tight tracking-tight">
                  Rzemiosło, precyzja i stal.
                </h2>
                <div className="mt-6 gold-line w-24" />
                <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">
                  Realizujemy bramy od pomysłu do montażu. Wszystko we własnym zakładzie w Ozorkowie.
                </p>
                <div style={{ marginTop: 28 }}>
                  <LuxButton href="/galeria" variant="outline">
                    Przeglądaj portfolio
                    <ArrowRight className="h-4 w-4" />
                  </LuxButton>
                </div>
              </ScrollReveal>

              {/* Cards */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                <ScrollReveal delay={0.1}>
                  <div className="page-card page-card-accent" style={{ padding: "36px 32px" }}>
                    <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.4em] text-[#D4AF37]/80">Nasza filozofia</p>
                    <p className="text-[17px] font-light leading-relaxed text-zinc-200">
                      Koziol Luxury Gates to pracownia, gdzie każdy projekt startuje od zrozumienia architektury
                      budynku i oczekiwań inwestora. Dobieramy wypełnienie, podział przęseł, kolorystykę i
                      automatykę tak, aby brama przez lata była wizytówką nieruchomości.
                    </p>
                  </div>
                </ScrollReveal>

                <div className="stats-grid">
                  {STATS.map((s) => (
                    <TiltCard key={s.label} intensity={9}>
                      <div className="page-card-stat" style={{
                        display: "flex", flexDirection: "column", gap: 14,
                        padding: "32px 28px",
                      }}>
                        <span style={{
                          fontFamily: "var(--font-playfair, Georgia, serif)",
                          fontSize: "3.5rem", fontWeight: 700, lineHeight: 1,
                          background: "linear-gradient(135deg,#C9A227,#E8C97A,#D4AF37,#B8961F)",
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>
                          {s.value}{s.suffix}
                        </span>
                        <span style={{ fontSize: 10, letterSpacing: "0.38em", textTransform: "uppercase", color: "#71717a" }}>
                          {s.label}
                        </span>
                      </div>
                    </TiltCard>
                  ))}
                </div>

                <ScrollReveal delay={0.2}>
                  <div className="page-card page-card-accent" style={{ padding: "36px 32px" }}>
                    <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.4em] text-[#D4AF37]/80">Materiały i technologia</p>
                    <p className="text-[15px] leading-relaxed text-zinc-400">
                      Cynkowanie ogniowe, malowanie proszkowe RAL, profile zamknięte 60×60 do 100×100. Każde
                      ogrodzenie systemowe dobieramy pod projekt bramy, aby całość tworzyła jednolitą całość.
                      Montaż z automatyką FAAC lub BFT, integracja z domofonem i aplikacją mobilną.
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CECHY TECHNICZNE ═══════════════════════════════════════════════════ */}
        <section className="relative border-b border-zinc-800">
          {/* Central strong glow */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(133,102,47,0.16) 0%, transparent 60%)" }}
          />

          <div className="tech-section-inner" style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
            <ScrollReveal>
              <div className="tech-section-header" style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <p className="tech-section-eyebrow text-[10px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">Technologia</p>
                  <h2 className="font-display" style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.15 }}>
                    Wyróżnia nas każdy detal.
                  </h2>
                </div>
                <p style={{ maxWidth: 320, fontSize: 15, lineHeight: 1.7, color: "#71717a" }}>
                  Od doboru stali po automatykę — nasze standardy wykraczają poza produkcję seryjną.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="features-grid tech-section-grid" style={{ marginTop: 48 }} staggerDelay={0.09}>
              {FEATURES.map(({ Icon, eyebrow, title, desc }) => (
                <StaggerItem key={title}>
                  <TiltCard intensity={9} className="h-full">
                    <div className="beam-wrapper h-full">
                      <div className="beam-inner flex h-full flex-col gap-5 rounded-2xl" style={{ padding: "36px 32px" }}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-black/80">
                          <Icon className="h-6 w-6 text-[#D4AF37]" />
                        </div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#D4AF37]/70">{eyebrow}</p>
                        <h3 className="text-[15px] font-semibold leading-snug text-white">{title}</h3>
                        <p className="text-[13px] leading-relaxed text-zinc-400">{desc}</p>
                      </div>
                    </div>
                  </TiltCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ══ PROCES ═════════════════════════════════════════════════════════════ */}
        <section className="relative border-b border-zinc-800 bg-[#030303] grid-overlay">
          <div className="process-section-inner" style={{ maxWidth: 1280, margin: "0 auto" }}>
            <ScrollReveal>
              <p className="process-section-eyebrow text-[10px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">Jak działamy</p>
              <h2 className="font-display max-w-xl text-[clamp(2.2rem,4.5vw,3.2rem)] font-normal italic leading-tight">
                Od konfiguracji do montażu — bez kompromisów.
              </h2>
            </ScrollReveal>

            <div className="process-grid process-section-grid" style={{ marginTop: 48 }}>
              {PROCESS.map((step, i) => (
                <ScrollReveal key={step.num} delay={i * 0.13}>
                  <TiltCard intensity={7} className="h-full">
                    <div className="page-card group flex h-full flex-col gap-5 transition-all duration-300" style={{ padding: "36px 32px" }}>
                      <span className="font-display text-[4.5rem] font-normal leading-none text-[#D4AF37]/25 transition-colors duration-300 group-hover:text-[#D4AF37]/45">
                        {step.num}
                      </span>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-[15px] font-semibold text-white">{step.title}</h3>
                        <p className="text-[13px] leading-relaxed text-zinc-400">{step.desc}</p>
                      </div>
                      <div className="mt-auto pt-2">
                        <LuxButton href={step.href} variant="outline" size="md">
                          {step.cta}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </LuxButton>
                      </div>
                    </div>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PORTFOLIO ══════════════════════════════════════════════════════════ */}
        <section className="relative border-b border-zinc-800 overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(133,102,47,0.12) 0%, transparent 65%)" }}
          />

          <div className="portfolio-section-inner">
            <div className="portfolio-cols">
              {/* Left: heading + text + buttons */}
              <ScrollReveal style={{ maxWidth: 560 }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.5em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 16 }}>Portfolio</p>
                <h2 className="font-display" style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.15, marginBottom: 20 }}>
                  Każda brama, inna historia.
                </h2>
                <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: "#a1a1aa", marginBottom: 36 }}>
                  Bramy przesuwne, skrzydłowe, samonośne. Każdy projekt indywidualny,
                  każde wykończenie dobrane do architektury budynku.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <LuxButton href="/galeria" variant="gold" size="lg">
                    Przeglądaj portfolio
                    <ArrowRight className="h-4 w-4" />
                  </LuxButton>
                  <LuxButton href="/konfigurator" variant="outline" size="lg">
                    Konfigurator
                  </LuxButton>
                </div>
              </ScrollReveal>

              {/* Right: 3 stat tiles */}
              <ScrollReveal delay={0.15} style={{ width: "100%", maxWidth: 480 }}>
                <div className="portfolio-tiles">
                  {[
                    { num: "80+", label: "Bramy przesuwne" },
                    { num: "70+", label: "Bramy skrzydłowe" },
                    { num: "50+", label: "Bramy + furtki" },
                  ].map((item) => (
                    <TiltCard key={item.label} intensity={8} className="h-full">
                      <div className="page-card-stat" style={{
                        display: "flex", flexDirection: "column", gap: 12,
                        padding: "32px 28px", textAlign: "center",
                      }}>
                        <span style={{
                          fontFamily: "var(--font-playfair, Georgia, serif)",
                          fontSize: "2.6rem", fontWeight: 700, lineHeight: 1,
                          background: "linear-gradient(135deg,#C9A227,#E8C97A,#D4AF37)",
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>
                          {item.num}
                        </span>
                        <span className="portfolio-tile-label" style={{ fontSize: 11, color: "#71717a", lineHeight: 1.4 }}>{item.label}</span>
                      </div>
                    </TiltCard>
                  ))}
                </div>
                <p style={{ marginTop: 16, fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#52525b", textAlign: "center" }}>
                  Realizacje w całej Polsce
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ══ CTA FINALE ═════════════════════════════════════════════════════════ */}
        <section className="relative overflow-x-hidden border-b border-zinc-800 bg-[#030303] grid-overlay">
          {/* Big central burst */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 100% 90% at 50% 50%, rgba(133,102,47,0.22) 0%, transparent 60%)" }}
          />

          <div className="relative mx-auto flex flex-col items-center text-center w-full cta-finale-inner">
            <ScrollReveal>
              <p className="cta-finale-eyebrow text-[10px] font-semibold uppercase tracking-[0.6em] text-[#D4AF37]">
                Zacznij tutaj
              </p>
              <h2 className="cta-finale-heading font-display font-normal italic leading-tight tracking-tight text-white">
                Każda brama jest wyjątkowa.
                <br />
                Twoja też będzie.
              </h2>
              <p className="mx-auto mt-7 max-w-lg text-[16px] font-light leading-relaxed text-zinc-400">
                Skonfiguruj swoją bramę online i otrzymaj wstępną wycenę. Bezpłatna
                konsultacja — od razu, bez wychodzenia z domu.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.18}>
              <div className="cta-finale-buttons">
                <LuxButton href="/konfigurator" variant="gold" size="lg">
                  Otwórz konfigurator
                  <ArrowRight className="h-4 w-4" />
                </LuxButton>
                <LuxButton href="/kontakt" variant="outline" size="lg">
                  Skontaktuj się z nami
                </LuxButton>
              </div>
            </ScrollReveal>

          </div>
        </section>

        <MainFooter />
      </main>
    </>
  );
}
