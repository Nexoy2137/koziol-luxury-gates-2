import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koziol-gates.pl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/galeria`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/konfigurator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/kontakt`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/lokalizacja`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/konto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return staticRoutes;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: galleryRows } = await supabase
      .from("gallery")
      .select("id")
      .order("id", { ascending: false });

    const galleryEntries: MetadataRoute.Sitemap = (galleryRows ?? []).map((row) => ({
      url: `${baseUrl}/galeria/${row.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...galleryEntries];
  } catch {
    return staticRoutes;
  }
}
