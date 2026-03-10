import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CursorGlow } from "../components/ui/CursorGlow";
import { ToastProvider } from "../context/ToastContext";
import { ScrollToTop } from "../components/ScrollToTop";
import { SpeedInsights } from "@vercel/speed-insights/next";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koziol-gates.pl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kozioł Luxury Gates | Producent Ekskluzywnych Bram i Ogrodzeń",
  description:
    "Projektujemy i montujemy luksusowe bramy oraz systemy ogrodzeniowe. Skorzystaj z naszego konfiguratora online i otrzymaj wstępną wycenę w 2 minuty. Realizacje w całej Polsce.",
  keywords: [
    "bramy luksusowe",
    "producent bram",
    "ogrodzenia premium",
    "wycena bramy online",
    "Kozioł Luxury Gates",
    "bramy premium",
  ],
  openGraph: {
    title: "Kozioł Luxury Gates | Twoja Brama do Świata Luksusu",
    description:
      "Indywidualne projekty, najwyższa jakość materiałów i nowoczesny design. Sprawdź nasz konfigurator.",
    type: "website",
    locale: "pl_PL",
    images: [
      {
        url: "https://koziol-luxury-gates-2.vercel.app/logo.svg",
        width: 1200,
        height: 630,
        alt: "Kozioł Luxury Gates – logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozioł Luxury Gates | Producent Ekskluzywnych Bram",
    description: "Luksusowe bramy i ogrodzenia. Konfigurator online, wycena w 2 minuty.",
    images: ["https://koziol-luxury-gates-2.vercel.app/logo.svg"],
  },
  robots: "index, follow",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 0.5,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#000000",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Kozioł Luxury Gates",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.svg` },
      description: "Producent ekskluzywnych bram, furt i ogrodzeń. Realizacje w całej Polsce.",
      foundingDate: "2009",
      address: {
        "@type": "PostalAddress",
        streetAddress: "ul. Przykładowa 1",
        addressLocality: "Przykładowe Miasto",
        postalCode: "00-000",
        addressCountry: "PL",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+48-500-000-000",
        email: "kontakt@example.com",
        contactType: "customer service",
        areaServed: "PL",
        availableLanguage: "Polish",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Kozioł Luxury Gates",
      description: "Konfigurator bram online, galeria realizacji, wycena w 2 minuty.",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "pl-PL",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ToastProvider>
          <a
            href="#main-content"
            className="fixed left-4 top-4 z-[100] -translate-y-[200%] rounded-md bg-[#D4AF37] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-black shadow-lg focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Przejdź do głównej treści strony"
          >
            Przejdź do treści
          </a>
          <div className="grain-overlay" aria-hidden="true" />
          <CursorGlow />
          <ScrollToTop />
          <div id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </div>
          <SpeedInsights />
        </ToastProvider>
      </body>
    </html>
  );
}
