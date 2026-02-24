"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { X, Ruler, PenTool, CircleDollarSign, ArrowRight } from "lucide-react";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";

type GalleryItem = {
  id: number;
  image_url: string;
  description: string | null;
  dimensions: string | null;
  price: number | null;
  model_id: string | number | null;
  material_id: string | number | null;
  product?: string | null;
  steel_type?: string | null;
  ral_code?: string | null;
  paint_type?: string | null;
};

export default function PublicGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedImg, setSelectedImg] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .order("id", { ascending: false });
    if (data) setItems(data as GalleryItem[]);
  }

  function buildConfiguratorHref(item: GalleryItem) {
    const params = new URLSearchParams();
    if (item.model_id !== null && item.model_id !== "") {
      params.set("model_id", String(item.model_id));
    }
    if (item.material_id !== null && item.material_id !== "") {
      params.set("material_id", String(item.material_id));
    }
    if (item.product) {
      params.set("product", String(item.product));
    }
    if (item.steel_type) {
      params.set("steel", String(item.steel_type));
    }
    if (item.ral_code) {
      params.set("ral", String(item.ral_code));
    }
    if (item.paint_type) {
      params.set("paint", String(item.paint_type));
    }
    const qs = params.toString();
    return qs ? `/konfigurator?${qs}` : "/konfigurator";
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <MainHeader />

      {/* NAGŁÓWEK */}
      <section className="border-b border-zinc-900 bg-gradient-to-b from-black via-[#050505] to-black">
        <header className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-10 pt-12 text-center md:px-8 md:pb-16 md:pt-20">
          <p className="text-xs uppercase tracking-[0.5em] text-[#D4AF37]">
            Nasze realizacje
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-light tracking-tight italic md:text-5xl lg:text-6xl">
              Luxury Gates Portfolio
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
              Wybrane projekty bram i ogrodzeń zrealizowane dla naszych klientów.
              Każda inwestycja powstała na indywidualne zamówienie – z dbałością
              o detal i dopasowanie do architektury.
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              href="/konfigurator"
              className="inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-black/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-300 transition-all hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
            >
              Skonfiguruj podobną bramę
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>
      </section>

      {/* SIATKA ZDJĘĆ */}
      <section className="bg-black/80">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative cursor-pointer overflow-hidden border border-zinc-900 bg-zinc-900/40 transition-all hover:border-[#D4AF37]/50"
              >
                <button
                  type="button"
                  onClick={() => setSelectedImg(item)}
                  className="block w-full text-left"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.description || "Realizacja bramy"}
                    className="h-full w-full transform object-cover opacity-80 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
                  />
                </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div>
                      <h3 className="max-w-[220px] truncate text-sm font-light tracking-wide">
                        {item.description || "Realizacja Koziol Luxury Gates"}
                      </h3>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                        Zobacz szczegóły
                      </p>
                    </div>
                    <span className="rounded-full border border-zinc-800 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                      {item.price ? `${item.price.toLocaleString()} PLN` : "premium"}
                    </span>
                  </div>
                </button>

                <div className="flex items-center justify-between gap-3 border-t border-zinc-900/60 bg-black/30 px-5 py-4">
                  <Link
                    href={buildConfiguratorHref(item)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition-all hover:bg-white"
                  >
                    Konfiguruj podobną
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedImg(item)}
                    className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-[#D4AF37]"
                  >
                    Szczegóły
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL (PODGLĄD SZCZEGÓŁÓW) */}
      {selectedImg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12">
          <button
            onClick={() => setSelectedImg(null)}
            className="absolute right-6 top-6 z-50 text-white transition-colors hover:text-[#D4AF37] md:right-10 md:top-8"
          >
            <X size={32} />
          </button>

          <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-10 md:gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/3] rounded-2xl border border-zinc-900 bg-black">
              <img
                src={selectedImg.image_url}
                className="h-full w-full object-contain"
                alt=""
              />
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37]">
                  Specyfikacja realizacji
                </p>
                <h2 className="mt-3 text-3xl font-light leading-tight md:text-4xl">
                  {selectedImg.description || "Realizacja bramy"}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 border-y border-zinc-800 py-6">
                <div className="flex items-center gap-4">
                  <Ruler className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      Wymiary
                    </p>
                    <p className="text-lg font-light">
                      {selectedImg.dimensions || "Na życzenie klienta"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <PenTool className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      Materiał i wypełnienie
                    </p>
                    <p className="text-lg font-light">
                      Dopasowane indywidualnie
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <CircleDollarSign className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      Orientacyjny koszt
                    </p>
                    <p className="text-2xl font-mono text-[#D4AF37]">
                      {selectedImg.price
                        ? `${selectedImg.price.toLocaleString()} PLN`
                        : "Na zapytanie"}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href={buildConfiguratorHref(selectedImg)}
                onClick={() => setSelectedImg(null)}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-[#D4AF37] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-black transition-all hover:bg-white"
              >
                Chcę podobną bramę
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <MainFooter />
    </main>
  );
}
