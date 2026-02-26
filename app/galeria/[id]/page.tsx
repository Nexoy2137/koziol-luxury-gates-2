import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  ArrowRight,
  CircleDollarSign,
  Fence,
  LayoutGrid,
  Paintbrush,
  Package,
  Ruler,
  Shield,
  DoorOpen,
} from "lucide-react";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
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

function getProductFlags(product?: string | null) {
  const normalized = (product || "").toLowerCase();
  const hasGate = normalized.includes("brama");
  const hasWicket = normalized.includes("furtka");
  return { hasGate, hasWicket };
}

function buildConfiguratorHref(
  item: GalleryItem,
  forcedProduct?: "brama" | "furtka" | null,
  pairBoth?: boolean
) {
  const params = new URLSearchParams();
  params.set("prefill", "1");

  const gateModelId =
    item.gate_model_id ??
    (item.product === "brama" && item.model_id != null ? item.model_id : null);
  const wicketModelId =
    item.wicket_model_id ??
    (item.product === "furtka" && item.model_id != null ? item.model_id : null);

  let primaryModelId: string | number | null = null;
  if (forcedProduct === "brama") {
    primaryModelId = gateModelId ?? item.model_id;
  } else if (forcedProduct === "furtka") {
    primaryModelId = wicketModelId ?? item.model_id;
  } else {
    primaryModelId = item.model_id;
  }

  if (primaryModelId !== null && primaryModelId !== "") {
    params.set("model_id", String(primaryModelId));
  }

  if (item.material_id !== null && item.material_id !== "") {
    params.set("material_id", String(item.material_id));
  }

  const derivedProduct =
    forcedProduct ??
    (item.product === "brama" || item.product === "furtka" ? item.product : null);
  if (derivedProduct) {
    params.set("product", derivedProduct);
  }

  if (pairBoth) {
    params.set("pair", "brama+furtka");
    const secondaryId =
      forcedProduct === "brama"
        ? wicketModelId
        : forcedProduct === "furtka"
          ? gateModelId
          : null;
    if (secondaryId != null && secondaryId !== "") {
      params.set("model_id_secondary", String(secondaryId));
    }
  }

  if (item.steel_type) params.set("steel", String(item.steel_type));
  if (item.ral_code) params.set("ral", String(item.ral_code));
  if (item.paint_type) params.set("paint", String(item.paint_type));

  const qs = params.toString();
  return qs ? `/konfigurator?${qs}` : "/konfigurator";
}

function formatPln(value: number) {
  return `${new Intl.NumberFormat("pl-PL").format(value)} PLN`;
}

export default async function GalleryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const idNum = Number(idParam);
  const id = Number.isFinite(idNum) ? idNum : null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <MainHeader />
        <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
          <h1 className="text-2xl font-light">Brak konfiguracji Supabase</h1>
          <p className="mt-4 text-sm text-zinc-400">
            Ustaw zmienne środowiskowe `NEXT_PUBLIC_SUPABASE_URL` oraz
            `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
          </p>
          <Link
            href="/galeria"
            className="mt-10 inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-black/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-300 transition-all hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć do galerii
          </Link>
        </section>
        <MainFooter />
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const [{ data, error }, { data: pricesData }] = await Promise.all([
    supabase.from("gallery").select("*").eq("id", id).maybeSingle(),
    supabase.from("prices").select("id, name, category"),
  ]);

  const prices = (pricesData ?? []) as { id: number; name: string; category: string }[];
  const gateModelName = (id: string | number | null) =>
    prices.find((p) => p.category === "base" && p.id === Number(id))?.name ?? null;
  const wicketModelName = (id: string | number | null) =>
    prices.find((p) => p.category === "wicket_base" && p.id === Number(id))?.name ?? null;
  const materialName = (id: string | number | null) =>
    prices.find((p) => p.category === "material" && p.id === Number(id))?.name ?? null;

  if (error || !data || id === null) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <MainHeader />
        <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
          <h1 className="text-2xl font-light">Nie znaleziono realizacji</h1>
          <p className="mt-4 text-sm text-zinc-400">
            Ta pozycja galerii nie istnieje lub została usunięta.
          </p>
          <Link
            href="/galeria"
            className="mt-10 inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-black/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-300 transition-all hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć do galerii
          </Link>
        </section>
        <MainFooter />
      </main>
    );
  }

  const item = data as GalleryItem;
  const { hasGate, hasWicket } = getProductFlags(item.product);
  const gateId = item.gate_model_id ?? (hasGate ? item.model_id : null);
  const wicketId = item.wicket_model_id ?? (hasWicket ? item.model_id : null);
  const gateName = gateModelName(gateId);
  const wicketName = wicketModelName(wicketId);
  const material = materialName(item.material_id);

  return (
    <main className="min-h-screen bg-black text-white">
      <MainHeader />

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <section className="relative border-b border-zinc-800 bg-[#030303] grid-overlay overflow-hidden">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(133,102,47,0.12) 0%, transparent 65%)" }} />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-12 md:px-8 md:py-16">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.5em] text-[#D4AF37]">Realizacja</p>
            <h1 className="font-display mt-4 text-3xl font-normal italic tracking-tight md:text-4xl lg:text-5xl">
              {item.description || "Realizacja Kozioł Luxury Gates"}
            </h1>
          </div>
          <LuxButton href="/galeria" variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Wróć do galerii
          </LuxButton>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-black">
        <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 md:px-8 md:pb-16" style={{ paddingTop: 80 }}>
          {/* Image - smaller, centered */}
          <div className="mx-auto mb-12 w-full max-w-[1000px]">
            <div className="beam-wrapper beam-wrapper-fast beam-wrapper-strong">
              <div className="beam-inner relative aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.description || "Realizacja"} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          {/* Opis - full width if present */}
          {item.description != null && String(item.description).trim() !== "" && (
            <div className="mb-10 max-w-2xl">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.4em] text-zinc-500">Opis</p>
              <p className="text-[15px] leading-relaxed text-zinc-300">{item.description}</p>
            </div>
          )}

          {/* Specs grid - tiles side by side */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div className="gallery-spec-tile">
              <div className="gallery-spec-tile-icon"><Ruler className="h-4 w-4" /></div>
              <p className="gallery-spec-tile-label">Wymiary</p>
              <p className="gallery-spec-tile-value">{item.dimensions || "Na życzenie"}</p>
            </div>

            <div className="gallery-spec-tile">
              <div className="gallery-spec-tile-icon"><CircleDollarSign className="h-4 w-4" /></div>
              <p className="gallery-spec-tile-label">Koszt</p>
              <p className="gallery-spec-tile-value font-medium text-[#D4AF37]">
                {item.price != null && item.price > 0 ? formatPln(item.price) : "Na zapytanie"}
              </p>
            </div>

            {item.product != null && String(item.product).trim() !== "" && (
              <div className="gallery-spec-tile">
                <div className="gallery-spec-tile-icon"><Package className="h-4 w-4" /></div>
                <p className="gallery-spec-tile-label">Produkt</p>
                <p className="gallery-spec-tile-value">
                  {item.product === "brama+furtka" ? "Brama i furtka" : item.product === "brama" ? "Brama" : item.product === "furtka" ? "Furtka" : item.product}
                </p>
              </div>
            )}

            {gateName && (
              <div className="gallery-spec-tile">
                <div className="gallery-spec-tile-icon"><Fence className="h-4 w-4" /></div>
                <p className="gallery-spec-tile-label">Model bramy</p>
                <p className="gallery-spec-tile-value">{gateName}</p>
              </div>
            )}

            {wicketName && (
              <div className="gallery-spec-tile">
                <div className="gallery-spec-tile-icon"><DoorOpen className="h-4 w-4" /></div>
                <p className="gallery-spec-tile-label">Model furtki</p>
                <p className="gallery-spec-tile-value">{wicketName}</p>
              </div>
            )}

            {material && (
              <div className="gallery-spec-tile">
                <div className="gallery-spec-tile-icon"><LayoutGrid className="h-4 w-4" /></div>
                <p className="gallery-spec-tile-label">Wypełnienie</p>
                <p className="gallery-spec-tile-value">{material}</p>
              </div>
            )}

            {item.steel_type != null && String(item.steel_type).trim() !== "" && (
              <div className="gallery-spec-tile">
                <div className="gallery-spec-tile-icon"><Shield className="h-4 w-4" /></div>
                <p className="gallery-spec-tile-label">Stal</p>
                <p className="gallery-spec-tile-value">{item.steel_type}</p>
              </div>
            )}

            {item.ral_code != null && String(item.ral_code).trim() !== "" && (
              <div className="gallery-spec-tile">
                <div className="gallery-spec-tile-icon"><Paintbrush className="h-4 w-4" /></div>
                <p className="gallery-spec-tile-label">RAL</p>
                <p className="gallery-spec-tile-value">{item.ral_code}</p>
              </div>
            )}

            {item.paint_type != null && String(item.paint_type).trim() !== "" && (
              <div className="gallery-spec-tile">
                <div className="gallery-spec-tile-icon"><Paintbrush className="h-4 w-4" /></div>
                <p className="gallery-spec-tile-label">Malowanie</p>
                <p className="gallery-spec-tile-value">{item.paint_type}</p>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap" style={{ marginTop: 48, marginBottom: 32, gap: 20 }}>
              {hasGate && (
                <LuxButton href={buildConfiguratorHref(item, "brama")} variant="gold">
                  Podobna brama
                  <ArrowRight className="h-4 w-4" />
                </LuxButton>
              )}
              {hasWicket && (
                <LuxButton href={buildConfiguratorHref(item, "furtka")} variant="gold">
                  Podobna furtka
                  <ArrowRight className="h-4 w-4" />
                </LuxButton>
              )}
              {hasGate && hasWicket && (
                <LuxButton href={buildConfiguratorHref(item, "brama", true)} variant="outline">
                  Podobna brama i furtka
                  <ArrowRight className="h-4 w-4" />
                </LuxButton>
              )}
              {!hasGate && !hasWicket && (
                <LuxButton href={buildConfiguratorHref(item)} variant="gold">
                  Podobna realizacja
                  <ArrowRight className="h-4 w-4" />
                </LuxButton>
              )}
          </div>
        </div>
      </section>

      <MainFooter />
    </main>
  );
}

