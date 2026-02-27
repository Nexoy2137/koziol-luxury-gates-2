import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konfigurator bramy | Kozioł Luxury Gates",
  description:
    "Skonfiguruj swoją bramę online — wybierz typ, wymiary i wykończenie. Wstępna wycena w 2 minuty.",
  openGraph: {
    title: "Konfigurator | Kozioł Luxury Gates",
    description: "Indywidualna konfiguracja bramy z wstępną wyceną. Model, materiał, kolor, automatyka.",
  },
};

export default function KonfiguratorLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
