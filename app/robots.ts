import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koziol-gates.pl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/konto", "/login", "/reset-hasla"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
