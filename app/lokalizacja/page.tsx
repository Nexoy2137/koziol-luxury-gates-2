"use client";

import { MapPin, Car, Train, ArrowRight } from "lucide-react";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
import { LuxButton } from "@/components/ui/LuxButton";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";

export default function LokalizacjaPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <MainHeader />

      {/* Hero */}
      <section style={{ borderBottom: "1px solid rgba(39,39,42,0.8)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(133,102,47,0.16) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 32px 64px" }}>
          <ScrollReveal>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.5em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 16 }}>
              Lokalizacja
            </p>
            <h1 className="font-display" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.1, marginBottom: 20 }}>
              Jak do nas dojechać
            </h1>
            <p style={{ fontSize: 15, color: "#a1a1aa", lineHeight: 1.7, maxWidth: 520, marginBottom: 32 }}>
              Nasz showroom i siedziba mieszczą się w Ozorkowie. Dogodny dojazd
              z Łodzi, Poznania i Warszawy. Zapraszamy po wcześniejszym umówieniu.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <LuxButton href="/kontakt" variant="outline">
              Umów wizytę
              <ArrowRight size={15} />
            </LuxButton>
          </ScrollReveal>
        </div>
      </section>

      {/* Map */}
      <section style={{ borderBottom: "1px solid rgba(39,39,42,0.8)", background: "#030303" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px" }}>
          <ScrollReveal>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.45em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 20 }}>
              Mapa dojazdu
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1} scale>
            <div
              className="map-wrapper"
              style={{
                height: 420,
                overflow: "hidden",
                borderRadius: 16,
                border: "1px solid rgba(39,39,42,0.8)",
                filter: "grayscale(1) invert(1) brightness(0.28) contrast(1.1)",
                transition: "filter 0.8s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = "grayscale(0) invert(0) brightness(1) contrast(1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "grayscale(1) invert(1) brightness(0.28) contrast(1.1)"; }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3045.2311407336433!2d19.274154776998984!3d51.94780947843452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471bb03dc2947b47%3A0x697cd38344b01a89!2sAdam%C3%B3wek%2041%2C%2095-035%20Ozork%C3%B3w!5e1!3m2!1spl!2spl!4v1772035763217!5m2!1spl!2spl"
                width="100%" height="100%"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Address + directions */}
      <section style={{ borderBottom: "1px solid rgba(39,39,42,0.8)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>

          <ScrollReveal>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.45em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 20 }}>
              Adres
            </p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <MapPin size={16} style={{ color: "#D4AF37", flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 15, color: "#a1a1aa", lineHeight: 1.8 }}>
                Kozioł Luxury Gates<br />
                ul. Adamówek 41<br />
                95-035 Ozorków, Polska
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.7 }}>
              Wejście do showroomu znajduje się na końcu uliczki. Na miejscu
              dostępne są miejsca postojowe dla klientów.
            </p>
          </ScrollReveal>

          <StaggerContainer className="flex flex-col" style={{ gap: 24 }}>
            {[
              {
                Icon: Car, label: "Samochodem",
                desc: "Zjazd z drogi krajowej — szczegółowe wskazówki po umówieniu.",
                bullets: ["ok. 30 min z centrum Łodzi", "ok. 1h 30 min z Warszawy", "ok. 2h z Poznania"],
              },
              {
                Icon: Train, label: "Komunikacją",
                desc: "Najbliższa stacja kolejowa w Ozorkowie. Możliwy odbiór po wcześniejszym umówieniu spotkania.",
                bullets: [],
              },
            ].map(({ Icon, label, desc, bullets }) => (
              <StaggerItem key={label}>
                <div className="page-card" style={{ padding: "32px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <Icon size={16} style={{ color: "#D4AF37" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "#a1a1aa" }}>
                      {label}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.7, marginBottom: bullets.length ? 12 : 0 }}>{desc}</p>
                  {bullets.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {bullets.map((b) => (
                        <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#71717a" }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#D4AF37", flexShrink: 0, display: "block" }} />
                          {b}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <MainFooter />
    </main>
  );
}
