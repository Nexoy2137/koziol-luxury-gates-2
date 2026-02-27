"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Filter, X, SlidersHorizontal } from "lucide-react";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { LuxButton } from "@/components/ui/LuxButton";

type GalleryItem = {
  id: number;
  image_url: string;
  description: string | null;
  dimensions: string | null;
  price: number | null;
  model_id: string | number | null;
  material_id: string | number | null;
  product?: string | null;
  gate_model_id?: string | number | null;
  wicket_model_id?: string | number | null;
  steel_type?: string | null;
  ral_code?: string | null;
  paint_type?: string | null;
};

type PriceRow = {
  id: number;
  name: string;
  category: string;
  value: number;
};

const PRICE_RANGES = [
  { value: "", label: "Dowolna cena" },
  { value: "0-15000", label: "do 15 000 PLN" },
  { value: "15000-30000", label: "15 000 – 30 000 PLN" },
  { value: "30000-50000", label: "30 000 – 50 000 PLN" },
  { value: "50000-999999", label: "powyżej 50 000 PLN" },
  { value: "na-zapytanie", label: "Na zapytanie" },
];

function getGateModelId(item: GalleryItem): string | number | null {
  if (item.gate_model_id != null && item.gate_model_id !== "") return item.gate_model_id;
  if (item.product === "brama" && item.model_id != null) return item.model_id;
  if (item.product === "brama+furtka" && item.gate_model_id != null) return item.gate_model_id;
  if (item.product === "brama+furtka" && item.model_id != null) return item.model_id;
  return null;
}

function getWicketModelId(item: GalleryItem): string | number | null {
  if (item.wicket_model_id != null && item.wicket_model_id !== "") return item.wicket_model_id;
  if (item.product === "furtka" && item.model_id != null) return item.model_id;
  if (item.product === "brama+furtka" && item.wicket_model_id != null) return item.wicket_model_id;
  return null;
}

export default function PublicGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [filterPrice, setFilterPrice] = useState<string>("");
  const [filterGateModel, setFilterGateModel] = useState<string>("");
  const [filterWicketModel, setFilterWicketModel] = useState<string>("");
  const [filterMaterial, setFilterMaterial] = useState<string>("");
  const [filterColor, setFilterColor] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [galleryRes, pricesRes] = await Promise.all([
        supabase.from("gallery").select("*").order("id", { ascending: false }),
        supabase.from("prices").select("id, name, category, value"),
      ]);
      if (galleryRes.data) setItems(galleryRes.data as GalleryItem[]);
      if (pricesRes.data) setPrices(pricesRes.data as PriceRow[]);
    }
    fetchData();
  }, []);

  const gateModels = useMemo(
    () => prices.filter((p) => p.category === "base").sort((a, b) => a.name.localeCompare(b.name)),
    [prices]
  );
  const wicketModels = useMemo(
    () => prices.filter((p) => p.category === "wicket_base").sort((a, b) => a.name.localeCompare(b.name)),
    [prices]
  );
  const materials = useMemo(
    () => prices.filter((p) => p.category === "material").sort((a, b) => a.name.localeCompare(b.name)),
    [prices]
  );
  const colors = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.ral_code != null && String(i.ral_code).trim() !== "") set.add(String(i.ral_code).trim());
    });
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterPrice) {
        if (filterPrice === "na-zapytanie") {
          if (item.price != null && item.price > 0) return false;
        } else {
          const [minStr, maxStr] = filterPrice.split("-");
          const min = Number(minStr);
          const max = Number(maxStr);
          const p = item.price ?? 0;
          if (p === 0 && filterPrice !== "na-zapytanie") return false;
          if (p < min || p > max) return false;
        }
      }
      if (filterGateModel) {
        const gateId = getGateModelId(item);
        if (gateId == null) return false;
        if (String(gateId) !== filterGateModel) return false;
      }
      if (filterWicketModel) {
        const wicketId = getWicketModelId(item);
        if (wicketId == null) return false;
        if (String(wicketId) !== filterWicketModel) return false;
      }
      if (filterMaterial) {
        const mid = item.material_id != null ? String(item.material_id) : "";
        if (mid !== filterMaterial) return false;
      }
      if (filterColor) {
        const code = item.ral_code != null ? String(item.ral_code).trim() : "";
        if (code !== filterColor) return false;
      }
      return true;
    });
  }, [items, filterPrice, filterGateModel, filterWicketModel, filterMaterial, filterColor]);

  const hasActiveFilters = !!filterPrice || !!filterGateModel || !!filterWicketModel || !!filterMaterial || !!filterColor;
  const activeCount = [filterPrice, filterGateModel, filterWicketModel, filterMaterial, filterColor].filter(Boolean).length;

  const clearFilters = () => {
    setFilterPrice("");
    setFilterGateModel("");
    setFilterWicketModel("");
    setFilterMaterial("");
    setFilterColor("");
  };

  const selectClass = "gallery-filter-select";

  return (
    <main className="min-h-screen bg-black text-white">
      <MainHeader />

      <section className="relative border-b border-zinc-800 bg-[#030303] grid-overlay overflow-hidden">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(133,102,47,0.16) 0%, transparent 65%)" }} />

        <div className="relative mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-32" style={{ paddingBottom: 40 }}>
          <ScrollReveal>
            <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">
              Nasze realizacje
            </p>
            <h1 className="font-display max-w-3xl text-4xl font-normal italic leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Luxury Gates Portfolio
            </h1>
            <p className="mt-6 max-w-xl text-[15px] font-light leading-relaxed text-zinc-400">
              Każda inwestycja powstała na indywidualne zamówienie — z dbałością
              o detal i dopasowanie do architektury budynku.
            </p>
          </ScrollReveal>

          <ScrollReveal style={{ marginTop: 32 }}>
            <LuxButton href="/konfigurator" variant="outline">
              Skonfiguruj podobną bramę
              <ArrowRight className="h-4 w-4" />
            </LuxButton>
          </ScrollReveal>
        </div>
      </section>

      <div className="sticky top-0 z-40 border-b border-zinc-800 bg-black/90 backdrop-blur-xl" style={{ paddingTop: 20, paddingBottom: 20 }}>
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowFilters((s) => !s)}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.28em] transition-all ${
                  showFilters
                    ? "border-[#D4AF37]/70 bg-[#D4AF37]/15 text-[#D4AF37]"
                    : "border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
                style={showFilters ? { boxShadow: "0 0 24px rgba(212,175,55,0.15)" } : undefined}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtry
                {hasActiveFilters && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[8px] font-bold text-black">
                    {activeCount}
                  </span>
                )}
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-zinc-600 transition-colors hover:text-[#D4AF37]"
                >
                  <X className="h-3 w-3" />
                  Wyczyść
                </button>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-600">
              <span className="text-zinc-400">{filteredItems.length}</span>{" "}
              {filteredItems.length === 1 ? "realizacja" : "realizacji"}
            </p>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-zinc-800" style={{ gap: "16px 20px", paddingTop: 20, paddingBottom: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label className="block text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                      Cena
                    </label>
                    <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className={selectClass}>
                      {PRICE_RANGES.map((r) => (
                        <option key={r.value || "any"} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label className="block text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                      Model bramy
                    </label>
                    <select value={filterGateModel} onChange={(e) => setFilterGateModel(e.target.value)} className={selectClass}>
                      <option value="">Wszystkie</option>
                      {gateModels.map((m) => (
                        <option key={m.id} value={String(m.id)}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label className="block text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                      Model furtki
                    </label>
                    <select value={filterWicketModel} onChange={(e) => setFilterWicketModel(e.target.value)} className={selectClass}>
                      <option value="">Wszystkie</option>
                      {wicketModels.map((m) => (
                        <option key={m.id} value={String(m.id)}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label className="block text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                      Wypełnienie
                    </label>
                    <select value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)} className={selectClass}>
                      <option value="">Wszystkie</option>
                      {materials.map((m) => (
                        <option key={m.id} value={String(m.id)}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label className="block text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                      Kolor RAL
                    </label>
                    <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)} className={selectClass}>
                      <option value="">Wszystkie</option>
                      {colors.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <section className="relative bg-black">
        <div className="pointer-events-none absolute inset-0 grid-overlay opacity-50" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8" style={{ paddingTop: 64, paddingBottom: 28 }}>
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-8 py-32 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/80">
                <Filter className="h-8 w-8 text-zinc-600" />
              </div>
              <p className="text-[15px] text-zinc-500">
                Brak realizacji spełniających wybrane filtry.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-zinc-700 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37] transition-all hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10"
              >
                Wyczyść filtry
              </button>
            </motion.div>
          ) : (
            <ScrollReveal>
              <StaggerContainer className="masonry-grid">
                {filteredItems.map((item) => (
                  <StaggerItem key={item.id} className="masonry-item">
                    <Link href={`/galeria/${item.id}`} className="group block">
                      <div className="gallery-card">
                        <div className="gallery-img-wrap relative overflow-hidden" style={{ aspectRatio: item.id % 3 === 1 ? "4/5" : "16/10" }}>
                          <Image
                            src={item.image_url}
                            alt={item.description || "Realizacja bramy"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>

                        <div className="gallery-overlay absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37] bg-[#D4AF37]/20 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
                            Zobacz szczegóły
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </ScrollReveal>
          )}
        </div>
      </section>

      <section className="relative border-t border-zinc-800 bg-[#030303] grid-overlay" style={{ paddingTop: 24, paddingBottom: 28 }}>
        <div className="relative mx-auto max-w-7xl px-5 text-center">
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(133,102,47,0.12) 0%, transparent 70%)" }} />
          <ScrollReveal className="relative">
            <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">
              Zainspirowany?
            </p>
            <h2 className="font-display mx-auto max-w-2xl text-3xl font-normal italic leading-tight md:text-4xl">
              Skonfiguruj swoją bramę i otrzymaj wycenę.
            </h2>
            <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
              <LuxButton href="/konfigurator" variant="gold" size="lg">
                Otwórz konfigurator
              </LuxButton>
              <LuxButton href="/kontakt" variant="outline" size="lg">
                Umów spotkanie
              </LuxButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MainFooter />
    </main>
  );
}
