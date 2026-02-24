 "use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setStatus("sending");
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-hasla/zmien`,
      });
      if (error) throw error;
      setStatus("sent");
    } catch (error: any) {
      alert("Błąd wysyłania maila resetującego: " + error.message);
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full border border-[#D4AF37]/30 p-10 bg-zinc-900/50"
      >
        <h1 className="text-[#D4AF37] text-2xl uppercase tracking-[0.3em] mb-6 text-center">
          Reset hasła
        </h1>
        <p className="text-xs text-zinc-400 mb-6 text-center">
          Podaj email do panelu. Wyślemy link do ustawienia nowego hasła.
        </p>
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-black border border-zinc-800 p-3 mb-4 focus:border-[#D4AF37] outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          disabled={status === "sending"}
          className="w-full bg-[#D4AF37] text-black font-bold py-3 uppercase tracking-widest hover:bg-[#b8962d] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "Wysyłanie..." : "Wyślij link resetujący"}
        </button>

        {status === "sent" && (
          <p className="mt-4 text-[11px] text-center text-green-400">
            Jeśli podany email jest poprawny, wysłaliśmy wiadomość z linkiem do
            zmiany hasła.
          </p>
        )}

        <div className="mt-6 flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          <Link href="/login" className="hover:text-[#D4AF37]">
            ← Wróć do logowania
          </Link>
        </div>
      </form>
    </div>
  );
}

