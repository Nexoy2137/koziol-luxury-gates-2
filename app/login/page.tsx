"use client";
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Jeśli użytkownik jest już zalogowany, od razu przenosimy do /admin
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace('/admin');
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Błąd logowania: " + error.message);
    else router.push('/admin'); // Po zalogowaniu leci do panelu
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="max-w-md w-full border border-[#D4AF37]/30 p-10 bg-zinc-900/50">
        <h1 className="text-[#D4AF37] text-2xl uppercase tracking-[0.3em] mb-8 text-center">Panel Zarządzania</h1>
        <input 
          type="email" placeholder="Email" 
          className="w-full bg-black border border-zinc-800 p-3 mb-4 focus:border-[#D4AF37] outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Hasło" 
          className="w-full bg-black border border-zinc-800 p-3 mb-6 focus:border-[#D4AF37] outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-[#D4AF37] text-black font-bold py-3 uppercase tracking-widest hover:bg-[#b8962d]">
          Zaloguj się
        </button>

        <div className="mt-6 flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          <Link href="/" className="hover:text-[#D4AF37]">
            ← Wróć na stronę główną
          </Link>
          <Link href="/konfigurator" className="hover:text-[#D4AF37]">
            Przejdź do konfiguratora
          </Link>
          <Link href="/reset-hasla" className="hover:text-[#D4AF37] mt-2 text-[10px]">
            Zapomniałem hasła
          </Link>
        </div>
      </form>
    </div>
  );
}