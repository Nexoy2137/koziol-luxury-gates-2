"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setEmail(data.user.email || "");
      setNewEmail(data.user.email || "");
      setLoading(false);
    };
    load();
  }, [router]);

  const handleEmailChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEmail || newEmail === email) return;
    if (!password) {
      alert("Podaj aktualne hasło, aby zmienić email.");
      return;
    }
    try {
      setSavingEmail(true);
      // potwierdzamy tożsamość poprzez ponowne logowanie
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (reauthError) {
        alert("Nieprawidłowe hasło. Email nie został zmieniony.");
        setSavingEmail(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      alert(
        "Adres email został zaktualizowany. Jeśli wymagane, potwierdź zmianę przez link w wiadomości od Supabase."
      );
      setEmail(newEmail);
    } catch (error: any) {
      alert("Błąd zmiany emaila: " + error.message);
    } finally {
      setSavingEmail(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) {
      alert("Podaj aktualne hasło, aby zmienić hasło.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      alert("Nowe hasło musi mieć co najmniej 8 znaków.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Hasła muszą być takie same.");
      return;
    }
    try {
      setSavingPassword(true);
      // reautoryzacja hasłem przed zmianą
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (reauthError) {
        alert("Nieprawidłowe aktualne hasło. Zmiana hasła przerwana.");
        setSavingPassword(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      alert("Hasło zostało zmienione.");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      alert("Błąd zmiany hasła: " + error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 text-sm">
        Ładowanie konta...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-200 font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-10">
          Ustawienia konta
        </h1>

        <section className="mb-10 border border-zinc-800 bg-zinc-900/40 p-6 md:p-8">
          <h2 className="text-sm uppercase tracking-[0.25em] text-zinc-400 mb-4">
            Adres email
          </h2>
          <form
            onSubmit={handleEmailChange}
            className="flex flex-col gap-4 max-w-md"
          >
            <input
              type="email"
              className="w-full bg-black border border-zinc-800 p-3 text-sm outline-none focus:border-[#D4AF37]"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <button
              disabled={savingEmail}
              className="self-start px-6 py-3 text-[11px] font-black uppercase tracking-[0.25em] bg-[#D4AF37] text-black hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Zmień email
            </button>
          </form>
        </section>

        <section className="border border-zinc-800 bg-zinc-900/40 p-6 md:p-8">
          <h2 className="text-sm uppercase tracking-[0.25em] text-zinc-400 mb-4">
            Zmiana hasła
          </h2>
          <form
            onSubmit={handlePasswordChange}
            className="flex flex-col gap-4 max-w-md"
          >
            <input
              type="password"
              placeholder="Aktualne hasło (wymagane do zmiany)"
              className="w-full bg-black border border-zinc-800 p-3 text-sm outline-none focus:border-zinc-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Nowe hasło (min. 8 znaków)"
              className="w-full bg-black border border-zinc-800 p-3 text-sm outline-none focus:border-[#D4AF37]"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Powtórz nowe hasło"
              className="w-full bg-black border border-zinc-800 p-3 text-sm outline-none focus:border-[#D4AF37]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              disabled={savingPassword}
              className="self-start px-6 py-3 text-[11px] font-black uppercase tracking-[0.25em] bg-[#D4AF37] text-black hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Zmień hasło
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

