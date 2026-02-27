"use client";

import React, { useEffect, useRef, useState } from "react";
import { getRalDisplayColor, ralCodeToNamePl } from "@/lib/ralColors";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Box, ShieldCheck, Ruler, LayoutGrid, Settings, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
import { useToast } from "@/context/ToastContext";
import { ConfigSuccessOverlay } from "@/components/ui/ConfigSuccessOverlay";

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
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showReviewOverlay, setShowReviewOverlay] = useState(false);
  const searchParams = useSearchParams();
  const toast = useToast();

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

  // Price flash animation — refs + effect declared here, before all other effects
  const priceRef = useRef<HTMLDivElement>(null);
  const prevPrice = useRef(0);
  useEffect(() => {
    if (totalPrice !== prevPrice.current && priceRef.current) {
      priceRef.current.animate(
        [
          { color: "#D4AF37", transform: "scale(1)" },
          { color: "#fff",    transform: "scale(1.06)" },
          { color: "#D4AF37", transform: "scale(1)" },
        ],
        { duration: 500, easing: "ease-out" }
      );
      prevPrice.current = totalPrice;
    }
  }, [totalPrice]);

  const isPairMode = !!primaryConfig && !!secondaryConfig;

  useEffect(() => {
    if (!isPairMode) return;
    if (activePairPart === "primary") setPrimaryConfig(config);
    else setSecondaryConfig(config);
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
      const row = data as { value?: unknown } | null;
      if (row?.value) {
        const cfg = row.value as { delaySec?: number; maxPerDay?: number };
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

      const row = data as { value?: unknown } | null;
      const value = row?.value as
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
        { code: "RAL 9005", name: "Czarny głęboki", price: 0 },
        { code: "RAL 7016", name: "Antracyt", price: 0 },
        { code: "RAL 7021", name: "Czarny szary", price: 0 },
        { code: "RAL 7035", name: "Jasny szary", price: 0 },
        { code: "RAL 8017", name: "Brąz czekoladowy", price: 0 },
        { code: "RAL 9006", name: "Aluminium białe", price: 0 },
        { code: "RAL 9016", name: "Biały", price: 0 },
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
      const updated = { ...prev };

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
      const updated = { ...config };
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
      await toast.showAlert("Proszę podać poprawną miejscowość (bez cyfr).");
      return;
    }
    if (!postalTrimmed || !/^\d{2}-\d{3}$/.test(postalTrimmed)) {
      await toast.showAlert("Proszę podać poprawny kod pocztowy w formacie 00-000.");
      return;
    }

    const normalizedPhone = normalizePolishPhone(phone);
    if (normalizedPhone.length !== 9) {
      await toast.showAlert("Podaj poprawny numer telefonu (9 cyfr, może być z +48).");
      return;
    }

    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);

    // ── Opcjonalne IP urządzenia (do backendowego limitu per IP) ──────────
    let clientIp: string | null = null;
    try {
      if (typeof window !== "undefined" && "fetch" in window) {
        const res = await fetch("https://api.ipify.org?format=json");
        if (res.ok) {
          const data = (await res.json()) as { ip?: string };
          if (data.ip && typeof data.ip === "string") {
            clientIp = data.ip;
          }
        }
      }
    } catch (e) {
      console.warn("Nie udało się pobrać adresu IP użytkownika:", e);
    }

    // ── Limit per urządzenie / przeglądarka (localStorage) ────────────────
    if (dailyCount >= maxLeadsPerDay) {
      await toast.showAlert("Przekroczono maksymalną liczbę zapytań z tego urządzenia na dziś.");
      return;
    }

    if (lastSentAt && now - lastSentAt < cooldownMs) {
      await toast.showAlert("Za często wysyłasz zapytania. Spróbuj ponownie za kilka minut.");
      return;
    }

    // ── Limit per numer telefonu + (jeśli dostępne) per IP (backend) ─────
    try {
      const { data: phoneLeads, error: phoneErr } = await supabase
        .from("leads")
        .select("created_at")
        .eq("customer_phone", normalizedPhone)
        .gte("created_at", `${today}T00:00:00.000Z`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!phoneErr && phoneLeads) {
        const phoneDailyCount = phoneLeads.length;
        if (phoneDailyCount >= maxLeadsPerDay) {
          await toast.showAlert("Przekroczono maksymalną liczbę zapytań z tego numeru telefonu na dziś.");
          return;
        }
        const lastLead = phoneLeads[0] as { created_at?: string } | undefined;
        if (lastLead?.created_at) {
          const lastPhoneTs = new Date(lastLead.created_at).getTime();
          if (Number.isFinite(lastPhoneTs) && now - lastPhoneTs < cooldownMs) {
            await toast.showAlert("Za często wysyłasz zapytania z tego numeru. Spróbuj ponownie za kilka minut.");
            return;
          }
        }
      }

      if (clientIp) {
        const { data: ipLeads, error: ipErr } = await supabase
          .from("leads")
          .select("created_at")
          .eq("client_ip", clientIp)
          .gte("created_at", `${today}T00:00:00.000Z`)
          .order("created_at", { ascending: false })
          .limit(20);

        if (!ipErr && ipLeads) {
          const ipDailyCount = ipLeads.length;
          if (ipDailyCount >= maxLeadsPerDay) {
            await toast.showAlert("Przekroczono maksymalną liczbę zapytań z tego urządzenia na dziś (adres IP).");
            return;
          }
          const lastIpLead = ipLeads[0] as { created_at?: string } | undefined;
          if (lastIpLead?.created_at) {
            const lastIpTs = new Date(lastIpLead.created_at).getTime();
            if (Number.isFinite(lastIpTs) && now - lastIpTs < cooldownMs) {
              await toast.showAlert("Za często wysyłasz zapytania z tego urządzenia. Spróbuj ponownie za kilka minut.");
              return;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Błąd sprawdzania limitów anty-spam (telefon/IP):", e);
      // W razie błędu nie blokujemy wysyłki, żeby nie psuć UX
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
        client_ip: clientIp,
        total_price: combinedTotal,
        details: detailsPayload,
      },
    ]);

    if (error) {
      await toast.showAlert("Błąd wysyłania: " + error.message);
    } else {
      setShowSuccessOverlay(true);
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

  const previewConfig =
    primaryConfig && secondaryConfig
      ? activePairPart === "primary"
        ? primaryConfig
        : secondaryConfig
      : config;

  const previewBaseCategory =
    previewConfig.product === "furtka" ? "wicket_base" : "base";

  const previewBase = dbPrices.find(
    (p) => p.category === previewBaseCategory && p.name === previewConfig.type
  );

  const previewMaterial = dbPrices.find(
    (p) => p.category === "material" && p.name === previewConfig.material
  );

  const previewBaseImageUrl =
    (previewBase as any)?.image_url &&
    typeof (previewBase as any).image_url === "string"
      ? (previewBase as any).image_url
      : null;

  const previewMaterialImageUrl =
    (previewMaterial as any)?.image_url &&
    typeof (previewMaterial as any).image_url === "string"
      ? (previewMaterial as any).image_url
      : null;

  const getPreviewForConfig = (c: Config | null) => {
    if (!c) return null;
    const cat = c.product === "furtka" ? "wicket_base" : "base";
    const base = dbPrices.find(
      (p) => p.category === cat && p.name === c.type
    ) as any | undefined;
    const material = dbPrices.find(
      (p) => p.category === "material" && p.name === c.material
    ) as any | undefined;
    const baseUrl =
      base && typeof base.image_url === "string" ? base.image_url : null;
    const materialUrl =
      material && typeof material.image_url === "string"
        ? material.image_url
        : null;
    return { config: c, baseUrl, materialUrl };
  };

  useEffect(() => {
    if (!showReviewOverlay) return;
    if (typeof window === "undefined") return;

    // Mobile/iOS: bez animacji, żeby na pewno wskoczyć na górę,
    // plus blokada scrolla na <body> i <html>
    window.scrollTo(0, 0);
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [showReviewOverlay]);

  const handleNextStep = async () => {
    if (step === 1 && !config.type) {
      await toast.showAlert(`Najpierw wybierz model ${config.product === "furtka" ? "furtki" : "bramy"}.`);
      return;
    }
    if (step === 2 && !config.material) {
      await toast.showAlert("Najpierw wybierz materiał / wypełnienie.");
      return;
    }
    if (step === 3 && !config.steelType) {
      await toast.showAlert("Najpierw wybierz typ stali / zabezpieczenia.");
      return;
    }
    if (step === 4) {
      if (!config.ral) {
        await toast.showAlert("Najpierw wybierz kolor z palety RAL.");
        return;
      }
      if (config.ral === "INNY" && !config.ralCustomCode.trim()) {
        await toast.showAlert("Podaj kod koloru RAL przy opcji „Inny kolor RAL”.");
        return;
      }
    }
    if (step === 5 && !config.paintType) {
      await toast.showAlert("Najpierw wybierz typ malowania.");
      return;
    }
    if (step === 6 && (!config.width || !config.height)) {
      await toast.showAlert(`Ustaw szerokość i wysokość ${config.product === "furtka" ? "furtki" : "bramy"}.`);
      return;
    }

    if (step === 6) {
      if (!primaryConfig && !askedSecondary) {
        setAskedSecondary(true);
        const otherLabel = config.product === "furtka" ? "bramę" : "furtkę";
        const wants = forcePairFromUrl
          ? true
          : await toast.showConfirm(`Czy chcesz od razu skonfigurować także ${otherLabel}?`);
        if (wants) {
          setPrimaryConfig(config);
          const nextProduct = config.product === "brama" ? "furtka" : "brama";

          const copyDetails = forcePairFromUrl
            ? true
            : await toast.showConfirm(
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
      return;
    }

    if (step === 7) {
      const cityTrimmed = city.trim();
      const postalTrimmed = postalCode.trim();

      if (!cityTrimmed || cityTrimmed.length < 2 || /\d/.test(cityTrimmed)) {
        await toast.showAlert("Proszę podać poprawną miejscowość (bez cyfr).");
        return;
      }
      if (!postalTrimmed || !/^\d{2}-\d{3}$/.test(postalTrimmed)) {
        await toast.showAlert("Proszę podać poprawny kod pocztowy w formacie 00-000.");
        return;
      }
      const normalizedPhone = normalizePolishPhone(phone);
      if (normalizedPhone.length !== 9) {
        await toast.showAlert("Podaj poprawny numer telefonu (9 cyfr, może być z +48).");
        return;
      }
    }

    setShowReviewOverlay(true);
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
    <main className="min-h-screen bg-[#050505] text-white font-sans" style={{ animation: "fadeInUp 0.65s ease both" }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .konfig-step-enter { animation: slideDown 0.35s ease both; }
        .konfig-main-layout { display:grid; grid-template-columns:1fr; gap:40px; }
        @media(min-width:1024px){
          .konfig-main-layout { grid-template-columns:minmax(0,1fr) minmax(400px,460px); gap:56px; }
        }
        .konfig-options-grid { display:grid; grid-template-columns:1fr; gap:10px; }
        @media(min-width:640px){ .konfig-options-grid { grid-template-columns:1fr 1fr; } }
        @media(min-width:900px){ .konfig-options-grid { grid-template-columns:repeat(3,1fr); } }
        .konfig-input:focus { border-color: rgba(212,175,55,0.7) !important; }
        .konfig-option-btn {
          padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(63,63,70,0.8);
          background: rgba(9,9,11,0.7); text-align:left; cursor:pointer;
          transition: all 0.2s; color:#a1a1aa; width:100%;
        }
        .konfig-option-btn:hover { border-color: rgba(212,175,55,0.4); color:#fff; }
        .konfig-option-btn.selected { border-color:#D4AF37; background:rgba(212,175,55,0.08); color:#fff; }
        /* ── Option cards (model, material, steel, paint) ── */
        .kopt {
          display:block; width:100%; padding:20px 22px; border-radius:14px;
          border:1px solid rgba(63,63,70,0.8); background:rgba(9,9,11,0.7);
          text-align:left; cursor:pointer; transition:all 0.18s; color:#a1a1aa;
        }
        .kopt:hover { border-color:rgba(212,175,55,0.35); background:rgba(9,9,11,0.95); color:#fff; transform:translateY(-1px); }
        .kopt.sel { border-color:#D4AF37; background:rgba(212,175,55,0.06); color:#fff; box-shadow:0 0 22px rgba(212,175,55,0.12); }
        .kopt .ktitle { font-size:15px; font-weight:600; margin-bottom:4px; }
        .kopt .klabel { font-size:9px; letter-spacing:0.4em; text-transform:uppercase; color:#52525b; margin-bottom:10px; }
        .kopt .kprice { font-size:11px; color:#D4AF37; font-weight:600; }

        /* ── RAL color swatches ── */
        .kral {
          padding:14px; border-radius:14px; border:1px solid rgba(63,63,70,0.8);
          background:rgba(9,9,11,0.7); cursor:pointer; transition:all 0.18s;
          display:flex; flex-direction:column; gap:10px; align-items:flex-start;
        }
        .kral:hover { border-color:rgba(212,175,55,0.4); transform:translateY(-1px); }
        .kral.sel { border-color:#D4AF37; background:rgba(212,175,55,0.06); box-shadow:0 0 20px rgba(212,175,55,0.15); }
        .kral .kswatch { border-radius:10px; border:1px solid rgba(255,255,255,0.1); transition:box-shadow 0.18s; }
        .kral.sel .kswatch { box-shadow:0 0 0 2px #D4AF37; }
        .kral .kcode { font-size:11px; font-weight:600; color:#fff; }
        .kral .kname { font-size:9px; letter-spacing:0.3em; text-transform:uppercase; color:#52525b; }
        .kral .kpick { font-size:9px; letter-spacing:0.35em; text-transform:uppercase; color:#52525b; margin-top:auto; }
        .kral.sel .kpick { color:#D4AF37; }

        /* ── Preview card (model + materiał) ── */
        .kpreview {
          border-radius:16px;
          border:1px solid rgba(63,63,70,0.85);
          background:radial-gradient(circle at 0 0, rgba(212,175,55,0.08) 0%, rgba(9,9,11,0.98) 40%, rgba(9,9,11,1) 100%);
          padding:12px 12px 10px;
          display:flex;
          flex-direction:column;
          gap:8px;
          margin-bottom:18px;
        }
        .kpreview-header {
          display:flex;
          justify-content:space-between;
          align-items:baseline;
          gap:8px;
        }
        .kpreview-label {
          font-size:9px;
          letter-spacing:0.35em;
          text-transform:uppercase;
          color:#52525b;
        }
        .kpreview-tag {
          font-size:9px;
          text-transform:uppercase;
          letter-spacing:0.18em;
          color:#a1a1aa;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          max-width:180px;
        }
        @media(min-width:1024px){
          .kpreview-tag { max-width:220px; }
        }
        .kpreview-grid {
          display:grid;
          grid-template-columns:3fr 2fr;
          gap:6px;
        }
        @media(max-width:1023px){
          .kpreview-grid { grid-template-columns:1fr; }
        }
        .kpreview-main,
        .kpreview-material {
          position:relative;
          border-radius:12px;
          overflow:hidden;
          background:#050505;
          height:180px;
        }
        @media(min-width:1024px){
          .kpreview-main,
          .kpreview-material {
            height:200px;
          }
        }

        /* Podsumowanie końcowe: dwa kwadratowe podglądy tej samej wielkości,
           idealnie wyśrodkowane w kartach */
        .kpreview-review .kpreview-main,
        .kpreview-review .kpreview-material {
          height:auto;
          aspect-ratio:1 / 1;
          width:100%;
          max-width:200px;
          max-height:200px;
          margin:0 auto;
        }
        @media(min-width:1024px){
          .kpreview-review .kpreview-main,
          .kpreview-review .kpreview-material {
            max-width:220px;
            max-height:220px;
          }
        }
        .kpreview-review-grid {
          display:grid;
          grid-template-columns:1fr;
          gap:12px;
        }
        @media(min-width:900px){
          .kpreview-review-grid {
            grid-template-columns:1fr 1fr;
          }
        }
        /* W podsumowaniu końcowym w jednej karcie model i materiał mają takie same kolumny
           i są wyśrodkowane względem siebie i krawędzi karty */
        @media(min-width:640px){
          .kpreview-review .kpreview-grid {
            grid-template-columns:auto auto;
            justify-content:center;
            column-gap:100px;
          }
        }
        .kpreview-main img,
        .kpreview-material img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        /* ── Review overlay (summary modal) ── */
        .konfig-review-overlay {
          position:fixed;
          inset:0;
          z-index:10050;
          display:flex;
          align-items:flex-start;
          justify-content:center;
          padding:56px 16px 20px;
          background:
            radial-gradient(circle at 50% 0%, rgba(212,175,55,0.16) 0%, rgba(0,0,0,0.92) 55%, rgba(0,0,0,0.96) 100%);
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
          overflow-y:auto;
          -webkit-overflow-scrolling:touch;
        }
        @media(min-width:1024px){
          .konfig-review-overlay {
            align-items:center;
            padding-top:32px;
            padding-bottom:32px;
          }
        }
        .konfig-review-card {
          width:100%;
          max-width:640px;
          border-radius:24px;
          border:1px solid rgba(212,175,55,0.3);
          background:rgba(9,9,11,0.95);
          box-shadow:0 0 100px rgba(0,0,0,0.9), 0 0 60px rgba(212,175,55,0.15);
          padding:22px 20px 20px;
          max-height:calc(100vh - 140px);
          overflow-y:auto;
        }
        .kpreview-placeholder {
          position:absolute;
          inset:0;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:10px;
          font-size:10px;
          color:#71717a;
          text-align:center;
        }

        /* ── Navigation buttons ── */
        .knav-prev {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 26px; border-radius:999px;
          border:1.5px solid rgba(63,63,70,0.8); background:transparent;
          color:#a1a1aa; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;
          cursor:pointer; transition:all 0.2s;
        }
        .knav-prev:hover { border-color:rgba(212,175,55,0.5); color:#fff; }
        .knav-next {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 32px; border-radius:999px;
          background:#D4AF37; color:#000; border:none;
          font-size:12px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase;
          cursor:pointer; box-shadow:0 0 28px rgba(212,175,55,0.35); transition:all 0.2s;
        }
        .knav-next:hover { background:#C9A227; box-shadow:0 0 52px rgba(212,175,55,0.6); }

        /* ── Summary sidebar rows ── */
        .ksum-row {
          display:flex; justify-content:space-between; align-items:center;
          gap:12px; padding:11px 14px; border-radius:10px;
          background:rgba(0,0,0,0.4); transition:background 0.15s; cursor:pointer;
        }
        .ksum-row:hover { background:rgba(212,175,55,0.06); }
        .ksum-key { font-size:9px; letter-spacing:0.4em; text-transform:uppercase; color:#52525b; flex-shrink:0; }
        .ksum-val { font-size:13px; font-weight:500; color:#e4e4e7; text-align:right; }

        /* ── Step heading ── */
        .kstep-h { font-family:var(--font-playfair,Georgia,serif); font-size:clamp(1.6rem,3.5vw,2.2rem); font-weight:400; font-style:italic; display:flex; align-items:center; gap:14px; margin-bottom:28px; color:#fff; }

        /* ── Dims slider ── */
        .kdims { border:1px solid rgba(39,39,42,0.8); border-radius:18px; background:rgba(9,9,11,0.6); padding:32px; }

        /* ── Product toggle (BRAMA / FURTKA) ── */
        .kproduct-toggle {
          display:inline-flex; gap:0; padding:6px; border-radius:999px;
          border:1.5px solid rgba(63,63,70,0.9); background:rgba(0,0,0,0.5);
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .kproduct-toggle button {
          padding:12px 28px; border-radius:999px; border:none;
          font-size:11px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase;
          cursor:pointer; transition:all 0.25s cubic-bezier(0.4,0,0.2,1);
          background:transparent; color:#71717a;
        }
        .kproduct-toggle button:hover { color:#a1a1aa; }
        .kproduct-toggle button.sel {
          background:linear-gradient(135deg,#D4AF37 0%,#C9A227 100%);
          color:#000; box-shadow:0 2px 12px rgba(212,175,55,0.4), 0 0 24px rgba(212,175,55,0.15);
        }
        .kproduct-toggle button.sel:hover {
          box-shadow:0 2px 16px rgba(212,175,55,0.5), 0 0 32px rgba(212,175,55,0.2);
        }

        /* ── Custom range sliders (satisfying feel) ── */
        .kslider {
          -webkit-appearance:none; appearance:none; width:100%; height:10px;
          background:linear-gradient(to right, rgba(212,175,55,0.5) 0%, rgba(212,175,55,0.5) var(--fill, 0%), rgba(39,39,42,0.9) var(--fill, 0%) 100%);
          border-radius:999px; outline:none;
          cursor:grab; transition:box-shadow 0.2s;
        }
        .kslider:hover { box-shadow:0 0 0 2px rgba(212,175,55,0.2); }
        .kslider:active { cursor:grabbing; }
        .kslider::-webkit-slider-thumb {
          -webkit-appearance:none; appearance:none; width:24px; height:24px;
          border-radius:50%; background:linear-gradient(135deg,#D4AF37,#C9A227);
          border:2px solid rgba(0,0,0,0.3); box-shadow:0 2px 12px rgba(212,175,55,0.5);
          cursor:grab; transition:transform 0.15s, box-shadow 0.15s;
        }
        .kslider::-webkit-slider-thumb:hover {
          transform:scale(1.12); box-shadow:0 2px 20px rgba(212,175,55,0.65);
        }
        .kslider::-webkit-slider-thumb:active {
          transform:scale(1.05); box-shadow:0 0 0 4px rgba(212,175,55,0.3);
        }
        .kslider::-moz-range-thumb {
          width:24px; height:24px; border-radius:50%; border:2px solid rgba(0,0,0,0.3);
          background:linear-gradient(135deg,#D4AF37,#C9A227);
          box-shadow:0 2px 12px rgba(212,175,55,0.5); cursor:grab;
          transition:transform 0.15s, box-shadow 0.15s;
        }
        .kslider::-moz-range-thumb:hover {
          transform:scale(1.12); box-shadow:0 2px 20px rgba(212,175,55,0.65);
        }
        .kslider::-moz-range-track { background:rgba(39,39,42,0.9); border-radius:999px; height:10px; }

        /* ── Contact form inputs (soft, non-jarring) ── */
        .kcontact-input {
          width:100%; padding:14px 18px; border-radius:12px;
          border:1px solid rgba(63,63,70,0.7); background:rgba(18,18,20,0.9);
          color:#e4e4e7; font-size:14px; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .kcontact-input::placeholder { color:#71717a; }
        .kcontact-input:hover { border-color:rgba(63,63,70,0.95); }
        .kcontact-input:focus {
          border-color:rgba(212,175,55,0.6); box-shadow:0 0 0 2px rgba(212,175,55,0.12);
        }
        .kcontact-grid { display:grid; grid-template-columns:1fr; gap:20px; }
        @media(min-width:640px){ .kcontact-grid { grid-template-columns:1fr 1fr; } }

        /* ── Step number badge in progress bar ── */
        .kstep-num { font-size:9px; font-weight:700; color:#52525b; letter-spacing:0.1em; margin-top:6px; text-align:center; }
      `}</style>
      <MainHeader />

      {/* Hero */}
      <section style={{ borderBottom: "1px solid rgba(39,39,42,0.8)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(133,102,47,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "64px 32px 48px" }}>
          <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.5em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 16 }}>
            Konfigurator online
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.1, marginBottom: 16 }}>
            Wycena Twojej bramy lub furtki
          </h1>
          <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: "#a1a1aa", maxWidth: 560 }}>
            Kilka kroków — wybierz model, wypełnienie, typ stali, kolor RAL i wymiary.
            Przygotujemy dla Ciebie wstępny projekt i ofertę.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 64px" }}>
        <div className="konfig-main-layout">
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* ── Progress bar with step numbers ── */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ height: 3, width: "100%", borderRadius: 999, background: step >= s ? "#D4AF37" : "rgba(63,63,70,0.6)", transition: "background 0.4s", boxShadow: step >= s ? "0 0 8px rgba(212,175,55,0.5)" : "none" }} />
                    <span className="kstep-num">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {step === 1 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="kstep-h">
                  <Box className="text-[#D4AF37]" /> Wybierz bazę projektu
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 28 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "#52525b" }}>
                    Konfigurujesz:
                  </span>

                  {isPairMode ? (
                    <span style={{ padding: "10px 20px", borderRadius: 999, border: "1px solid rgba(63,63,70,0.8)", background: "rgba(0,0,0,0.5)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#D4AF37" }}>
                      {activePairPart === "primary"
                        ? `Pierwszy element — ${config.product}`
                        : `Drugi element — ${config.product}`}
                    </span>
                  ) : (
                    <div className="kproduct-toggle">
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
                        className={config.product === "brama" ? "sel" : ""}
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
                        className={config.product === "furtka" ? "sel" : ""}
                      >
                        Furtka
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
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
                        className={`kopt${config.type === item.name ? " sel" : ""}`}
                      >
                        <div className="klabel">Model Premium</div>
                        <div className="ktitle">{item.name}</div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="kstep-h">
                  <LayoutGrid className="text-[#D4AF37]" /> Wybierz wypełnienie
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
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
                        className={`kopt${config.material === item.name ? " sel" : ""}`}
                      >
                        <div className="klabel">Wypełnienie</div>
                        <div className="ktitle">{item.name}</div>
                        {item.value !== 0 && <div className="kprice">+ {item.value.toLocaleString()} PLN/m²</div>}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="kstep-h">
                  <LayoutGrid className="text-[#D4AF37]" /> Wybierz typ stali
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                  {(steelTypes.length ? steelTypes : [{ label: "Stal (opcja)", price: 0 }]).map(
                    (item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, steelType: item.label }))
                        }
                        className={`kopt${config.steelType === item.label ? " sel" : ""}`}
                      >
                        <div className="klabel">Typ stali / zabezpieczenia</div>
                        <div className="ktitle">
                          {item.label}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="kstep-h">
                  <LayoutGrid className="text-[#D4AF37]" /> Wybierz kolor RAL
                </h2>
                <p className="mb-5 text-xs text-zinc-400">
                  Wszystkie kolory RAL Classic znajdziesz na stronie{" "}
                  <a
                    href="https://www.ral-farben.de/en/all-ral-colours"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#D4AF37]"
                  >
                    oficjalnego wzornika RAL
                  </a>
                  {" "}(wybierz tylko kolory RAL Classic). Wybierz jeden z poniższych kolorów lub, jeśli potrzebujesz innego,
                  skorzystaj z opcji „Inny kolor RAL”.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                  {(ralColors.length
                    ? ralColors
                    : [{ code: "RAL 9005", name: "Czarny głęboki", price: 0 }]
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
                      className={`kral${config.ral === c.code ? " sel" : ""}`}
                    >
                      <span
                        className="kswatch"
                        style={{
                          width: "100%", height: 56, display: "flex", alignItems: "center", justifyContent: "center",
                          background: getRalDisplayColor(c.code) || "rgba(30,30,30,0.9)",
                          color: getRalDisplayColor(c.code) ? "transparent" : "#71717a",
                          fontSize: 11, fontWeight: 700,
                        }}
                        title={!getRalDisplayColor(c.code) && c.code.trim() ? "Nie znaleziono w bazie RAL Classic" : undefined}
                      >
                        {!getRalDisplayColor(c.code) && c.code.trim() ? "?" : ""}
                      </span>
                      <div>
                        <div className="kcode">{c.code}</div>
                        <div className="kname">{c.name || ralCodeToNamePl(c.code) || "Kolor"}{!getRalDisplayColor(c.code) && c.code.trim() ? " (nie w bazie)" : ""}</div>
                      </div>
                      {c.price !== 0 && (
                        <span style={{ fontSize: 10, color: "#D4AF37", fontWeight: 600 }}>
                          + {c.price.toLocaleString()} PLN
                        </span>
                      )}
                      <div className="kpick">{config.ral === c.code ? "✓ Wybrano" : "Wybierz"}</div>
                    </button>
                  ))}
                </div>
                {allowOtherRal && (
                  <div style={{ marginTop: 16, border: "1px dashed rgba(63,63,70,0.8)", borderRadius: 14, background: "rgba(9,9,11,0.6)", padding: "20px 22px" }}>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          ral: "INNY",
                          ralPrice: otherRalPrice,
                        }))
                      }
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "7px 16px", borderRadius: 999, marginBottom: 14,
                        background: config.ral === "INNY" ? "#D4AF37" : "rgba(39,39,42,0.8)",
                        color: config.ral === "INNY" ? "#000" : "#a1a1aa",
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                        border: "none", cursor: "pointer",
                      }}
                    >
                      {config.ral === "INNY" ? "✓ " : ""}Inny kolor RAL (do wpisania)
                    </button>
                    <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.6, marginBottom: 12 }}>
                      Wpisz dokładny kod koloru RAL Classic (np. <span style={{ fontFamily: "monospace", color: "#a1a1aa" }}>RAL 7024</span>), który wybrałeś z wzornika.
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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
                        className="admin-input konfig-input"
                        style={{ borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#e4e4e7", background: "#000", border: "1px solid rgba(63,63,70,0.8)", flex: "1 1 200px", minWidth: 180, outline: "none" }}
                      />
                      {config.ralCustomCode.trim() && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                              background: getRalDisplayColor(config.ralCustomCode) || "rgba(30,30,30,0.9)",
                              border: "1px solid rgba(63,63,70,0.6)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, color: "#71717a", fontWeight: 700,
                            }}
                            title={!getRalDisplayColor(config.ralCustomCode) ? "Nie znaleziono w bazie RAL" : undefined}
                          >
                            {!getRalDisplayColor(config.ralCustomCode) ? "?" : null}
                          </div>
                          <span style={{ fontSize: 12, color: "#a1a1aa" }}>
                            {config.ralCustomCode.trim()}
                            {ralCodeToNamePl(config.ralCustomCode) && ` – ${ralCodeToNamePl(config.ralCustomCode)}`}
                          </span>
                        </div>
                      )}
                    </div>
                    {otherRalPrice !== 0 && (
                      <p style={{ marginTop: 8, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#71717a" }}>
                        Dopłata: <span style={{ color: "#D4AF37" }}>{otherRalPrice.toLocaleString()} PLN</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="kstep-h">
                  <LayoutGrid className="text-[#D4AF37]" /> Wybierz typ malowania
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
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
                      className={`kopt${config.paintType === item.label ? " sel" : ""}`}
                    >
                      <div className="klabel">Typ malowania</div>
                      <div className="ktitle">{item.label}</div>
                      {item.price !== 0 && (
                        <div className="kprice">+ {item.price.toLocaleString()} PLN</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="kstep-h" style={{ marginBottom: 12 }}>
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
                <div className="kdims" style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                  <div>
                    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#52525b" }}>
                      Szerokość{" "}
                      <span style={{ color: "#D4AF37", fontWeight: 700, fontSize: 15 }}>{config.width} cm</span>
                    </label>
                    <input
                      type="range"
                      min={minWidth}
                      max={maxWidth}
                      step="5"
                      value={config.width}
                      style={{ "--fill": `${Math.min(100, Math.max(0, ((config.width - minWidth) / Math.max(maxWidth - minWidth, 1)) * 100))}%` } as React.CSSProperties}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          width: parseInt(e.target.value),
                        })
                      }
                      className="kslider"
                    />
                  </div>
                  <div>
                    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#52525b" }}>
                      Wysokość{" "}
                      <span style={{ color: "#D4AF37", fontWeight: 700, fontSize: 15 }}>{config.height} cm</span>
                    </label>
                    <input
                      type="range"
                      min={minHeight}
                      max={maxHeight}
                      step="5"
                      value={config.height}
                      style={{ "--fill": `${Math.min(100, Math.max(0, ((config.height - minHeight) / Math.max(maxHeight - minHeight, 1)) * 100))}%` } as React.CSSProperties}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          height: parseInt(e.target.value),
                        })
                      }
                      className="kslider"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="kstep-h">
                  <ShieldCheck className="text-[#D4AF37]" /> Ostatni krok
                </h2>
                <div style={{ border: "1px solid rgba(63,63,70,0.6)", borderRadius: 18, background: "rgba(9,9,11,0.6)", padding: "32px", textAlign: "center", display: "flex", flexDirection: "column", gap: 24 }}>
                  <p style={{ fontSize: 14, fontStyle: "italic", color: "#71717a", lineHeight: 1.6, margin: 0 }}>
                    Podaj dane kontaktowe. Nasz doradca przygotuje finalny projekt,
                    sprawdzi warunki montażowe i oddzwoni z propozycją terminu.
                  </p>
                  <div className="kcontact-grid" style={{ textAlign: "left" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#52525b" }}>
                        Miejscowość
                      </label>
                      <input
                        type="text"
                        placeholder="Np. Wrocław"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="kcontact-input"
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#52525b" }}>
                        Kod pocztowy
                      </label>
                      <input
                        type="text"
                        placeholder="00-000"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="kcontact-input"
                      />
                    </div>
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <label style={{ display: "block", marginBottom: 8, fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#52525b" }}>
                      Numer telefonu
                    </label>
                    <input
                      type="tel"
                      placeholder="Wpisz numer telefonu"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="kcontact-input"
                      style={{ maxWidth: 280, margin: "0 auto", textAlign: "center", fontSize: 18, color: "#D4AF37" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, alignItems: "center", borderTop: "1px solid rgba(39,39,42,0.6)", paddingTop: 28, marginTop: 8 }}>
              {step > 1 && (
                <button onClick={handlePrevStep} className="knav-prev">
                  ← Wstecz
                </button>
              )}
              <button onClick={() => void handleNextStep()} className="knav-next" style={{ marginLeft: "auto" }}>
                {step === 7 ? "Wyślij zapytanie →" : "Następny krok →"}
              </button>
            </div>
          </div>

          <div style={{ position: "sticky", top: 120 }}>
            <div style={{ position: "relative", borderRadius: 20, border: "1px solid rgba(212,175,55,0.2)", background: "rgba(9,9,11,0.95)", padding: "28px 24px", boxShadow: "0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(133,102,47,0.08)" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: "radial-gradient(circle at 50% 0%, rgba(133,102,47,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <h4 style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.45em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(212,175,55,0.18)" }}>
                  Twoja konfiguracja
                </h4>

                <div className="kpreview">
                  <div className="kpreview-header">
                    <span className="kpreview-label">Podgląd</span>
                    <span className="kpreview-tag">
                      {previewConfig.product === "furtka" ? "Furtka" : "Brama"}
                      {previewConfig.type ? ` · ${previewConfig.type}` : ""}
                    </span>
                  </div>
                  <div className="kpreview-grid">
                    <div className="kpreview-main">
                      {previewBaseImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewBaseImageUrl}
                          alt={previewConfig.type || "Model bramy"}
                        />
                      ) : (
                        <div className="kpreview-placeholder">
                          {previewConfig.type
                            ? "Brak zdjęcia dla wybranego modelu."
                            : "Wybierz model, aby zobaczyć podgląd."}
                        </div>
                      )}
                    </div>
                    <div className="kpreview-material">
                      {previewMaterialImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewMaterialImageUrl}
                          alt={previewConfig.material || "Materiał wypełnienia"}
                        />
                      ) : (
                        <div className="kpreview-placeholder">
                          {previewConfig.material
                            ? "Dodaj zdjęcie materiału w zakładce Cennik."
                            : "Wybierz materiał, aby zobaczyć jego strukturę."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

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
                                className="ksum-row"
                              >
                                <span className="ksum-key">
                                  Baza
                                </span>
                                <span style={{ display: "none" }} />
                                <span className="ksum-val">{primaryConfig.type}</span>
                              </button>
                              {(activePairPart === "secondary" || step >= 6) && primaryConfig.width > 0 && primaryConfig.height > 0 && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("primary", 6)}
                                  className="ksum-row"
                                >
                                  <span className="ksum-key">
                                    Wymiar
                                  </span>
                                  <span style={{ display: "none" }} />
                                  <span className="ksum-val">
                                    {primaryConfig.width}×{primaryConfig.height} cm
                                  </span>
                                </button>
                              )}
                              {primaryConfig.material && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("primary", 2)}
                                  className="ksum-row"
                                >
                                  <span className="ksum-key">
                                    Wypełnienie
                                  </span>
                                  <span style={{ display: "none" }} />
                                  <span className="ksum-val">{primaryConfig.material}</span>
                                </button>
                              )}
                              {primaryConfig.steelType && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("primary", 3)}
                                  className="ksum-row"
                                >
                                  <span className="ksum-key">
                                    Stal
                                  </span>
                                  <span style={{ display: "none" }} />
                                  <span className="ksum-val">{primaryConfig.steelType}</span>
                                </button>
                              )}
                              {primaryConfig.ral && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("primary", 4)}
                                  className="ksum-row"
                                >
                                  <span className="ksum-key">
                                    Kolor
                                  </span>
                                  <span style={{ display: "none" }} />
                                  <span className="ksum-val" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {(primaryConfig.ral === "INNY" ? primaryConfig.ralCustomCode : primaryConfig.ral) && (
                                      <>
                                        <span
                                          style={{
                                            width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                                            background: getRalDisplayColor(primaryConfig.ral === "INNY" ? primaryConfig.ralCustomCode : primaryConfig.ral) || "rgba(30,30,30,0.9)",
                                            border: "1px solid rgba(63,63,70,0.5)",
                                          }}
                                        />
                                        {primaryConfig.ral === "INNY" && primaryConfig.ralCustomCode
                                          ? primaryConfig.ralCustomCode + (ralCodeToNamePl(primaryConfig.ralCustomCode) ? ` – ${ralCodeToNamePl(primaryConfig.ralCustomCode)}` : "")
                                          : primaryConfig.ral + (ralCodeToNamePl(primaryConfig.ral) ? ` – ${ralCodeToNamePl(primaryConfig.ral)}` : "")}
                                      </>
                                    )}
                                  </span>
                                </button>
                              )}
                              {primaryConfig.paintType && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("primary", 5)}
                                  className="ksum-row"
                                >
                                  <span className="ksum-key">
                                    Malowanie
                                  </span>
                                  <span style={{ display: "none" }} />
                                  <span className="ksum-val">{primaryConfig.paintType}</span>
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
                                  className="ksum-row"
                                >
                                  <span className="ksum-key">
                                    Baza
                                  </span>
                                  <span style={{ display: "none" }} />
                                  <span className="ksum-val">{secondaryConfig.type}</span>
                                </button>
                              )}
                              {activePairPart === "secondary" && step >= 6 && secondaryConfig.width > 0 && secondaryConfig.height > 0 && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("secondary", 6)}
                                  className="ksum-row"
                                >
                                  <span className="ksum-key">
                                    Wymiar
                                  </span>
                                  <span style={{ display: "none" }} />
                                  <span className="ksum-val">
                                    {secondaryConfig.width}×{secondaryConfig.height} cm
                                  </span>
                                </button>
                              )}
                              {secondaryConfig.material && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("secondary", 2)}
                                  className="ksum-row"
                                >
                                  <span className="ksum-key">
                                    Wypełnienie
                                  </span>
                                  <span style={{ display: "none" }} />
                                  <span className="ksum-val">{secondaryConfig.material}</span>
                                </button>
                              )}
                              {secondaryConfig.steelType && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("secondary", 3)}
                                  className="ksum-row"
                                >
                                  <span className="ksum-key">
                                    Stal
                                  </span>
                                  <span style={{ display: "none" }} />
                                  <span className="ksum-val">{secondaryConfig.steelType}</span>
                                </button>
                              )}
                              {secondaryConfig.ral && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("secondary", 4)}
                                  className="ksum-row"
                                >
                                  <span className="ksum-key">
                                    Kolor
                                  </span>
                                  <span style={{ display: "none" }} />
                                  <span className="ksum-val" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {(secondaryConfig.ral === "INNY" ? secondaryConfig.ralCustomCode : secondaryConfig.ral) && (
                                      <>
                                        <span
                                          style={{
                                            width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                                            background: getRalDisplayColor(secondaryConfig.ral === "INNY" ? secondaryConfig.ralCustomCode : secondaryConfig.ral) || "rgba(30,30,30,0.9)",
                                            border: "1px solid rgba(63,63,70,0.5)",
                                          }}
                                        />
                                        {secondaryConfig.ral === "INNY" && secondaryConfig.ralCustomCode
                                          ? secondaryConfig.ralCustomCode + (ralCodeToNamePl(secondaryConfig.ralCustomCode) ? ` – ${ralCodeToNamePl(secondaryConfig.ralCustomCode)}` : "")
                                          : secondaryConfig.ral + (ralCodeToNamePl(secondaryConfig.ral) ? ` – ${ralCodeToNamePl(secondaryConfig.ral)}` : "")}
                                      </>
                                    )}
                                  </span>
                                </button>
                              )}
                              {secondaryConfig.paintType && (
                                <button
                                  type="button"
                                  onClick={() => switchActivePairPart("secondary", 5)}
                                  className="ksum-row"
                                >
                                  <span className="ksum-key">
                                    Malowanie
                                  </span>
                                  <span style={{ display: "none" }} />
                                  <span className="ksum-val">{secondaryConfig.paintType}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 pt-4">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                            Szacowany koszt łącznie (brama + furtka)
                          </span>
                          <div style={{ fontSize: "3rem", fontWeight: 300, letterSpacing: "-0.02em", color: "#D4AF37", lineHeight: 1.1 }}>
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
                              className="ksum-row"
                            >
                              <span className="ksum-key">
                                Baza ({config.product})
                              </span>
                              <span style={{ display: "none" }} />
                              <span className="ksum-val">{config.type}</span>
                            </button>
                          )}
                          {step >= 6 && config.width > 0 && config.height > 0 && (
                            <button
                              type="button"
                              onClick={() => setStep(6)}
                              className="ksum-row"
                            >
                              <span className="ksum-key">
                                Wymiar
                              </span>
                              <span style={{ display: "none" }} />
                              <span className="ksum-val">
                                {config.width}×{config.height} cm
                              </span>
                            </button>
                          )}
                          {config.material && (
                            <button
                              type="button"
                              onClick={() => setStep(2)}
                              className="ksum-row"
                            >
                              <span className="ksum-key">
                                Wypełnienie
                              </span>
                              <span style={{ display: "none" }} />
                              <span className="ksum-val">{config.material}</span>
                            </button>
                          )}
                          {config.steelType && (
                            <button
                              type="button"
                              onClick={() => setStep(3)}
                              className="ksum-row"
                            >
                              <span className="ksum-key">
                                Stal
                              </span>
                              <span style={{ display: "none" }} />
                              <span className="ksum-val">{config.steelType}</span>
                            </button>
                          )}
                          {config.ral && (
                            <button
                              type="button"
                              onClick={() => setStep(4)}
                              className="ksum-row"
                            >
                              <span className="ksum-key">
                                Kolor
                              </span>
                              <span style={{ display: "none" }} />
                              <span className="ksum-val" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {(config.ral === "INNY" ? config.ralCustomCode : config.ral) && (
                                  <>
                                    <span
                                      style={{
                                        width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                                        background: getRalDisplayColor(config.ral === "INNY" ? config.ralCustomCode : config.ral) || "rgba(30,30,30,0.9)",
                                        border: "1px solid rgba(63,63,70,0.5)",
                                      }}
                                    />
                                    {config.ral === "INNY" && config.ralCustomCode
                                      ? config.ralCustomCode + (ralCodeToNamePl(config.ralCustomCode) ? ` – ${ralCodeToNamePl(config.ralCustomCode)}` : "")
                                      : config.ral + (ralCodeToNamePl(config.ral) ? ` – ${ralCodeToNamePl(config.ral)}` : "")}
                                  </>
                                )}
                              </span>
                            </button>
                          )}
                          {config.paintType && (
                            <button
                              type="button"
                              onClick={() => setStep(5)}
                              className="ksum-row"
                            >
                              <span className="ksum-key">
                                Malowanie
                              </span>
                              <span style={{ display: "none" }} />
                              <span className="ksum-val">{config.paintType}</span>
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
                            <div ref={priceRef} style={{ fontSize: "3rem", fontWeight: 300, letterSpacing: "-0.02em", color: "#D4AF37", lineHeight: 1.1, transition: "color 0.3s" }}>
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

      <section style={{ borderTop: "1px solid rgba(39,39,42,0.8)", background: "rgba(0,0,0,0.7)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Settings size={16} style={{ color: "#D4AF37", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>
              Jak działamy dalej?
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#71717a" }}>
              Po otrzymaniu konfiguracji kontaktujemy się z Tobą telefonicznie,
              doprecyzowujemy szczegóły techniczne, a następnie przygotowujemy
              wizualizację i ofertę dopasowaną do Twojej inwestycji.
            </p>
          </div>
        </div>
      </section>

      {showReviewOverlay && (
        <div className="konfig-review-overlay">
          <div className="konfig-review-card">
            <div style={{ marginBottom: 14 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "#52525b",
                  marginBottom: 8,
                }}
              >
                Ostatnie spojrzenie
              </p>
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(1.4rem,2.4vw,1.8rem)",
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "#fafafa",
                }}
              >
                Sprawdź konfigurację przed wysłaniem
              </h3>
            </div>

            <p
              style={{
                fontSize: 13,
                color: "#a1a1aa",
                lineHeight: 1.6,
                marginBottom: 14,
              }}
            >
              Zobacz jeszcze raz zdjęcia oraz kluczowe parametry. Jeśli coś chcesz
              poprawić, wróć do edycji. Jeśli wszystko się zgadza, potwierdź wysłanie
              zapytania.
            </p>

            <div
              style={{
                borderRadius: 20,
                border: "1px solid rgba(39,39,42,0.9)",
                padding: 14,
                marginBottom: 16,
                background: "rgba(9,9,11,0.9)",
              }}
            >
              {primaryConfig && secondaryConfig ? (
                <div className="kpreview-review-grid">
                  {[primaryConfig, secondaryConfig].map((cfg, idx) => {
                    const preview = getPreviewForConfig(cfg);
                    if (!preview) return null;
                    const labelPrefix =
                      idx === 0
                        ? "Pierwszy element"
                        : "Drugi element";
                    return (
                      <div key={idx} className="kpreview kpreview-review">
                        <div className="kpreview-header">
                          <span className="kpreview-label">
                            {labelPrefix}
                          </span>
                          <span className="kpreview-tag">
                            {preview.config.product === "furtka" ? "Furtka" : "Brama"}
                            {preview.config.type
                              ? ` · ${preview.config.type}`
                              : ""}
                          </span>
                        </div>
                        <div className="kpreview-grid">
                          <div className="kpreview-main">
                            {preview.baseUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={preview.baseUrl}
                                alt={preview.config.type || "Model bramy"}
                              />
                            ) : (
                              <div className="kpreview-placeholder">
                                {preview.config.type
                                  ? "Brak zdjęcia dla wybranego modelu."
                                  : "Wybierz model, aby zobaczyć podgląd."}
                              </div>
                            )}
                          </div>
                          <div className="kpreview-material">
                            {preview.materialUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={preview.materialUrl}
                                alt={
                                  preview.config.material ||
                                  "Materiał wypełnienia"
                                }
                              />
                            ) : (
                              <div className="kpreview-placeholder">
                                {preview.config.material
                                  ? "Brak zdjęcia dla wybranego materiału."
                                  : "Wybierz materiał, aby zobaczyć jego strukturę."}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: "0.28em",
                              textTransform: "uppercase",
                              color: "#52525b",
                              marginBottom: 6,
                            }}
                          >
                            Kluczowe parametry
                          </p>
                          <ul
                            style={{
                              listStyle: "none",
                              padding: 0,
                              margin: 0,
                              fontSize: 12,
                              color: "#e4e4e7",
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            {preview.config.type && (
                              <li>
                                <span style={{ color: "#71717a" }}>Model: </span>
                                {preview.config.type}
                              </li>
                            )}
                            {preview.config.material && (
                              <li>
                                <span style={{ color: "#71717a" }}>
                                  Wypełnienie:{" "}
                                </span>
                                {preview.config.material}
                              </li>
                            )}
                            {preview.config.width > 0 &&
                              preview.config.height > 0 && (
                                <li>
                                  <span style={{ color: "#71717a" }}>
                                    Wymiary:{" "}
                                  </span>
                                  {preview.config.width}×
                                  {preview.config.height} cm
                                </li>
                              )}
                            {preview.config.ral && (
                              <li>
                                <span style={{ color: "#71717a" }}>
                                  Kolor:{" "}
                                </span>
                                {preview.config.ral === "INNY" &&
                                preview.config.ralCustomCode
                                  ? preview.config.ralCustomCode
                                  : preview.config.ral}
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className="kpreview kpreview-review">
                    <div className="kpreview-header">
                      <span className="kpreview-label">Podgląd</span>
                      <span className="kpreview-tag">
                        {previewConfig.product === "furtka" ? "Furtka" : "Brama"}
                        {previewConfig.type ? ` · ${previewConfig.type}` : ""}
                      </span>
                    </div>
                    <div className="kpreview-grid">
                      <div className="kpreview-main">
                        {previewBaseImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={previewBaseImageUrl}
                            alt={previewConfig.type || "Model bramy"}
                          />
                        ) : (
                          <div className="kpreview-placeholder">
                            {previewConfig.type
                              ? "Brak zdjęcia dla wybranego modelu."
                              : "Wybierz model, aby zobaczyć podgląd."}
                          </div>
                        )}
                      </div>
                      <div className="kpreview-material">
                        {previewMaterialImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={previewMaterialImageUrl}
                            alt={
                              previewConfig.material || "Materiał wypełnienia"
                            }
                          />
                        ) : (
                          <div className="kpreview-placeholder">
                            {previewConfig.material
                              ? "Brak zdjęcia dla wybranego materiału."
                              : "Wybierz materiał, aby zobaczyć jego strukturę."}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                        color: "#52525b",
                        marginBottom: 6,
                      }}
                    >
                      Kluczowe parametry
                    </p>
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        fontSize: 12,
                        color: "#e4e4e7",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {previewConfig.type && (
                        <li>
                          <span style={{ color: "#71717a" }}>Model: </span>
                          {previewConfig.type}
                        </li>
                      )}
                      {previewConfig.material && (
                        <li>
                          <span style={{ color: "#71717a" }}>Wypełnienie: </span>
                          {previewConfig.material}
                        </li>
                      )}
                      {previewConfig.width > 0 && previewConfig.height > 0 && (
                        <li>
                          <span style={{ color: "#71717a" }}>Wymiary: </span>
                          {previewConfig.width}×{previewConfig.height} cm
                        </li>
                      )}
                      {previewConfig.ral && (
                        <li>
                          <span style={{ color: "#71717a" }}>Kolor: </span>
                          {previewConfig.ral === "INNY" &&
                          previewConfig.ralCustomCode
                            ? previewConfig.ralCustomCode
                            : previewConfig.ral}
                        </li>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 6,
              }}
            >
              <button
                type="button"
                onClick={() => setShowReviewOverlay(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(63,63,70,0.9)",
                  background: "transparent",
                  color: "#e4e4e7",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Wróć do edycji
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewOverlay(false);
                  void persistAndInsertLead();
                }}
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: "none",
                  background: "#D4AF37",
                  color: "#000",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: "0 0 26px rgba(212,175,55,0.5)",
                }}
              >
                Potwierdź i wyślij
              </button>
            </div>
          </div>
        </div>
      )}

      <MainFooter />

      <AnimatePresence mode="wait">
        {showSuccessOverlay && (
          <ConfigSuccessOverlay key="success" onClose={() => setShowSuccessOverlay(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}

