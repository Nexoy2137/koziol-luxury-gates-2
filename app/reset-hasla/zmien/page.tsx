"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordChangePage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [status, setStatus]     = useState<"checking" | "ready" | "saving">("checking");
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      else setStatus("ready");
    });
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 8) { await toast.showAlert("Hasło musi mieć co najmniej 8 znaków."); return; }
    if (password !== confirm) { await toast.showAlert("Hasła muszą być takie same."); return; }
    try {
      setStatus("saving");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await toast.showAlert("Hasło zostało zmienione. Zaloguj się ponownie.");
      router.replace("/login");
    } catch (error: unknown) {
      await toast.showAlert("Błąd: " + (error instanceof Error ? error.message : ""));
      setStatus("ready");
    }
  };

  const inputStyle = {
    width: "100%", background: "#000", border: "1px solid rgba(63,63,70,0.8)",
    borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#e4e4e7",
    outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" as const,
  };

  if (status === "checking") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#71717a", fontSize: 14 }}>
        Sprawdzanie sesji...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(133,102,47,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        style={{ position: "relative", width: "100%", maxWidth: 420 }}
      >
        <div className="beam-wrapper">
          <div className="beam-inner rounded-2xl" style={{ padding: 40 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Kozioł" style={{ height: 102, width: 102, margin: "0 auto 16px", display: "block" }} />
              <p style={{ fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 8 }}>Panel zarządzania</p>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: 0 }}>Ustaw nowe hasło</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Nowe hasło", value: password, setter: setPassword, placeholder: "Minimum 8 znaków" },
                { label: "Powtórz hasło", value: confirm, setter: setConfirm, placeholder: "••••••••" },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#71717a" }}>{label}</label>
                  <input
                    type="password" required placeholder={placeholder}
                    value={value} onChange={(e) => setter(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(212,175,55,0.7)"; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(63,63,70,0.8)"; }}
                  />
                </div>
              ))}

              <button
                type="submit" disabled={status === "saving"}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4,
                  padding: "14px 24px", borderRadius: 999, background: "#D4AF37", color: "#000",
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  border: "none", cursor: status === "saving" ? "not-allowed" : "pointer",
                  opacity: status === "saving" ? 0.6 : 1, boxShadow: "0 0 28px rgba(212,175,55,0.35)",
                }}
              >
                {status === "saving" ? "Zapisywanie..." : "Zapisz nowe hasło"}
                {status !== "saving" && <KeyRound size={13} />}
              </button>
            </form>

            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
              <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#52525b", textDecoration: "none" }}
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
