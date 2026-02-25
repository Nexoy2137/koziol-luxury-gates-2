"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
import { LuxButton } from "@/components/ui/LuxButton";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";

const contactCards = [
  {
    icon: Phone,
    label: "Telefon",
    value: "+48 602 384 821",
    sub: "Pon – Pt, 9:00 – 18:00",
    href: "tel:+48602384821",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "biuro@koziol-gates.pl",
    sub: "Odpowiadamy w ciągu 24 godzin",
    href: "mailto:biuro@koziol-gates.pl",
  },
  {
    icon: Clock,
    label: "Spotkania",
    value: "Po wcześniejszym umówieniu",
    sub: "Możliwy dojazd do klienta na teren budowy",
    href: null,
  },
];

export default function KontaktPage() {
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      <MainHeader />

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative border-b border-zinc-800">
        <div className="pointer-events-none absolute inset-0 gold-glow-center" />

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 md:px-8 md:pb-20 md:pt-28">
          <ScrollReveal>
            <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">
              Kontakt
            </p>
            <h1 className="font-display max-w-3xl text-4xl font-normal italic leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Porozmawiajmy o Twojej inwestycji.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] font-light leading-relaxed text-zinc-500">
              Zadzwoń, napisz lub umów spotkanie w naszym showroomie. Dobierzemy
              rozwiązanie dopasowane do architektury budynku i charakteru posesji.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="mt-8">
            <LuxButton href="/konfigurator" variant="outline">
              Otwórz konfigurator
              <ArrowRight className="h-4 w-4" />
            </LuxButton>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CONTACT CARDS ─────────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-800 bg-[#030303]">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
          <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-3" staggerDelay={0.1}>
            {contactCards.map((card) => (
              <StaggerItem key={card.label}>
                <div className="group beam-border h-full">
                  <div className="beam-inner flex h-full flex-col gap-5 rounded-2xl p-7 transition-all">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-black/60">
                      <card.icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-600">
                      {card.label}
                    </p>
                    {card.href ? (
                      <a
                        href={card.href}
                        className="text-lg font-light text-white transition-colors hover:text-[#D4AF37]"
                      >
                        {card.value}
                      </a>
                    ) : (
                      <p className="text-base font-light text-white">{card.value}</p>
                    )}
                    <p className="mt-auto text-xs leading-relaxed text-zinc-600">{card.sub}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── ADDRESS + FORM ────────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-800 bg-black">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-16 md:grid-cols-[1fr_1.1fr] md:px-8 md:py-24">
          {/* Address */}
          <ScrollReveal className="space-y-8">
            <div>
              <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">
                Siedziba
              </p>
              <h2 className="font-display text-2xl font-normal italic leading-tight md:text-3xl">
                Koziol Luxury Gates — showroom
              </h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950">
                  <MapPin className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-600">Adres</p>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    ul. Adamówek 41
                    <br />
                    95-035 Ozorków
                    <br />
                    Polska
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950">
                  <Clock className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-600">Godziny</p>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    Poniedziałek – Piątek
                    <br />
                    9:00 – 18:00
                  </p>
                </div>
              </div>
            </div>

            <div className="gold-line" />

            <p className="text-sm leading-relaxed text-zinc-600">
              Zapraszamy do kontaktu przed przyjazdem — przygotujemy próbki,
              katalogi i propozycje rozwiązań dopasowane do Twojej inwestycji.
            </p>

            <div className="flex flex-wrap gap-3">
              {["Bezpłatna konsultacja", "Dojazd do klienta", "Próbki materiałów"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-800 px-3 py-1.5 text-[9px] uppercase tracking-[0.28em] text-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </ScrollReveal>

          {/* Contact Form */}
          <ScrollReveal delay={0.15}>
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-full flex-col items-center justify-center gap-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-10 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-black">
                  <CheckCircle className="h-7 w-7 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-display text-xl italic text-white">
                    Wiadomość wysłana
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    Odpiszemy w ciągu 24 godzin. Dziękujemy za zainteresowanie.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 hover:text-[#D4AF37]"
                >
                  Wyślij kolejną wiadomość
                </button>
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-7 md:p-9">
                <p className="mb-6 text-[9px] font-semibold uppercase tracking-[0.4em] text-zinc-500">
                  Szybka wiadomość
                </p>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                        Imię i nazwisko
                      </label>
                      <input
                        type="text"
                        placeholder="Jan Kowalski"
                        required
                        className="w-full rounded-xl border border-zinc-800 bg-black/80 px-4 py-3 text-sm text-zinc-300 placeholder-zinc-700 outline-none transition-colors focus:border-[#D4AF37]/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        placeholder="+48 000 000 000"
                        className="w-full rounded-xl border border-zinc-800 bg-black/80 px-4 py-3 text-sm text-zinc-300 placeholder-zinc-700 outline-none transition-colors focus:border-[#D4AF37]/60"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                      Adres e-mail
                    </label>
                    <input
                      type="email"
                      placeholder="jan@kowalski.pl"
                      required
                      className="w-full rounded-xl border border-zinc-800 bg-black/80 px-4 py-3 text-sm text-zinc-300 placeholder-zinc-700 outline-none transition-colors focus:border-[#D4AF37]/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                      Opis inwestycji
                    </label>
                    <textarea
                      placeholder="Typ bramy, szerokość wjazdu, lokalizacja, budżet orientacyjny..."
                      rows={4}
                      className="w-full resize-none rounded-xl border border-zinc-800 bg-black/80 px-4 py-3 text-sm text-zinc-300 placeholder-zinc-700 outline-none transition-colors focus:border-[#D4AF37]/60"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-full bg-[#D4AF37] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-black shadow-gold-sm transition-all hover:bg-[#E8C97A]"
                  >
                    Wyślij wiadomość
                  </button>

                  <p className="text-center text-[9px] text-zinc-700">
                    Lub zadzwoń:{" "}
                    <a href="tel:+48602384821" className="text-zinc-500 hover:text-[#D4AF37]">
                      +48 602 384 821
                    </a>
                  </p>
                </form>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA BOTTOM ────────────────────────────────────────────────────────── */}
      <section className="relative bg-black">
        <div className="pointer-events-none absolute inset-0 gold-glow-center" />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center md:px-8 md:py-28">
          <ScrollReveal>
            <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">
              Zainspirowany?
            </p>
            <h2 className="font-display text-3xl font-normal italic leading-tight md:text-4xl">
              Sprawdź nasze realizacje w galerii.
            </h2>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <LuxButton href="/galeria" variant="gold">
                Zobacz realizacje
              </LuxButton>
              <LuxButton href="/konfigurator" variant="outline">
                Konfigurator online
                <ArrowRight className="h-4 w-4" />
              </LuxButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MainFooter />
    </main>
  );
}
