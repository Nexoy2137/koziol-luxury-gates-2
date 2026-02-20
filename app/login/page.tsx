"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
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
      </form>
    </div>
  );
}