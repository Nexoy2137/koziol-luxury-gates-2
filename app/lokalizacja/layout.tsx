import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lokalizacja i dojazd | Kozioł Luxury Gates",
  description: "Showroom i siedziba Kozioł Luxury Gates w Ozorkowie. Adres, mapa, dojazd.",
};

export default function LokalizacjaLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
