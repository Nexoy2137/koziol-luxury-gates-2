"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, ShieldCheck, Ruler, LayoutGrid, Settings, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";

type Price = {
  id: number;
  name: string;
  category: string;
  value: number;
  max_width?: number | null;
  max_height?: number | null;
  min_width?: number | null;
  min_height?: number | null;
};

type SteelTypeOption = {
  label: string;
  price: number;
};

type RalColorOption = {
  code: string;
  name?: string;
  hex?: string;
  price: number;
};

type PaintTypeOption = {
  label: string;
  price: number;
};

type Config = {
  product: "brama" | "furtka";
  type: string;
  basePrice: number;
  width: number;
  height: number;
  material: string;
  materialPrice: number;
  steelType: string;
  steelPrice: number;
  ral: string;
  ralPrice: number;
  ralCustomCode: string;
  paintType: string;
  paintPrice: number;
};

const calculateConfigPrice = (c: Config): number => {
  const area = (c.width / 100) * (c.height / 100);
  const base = Number(c.basePrice) || 0;
  const materialPart = area * (Number(c.materialPrice) || 0);
  const extras =
    (Number(c.steelPrice) || 0) +
    (Number(c.ralPrice) || 0) +
    (Number(c.paintPrice) || 0);
  const total = base + materialPart + extras;
  return Math.round(total > 0 ? total : 0);
};

export function KonfiguratorPageClient() {
  const [loading, setLoading] = useState<boolean>(true);
  const [step, setStep] = useState<number>(1);
  const [dbPrices, setDbPrices] = useState<Price[]>([]);
  const [steelTypes, setSteelTypes] = useState<SteelTypeOption[]>([]);
  const [ralColors, setRalColors] = useState<RalColorOption[]>([]);
  const [paintTypes, setPaintTypes] = useState<PaintTypeOption[]>([]);
  const [allowOtherRal, setAllowOtherRal] = useState<boolean>(true);
  const [otherRalPrice, setOtherRalPrice] = useState<number>(0);
  const [city, setCity] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [dailyCount, setDailyCount] = useState<number>(0);
  const [cooldownMs, setCooldownMs] = useState<number>(180_000);
  const [maxLeadsPerDay, setMaxLeadsPerDay] = useState<number>(5);
  const searchParams = useSearchParams();

  const [config, setConfig] = useState<Config>({
    product: "brama",
    type: "",
    basePrice: 0,
    width: 0,
    height: 0,
    material: "",
    materialPrice: 0,
    steelType: "",
    steelPrice: 0,
    ral: "",
    ralPrice: 0,
    ralCustomCode: "",
    paintType: "",
    paintPrice: 0,
  });

  const [primaryConfig, setPrimaryConfig] = useState<Config | null>(null);
  const [secondaryConfig, setSecondaryConfig] = useState<Config | null>(null);
  const [activePairPart, setActivePairPart] = useState<"primary" | "secondary">(
    "primary"
  );
  const [askedSecondary, setAskedSecondary] = useState<boolean>(false);

  const [totalPrice, setTotalPrice] = useState(0);
  const [forcePairFromUrl, setForcePairFromUrl] = useState<boolean>(false);
  const [secondaryModelIdFromUrl, setSecondaryModelIdFromUrl] = useState<number | null>(null);

  const isPairMode = !!primaryConfig && !!secondaryConfig;

  useEffect(() => {
    if (!isPairMode) return;
    if (activePairPart === "primary") setPrimaryConfig(config);
    else setSecondaryConfig(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, isPairMode, activePairPart]);

  const persistActivePairConfig = (next: Config) => {
    if (!primaryConfig) return;
    if (activePairPart === "primary") setPrimaryConfig(next);
    else setSecondaryConfig(next);
  };

  const switchActivePairPart = (nextPart: "primary" | "secondary", nextStep?: number) => {
    if (!primaryConfig || !secondaryConfig) return;
    persistActivePairConfig(config);
    setActivePairPart(nextPart);
    setConfig(nextPart === "primary" ? primaryConfig : secondaryConfig);
    if (typeof nextStep === "number") setStep(nextStep);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tsRaw = window.localStorage.getItem("konfigurator-last-lead-ts");
    if (tsRaw) {
      const ts = Number(tsRaw);
      if (Number.isFinite(ts) && ts > 0) {
        setLastSentAt(ts);
      }
    }

    const dailyRaw = window.localStorage.getItem("konfigurator-leads-daily");
    if (dailyRaw) {
      try {
        const parsed = JSON.parse(dailyRaw) as { date: string; count: number };
        const today = new Date().toISOString().slice(0, 10);
        if (parsed.date === today && Number.isFinite(parsed.count)) {
          setDailyCount(parsed.count);
        }
      } catch {
        // ignore invalid value
      }
    }
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("key", "anti_spam_config")
        .maybeSingle();
      if (error) {
        console.warn("Błąd pobierania ustawień anty-spam:", error.message);
        return;
      }
      if (data && (data as any).value) {
        const cfg = (data as any).value as { delaySec?: number; maxPerDay?: number };
        if (typeof cfg.delaySec === "number" && cfg.delaySec > 0) {
          setCooldownMs(cfg.delaySec * 1000);
        }
        if (typeof cfg.maxPerDay === "number" && cfg.maxPerDay > 0) {
          setMaxLeadsPerDay(cfg.maxPerDay);
        }
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const loadConfiguratorOptions = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("key", "configurator_options")
        .maybeSingle();

      if (error) {
        console.warn("Błąd pobierania opcji konfiguratora:", error.message);
        return;
      }

      const value = (data as any)?.value as
        | {
            steelTypes?: (string | { label: string; price?: number })[];
            ralColors?: {
              code: string;
              name?: string;
              hex?: string;
              price?: number;
            }[];
            paintTypes?: { label: string; price?: number }[];
            allowOtherRal?: boolean;
            otherRalPrice?: number;
          }
        | undefined;

      const defaultSteel: SteelTypeOption[] = [
        { label: "S235", price: 0 },
        { label: "S355", price: 0 },
        { label: "Ocynk + malowanie proszkowe", price: 0 },
      ];
      const defaultRal: RalColorOption[] = [
        { code: "RAL 9005", name: "Czarny głęboki", hex: "#0A0A0A", price: 0 },
        { code: "RAL 7016", name: "Antracyt", hex: "#383E42", price: 0 },
        { code: "RAL 7021", name: "Czarny szary", hex: "#1F2326", price: 0 },
        { code: "RAL 7035", name: "Jasny szary", hex: "#CBD0D3", price: 0 },
        { code: "RAL 8017", name: "Brąz czekoladowy", hex: "#4E3B31", price: 0 },
        { code: "RAL 9006", name: "Aluminium białe", hex: "#A5A8A6", price: 0 },
        { code: "RAL 9016", name: "Biały", hex: "#F6F6F6", price: 0 },
      ];
      const defaultPaint: PaintTypeOption[] = [
        { label: "Standard (mat)", price: 0 },
        { label: "Struktura drobna", price: 0 },
      ];

      const steelParsed: SteelTypeOption[] =
        value?.steelTypes?.length
          ? value.steelTypes
              .map((x) => {
                if (typeof x === "string") {
                  return { label: x, price: 0 } as SteelTypeOption;
                }
                return {
                  label: String(x.label || "").trim(),
                  price: Number(x.price) || 0,
                } as SteelTypeOption;
              })
              .filter((x) => !!x.label && x.label.trim().length >= 2)
          : defaultSteel;

      const ralParsed: RalColorOption[] =
        value?.ralColors?.length
          ? value.ralColors
              .map((x) => ({
                code: String(x.code || "").trim(),
                name: x.name ? String(x.name).trim() : undefined,
                hex: x.hex ? String(x.hex).trim() : undefined,
                price: Number(x.price) || 0,
              }))
              .filter((x) => x.code.length >= 4)
          : defaultRal;

      const paintParsed: PaintTypeOption[] =
        value?.paintTypes?.length
          ? value.paintTypes
              .map((x) => ({
                label: String(x.label || "").trim(),
                price: Number(x.price) || 0,
              }))
              .filter((x) => x.label.length >= 2)
          : defaultPaint;

      setSteelTypes(steelParsed);
      setRalColors(ralParsed);
      setPaintTypes(paintParsed);
      setAllowOtherRal(
        typeof value?.allowOtherRal === "boolean" ? value.allowOtherRal : true
      );
      setOtherRalPrice(
        typeof value?.otherRalPrice === "number" ? value.otherRalPrice : 0
      );
    };

    loadConfiguratorOptions();
  }, []);

  useEffect(() => {
    async function fetchPrices() {
      const { data, error } = await supabase.from("prices").select("*");
      if (error) {
        console.error("Błąd pobierania cen:", error);
      } else if (data) {
        const typedData = data as Price[];
        setDbPrices(typedData);
      }
      setLoading(false);
    }
    fetchPrices();
  }, []);

  useEffect(() => {
    const pair = searchParams.get("pair");
    setForcePairFromUrl(pair === "brama+furtka");
  }, [searchParams]);

  useEffect(() => {
    if (!dbPrices.length) return;

    const modelId = searchParams.get("model_id");
    const modelIdSecondary = searchParams.get("model_id_secondary");
    const materialId = searchParams.get("material_id");
    const product = searchParams.get("product");
    const steel = searchParams.get("steel");
    const ral = searchParams.get("ral");
    const paint = searchParams.get("paint");
    const pair = searchParams.get("pair");
    const prefill = searchParams.get("prefill");

    if (!modelId && !materialId && !product && !steel && !ral && !paint && !modelIdSecondary) return;

    let computed: Config | null = null;
    setConfig((prev) => {
      let updated = { ...prev };

      if (product === "furtka" || product === "brama") {
        updated.product = product;
      }

      if (modelId) {
        const modelIdNum = Number(modelId);
        const model =
          dbPrices.find((p) => p.category === "base" && p.id === modelIdNum) ??
          dbPrices.find((p) => p.category === "wicket_base" && p.id === modelIdNum);
        if (model) {
          if (model.category === "wicket_base") updated.product = "furtka";
          updated.type = model.name;
          updated.basePrice = model.value;
          const minW = model.min_width ?? 200;
          const minH = model.min_height ?? 100;
          updated.width = minW;
          updated.height = minH;
        }
      }

      if (modelIdSecondary) {
        const secondaryIdNum = Number(modelIdSecondary);
        if (Number.isFinite(secondaryIdNum)) {
          setSecondaryModelIdFromUrl(secondaryIdNum);
        }
      }

      if (materialId) {
        const materialIdNum = Number(materialId);
        const mat = dbPrices.find(
          (p) => p.category === "material" && p.id === materialIdNum
        );
        if (mat) {
          updated.material = mat.name;
          updated.materialPrice = mat.value;
        }
      }

      if (steel) {
        const label = String(steel);
        const option = steelTypes.find((s) => s.label === label);
        updated.steelType = label;
        updated.steelPrice = option ? option.price : 0;
      }
      if (ral) {
        const code = String(ral);
        const option = ralColors.find((c) => c.code === code);
        updated.ral = code;
        updated.ralPrice = option ? option.price : 0;
        updated.ralCustomCode = "";
      }
      if (paint) {
        const label = String(paint);
        const option = paintTypes.find((p) => p.label === label);
        updated.paintType = label;
        updated.paintPrice = option ? option.price : 0;
      }

      return updated;
    });

    const buildComputed = () => {
      let updated = { ...config };
      if (product === "furtka" || product === "brama") {
        updated.product = product;
      }
      if (modelId) {
        const modelIdNum = Number(modelId);
        const model =
          dbPrices.find((p) => p.category === "base" && p.id === modelIdNum) ??
          dbPrices.find((p) => p.category === "wicket_base" && p.id === modelIdNum);
        if (model) {
          if (model.category === "wicket_base") updated.product = "furtka";
          updated.type = model.name;
          updated.basePrice = model.value;
          updated.width = model.min_width ?? 200;
          updated.height = model.min_height ?? 100;
        }
      }
      if (materialId) {
        const materialIdNum = Number(materialId);
        const mat = dbPrices.find(
          (p) => p.category === "material" && p.id === materialIdNum
        );
        if (mat) {
          updated.material = mat.name;
          updated.materialPrice = mat.value;
        }
      }
      if (steel) {
        const label = String(steel);
        const option = steelTypes.find((s) => s.label === label);
        updated.steelType = label;
        updated.steelPrice = option ? option.price : 0;
      }
      if (ral) {
        const code = String(ral);
        const option = ralColors.find((c) => c.code === code);
        updated.ral = code;
        updated.ralPrice = option ? option.price : 0;
        updated.ralCustomCode = "";
      }
      if (paint) {
        const label = String(paint);
        const option = paintTypes.find((p) => p.label === label);
        updated.paintType = label;
        updated.paintPrice = option ? option.price : 0;
      }
      return updated;
    };
    computed = buildComputed();

    if (prefill === "1") {
      const c = computed ?? config;
      const hasType = !!c?.type;
      const hasMaterial = !!c?.material;
      const hasSteel = !!c?.steelType;
      const hasRal =
        !!c?.ral && !(c?.ral === "INNY" && !String(c?.ralCustomCode || "").trim());
      const hasPaint = !!c?.paintType;

      if (!hasType) setStep(1);
      else if (!hasMaterial) setStep(2);
      else if (!hasSteel) setStep(3);
      else if (!hasRal) setStep(4);
      else if (!hasPaint) setStep(5);
      else setStep(6);
    } else if (pair === "brama+furtka" && modelId) {
      setStep(6);
    } else if (modelId && materialId) {
      setStep(3);
    } else if (modelId || materialId) {
      setStep(2);
    }
  }, [dbPrices, steelTypes, ralColors, paintTypes, searchParams]);

  useEffect(() => {
    setTotalPrice(calculateConfigPrice(config));
  }, [config]);

  const normalizePolishPhone = (input: string) => {
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("0048") && digits.length === 13) digits = digits.slice(4);
    if (digits.startsWith("48") && digits.length === 11) digits = digits.slice(2);
    return digits;
  };

  const persistAndInsertLead = async () => {
    const cityTrimmed = city.trim();
    const postalTrimmed = postalCode.trim();

    if (!cityTrimmed || cityTrimmed.length < 2 || /\d/.test(cityTrimmed)) {
      alert("Proszę podać poprawną miejscowość (bez cyfr).");
      return;
    }
    if (!postalTrimmed || !/^\d{2}-\d{3}$/.test(postalTrimmed)) {
      alert("Proszę podać poprawny kod pocztowy w formacie 00-000.");
      return;
    }
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);

    if (dailyCount >= maxLeadsPerDay) {
      alert("Przekroczono maksymalną liczbę zapytań z tego urządzenia na dziś.");
      return;
    }

    if (lastSentAt && now - lastSentAt < cooldownMs) {
      alert("Za często wysyłasz zapytania. Spróbuj ponownie za kilka minut.");
      return;
    }
    const normalizedPhone = normalizePolishPhone(phone);
    if (normalizedPhone.length !== 9) {
      alert("Podaj poprawny numer telefonu (9 cyfr, może być z +48).");
      return;
    }

    if (primaryConfig && secondaryConfig) {
      persistActivePairConfig(config);
    }

    const resolvedPrimary = primaryConfig || config;
    const resolvedSecondary = primaryConfig ? (secondaryConfig || config) : null;

    const detailsPayload = resolvedSecondary
      ? { primary: resolvedPrimary, secondary: resolvedSecondary }
      : { primary: resolvedPrimary };

    const primaryTotal = calculateConfigPrice(resolvedPrimary);
    const secondaryTotal = resolvedSecondary ? calculateConfigPrice(resolvedSecondary) : 0;
    const combinedTotal = resolvedSecondary ? primaryTotal + secondaryTotal : primaryTotal;

    const { error } = await supabase.from("leads").insert([
      {
        customer_city: cityTrimmed,
        customer_postal_code: postalTrimmed,
        customer_phone: normalizedPhone,
        total_price: combinedTotal,
        details: detailsPayload,
      },
    ]);

    if (error) {
      alert("Błąd wysyłania: " + error.message);
    } else {
      alert(
        "Dziękujemy! Twoja wycena została zapisana. Oddzwonimy w ciągu 24h."
      );
      const ts = Date.now();
      setLastSentAt(ts);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "konfigurator-last-lead-ts",
          String(ts)
        );
        const nextCount = dailyCount + 1;
        setDailyCount(nextCount);
        window.localStorage.setItem(
          "konfigurator-leads-daily",
          JSON.stringify({ date: today, count: nextCount })
        );
      }
      setStep(1);
      setConfig({
        product: "brama",
        type: "",
        basePrice: 0,
        width: 0,
        height: 0,
        material: "",
        materialPrice: 0,
        steelType: "",
        steelPrice: 0,
        ral: "",
        ralPrice: 0,
        ralCustomCode: "",
        paintType: "",
        paintPrice: 0,
      });
      setPrimaryConfig(null);
      setSecondaryConfig(null);
      setActivePairPart("primary");
      setAskedSecondary(false);
      setCity("");
      setPostalCode("");
      setPhone("");
    }
  };

  const baseCategory = config.product === "furtka" ? "wicket_base" : "base";
  const activeModel = dbPrices.find(
    (p) => p.category === baseCategory && p.name === config.type
  );
  const maxWidth = activeModel?.max_width ?? 900;
  const minWidth = activeModel?.min_width ?? 200;
  const maxHeight = activeModel?.max_height ?? 250;
  const minHeight = activeModel?.min_height ?? 100;

  const handleNextStep = () => {
    if (step === 1 && !config.type) {
      alert(`Najpierw wybierz model ${config.product === "furtka" ? "furtki" : "bramy"}.`);
      return;
    }
    if (step === 2 && !config.material) {
      alert("Najpierw wybierz materiał / wypełnienie.");
      return;
    }
    if (step === 3 && !config.steelType) {
      alert("Najpierw wybierz typ stali / zabezpieczenia.");
      return;
    }
    if (step === 4) {
      if (!config.ral) {
        alert("Najpierw wybierz kolor z palety RAL.");
        return;
      }
      if (config.ral === "INNY" && !config.ralCustomCode.trim()) {
        alert("Podaj kod koloru RAL przy opcji „Inny kolor RAL”.");
        return;
      }
    }
    if (step === 5 && !config.paintType) {
      alert("Najpierw wybierz typ malowania.");
      return;
    }
    if (step === 6 && (!config.width || !config.height)) {
      alert(`Ustaw szerokość i wysokość ${config.product === "furtka" ? "furtki" : "bramy"}.`);
      return;
    }

    if (step === 6) {
      if (!primaryConfig && !askedSecondary) {
        setAskedSecondary(true);
        const otherLabel = config.product === "furtka" ? "bramę" : "furtkę";
        const wants = forcePairFromUrl
          ? true
          : window.confirm(
              `Czy chcesz od razu skonfigurować także ${otherLabel}?`
            );
        if (wants) {
          setPrimaryConfig(config);
          const nextProduct = config.product === "brama" ? "furtka" : "brama";

          const copyDetails = forcePairFromUrl
            ? true
            : window.confirm(
                `Czy skopiować materiał, typ stali, kolor RAL i typ malowania z pierwszej konfiguracji do ${nextProduct === "furtka" ? "furtki" : "bramy"}?`
              );

          const baseForCopy = copyDetails ? config : undefined;

          let nextType = "";
          let nextBasePrice = 0;
          let nextWidth = 0;
          let nextHeight = 0;
          if (forcePairFromUrl && secondaryModelIdFromUrl && dbPrices.length) {
            const model = dbPrices.find((p) => p.id === secondaryModelIdFromUrl);
            if (model) {
              nextType = model.name;
              nextBasePrice = model.value;
              nextWidth = model.min_width ?? 200;
              nextHeight = model.min_height ?? 100;
            }
          }

          const nextConfig: Config = {
            product: nextProduct,
            type: nextType,
            basePrice: nextBasePrice,
            width: nextWidth,
            height: nextHeight,
            material: baseForCopy?.material || "",
            materialPrice: baseForCopy?.materialPrice || 0,
            steelType: baseForCopy?.steelType || "",
            steelPrice: baseForCopy?.steelPrice || 0,
            ral: baseForCopy?.ral || "",
            ralPrice: baseForCopy?.ralPrice || 0,
            ralCustomCode: baseForCopy?.ralCustomCode || "",
            paintType: baseForCopy?.paintType || "",
            paintPrice: baseForCopy?.paintPrice || 0,
          };
          setSecondaryConfig(nextConfig);
          setActivePairPart("secondary");
          setConfig(nextConfig);
          if (forcePairFromUrl) {
            setForcePairFromUrl(false);
          }
          setStep(forcePairFromUrl ? 6 : 1);
          return;
        }

        setStep(7);
        return;
      }

      if (primaryConfig && secondaryConfig) {
        if (activePairPart === "primary") {
          switchActivePairPart("secondary", 6);
          return;
        }
        setStep(7);
        return;
      }
    }

    if (step < 7) {
      setStep(step + 1);
    } else {
      void persistAndInsertLead();
    }
  };

  const handlePrevStep = () => {
    if (step <= 1) return;
    setStep(step - 1);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <MainHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
        </div>
        <MainFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans">
      <MainHeader />

      <section className="border-b border-zinc-900 bg-gradient-to-b from-black via-[#050505] to-black">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-6 pt-10 md:px-8 md:pb-10 md:pt-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Konfigurator online
          </p>
          <h1 className="max-w-2xl text-3xl font-light tracking-tight md:text-4xl">
            Wycena Twojej bramy lub furtki w mniej niż 2 minuty
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400 md:text-base">
            Przejdź przez kilka krótkich kroków – wybierz model, wypełnienie,
            typ stali, kolor RAL, wymiary i zostaw numer telefonu. Na tej
            podstawie przygotujemy dla Ciebie wstępny projekt i ofertę.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-8 lg:col-span-2">
            <div className="mb-10 flex items-center gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    step >= s ? "bg-[#D4AF37]" : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>

            {step === 1 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="mb-8 flex items-center gap-3 text-2xl font-light italic md:text-3xl">
                  <Box className="text-[#D4AF37]" /> Wybierz bazę projektu
                </h2>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                    Konfigurujesz:
                  </span>

                  {isPairMode ? (
                    <span className="rounded-full border border-zinc-800 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]">
                      {activePairPart === "primary"
                        ? `Pierwszy element — ${config.product}`
                        : `Drugi element — ${config.product}`}
                    </span>
                  ) : (
                    <div className="flex rounded-full border border-zinc-800 bg-black/40 p-1">
                      <button
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            product: "brama",
                            type: "",
                            basePrice: 0,
                            width: 0,
                            height: 0,
                            material: "",
                            materialPrice: 0,
                            steelType: "",
                            steelPrice: 0,
                            ral: "",
                            ralPrice: 0,
                            ralCustomCode: "",
                            paintType: "",
                            paintPrice: 0,
                          }))
                        }
                        className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition-all ${
                          config.product === "brama"
                            ? "bg-[#D4AF37] text-black"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Brama
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            product: "furtka",
                            type: "",
                            basePrice: 0,
                            width: 0,
                            height: 0,
                            material: "",
                            materialPrice: 0,
                            steelType: "",
                            steelPrice: 0,
                            ral: "",
                            ralPrice: 0,
                            ralCustomCode: "",
                            paintType: "",
                            paintPrice: 0,
                          }))
                        }
                        className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition-all ${
                          config.product === "furtka"
                            ? "bg-[#D4AF37] text-black"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Furtka
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {dbPrices
                    .filter((p) => p.category === baseCategory)
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const minW = item.min_width ?? 200;
                          const minH = item.min_height ?? 100;
                          setConfig({
                            ...config,
                            type: item.name,
                            basePrice: item.value,
                            width: minW,
                            height: minH,
                          });
                        }}
                        className={`border p-6 text-left transition-all ${
                          config.type === item.name
                            ? "border-[#D4AF37] bg-zinc-900"
                            : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        <span className="mb-2 block text-[10px] uppercase text-zinc-500">
                          Model Premium
                        </span>
                        <span className="text-xl font-medium tracking-tight">
                          {item.name}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="mb-8 flex items-center gap-3 text-2xl font-light italic md:text-3xl">
                  <LayoutGrid className="text-[#D4AF37]" /> Wybierz wypełnienie
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {dbPrices
                    .filter((p) => p.category === "material")
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          setConfig({
                            ...config,
                            material: item.name,
                            materialPrice: item.value,
                          })
                        }
                        className={`border p-6 text-left transition-all ${
                          config.material === item.name
                            ? "border-[#D4AF37] bg-zinc-900"
                            : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        <span className="mb-2 block text-[10px] uppercase text-zinc-500">
                          Materiał
                        </span>
                        <span className="text-xl font-medium tracking-tight">
                          {item.name}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="mb-8 flex items-center gap-3 text-2xl font-light italic md:text-3xl">
                  <LayoutGrid className="text-[#D4AF37]" /> Wybierz typ stali
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {(steelTypes.length ? steelTypes : [{ label: "Stal (opcja)", price: 0 }]).map(
                    (item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, steelType: item.label }))
                        }
                        className={`border p-6 text-left transition-all ${
                          config.steelType === item.label
                            ? "border-[#D4AF37] bg-zinc-900"
                            : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        <span className="mb-2 block text-[10px] uppercase text-zinc-500">
                          Typ stali / zabezpieczenia
                        </span>
                        <span className="text-xl font-medium tracking-tight">
                          {item.label}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="mb-8 flex items-center gap-3 text-2xl font-light italic md:text-3xl">
                  <LayoutGrid className="text-[#D4AF37]" /> Wybierz kolor RAL
                </h2>
                <p className="mb-5 text-xs text-zinc-400">
                  Wszystkie kolory RAL znajdziesz na stronie{" "}
                  <a
                    href="https://www.ral-farben.de/en/all-ral-colours"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#D4AF37]"
                  >
                    oficjalnego wzornika RAL
                  </a>
                  . Wybierz jeden z poniższych kolorów lub, jeśli potrzebujesz innego,
                  skorzystaj z opcji „Inny kolor RAL”.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {(ralColors.length
                    ? ralColors
                    : [{ code: "RAL 9005", name: "Czarny", hex: "#0A0A0A", price: 0 }]
                  ).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          ral: c.code,
                          ralPrice: c.price,
                          ralCustomCode: "",
                        }))
                      }
                      className={`group relative overflow-hidden border p-4 text-left transition-all ${
                        config.ral === c.code
                          ? "border-[#D4AF37] bg-zinc-900"
                          : "border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <span
                          className="h-8 w-8 rounded-full border border-zinc-700"
                          style={{ background: c.hex || "#111" }}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-[11px] font-semibold tracking-wide text-white">
                            {c.code}
                          </div>
                          <div className="truncate text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                            {c.name || "Kolor"}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-300">
                        Wybierz
                      </div>
                    </button>
                  ))}
                </div>
                {allowOtherRal && (
                  <div className="mt-6 border border-dashed border-zinc-800 bg-black/40 p-4 text-left">
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          ral: "INNY",
                          ralPrice: otherRalPrice,
                        }))
                      }
                      className={`mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.25em] ${
                        config.ral === "INNY"
                          ? "bg-[#D4AF37] text-black"
                          : "bg-zinc-900 text-zinc-300"
                      }`}
                    >
                      Inny kolor RAL (do wpisania)
                    </button>
                    <div className="space-y-2 text-xs text-zinc-400">
                      <p>
                        Wpisz dokładny kod koloru RAL (np. <span className="font-mono">RAL 7024</span>),
                        który wybrałeś z wzornika.
                      </p>
                      <input
                        type="text"
                        value={config.ralCustomCode}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ral: "INNY",
                            ralPrice: otherRalPrice,
                            ralCustomCode: e.target.value,
                          }))
                        }
                        placeholder="Np. RAL 7024"
                        className="mt-1 w-full border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-100 outline-none transition-all focus:border-[#D4AF37]"
                      />
                      {otherRalPrice !== 0 && (
                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                          Dodatkowa dopłata za niestandardowy kolor:{" "}
                          <span className="text-[#D4AF37]">
                            {otherRalPrice.toLocaleString()} PLN
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="mb-8 flex items-center gap-3 text-2xl font-light italic md:text-3xl">
                  <LayoutGrid className="text-[#D4AF37]" /> Wybierz typ malowania
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {(paintTypes.length
                    ? paintTypes
                    : [{ label: "Standard (mat)", price: 0 }]
                  ).map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          paintType: item.label,
                          paintPrice: item.price,
                        }))
                      }
                      className={`border p-6 text-left transition-all ${
                        config.paintType === item.label
                          ? "border-[#D4AF37] bg-zinc-900"
                          : "border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <span className="mb-2 block text-[10px] uppercase text-zinc-500">
                        Typ malowania
                      </span>
                      <div className="flex items-end justify-between gap-3">
                        <span className="text-xl font-medium tracking-tight">
                          {item.label}
                        </span>
                        {item.price !== 0 && (
                          <span className="text-xs font-semibold text-[#D4AF37]">
                            + {item.price.toLocaleString()} PLN
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="mb-3 flex items-center gap-3 text-2xl font-light italic md:text-3xl">
                  <Ruler className="text-[#D4AF37]" />{" "}
                  {primaryConfig
                    ? `Dopasuj wymiary ${config.product === "furtka" ? "furtki" : "bramy"} (2/2)`
                    : `Dopasuj wymiary ${config.product === "furtka" ? "furtki" : "bramy"}`}
                </h2>
                {primaryConfig && (
                  <p className="mb-6 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Najpierw ustawiłeś wymiary pierwszego elementu. Teraz podaj wymiary{" "}
                    {config.product === "furtka" ? "furtki" : "bramy"}.
                  </p>
                )}
                <div className="space-y-10 border border-zinc-900 bg-zinc-900/20 p-8">
                  <div>
                    <label className="mb-4 flex justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Szerokość{" "}
                      <span className="text-zinc-300">{config.width} cm</span>
                    </label>
                    <input
                      type="range"
                      min={minWidth}
                      max={maxWidth}
                      step="5"
                      value={config.width}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          width: parseInt(e.target.value),
                        })
                      }
                      className="h-1 w-full cursor-pointer appearance-none bg-zinc-800 accent-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="mb-4 flex justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Wysokość{" "}
                      <span className="text-zinc-300">{config.height} cm</span>
                    </label>
                    <input
                      type="range"
                      min={minHeight}
                      max={maxHeight}
                      step="5"
                      value={config.height}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          height: parseInt(e.target.value),
                        })
                      }
                      className="h-1 w-full cursor-pointer appearance-none bg-zinc-800 accent-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="mb-8 flex items-center gap-3 text-2xl font-light italic md:text-3xl">
                  <ShieldCheck className="text-[#D4AF37]" /> Ostatni krok
                </h2>
                <div className="border border-[#D4AF37]/30 bg-zinc-900/40 p-8 text-center space-y-4">
                  <p className="mb-2 text-sm italic text-zinc-400">
                    Podaj dane kontaktowe. Nasz doradca przygotuje finalny projekt,
                    sprawdzi warunki montażowe i oddzwoni z propozycją terminu.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2 text-left">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Miejscowość
                      </label>
                      <input
                        type="text"
                        placeholder="Np. Wrocław"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border border-zinc-800 bg-black p-3 text-sm text-zinc-100 outline-none transition-all focus:border-[#D4AF37]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Kod pocztowy
                      </label>
                      <input
                        type="text"
                        placeholder="00-000"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full border border-zinc-800 bg-black p-3 text-sm text-zinc-100 outline-none transition-all focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Numer telefonu
                    </label>
                    <input
                      type="tel"
                      placeholder="Wpisz numer telefonu"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full max-w-xs border border-zinc-800 bg-black p-4 text-center text-xl text-[#D4AF37] outline-none transition-all focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 border-t border-zinc-900/50 pt-8">
              {step > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="px-8 py-3 text-xs uppercase tracking-widest text-zinc-400 transition-all border border-zinc-800 hover:bg-zinc-900"
                >
                  Wstecz
                </button>
              )}

              <button
                onClick={handleNextStep}
                className="ml-auto px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all hover:bg-white"
              >
                {step === 7 ? "Wyślij zapytanie" : "Następny krok"}
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-32 lg:h-fit">
            <div className="relative border border-[#D4AF37]/25 bg-[#050505] p-8 shadow-2xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.16),_transparent_55%)]" />
              <div className="absolute right-0 top-0 p-4 opacity-[0.04]">
                <ShieldCheck size={120} />
              </div>
              <div className="relative space-y-8">
                <h4 className="border-b border-[#D4AF37]/25 pb-4 text-[10px] uppercase tracking-[0.4em] text-[#D4AF37]">
                  Twoja konfiguracja
                </h4>

                {config.type || config.material || (config.width && config.height) ? (
                  <>
                    {primaryConfig && secondaryConfig ? (
                      <>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500">
                              Pierwszy element ({primaryConfig.product})
                            </p>
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => switchActivePairPart("primary", 1)}
                                className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                              >
                                <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                  Baza
                                </span>
                                <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                <span className="text-sm">{primaryConfig.type}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => switchActivePairPart("primary", 6)}
                                className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                              >
                                <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                  Wymiar
                                </span>
                                <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                <span className="text-sm">
                                  {primaryConfig.width}×{primaryConfig.height} cm
                                </span>
                              </button>
                              {primaryConfig.material && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("primary", 2)}
                                  className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                                >
                                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Wypełnienie
                                  </span>
                                  <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                  <span className="text-sm">{primaryConfig.material}</span>
                                </button>
                              )}
                              {primaryConfig.steelType && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("primary", 3)}
                                  className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                                >
                                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Stal
                                  </span>
                                  <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                  <span className="text-sm">{primaryConfig.steelType}</span>
                                </button>
                              )}
                              {primaryConfig.ral && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("primary", 4)}
                                  className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                                >
                                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Kolor
                                  </span>
                                  <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                  <span className="text-sm">
                                    {primaryConfig.ral === "INNY" && primaryConfig.ralCustomCode
                                      ? primaryConfig.ralCustomCode
                                      : primaryConfig.ral}
                                  </span>
                                </button>
                              )}
                              {primaryConfig.paintType && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("primary", 5)}
                                  className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                                >
                                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Malowanie
                                  </span>
                                  <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                  <span className="text-sm">{primaryConfig.paintType}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 pt-4 border-t border-zinc-900/60">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500">
                              Drugi element ({secondaryConfig.product})
                            </p>
                            <div className="space-y-2">
                              {secondaryConfig.type && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("secondary", 1)}
                                  className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                                >
                                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Baza
                                  </span>
                                  <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                  <span className="text-sm">{secondaryConfig.type}</span>
                                </button>
                              )}
                              {secondaryConfig.width > 0 && secondaryConfig.height > 0 && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("secondary", 6)}
                                  className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                                >
                                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Wymiar
                                  </span>
                                  <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                  <span className="text-sm">
                                    {secondaryConfig.width}×{secondaryConfig.height} cm
                                  </span>
                                </button>
                              )}
                              {secondaryConfig.material && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("secondary", 2)}
                                  className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                                >
                                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Wypełnienie
                                  </span>
                                  <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                  <span className="text-sm">{secondaryConfig.material}</span>
                                </button>
                              )}
                              {secondaryConfig.steelType && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("secondary", 3)}
                                  className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                                >
                                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Stal
                                  </span>
                                  <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                  <span className="text-sm">{secondaryConfig.steelType}</span>
                                </button>
                              )}
                              {secondaryConfig.ral && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("secondary", 4)}
                                  className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                                >
                                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Kolor
                                  </span>
                                  <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                  <span className="text-sm">
                                    {secondaryConfig.ral === "INNY" && secondaryConfig.ralCustomCode
                                      ? secondaryConfig.ralCustomCode
                                      : secondaryConfig.ral}
                                  </span>
                                </button>
                              )}
                              {secondaryConfig.paintType && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("secondary", 5)}
                                  className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                                >
                                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Malowanie
                                  </span>
                                  <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                                  <span className="text-sm">{secondaryConfig.paintType}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 pt-4">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                            Szacowany koszt łącznie (brama + furtka)
                          </span>
                          <div className="text-5xl font-light tracking-tighter text-[#D4AF37]">
                            {(calculateConfigPrice(primaryConfig) + calculateConfigPrice(secondaryConfig || config)).toLocaleString()}{" "}
                            <span className="text-xs text-zinc-500">PLN</span>
                          </div>
                          <p className="pt-2 text-[10px] text-zinc-500">
                            Ostateczna oferta zależy m.in. od warunków montażu,
                            automatyki oraz wybranego wykończenia.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-5">
                          {config.type && (
                            <button
                              type="button"
                              onClick={() => setStep(1)}
                              className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                            >
                              <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                Baza ({config.product})
                              </span>
                              <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                              <span className="text-sm">{config.type}</span>
                            </button>
                          )}
                          {config.width > 0 && config.height > 0 && (
                            <button
                              type="button"
                              onClick={() => setStep(6)}
                              className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                            >
                              <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                Wymiar
                              </span>
                              <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                              <span className="text-sm">
                                {config.width}×{config.height} cm
                              </span>
                            </button>
                          )}
                          {config.material && (
                            <button
                              type="button"
                              onClick={() => setStep(2)}
                              className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                            >
                              <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                Wypełnienie
                              </span>
                              <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                              <span className="text-sm">{config.material}</span>
                            </button>
                          )}
                          {config.steelType && (
                            <button
                              type="button"
                              onClick={() => setStep(3)}
                              className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                            >
                              <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                Stal
                              </span>
                              <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                              <span className="text-sm">{config.steelType}</span>
                            </button>
                          )}
                          {config.ral && (
                            <button
                              type="button"
                              onClick={() => setStep(4)}
                              className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                            >
                              <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                Kolor
                              </span>
                              <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                              <span className="text-sm">
                                {config.ral === "INNY" && config.ralCustomCode
                                  ? config.ralCustomCode
                                  : config.ral}
                              </span>
                            </button>
                          )}
                          {config.paintType && (
                            <button
                              type="button"
                              onClick={() => setStep(5)}
                              className="flex w-full items-end justify-between text-left transition-colors hover:text-[#D4AF37]"
                            >
                              <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                Malowanie
                              </span>
                              <span className="mx-4 mb-1 flex-1 border-b border-dotted border-zinc-800 text-sm font-light" />
                              <span className="text-sm">{config.paintType}</span>
                            </button>
                          )}
                        </div>

                        {config.type &&
                        config.material &&
                        config.steelType &&
                        config.ral &&
                        config.paintType &&
                        config.width > 0 &&
                        config.height > 0 ? (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                              Szacowany koszt
                            </span>
                            <div className="text-5xl font-light tracking-tighter text-[#D4AF37]">
                              {totalPrice.toLocaleString()}{" "}
                              <span className="text-xs text-zinc-500">PLN</span>
                            </div>
                            <p className="pt-2 text-[10px] text-zinc-500">
                              Ostateczna oferta zależy m.in. od warunków montażu,
                              automatyki oraz wybranego wykończenia.
                            </p>
                          </div>
                        ) : (
                          <p className="pt-2 text-[10px] text-zinc-500">
                            Uzupełnij kolejne kroki konfiguratora, aby zobaczyć
                            podsumowanie i wycenę.
                          </p>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <p className="pt-2 text-[10px] text-zinc-500">
                    Zacznij od wyboru modelu bramy. Podsumowanie pojawi się po
                    rozpoczęciu konfiguracji.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900 bg-black/70">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 text-sm text-zinc-400 md:px-8 md:py-12">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            <Settings className="h-4 w-4 text-[#D4AF37]" />
            Jak działamy dalej?
          </div>
          <p>
            Po otrzymaniu konfiguracji kontaktujemy się z Tobą telefonicznie,
            doprecyzowujemy szczegóły techniczne, a następnie przygotowujemy
            wizualizację i ofertę dopasowaną do Twojej inwestycji.
          </p>
        </div>
      </section>

      <MainFooter />
    </main>
  );
}

