"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
import { LuxButton } from "@/components/ui/LuxButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const contactCards = [
  {
    Icon: Phone,
    label: "Telefon",
    value: "+48 602 384 821",
    sub: "Poniedziałek – Piątek, 9:00 – 18:00",
    href: "tel:+48602384821",
  },
  {
    Icon: Mail,
    label: "E-mail",
    value: "biuro@koziol-gates.pl",
    sub: "Odpowiadamy w ciągu 24 godzin roboczych",
    href: "mailto:biuro@koziol-gates.pl",
  },
  {
    Icon: Clock,
    label: "Spotkania",
    value: "Po wcześniejszym umówieniu",
    sub: "Możliwy dojazd do klienta na teren budowy",
    href: null,
  },
];

const inputStyle = {
  width: "100%",
  background: "rgba(18,18,20,0.9)",
  border: "1px solid rgba(63,63,70,0.7)",
  borderRadius: 12,
  padding: "14px 18px",
  fontSize: 14,
  color: "#e4e4e7",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box" as const,
};

const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = "rgba(212,175,55,0.6)";
  e.target.style.boxShadow = "0 0 0 2px rgba(212,175,55,0.12)";
};
const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = "rgba(63,63,70,0.7)";
  e.target.style.boxShadow = "none";
};

export default function KontaktPage() {
  const [sent, setSent] = useState(false);

  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <style>{`
        .kcontact-form input::placeholder, .kcontact-form textarea::placeholder { color:#71717a; }
        .contact-cards { display:grid; grid-template-columns:1fr; gap:16px; }
        .contact-layout { display:grid; grid-template-columns:1fr; gap:40px; }
        .form-row { display:grid; grid-template-columns:1fr; gap:14px; }
        @media(min-width:640px){
          .contact-cards { grid-template-columns:repeat(3,1fr); }
          .form-row { grid-template-columns:1fr 1fr; }
        }
        @media(min-width:900px){
          .contact-layout { grid-template-columns:1fr 1.15fr; gap:56px; }
        }
      `}</style>
      <MainHeader />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ borderBottom: "1px solid rgba(39,39,42,0.8)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(133,102,47,0.16) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div className="page-container" style={{ position: "relative", paddingTop: 56, paddingBottom: 48 }}>
          <ScrollReveal>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.5em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 16 }}>
              Kontakt
            </p>
            <h1 className="font-display" style={{ fontSize: "clamp(2.4rem,6vw,4rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.1, marginBottom: 20 }}>
              Porozmawiajmy o Twojej inwestycji.
            </h1>
            <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: "#a1a1aa", maxWidth: 520, marginBottom: 36 }}>
              Zadzwoń, napisz lub umów spotkanie w naszym showroomie. Dobierzemy
              rozwiązanie dopasowane do architektury budynku i charakteru posesji.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <LuxButton href="/konfigurator" variant="outline">
              Otwórz konfigurator
              <ArrowRight className="h-4 w-4" />
            </LuxButton>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 3 CONTACT CARDS ─────────────────────────────────────────────────── */}
      <section style={{ borderBottom: "1px solid rgba(39,39,42,0.8)", background: "#030303" }}>
        <div className="page-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <ScrollReveal>
            <div className="contact-cards">
              {contactCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="beam-wrapper" style={{ height: "100%" }}>
                    <div className="beam-inner" style={{ borderRadius: "calc(1rem - 1px)", padding: "32px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.3)", background: "rgba(0,0,0,0.6)" }}>
                        <card.Icon size={20} style={{ color: "#D4AF37" }} />
                      </div>
                      <p style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: "#52525b" }}>
                        {card.label}
                      </p>
                      {card.href ? (
                        <a href={card.href} style={{ fontSize: 17, fontWeight: 300, color: "#fff", textDecoration: "none", transition: "color 0.2s" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#D4AF37"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
                        >
                          {card.value}
                        </a>
                      ) : (
                        <p style={{ fontSize: 15, fontWeight: 300, color: "#fff" }}>{card.value}</p>
                      )}
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: "#52525b", marginTop: "auto" }}>{card.sub}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── ADDRESS + FORM ──────────────────────────────────────────────────── */}
      <section style={{ borderBottom: "1px solid rgba(39,39,42,0.8)" }}>
        <div className="page-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="contact-layout">

            {/* Address */}
            <ScrollReveal>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.45em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 16 }}>
                Siedziba
              </p>
              <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.2, marginBottom: 32 }}>
                Kozioł Luxury Gates — showroom
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[
                  { Icon: MapPin, label: "Adres", content: "ul. Adamówek 41\n95-035 Ozorków\nPolska" },
                  { Icon: Clock, label: "Godziny", content: "Poniedziałek – Piątek\n9:00 – 18:00" },
                ].map(({ Icon, label, content }) => (
                  <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, borderRadius: "50%", border: "1px solid rgba(39,39,42,0.9)", background: "rgba(9,9,11,0.8)" }}>
                      <Icon size={15} style={{ color: "#D4AF37" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#52525b", marginBottom: 6 }}>{label}</p>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: "#a1a1aa", whiteSpace: "pre-line" }}>{content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ margin: "28px 0", height: 1, background: "linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)" }} />

              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#71717a", marginBottom: 24 }}>
                Zapraszamy do kontaktu przed przyjazdem — przygotujemy próbki,
                katalogi i propozycje rozwiązań dopasowane do Twojej inwestycji.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Bezpłatna konsultacja", "Dojazd do klienta", "Próbki materiałów"].map((tag) => (
                  <span key={tag} style={{ padding: "6px 14px", border: "1px solid rgba(39,39,42,0.9)", borderRadius: 999, fontSize: 10, color: "#71717a" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal delay={0.15}>
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="page-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: "40px 36px", textAlign: "center" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.3)", background: "#000" }}>
                    <CheckCircle size={26} style={{ color: "#D4AF37" }} />
                  </div>
                  <div>
                    <h3 className="font-display" style={{ fontSize: "1.4rem", fontStyle: "italic", color: "#fff", marginBottom: 8 }}>
                      Wiadomość wysłana
                    </h3>
                    <p style={{ fontSize: 13, color: "#71717a" }}>Odpiszemy w ciągu 24 godzin. Dziękujemy za zainteresowanie.</p>
                  </div>
                  <button type="button" onClick={() => setSent(false)}
                    style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#71717a", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#D4AF37"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#71717a"; }}
                  >
                    Wyślij kolejną wiadomość
                  </button>
                </motion.div>
              ) : (
                <div className="kcontact-form" style={{ border: "1px solid rgba(39,39,42,0.8)", borderRadius: 20, background: "rgba(9,9,11,0.6)", padding: "36px 32px" }}>
                  <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.4em", textTransform: "uppercase", color: "#52525b", marginBottom: 28 }}>
                    Szybka wiadomość
                  </p>

                  <form style={{ display: "flex", flexDirection: "column", gap: 16 }}
                    onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                  >
                    <div className="form-row">
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: "#71717a" }}>Imię i nazwisko</label>
                        <input type="text" placeholder="Jan Kowalski" required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: "#71717a" }}>Telefon</label>
                        <input type="tel" placeholder="+48 000 000 000" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: "#71717a" }}>Adres e-mail</label>
                      <input type="email" placeholder="jan@kowalski.pl" required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: "#71717a" }}>Opis inwestycji</label>
                      <textarea
                        placeholder="Typ bramy, szerokość wjazdu, lokalizacja, budżet orientacyjny..."
                        rows={4}
                        style={{ ...inputStyle, resize: "none" }}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </div>

                    <button type="submit" style={{
                      marginTop: 8, padding: "14px 24px", borderRadius: 999,
                      background: "#D4AF37", color: "#000",
                      fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                      border: "none", cursor: "pointer",
                      boxShadow: "0 0 28px rgba(212,175,55,0.35)",
                      transition: "all 0.2s",
                    }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#C9A227"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#D4AF37"; }}
                    >
                      Wyślij wiadomość
                    </button>

                    <p style={{ textAlign: "center", fontSize: 11, color: "#52525b" }}>
                      Lub zadzwoń:{" "}
                      <a href="tel:+48602384821" style={{ color: "#71717a", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#D4AF37"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#71717a"; }}
                      >
                        +48 602 384 821
                      </a>
                    </p>
                  </form>
                </div>
              )}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", background: "#000" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(133,102,47,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div className="page-container" style={{ position: "relative", maxWidth: 900, paddingTop: 56, paddingBottom: 56, textAlign: "center" }}>
          <ScrollReveal>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.55em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 16 }}>Zainspirowany?</p>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.2, marginBottom: 32 }}>
              Sprawdź nasze realizacje w galerii.
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              <LuxButton href="/galeria" variant="gold">
                Zobacz realizacje
              </LuxButton>
              <LuxButton href="/konfigurator" variant="outline">
                Konfigurator online
                <ArrowRight className="h-4 w-4" />
              </LuxButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MainFooter />
    </main>
  );
}
