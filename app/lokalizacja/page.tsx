"use client";

import { MapPin, Car, Train, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";

export default function LokalizacjaPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <MainHeader />

      <section className="border-b border-zinc-900 bg-gradient-to-b from-black via-[#050505] to-black">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 md:px-8 md:pb-16 md:pt-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Lokalizacja
          </p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl space-y-4">
              <h1 className="text-3xl font-light tracking-tight md:text-4xl">
                Jak do nas dojechać
              </h1>
              <p className="text-sm text-zinc-400 md:text-base">
                Nasz showroom i siedziba mieszczą się w Ozorkowie. Dogodny dojazd
                zarówno z Łodzi, jak i z Poznania czy Warszawy. Poniżej znajdziesz
                mapę oraz wskazówki dojazdu.
              </p>
            </div>
            <Link
              href="/kontakt"
              className="mt-2 inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-black/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-300 transition-all hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
            >
              Dane kontaktowe
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-900 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Mapa dojazdu
          </h2>
          <div className="h-[380px] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24355.229058309502!2d19.278379899999997!3d51.95999555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471bb003bb221dc3%3A0xfa4a2b1a1b13f88e!2sElizy%20Orzeszkowej%2036A%2C%2095-035%20Ozork%C3%B3w!5e1!3m2!1spl!2spl!4v1771612009734!5m2!1spl!2spl"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              className="grayscale invert brightness-[0.7] contrast-[1.2] transition-all duration-1000 ease-in-out hover:grayscale-0 hover:invert-0 hover:brightness-100 hover:contrast-100"
            ></iframe>
          </div>
        </div>
      </section>

      <section className="bg-black/80">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-2 md:px-8 md:py-16">
          <div className="space-y-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
              Adres
            </p>
            <div className="space-y-3 text-sm text-zinc-400">
              <div className="flex items-start gap-3">
                <MapPin className="mt-[2px] h-4 w-4 text-[#D4AF37]" />
                <p>
                  Koziol Luxury Gates
                  <br />
                  ul. Przykładowa 123
                  <br />
                  00-035 Ozorków, Polska
                </p>
              </div>
              <p>
                Wejście do showroomu znajduje się od strony parkingu. Na miejscu
                dostępne są miejsca postojowe dla klientów.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 text-sm text-zinc-400 sm:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-zinc-900 bg-zinc-950/70 p-6">
              <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                <Car className="h-4 w-4 text-[#D4AF37]" />
                Samochodem
              </div>
              <p className="text-xs text-zinc-400">
                Zjazd z drogi krajowej – szczegółowe wskazówki otrzymasz po
                umówieniu wizyty. Czas dojazdu:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                <li>• ok. 30 min z centrum Łodzi</li>
                <li>• ok. 1h 30 min z Warszawy</li>
                <li>• ok. 2h z Poznania</li>
              </ul>
            </div>

            <div className="space-y-3 rounded-2xl border border-zinc-900 bg-zinc-950/70 p-6">
              <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                <Train className="h-4 w-4 text-[#D4AF37]" />
                Komunikacją
              </div>
              <p className="text-xs text-zinc-400">
                Najbliższa stacja kolejowa znajduje się w Ozorkowie. Z dworca
                możemy zorganizować odbiór po wcześniejszym umówieniu spotkania.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MainFooter />
    </main>
  );
}

