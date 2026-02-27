"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { MainHeader } from "@/components/MainHeader";
import { MainFooter } from "@/components/MainFooter";
import { ChevronLeft } from "lucide-react";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const toast = useToast();
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
      await toast.showAlert("Podaj aktualne hasło, aby zmienić email.");
      return;
    }
    try {
      setSavingEmail(true);
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (reauthError) {
        await toast.showAlert("Nieprawidłowe hasło. Email nie został zmieniony.");
        setSavingEmail(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      await toast.showAlert(
        "Adres email został zaktualizowany. Jeśli wymagane, potwierdź zmianę przez link w wiadomości od Supabase."
      );
      setEmail(newEmail);
    } catch (error: unknown) {
      await toast.showAlert("Błąd zmiany emaila: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSavingEmail(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) {
      await toast.showAlert("Podaj aktualne hasło, aby zmienić hasło.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      await toast.showAlert("Nowe hasło musi mieć co najmniej 8 znaków.");
      return;
    }
    if (newPassword !== confirmPassword) {
      await toast.showAlert("Hasła muszą być takie same.");
      return;
    }
    try {
      setSavingPassword(true);
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (reauthError) {
        await toast.showAlert("Nieprawidłowe aktualne hasło. Zmiana hasła przerwana.");
        setSavingPassword(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      await toast.showAlert("Hasło zostało zmienione.");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      await toast.showAlert("Błąd zmiany hasła: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSavingPassword(false);
    }
  };

  const inputStyle = {
    width: "100%", background: "#000", border: "1px solid rgba(63,63,70,0.8)",
    borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#e4e4e7",
    outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" as const,
  };
  const btnStyle = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "12px 24px", borderRadius: 999, background: "#D4AF37", color: "#000",
    fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const,
    border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(212,175,55,0.28)",
    transition: "all 0.2s",
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#71717a", fontSize: 14 }}>
        Ładowanie konta...
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <MainHeader />

      <section style={{ borderBottom: "1px solid rgba(39,39,42,0.8)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 32px 32px" }}>
          <button
            onClick={() => router.back()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24,
              padding: "10px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              color: "#a1a1aa", background: "transparent", border: "1px solid rgba(63,63,70,0.6)", borderRadius: 10,
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)";
              e.currentTarget.style.color = "#D4AF37";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(63,63,70,0.6)";
              e.currentTarget.style.color = "#a1a1aa";
            }}
          >
            <ChevronLeft size={16} />
            Wstecz
          </button>
          <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.45em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 12 }}>
            Panel konta
          </p>
          <h1 className="font-display" style={{ fontSize: "2rem", fontWeight: 400, fontStyle: "italic", marginBottom: 8 }}>
            Ustawienia konta
          </h1>
          <p style={{ fontSize: 13, color: "#71717a" }}>Zalogowany jako: {email}</p>
        </div>
      </section>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ border: "1px solid rgba(39,39,42,0.8)", borderRadius: 16, background: "rgba(9,9,11,0.6)", padding: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", color: "#71717a", marginBottom: 20 }}>
            Adres e-mail
          </p>
          <form onSubmit={handleEmailChange} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 440 }}>
            <input
              type="email" required value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(212,175,55,0.7)"; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(63,63,70,0.8)"; }}
            />
            <button type="submit" disabled={savingEmail} style={{ ...btnStyle, opacity: savingEmail ? 0.6 : 1, cursor: savingEmail ? "not-allowed" : "pointer" }}>
              {savingEmail ? "Zapisywanie..." : "Zmień e-mail"}
            </button>
          </form>
        </div>

        <div style={{ border: "1px solid rgba(39,39,42,0.8)", borderRadius: 16, background: "rgba(9,9,11,0.6)", padding: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", color: "#71717a", marginBottom: 20 }}>
            Zmiana hasła
          </p>
          <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 440 }}>
            {[
              { label: "Aktualne hasło", value: password, setter: setPassword },
              { label: "Nowe hasło (min. 8 znaków)", value: newPassword, setter: setNewPassword },
              { label: "Powtórz nowe hasło", value: confirmPassword, setter: setConfirmPassword },
            ].map(({ label, value, setter }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#71717a" }}>{label}</label>
                <input
                  type="password" required value={value} onChange={(e) => setter(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(212,175,55,0.7)"; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(63,63,70,0.8)"; }}
                />
              </div>
            ))}
            <button type="submit" disabled={savingPassword} style={{ ...btnStyle, opacity: savingPassword ? 0.6 : 1, cursor: savingPassword ? "not-allowed" : "pointer" }}>
              {savingPassword ? "Zapisywanie..." : "Zmień hasło"}
            </button>
          </form>
        </div>
      </div>

      <MainFooter />
    </main>
  );
}

