import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Koziol Luxury Gates | Producent Ekskluzywnych Bram i Ogrodzeń",
  description: "Projektujemy i montujemy luksusowe bramy oraz systemy ogrodzeniowe. Skorzystaj z naszego konfiguratora online i otrzymaj wstępną wycenę w 2 minuty. Realizacje w całej Polsce.",
  keywords: ["bramy luksusowe", "producent bram", "ogrodzenia premium", "wycena bramy online", "Koziol Luxury Gates", "bramy Ozorków"],
  openGraph: {
    title: "Koziol Luxury Gates | Twoja Brama do Świata Luksusu",
    description: "Indywidualne projekty, najwyższa jakość materiałów i nowoczesny design. Sprawdź nasz konfigurator.",
    images: ["/og-image.jpg"], // Zdjęcie, które wyświetli się przy wysyłaniu linku
  },
  robots: "index, follow",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
