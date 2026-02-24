import Image from "next/image";
import Link from "next/link";
import { Box, ShieldCheck, Ruler, Settings, LayoutGrid } from "lucide-react";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans">
      <MainHeader />

      {/* HERO / O NAS */}
      <section className="border-b border-zinc-900 bg-gradient-to-b from-black via-[#050505] to-black">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-16 md:flex-row md:items-center md:pb-24 md:pt-24">
          <div className="flex-1 space-y-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
              Producent ekskluzywnych bram i ogrodzeń
            </p>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl lg:text-5xl">
              Koziol Luxury Gates – Twoja brama do świata luksusu
            </h1>
            <p className="max-w-xl text-sm text-zinc-400 md:text-base">
              Projektujemy i realizujemy nowoczesne bramy, furtki i ogrodzenia
              dla wymagających inwestorów. Łączymy precyzję wykonania, solidną
              stal i minimalistyczny design dopasowany do architektury domu.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/konfigurator"
                className="inline-flex items-center gap-3 rounded-full bg-[#D4AF37] px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-black shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all hover:bg-white"
              >
                Otwórz konfigurator
              </Link>
              <Link
                href="/galeria"
                className="inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-black/50 px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-300 transition-all hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
              >
                Zobacz realizacje
              </Link>
            </div>
          </div>

          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_60%)]" />
            <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/25 bg-black/60">
              <Image
                src="/logo_2.jpg"
                alt="Koziol Luxury Gates realizacja"
                width={900}
                height={600}
                className="h-full w-full object-cover opacity-80"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEK CJA O NAS */}
      <section className="border-b border-zinc-900 bg-black/80">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:px-8 md:py-16">
          <div className="space-y-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
              O nas
            </p>
            <h2 className="text-2xl font-light tracking-tight md:text-3xl">
              Rzemiosło, stal i precyzja – wszystko pod jedną marką
            </h2>
            <p className="text-sm text-zinc-400 md:text-base">
              Koziol Luxury Gates to pracownia, w której powstają indywidualne
              projekty bram i ogrodzeń. Pracujemy na sprawdzonych systemach
              stalowych, stosujemy zabezpieczenia antykorozyjne i wykończenia,
              które przez lata zachowują swój wygląd.
            </p>
            <p className="text-sm text-zinc-400 md:text-base">
              Każdy projekt rozpoczynamy od zrozumienia architektury budynku i
              potrzeb inwestora. Następnie dobieramy wypełnienie, podział
              przęseł, kolorystykę i automatykę – tak, aby całość była
              jednocześnie reprezentacyjna i wygodna w użytkowaniu.
            </p>
          </div>

          <div className="grid gap-4 text-sm text-zinc-300">
            <div className="flex items-start gap-4 rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5">
              <Box className="mt-1 h-5 w-5 text-[#D4AF37]" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                  Konstrukcje stalowe
                </p>
                <p className="mt-2 text-sm">
                  Spawane konstrukcje na profilach zamkniętych, przygotowane pod
                  automatykę i montaż ogrodzenia systemowego.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5">
              <ShieldCheck className="mt-1 h-5 w-5 text-[#D4AF37]" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                  Trwałość i zabezpieczenia
                </p>
                <p className="mt-2 text-sm">
                  Cynkowanie ogniowe, malowanie proszkowe i komponenty odporne
                  na codzienne użytkowanie w polskich warunkach.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5">
              <Ruler className="mt-1 h-5 w-5 text-[#D4AF37]" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                  Pełne dopasowanie
                </p>
                <p className="mt-2 text-sm">
                  Projektujemy bramy przesuwne, skrzydłowe i furtki dokładnie
                  pod wymiary wjazdu i warunki zabudowy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DLACZEGO MY / KAFELKI */}
      <section className="border-b border-zinc-900 bg-[#050505]">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-16">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
                Dlaczego inwestorzy wybierają nas
              </p>
              <h2 className="mt-3 text-2xl font-light tracking-tight md:text-3xl">
                Od pierwszej rozmowy do montażu pod klucz
              </h2>
            </div>
            <div className="text-xs text-zinc-500 md:max-w-sm">
              Proces prowadzenia inwestora jest prosty – zaczynasz od
              konfiguratora online lub telefonu, a my zajmujemy się resztą:
              pomiarem, projektem, produkcją i montażem.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-900 bg-zinc-950/60 p-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
                Krok 1
              </span>
              <p className="text-sm font-medium text-white">
                Konfiguracja i wstępna wycena
              </p>
              <p className="text-xs text-zinc-400">
                Wybierz typ bramy, materiał i przybliżone wymiary w konfiguratorze
                online, a my przygotujemy propozycję projektu.
              </p>
              <Link
                href="/konfigurator"
                className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[#D4AF37] hover:text-white"
              >
                Otwórz konfigurator
              </Link>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-900 bg-zinc-950/60 p-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
                Krok 2
              </span>
              <p className="text-sm font-medium text-white">
                Projekt i dopasowanie detali
              </p>
              <p className="text-xs text-zinc-400">
                Na podstawie przesłanych wymiarów i zdjęć dopracowujemy podział
                przęseł, wypełnienie i kolorystykę, aby brama tworzyła całość z
                budynkiem.
              </p>
              <Link
                href="/galeria"
                className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[#D4AF37] hover:text-white"
              >
                Zobacz nasze realizacje
              </Link>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-900 bg-zinc-950/60 p-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
                Krok 3
              </span>
              <p className="text-sm font-medium text-white">
                Produkcja i montaż pod klucz
              </p>
              <p className="text-xs text-zinc-400">
                Po akceptacji projektu produkujemy konstrukcję i montujemy ją na
                miejscu – z automatyką, furtkami i dopasowanym ogrodzeniem.
              </p>
              <Link
                href="/kontakt"
                className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[#D4AF37] hover:text-white"
              >
                Umów rozmowę
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA DO PODSTRON */}
      <section className="border-b border-zinc-900 bg-black/80">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Link
              href="/konfigurator"
              className="group flex flex-col gap-4 rounded-2xl border border-zinc-900 bg-zinc-950/70 p-6 transition-colors hover:border-[#D4AF37]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-black/60">
                <LayoutGrid className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                  Konfigurator online
                </p>
                <p className="text-sm font-light text-white">
                  Sprawdź wstępną wycenę swojej bramy w mniej niż 2 minuty.
                </p>
              </div>
              <span className="mt-auto text-[11px] uppercase tracking-[0.25em] text-zinc-500 group-hover:text-[#D4AF37]">
                Przejdź do konfiguratora
              </span>
            </Link>

            <Link
              href="/galeria"
              className="group flex flex-col gap-4 rounded-2xl border border-zinc-900 bg-zinc-950/70 p-6 transition-colors hover:border-[#D4AF37]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-black/60">
                <Image
                  src="/logo.svg"
                  alt="Koziol Luxury Gates"
                  width={20}
                  height={20}
                  className="opacity-80"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                  Realizacje
                </p>
                <p className="text-sm font-light text-white">
                  Zobacz wybrane bramy i ogrodzenia, które wykonaliśmy dla naszych klientów.
                </p>
              </div>
              <span className="mt-auto text-[11px] uppercase tracking-[0.25em] text-zinc-500 group-hover:text-[#D4AF37]">
                Przeglądaj portfolio
              </span>
            </Link>

            <Link
              href="/kontakt"
              className="group flex flex-col gap-4 rounded-2xl border border-zinc-900 bg-zinc-950/70 p-6 transition-colors hover:border-[#D4AF37]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-black/60">
                <Settings className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                  Kontakt i lokalizacja
                </p>
                <p className="text-sm font-light text-white">
                  Umów spotkanie w showroomie lub rozmowę telefoniczną z doradcą.
                </p>
              </div>
              <span className="mt-auto text-[11px] uppercase tracking-[0.25em] text-zinc-500 group-hover:text-[#D4AF37]">
                Dane kontaktowe
              </span>
            </Link>
          </div>
        </div>
      </section>

      <MainFooter />
    </main>
  );
}