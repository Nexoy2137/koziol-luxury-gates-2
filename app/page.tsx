"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Box, ShieldCheck, Ruler, Zap } from "lucide-react";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
import { LuxButton } from "@/components/ui/LuxButton";
import { GateReveal } from "@/components/ui/GateReveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { CountUp } from "@/components/ui/CountUp";
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

      <main className="min-h-screen bg-black text-white">
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
          <div className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32 lg:py-36">
            <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:gap-16 xl:gap-24">

              {/* Text column */}
              <div className="flex min-w-0 flex-1 flex-col gap-7">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-[10px] font-semibold uppercase tracking-[0.6em] text-[#D4AF37]"
                >
                  Producent ekskluzywnych bram · Ozorków · Est. 2009
                </motion.p>

                <h1 className="font-display text-[clamp(3rem,7vw,6rem)] font-normal italic leading-[1.04] tracking-tight">
                  {[
                    { t: "Twoja ",     c: "" },
                    { t: "brama",      c: "" },
                    { t: "\nto ",      c: "text-gold-gradient not-italic" },
                    { t: "pierwsze",   c: "text-gold-gradient not-italic" },
                    { t: "\nwrażenie.", c: "" },
                  ].map((w, i) => (
                    <motion.span key={i}
                      className={`inline-block whitespace-pre-wrap ${w.c}`}
                      initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.75, delay: 0.1 + i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      {w.t}
                    </motion.span>
                  ))}
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.7 }}
                  className="max-w-lg text-[16px] font-light leading-relaxed text-zinc-400"
                >
                  Projektujemy i realizujemy ekskluzywne bramy, furtki i ogrodzenia dla wymagających
                  inwestorów. Precyzja, trwała stal, minimalistyczny design — od projektu do montażu.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.85 }}
                  className="flex flex-wrap items-center gap-4"
                >
                  <LuxButton href="/konfigurator" variant="gold" size="lg">
                    Otwórz konfigurator
                    <ArrowRight className="h-4 w-4" />
                  </LuxButton>
                  <LuxButton href="/galeria" variant="outline" size="lg">
                    Zobacz realizacje
                  </LuxButton>
                </motion.div>

                {/* Animated counters */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 1.05 }}
                  className="flex flex-wrap gap-x-12 gap-y-5 border-t border-zinc-800 pt-7"
                >
                  {STATS.map((s) => (
                    <div key={s.label} className="flex flex-col gap-2">
                      <span className="font-display text-[2.4rem] font-semibold leading-none text-gold-gradient">
                        <CountUp to={s.value} suffix={s.suffix} />
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">{s.label}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Brand card — right column */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full flex-shrink-0 lg:w-[380px] xl:w-[420px]"
              >
                <TiltCard intensity={7}>
                  <div className="beam-wrapper">
                    <div className="beam-inner relative flex flex-col items-center gap-7 rounded-2xl p-10">
                      {/* Inner ambient glow */}
                      <div className="pointer-events-none absolute inset-0 rounded-2xl"
                        style={{ background: "radial-gradient(ellipse 75% 60% at 50% 20%, rgba(133,102,47,0.22) 0%, transparent 65%)" }}
                      />

                      {/* Logo — clearly visible at proper size */}
                      <div className="relative w-full rounded-xl border border-zinc-700 bg-black/50 px-6 py-7">
                        <Image
                          src="/logo.jpg"
                          alt="Koziol Luxury Gates"
                          width={360}
                          height={120}
                          className="relative w-full object-contain"
                          priority
                        />
                      </div>

                      <div className="gold-line w-full" />

                      {/* Info grid */}
                      <div className="grid w-full grid-cols-2 gap-2">
                        {[
                          { label: "Siedziba",      value: "Ozorków" },
                          { label: "Rok założenia", value: "2009" },
                          { label: "Zasięg",        value: "Cała Polska" },
                          { label: "Gwarancja",     value: "20 lat" },
                        ].map((item) => (
                          <div key={item.label} className="flex flex-col gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                            <span className="text-[9px] uppercase tracking-[0.38em] text-zinc-600">{item.label}</span>
                            <span className="text-[13px] font-medium text-zinc-200">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      <Link href="/kontakt"
                        className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/50 px-5 py-3.5 text-[11px] font-medium text-zinc-400 transition-all hover:border-[#D4AF37]/55 hover:text-[#D4AF37]"
                      >
                        Umów spotkanie w showroomie
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ TICKER ═════════════════════════════════════════════════════════════ */}
        <div className="overflow-hidden border-b border-zinc-800 bg-zinc-950/70 py-4">
          <div className="marquee-track flex gap-12 whitespace-nowrap">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-400">
                <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-[#D4AF37]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ══ O NAS ══════════════════════════════════════════════════════════════ */}
        <section className="relative border-b border-zinc-800 bg-[#030303] grid-overlay">
          <div className="pointer-events-none absolute inset-0 gold-glow-left" />

          <div className="relative mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-32">
            <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:gap-24">

              {/* Sticky label */}
              <ScrollReveal className="lg:sticky lg:top-28 lg:w-72 lg:flex-shrink-0">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">O nas</p>
                <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.2rem)] font-normal italic leading-tight tracking-tight">
                  Rzemiosło, precyzja i stal.
                </h2>
                <div className="mt-6 gold-line w-24" />
                <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">
                  Realizujemy bramy od pomysłu do montażu. Wszystko we własnym zakładzie w Ozorkowie.
                </p>
                <div className="mt-8">
                  <LuxButton href="/galeria" variant="outline">
                    Przeglądaj portfolio
                    <ArrowRight className="h-4 w-4" />
                  </LuxButton>
                </div>
              </ScrollReveal>

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-5">
                <ScrollReveal delay={0.1}>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-9">
                    <p className="mb-5 text-[9px] uppercase tracking-[0.38em] text-zinc-500">Nasza filozofia</p>
                    <p className="text-[17px] font-light leading-relaxed text-zinc-200">
                      Koziol Luxury Gates to pracownia, gdzie każdy projekt startuje od zrozumienia architektury
                      budynku i oczekiwań inwestora. Dobieramy wypełnienie, podział przęseł, kolorystykę i
                      automatykę tak, aby brama przez lata była wizytówką nieruchomości.
                    </p>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {STATS.map((s, i) => (
                    <ScrollReveal key={s.label} delay={0.1 * (i + 1)}>
                      <TiltCard intensity={9}>
                        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-7 transition-colors hover:border-[#D4AF37]/40">
                          <span className="font-display text-6xl font-semibold leading-none text-gold-gradient">
                            <CountUp to={s.value} suffix={s.suffix} />
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.38em] text-zinc-500">{s.label}</span>
                        </div>
                      </TiltCard>
                    </ScrollReveal>
                  ))}
                </div>

                <ScrollReveal delay={0.2}>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-9">
                    <p className="mb-5 text-[9px] uppercase tracking-[0.38em] text-zinc-500">Materiały i technologia</p>
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

          <div className="relative mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-32">
            <ScrollReveal>
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">Technologia</p>
                  <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.2rem)] font-normal italic leading-tight">
                    Wyróżnia nas każdy detal.
                  </h2>
                </div>
                <p className="max-w-sm text-[15px] leading-relaxed text-zinc-500">
                  Od doboru stali po automatykę — nasze standardy wykraczają poza produkcję seryjną.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.09}>
              {FEATURES.map(({ Icon, eyebrow, title, desc }) => (
                <StaggerItem key={title}>
                  <TiltCard intensity={9} className="h-full">
                    <div className="beam-wrapper h-full">
                      <div className="beam-inner flex h-full flex-col gap-6 rounded-2xl p-8">
                        <div className="flex h-13 w-13 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-black">
                          <Icon className="h-6 w-6 text-[#D4AF37]" />
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.38em] text-zinc-600">{eyebrow}</p>
                        <h3 className="text-[14px] font-semibold leading-snug text-white">{title}</h3>
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
          <div className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-32">
            <ScrollReveal>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">Jak działamy</p>
              <h2 className="font-display max-w-xl text-[clamp(2.2rem,4.5vw,3.2rem)] font-normal italic leading-tight">
                Od konfiguracji do montażu — bez kompromisów.
              </h2>
            </ScrollReveal>

            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {PROCESS.map((step, i) => (
                <ScrollReveal key={step.num} delay={i * 0.13}>
                  <TiltCard intensity={7} className="h-full">
                    <div className="group flex h-full flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-9 transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-gold">
                      <span className="font-display text-[5.5rem] font-normal leading-none text-[#D4AF37]/20 transition-colors duration-300 group-hover:text-[#D4AF37]/50">
                        {step.num}
                      </span>
                      <div className="flex flex-col gap-3">
                        <h3 className="text-[15px] font-semibold text-white">{step.title}</h3>
                        <p className="text-[13px] leading-relaxed text-zinc-400">{step.desc}</p>
                      </div>
                      <Link href={step.href}
                        className="mt-auto flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-zinc-600 transition-colors group-hover:text-[#D4AF37]"
                      >
                        {step.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PORTFOLIO ══════════════════════════════════════════════════════════ */}
        <section className="relative border-b border-zinc-800">
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(133,102,47,0.12) 0%, transparent 65%)" }}
          />

          <div className="relative mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-32">
            <div className="flex flex-col gap-14 md:flex-row md:items-center md:justify-between">
              <ScrollReveal className="md:max-w-xl">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">Portfolio</p>
                <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.2rem)] font-normal italic leading-tight">
                  Każda brama,<br className="hidden sm:block" /> inna historia.
                </h2>
                <p className="mt-5 text-[16px] font-light leading-relaxed text-zinc-400">
                  Bramy przesuwne, skrzydłowe, samonośne. Każdy projekt indywidualny, każde
                  wykończenie dobrane do architektury budynku.
                </p>
                <div className="mt-9 flex flex-wrap gap-4">
                  <LuxButton href="/galeria" variant="gold" size="lg">
                    Przeglądaj portfolio
                    <ArrowRight className="h-4 w-4" />
                  </LuxButton>
                  <LuxButton href="/konfigurator" variant="outline" size="lg">
                    Konfigurator
                  </LuxButton>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <div className="beam-wrapper w-full md:w-80">
                  <div className="beam-inner rounded-2xl p-9">
                    <div className="space-y-5">
                      {[
                        { label: "Bramy przesuwne",   to: 80 },
                        { label: "Bramy skrzydłowe",  to: 70 },
                        { label: "Bramy + furtki",    to: 50 },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between border-b border-zinc-800 pb-5 last:border-0 last:pb-0">
                          <span className="text-[14px] text-zinc-400">{row.label}</span>
                          <span className="font-display text-2xl font-semibold text-gold-gradient">
                            <CountUp to={row.to} suffix="+" />
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-7 text-[9px] uppercase tracking-[0.4em] text-zinc-600">Realizacje w całej Polsce</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ══ CTA FINALE ═════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-b border-zinc-800 bg-[#030303] grid-overlay">
          {/* Big central burst */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 100% 90% at 50% 50%, rgba(133,102,47,0.22) 0%, transparent 60%)" }}
          />

          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 py-36 text-center md:px-8 md:py-44">
            <ScrollReveal>
              <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.6em] text-[#D4AF37]">
                Zacznij tutaj
              </p>
              <h2 className="font-display text-[clamp(2.4rem,7vw,5rem)] font-normal italic leading-tight tracking-tight">
                Każda brama jest wyjątkowa.
                <br />
                <span className="text-zinc-500">Twoja też będzie.</span>
              </h2>
              <p className="mx-auto mt-7 max-w-lg text-[16px] font-light leading-relaxed text-zinc-400">
                Skonfiguruj swoją bramę online i otrzymaj wstępną wycenę. Bezpłatna
                konsultacja — od razu, bez wychodzenia z domu.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.18} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <LuxButton href="/konfigurator" variant="gold" size="lg">
                Otwórz konfigurator
                <ArrowRight className="h-4 w-4" />
              </LuxButton>
              <LuxButton href="/kontakt" variant="outline" size="lg">
                Skontaktuj się z nami
              </LuxButton>
            </ScrollReveal>

            <ScrollReveal delay={0.32} className="mt-12 flex flex-wrap justify-center gap-3">
              {["Bezpłatna wycena", "Realizacja w całej Polsce", "Gwarancja 20 lat"].map((tag) => (
                <span key={tag}
                  className="rounded-full border border-zinc-800 px-5 py-2.5 text-[10px] uppercase tracking-[0.32em] text-zinc-600 transition-all hover:border-zinc-700 hover:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </ScrollReveal>
          </div>
        </section>

        <MainFooter />
      </main>
    </>
  );
}
