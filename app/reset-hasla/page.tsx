"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";

export default function ResetPasswordRequestPage() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const toast = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setStatus("sending");
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-hasla/zmien`,
      });
      if (error) throw error;
      setStatus("sent");
    } catch (error: unknown) {
      await toast.showAlert("Błąd wysyłania: " + (error instanceof Error ? error.message : ""));
      setStatus("idle");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(133,102,47,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ position: "relative", width: "100%", maxWidth: 420 }}
      >
        <div className="beam-wrapper">
          <div className="beam-inner rounded-2xl" style={{ padding: 40 }}>

            <div style={{ textAlign: "center", marginBottom: 32 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Koziol" style={{ height: 102, width: 102, margin: "0 auto 16px", display: "block" }} />
              <p style={{ fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 8 }}>
                Panel zarządzania
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: 0 }}>
                Reset hasła
              </h1>
              <p style={{ marginTop: 10, fontSize: 13, color: "#71717a", lineHeight: 1.6 }}>
                Podaj swój adres e-mail. Wyślemy link do ustawienia nowego hasła.
              </p>
            </div>

            {status === "sent" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "24px 0" }}
              >
                <CheckCircle size={48} style={{ color: "#D4AF37", margin: "0 auto 16px", display: "block" }} />
                <p style={{ fontSize: 14, color: "#e4e4e7", marginBottom: 8 }}>Link wysłany</p>
                <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.6 }}>
                  Jeśli podany e-mail jest poprawny, za chwilę otrzymasz wiadomość z linkiem do zmiany hasła.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#71717a" }}>
                    E-mail
                  </label>
                  <input
                    type="email" required placeholder="twoj@email.pl"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%", background: "#000", border: "1px solid rgba(63,63,70,0.8)",
                      borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#e4e4e7",
                      outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" as const,
                    }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(212,175,55,0.7)"; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(63,63,70,0.8)"; }}
                  />
                </div>

                <button
                  type="submit" disabled={status === "sending"}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    marginTop: 4, padding: "14px 24px", borderRadius: 999,
                    background: "#D4AF37", color: "#000",
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                    border: "none", cursor: status === "sending" ? "not-allowed" : "pointer",
                    opacity: status === "sending" ? 0.6 : 1,
                    boxShadow: "0 0 28px rgba(212,175,55,0.35)",
                  }}
                >
                  {status === "sending" ? "Wysyłanie..." : "Wyślij link resetujący"}
                  {status !== "sending" && <Mail size={13} />}
                </button>
              </form>
            )}

            <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
              <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#52525b", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#a1a1aa"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#52525b"; }}
              >
                <ArrowLeft size={12} />
                Wróć do logowania
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
