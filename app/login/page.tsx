"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/admin");
    });
  }, [router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { await toast.showAlert("Błąd logowania: " + error.message); setLoading(false); }
    else router.push("/admin");
  };

  const inputStyle = {
    width: "100%", background: "#000", border: "1px solid rgba(63,63,70,0.8)",
    borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#e4e4e7",
    outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" as const,
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
              <img src="/logo.svg" alt="Kozioł" style={{ height: 102, width: 102, margin: "0 auto 16px", display: "block" }} />
              <p style={{ fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 8 }}>
                Panel zarządzania
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: 0 }}>
                Zaloguj się
              </h1>
            </div>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }} aria-label="Logowanie do panelu">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="login-email" style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#71717a" }}>
                  E-mail
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(212,175,55,0.7)"; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(63,63,70,0.8)"; }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="login-password" style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#71717a" }}>
                  Hasło
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(212,175,55,0.7)"; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(63,63,70,0.8)"; }}
                />
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginTop: 8, padding: "14px 24px", borderRadius: 999,
                  background: "#D4AF37", color: "#000",
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  border: "none", cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  boxShadow: "0 0 28px rgba(212,175,55,0.35)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Logowanie..." : "Zaloguj się"}
                {!loading && <Lock size={13} />}
              </button>
            </form>

            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Link href="/reset-hasla" style={{ fontSize: 11, color: "#71717a", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#D4AF37"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#71717a"; }}
              >
                Zapomniałem hasła
              </Link>
              <div style={{ height: 1, width: 40, background: "rgba(63,63,70,0.6)" }} />
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#52525b", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#a1a1aa"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#52525b"; }}
              >
                <ArrowLeft size={12} />
                Wróć na stronę główną
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
