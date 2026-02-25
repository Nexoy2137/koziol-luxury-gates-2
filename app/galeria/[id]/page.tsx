import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  ArrowRight,
  CircleDollarSign,
  Paintbrush,
  Package,
  Ruler,
  Shield,
  Tag,
} from "lucide-react";
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
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .eq("id", id)
    .maybeSingle();

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

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <MainHeader />

      <section className="border-b border-zinc-900 bg-gradient-to-b from-black via-[#050505] to-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-10 md:px-8 md:py-14">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[#D4AF37]">Realizacja</p>
            <h1 className="mt-3 text-3xl font-light tracking-tight md:text-4xl">
              {item.description || "Realizacja Koziol Luxury Gates"}
            </h1>
          </div>
          <Link
            href="/galeria"
            className="inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-black/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-300 transition-all hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć
          </Link>
        </div>
      </section>

      <section className="bg-black/80">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 md:px-8 md:py-16 lg:grid-cols-2 lg:items-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-900 bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image_url} alt={item.description || "Realizacja"} className="h-full w-full object-contain" />
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 border-y border-zinc-800 py-6">
              {item.description != null && String(item.description).trim() !== "" && (
                <div className="flex items-center gap-4">
                  <Tag className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Opis</p>
                    <p className="text-lg font-light">{item.description}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Ruler className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Wymiary</p>
                  <p className="text-lg font-light">{item.dimensions || "Na życzenie klienta"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <CircleDollarSign className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Orientacyjny koszt</p>
                  <p className="text-2xl font-mono text-[#D4AF37]">
                    {item.price != null && item.price > 0 ? formatPln(item.price) : "Na zapytanie"}
                  </p>
                </div>
              </div>

              {item.product != null && String(item.product).trim() !== "" && (
                <div className="flex items-center gap-4">
                  <Package className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Rodzaj produktu</p>
                    <p className="text-lg font-light">
                      {item.product === "brama+furtka"
                        ? "Brama i furtka"
                        : item.product === "brama"
                          ? "Brama"
                          : item.product === "furtka"
                            ? "Furtka"
                            : item.product}
                    </p>
                  </div>
                </div>
              )}

              {item.steel_type != null && String(item.steel_type).trim() !== "" && (
                <div className="flex items-center gap-4">
                  <Shield className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Stal</p>
                    <p className="text-lg font-light">{item.steel_type}</p>
                  </div>
                </div>
              )}

              {item.ral_code != null && String(item.ral_code).trim() !== "" && (
                <div className="flex items-center gap-4">
                  <Paintbrush className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Kolor RAL</p>
                    <p className="text-lg font-light">{item.ral_code}</p>
                  </div>
                </div>
              )}

              {item.paint_type != null && String(item.paint_type).trim() !== "" && (
                <div className="flex items-center gap-4">
                  <Paintbrush className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Typ malowania</p>
                    <p className="text-lg font-light">{item.paint_type}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {hasGate && (
                <Link
                  href={buildConfiguratorHref(item, "brama")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition-all hover:bg-white"
                >
                  Podobna brama
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {hasWicket && (
                <Link
                  href={buildConfiguratorHref(item, "furtka")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition-all hover:bg-white"
                >
                  Podobna furtka
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {hasGate && hasWicket && (
                <Link
                  href={buildConfiguratorHref(item, "brama", true)}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-200 transition-all hover:border-[#D4AF37] hover:text-[#D4AF37]"
                >
                  Podobna brama i furtka
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {!hasGate && !hasWicket && (
                <Link
                  href={buildConfiguratorHref(item)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition-all hover:bg-white"
                >
                  Podobna realizacja
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <MainFooter />
    </main>
  );
}

