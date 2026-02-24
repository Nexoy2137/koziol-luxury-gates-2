"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordChangePage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "saving">(
    "checking"
  );
  const router = useRouter();

  useEffect(() => {
    // sprawdzamy czy sesja resetu jest aktywna
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
      } else {
        setStatus("ready");
      }
    };
    check();
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      alert("Hasło musi mieć co najmniej 8 znaków.");
      return;
    }
    if (password !== confirm) {
      alert("Hasła muszą być takie same.");
      return;
    }
    try {
      setStatus("saving");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      alert("Hasło zostało zmienione. Zaloguj się ponownie.");
      router.replace("/login");
    } catch (error: any) {
      alert("Błąd zmiany hasła: " + error.message);
      setStatus("ready");
    }
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 text-sm">
        Sprawdzanie linku resetującego...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full border border-[#D4AF37]/30 p-10 bg-zinc-900/50"
      >
        <h1 className="text-[#D4AF37] text-2xl uppercase tracking-[0.3em] mb-6 text-center">
          Ustaw nowe hasło
        </h1>
        <input
          type="password"
          placeholder="Nowe hasło"
          className="w-full bg-black border border-zinc-800 p-3 mb-4 focus:border-[#D4AF37] outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Powtórz hasło"
          className="w-full bg-black border border-zinc-800 p-3 mb-6 focus:border-[#D4AF37] outline-none"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button
          disabled={status === "saving"}
          className="w-full bg-[#D4AF37] text-black font-bold py-3 uppercase tracking-widest hover:bg-[#b8962d] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Zapisz nowe hasło
        </button>
      </form>
    </div>
  );
}

