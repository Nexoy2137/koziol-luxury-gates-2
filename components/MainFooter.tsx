import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const footerLinks = [
  { href: "/galeria",      label: "Galeria" },
  { href: "/konfigurator", label: "Konfigurator" },
  { href: "/lokalizacja",  label: "Lokalizacja" },
  { href: "/kontakt",      label: "Kontakt" },
];

const contacts = [
  { Icon: Phone, text: "+48 602 384 821",    href: "tel:+48602384821" },
  { Icon: Mail,  text: "biuro@koziol-gates.pl", href: "mailto:biuro@koziol-gates.pl" },
];

export function MainFooter() {
  return (
    <footer style={{ position: "relative", background: "#09090b", borderTop: "1px solid rgba(39,39,42,0.8)", overflow: "hidden", maxWidth: "100vw" }}>
      {/* Top gold shimmer */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(to right, transparent, rgba(212,175,55,0.5), transparent)" }} />

      {/* CSS hover helpers + responsive */}
      <style>{`
        .footer-link { color: #a1a1aa; text-decoration: none; transition: color 0.2s; font-size: 13px; }
        .footer-link:hover { color: #D4AF37; }
        .footer-contact-link { display: flex; align-items: center; gap: 10px; color: #a1a1aa; text-decoration: none; transition: color 0.2s; font-size: 13px; word-break: break-all; }
        .footer-contact-link:hover { color: #D4AF37; }
        @media (min-width: 640px) {
          .footer-grid { grid-template-columns: 2fr 1fr !important; gap: 40px !important; }
          .footer-inner { padding: 48px 28px !important; }
        }
        @media (min-width: 1024px) {
          .footer-grid { grid-template-columns: 2fr 1fr 1fr !important; gap: 48px !important; }
          .footer-inner { padding: 52px 32px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 20px", width: "100%", boxSizing: "border-box" }} className="footer-inner">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }} className="footer-grid">

          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Koziol Luxury Gates" style={{ height: 90, width: 90, borderRadius: 6, display: "block" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#D4AF37", letterSpacing: "0.03em" }}>
                Koziol Luxury Gates
              </span>
            </Link>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#71717a", maxWidth: 320 }}>
              Projektujemy i realizujemy ekskluzywne bramy, furtki i ogrodzenia
              dla wymagających inwestorów. Od projektu do montażu pod klucz.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Ozorków, Polska", "Realizacje w całej Polsce", "Gwarancja 20 lat"].map((tag) => (
                <span key={tag} style={{
                  padding: "6px 14px", border: "1px solid rgba(39,39,42,0.9)",
                  borderRadius: 999, fontSize: 10, color: "#71717a", display: "inline-block",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.4em", textTransform: "uppercase", color: "#52525b" }}>
              Nawigacja
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.4em", textTransform: "uppercase", color: "#52525b" }}>
              Kontakt
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {contacts.map(({ Icon, text, href }) => (
                <a key={href} href={href} className="footer-contact-link">
                  <Icon size={14} style={{ color: "#D4AF37", flexShrink: 0 }} />
                  {text}
                </a>
              ))}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#71717a" }}>
                <MapPin size={14} style={{ color: "#D4AF37", flexShrink: 0, marginTop: 2 }} />
                <span>ul. Adamówek 41<br />95-035 Ozorków</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ marginTop: 40, height: 1, background: "linear-gradient(to right, transparent, rgba(63,63,70,0.7), transparent)" }} />
        <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, fontSize: 11, color: "#3f3f46", wordBreak: "break-word" }}>
          <span>© 2026 Koziol Luxury Gates. Wszelkie prawa zastrzeżone.</span>
          <span>ul. Adamówek 41, 95-035 Ozorków</span>
        </div>
      </div>
    </footer>
  );
}
