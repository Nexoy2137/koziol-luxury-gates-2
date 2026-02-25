import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CursorGlow } from "@/components/ui/CursorGlow";

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

export const metadata: Metadata = {
  title: "Koziol Luxury Gates | Producent Ekskluzywnych Bram i Ogrodzeń",
  description:
    "Projektujemy i montujemy luksusowe bramy oraz systemy ogrodzeniowe. Skorzystaj z naszego konfiguratora online i otrzymaj wstępną wycenę w 2 minuty. Realizacje w całej Polsce.",
  keywords: [
    "bramy luksusowe",
    "producent bram",
    "ogrodzenia premium",
    "wycena bramy online",
    "Koziol Luxury Gates",
    "bramy Ozorków",
  ],
  openGraph: {
    title: "Koziol Luxury Gates | Twoja Brama do Świata Luksusu",
    description:
      "Indywidualne projekty, najwyższa jakość materiałów i nowoczesny design. Sprawdź nasz konfigurator.",
    images: ["/og-image.jpg"],
  },
  robots: "index, follow",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <div className="grain-overlay" aria-hidden="true" />
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}
