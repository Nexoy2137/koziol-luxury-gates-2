import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria realizacji | Kozioł Luxury Gates",
  description:
    "Zobacz realizacje bram przesuwnych, skrzydłowych i furt. Każdy projekt indywidualny — od konfiguracji do montażu.",
  openGraph: {
    title: "Galeria | Kozioł Luxury Gates",
    description: "Realizacje ekskluzywnych bram i ogrodzeń. Bramy przesuwne, skrzydłowe, samonośne.",
  },
};

export default function GaleriaLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
