import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

const footerLinks = [
  { href: "/galeria",      label: "Galeria" },
  { href: "/konfigurator", label: "Konfigurator" },
  { href: "/lokalizacja",  label: "Lokalizacja" },
  { href: "/kontakt",      label: "Kontakt" },
];

export function MainFooter() {
  return (
    <footer className="relative overflow-hidden bg-zinc-950">
      {/* Top gold glow line */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.5), transparent)" }} />

      {/* Subtle background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-30 grid-overlay" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-20">

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="space-y-6 lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.jpg"
                alt="Koziol Luxury Gates"
                width={200}
                height={65}
                className="h-11 w-auto rounded-sm"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
              Projektujemy i realizujemy ekskluzywne bramy, furtki i ogrodzenia
              dla wymagających inwestorów. Od projektu do montażu pod klucz.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Ozorków, Polska", "Realizacje w całej Polsce", "Gwarancja 20 lat"].map((tag) => (
                <span key={tag} className="rounded-full border border-zinc-800 px-3 py-1.5 text-[10px] text-zinc-500">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-zinc-500">
              Nawigacja
            </p>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-zinc-400 transition-colors hover:text-[#D4AF37]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-zinc-500">
              Kontakt
            </p>
            <ul className="space-y-3">
              <li>
                <a href="tel:+48602384821"
                  className="flex items-center gap-2.5 text-[13px] text-zinc-400 transition-colors hover:text-[#D4AF37]">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0 text-[#D4AF37]" />
                  +48 602 384 821
                </a>
              </li>
              <li>
                <a href="mailto:biuro@koziol-gates.pl"
                  className="flex items-center gap-2.5 text-[13px] text-zinc-400 transition-colors hover:text-[#D4AF37]">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0 text-[#D4AF37]" />
                  biuro@koziol-gates.pl
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-[13px] text-zinc-500">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D4AF37]" />
                  ul. Adamówek 41<br />95-035 Ozorków
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-14 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(63,63,70,0.8), transparent)" }} />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col gap-3 text-[11px] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Koziol Luxury Gates. Wszelkie prawa zastrzeżone.</p>
          <p>ul. Adamówek 41, 95-035 Ozorków, Polska</p>
        </div>
      </div>
    </footer>
  );
}
