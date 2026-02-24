"use client";

import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <MainHeader />

      <section className="border-b border-zinc-900 bg-gradient-to-b from-black via-[#050505] to-black">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 md:px-8 md:pb-16 md:pt-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Kontakt
          </p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl space-y-4">
              <h1 className="text-3xl font-light tracking-tight md:text-4xl">
                Showroom Koziol Luxury Gates
              </h1>
              <p className="text-sm text-zinc-400 md:text-base">
                Porozmawiajmy o Twojej inwestycji. Zadzwoń, napisz lub umów
                spotkanie w naszym showroomie. Dobierzemy rozwiązanie
                dopasowane do architektury budynku i charakteru posesji.
              </p>
            </div>
            <Link
              href="/konfigurator"
              className="mt-2 inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-black/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-300 transition-all hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
            >
              Otwórz konfigurator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-900 bg-black/70">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-3 md:px-8 md:py-16">
          <div className="space-y-4 rounded-2xl border border-zinc-900 bg-gradient-to-br from-zinc-950 via-black to-zinc-900/60 p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-black/60">
              <Phone className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              Telefon
            </p>
            <p className="text-lg font-light text-white">+48 123 456 789</p>
            <p className="text-xs text-zinc-500">
              Poniedziałek – piątek, 9:00–18:00
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-zinc-900 bg-gradient-to-br from-zinc-950 via-black to-zinc-900/60 p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-black/60">
              <Mail className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              E-mail
            </p>
            <p className="text-lg font-light text-white">biuro@koziol-gates.pl</p>
            <p className="text-xs text-zinc-500">
              Wyślij rzut działki, projekt lub zdjęcia – przygotujemy propozycję.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-zinc-900 bg-gradient-to-br from-zinc-950 via-black to-zinc-900/60 p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-black/60">
              <Clock className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              Spotkania
            </p>
            <p className="text-sm text-zinc-400">
              Spotkania w showroomie po wcześniejszym umówieniu terminu. Możliwy
              dojazd do klienta na teren budowy.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)] md:px-8 md:py-16">
          <div className="space-y-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
              Dane firmy
            </p>
            <h2 className="text-2xl font-light tracking-tight md:text-3xl">
              Koziol Luxury Gates – siedziba
            </h2>
            <div className="space-y-4 text-sm text-zinc-400">
              <div className="flex items-start gap-3">
                <MapPin className="mt-[2px] h-4 w-4 text-[#D4AF37]" />
                <p>
                  ul. Przykładowa 123
                  <br />
                  00-035 Ozorków
                  <br />
                  Polska
                </p>
              </div>
              <p>
                Zapraszamy do kontaktu przed przyjazdem – przygotujemy próbki,
                katalogi i propozycje rozwiązań dopasowane do Twojej inwestycji.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-zinc-900 bg-zinc-950/70 p-6 text-sm text-zinc-300">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Szybka wiadomość
            </p>
            <p className="text-xs text-zinc-500">
              Ten formularz jest przykładowy – dane z niego nie są nigdzie
              wysyłane. Możesz go później podpiąć do wybranej obsługi e-mail.
            </p>
            <form className="mt-4 space-y-4">
              <input
                placeholder="Imię i nazwisko"
                className="w-full border border-zinc-800 bg-black px-3 py-2 text-sm outline-none transition-all focus:border-[#D4AF37]"
              />
              <input
                placeholder="Adres e-mail"
                className="w-full border border-zinc-800 bg-black px-3 py-2 text-sm outline-none transition-all focus:border-[#D4AF37]"
              />
              <textarea
                placeholder="Krótko opisz swoją inwestycję (typ bramy, szerokość wjazdu, lokalizacja)"
                rows={4}
                className="w-full resize-none border border-zinc-800 bg-black px-3 py-2 text-sm outline-none transition-all focus:border-[#D4AF37]"
              />
              <button
                type="button"
                className="mt-2 w-full rounded-full bg-[#D4AF37] px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-black transition-all hover:bg-white"
              >
                Wyślij (makieta)
              </button>
            </form>
          </div>
        </div>
      </section>

      <MainFooter />
    </main>
  );
}

