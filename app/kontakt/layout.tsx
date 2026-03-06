import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt | Kozioł Luxury Gates",
  description:
    "Skontaktuj się z nami — showroom w Polsce, dojazd na teren budowy. Umów spotkanie lub wycenę.",
  openGraph: {
    title: "Kontakt | Kozioł Luxury Gates",
    description: "Biuro, showroom, mapa. Realizacje w całej Polsce.",
  },
};

export default function KontaktLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
