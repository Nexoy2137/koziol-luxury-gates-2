"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Settings, Ruler, Box, ShieldCheck, Loader2, LayoutGrid } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [dbPrices, setDbPrices] = useState<any[]>([]);
  const [phone, setPhone] = useState('');
  
  const [config, setConfig] = useState({
    type: 'Brama Przesuwna',
    basePrice: 0,
    width: 400,
    height: 150,
    material: 'Palisada Pozioma',
    materialPrice: 0,
  });

  const [totalPrice, setTotalPrice] = useState(0);

  // 1. POBIERANIE CEN Z SUPABASE
  useEffect(() => {
    async function fetchPrices() {
      const { data, error } = await supabase.from('prices').select('*');
      if (error) {
        console.error('Błąd pobierania cen:', error);
      } else if (data) {
        setDbPrices(data);
        const brama = data.find(p => p.name === 'Brama Przesuwna');
        const mat = data.find(p => p.name === 'Palisada Pozioma');
        setConfig(prev => ({
          ...prev,
          basePrice: brama?.value || 0,
          materialPrice: mat?.value || 0
        }));
      }
      setLoading(false);
    }
    fetchPrices();
  }, []);

  // 2. OBLICZANIE CENY NA ŻYWO
  useEffect(() => {
    const area = (config.width / 100) * (config.height / 100);
    const calculated = Number(config.basePrice) + (area * Number(config.materialPrice));
    setTotalPrice(Math.round(calculated));
  }, [config]);

  // 3. OBSŁUGA WYSYŁKI ZAMÓWIENIA
  const handleOrder = async () => {
    if (!phone || phone.length < 9) {
      alert("Proszę podać poprawny numer telefonu.");
      return;
    }

    const { error } = await supabase.from('leads').insert([{
      customer_phone: phone,
      total_price: totalPrice,
      details: config
    }]);

    if (error) {
      alert("Błąd wysyłania: " + error.message);
    } else {
      alert("Dziękujemy! Twoja wycena została zapisana. Oddzwonimy w ciągu 24h.");
      setStep(1);
      setPhone('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans scroll-smooth">
      {/* HEADER */}
      <header className="flex flex-col items-center py-8 border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <Image src="/logo.jpg" alt="Logo" width={220} height={100} className="mb-6" />
        <nav className="flex gap-8 text-[10px] uppercase tracking-[0.3em] font-light text-zinc-400">
          <a href="/galeria" className="hover:text-[#D4AF37] transition-colors">Galeria</a>
          <a href="#konfigurator" className="hover:text-[#D4AF37] transition-colors">Konfigurator</a>
          <a href="#lokalizacja" className="hover:text-[#D4AF37] transition-colors">Lokalizacja</a>
          <a href="#kontakt" className="hover:text-[#D4AF37] transition-colors">Kontakt</a>
        </nav>
      </header>

      <section id="konfigurator" className="max-w-5xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            {/* PROGRESS BAR */}
            <div className="flex items-center gap-4 mb-12">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`h-1 flex-1 transition-all duration-500 ${step >= s ? 'bg-[#D4AF37]' : 'bg-zinc-800'}`} />
              ))}
            </div>

            {/* KROK 1: TYP KONSTRUKCJI */}
            {step === 1 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-3xl font-light mb-8 flex items-center gap-3 italic text-luxury">
                  <Box className="text-[#D4AF37]" /> Wybierz bazę projektu
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dbPrices.filter(p => p.category === 'base').map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setConfig({ ...config, type: item.name, basePrice: item.value })}
                      className={`p-6 border text-left transition-all ${config.type === item.name ? 'border-[#D4AF37] bg-zinc-900' : 'border-zinc-800 hover:border-zinc-600'}`}
                    >
                      <span className="block text-[10px] text-zinc-500 uppercase mb-2">Model Premium</span>
                      <span className="text-xl font-medium tracking-tight">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* KROK 2: WYMIARY */}
            {step === 2 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-3xl font-light mb-8 flex items-center gap-3 italic text-luxury">
                  <Ruler className="text-[#D4AF37]" /> Dopasuj wymiary
                </h2>
                <div className="space-y-12 bg-zinc-900/20 p-8 border border-zinc-900">
                  <div>
                    <label className="flex justify-between text-zinc-500 mb-4 uppercase text-[10px] tracking-[0.2em]">
                      Szerokość <span>{config.width} cm</span>
                    </label>
                    <input 
                      type="range" min="200" max="900" step="10"
                      value={config.width}
                      onChange={(e) => setConfig({...config, width: parseInt(e.target.value)})}
                      className="w-full accent-[#D4AF37] h-1 bg-zinc-800 appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-zinc-500 mb-4 uppercase text-[10px] tracking-[0.2em]">
                      Wysokość <span>{config.height} cm</span>
                    </label>
                    <input 
                      type="range" min="100" max="250" step="5"
                      value={config.height}
                      onChange={(e) => setConfig({...config, height: parseInt(e.target.value)})}
                      className="w-full accent-[#D4AF37] h-1 bg-zinc-800 appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* KROK 3: WYBÓR WYPEŁNIENIA */}
            {step === 3 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-3xl font-light mb-8 flex items-center gap-3 italic text-luxury">
                  <LayoutGrid className="text-[#D4AF37]" /> Wybierz wypełnienie
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dbPrices.filter(p => p.category === 'material').map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setConfig({ ...config, material: item.name, materialPrice: item.value })}
                      className={`p-6 border text-left transition-all ${config.material === item.name ? 'border-[#D4AF37] bg-zinc-900' : 'border-zinc-800 hover:border-zinc-600'}`}
                    >
                      <span className="block text-[10px] text-zinc-500 uppercase mb-2">Materiał</span>
                      <span className="text-xl font-medium tracking-tight">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* KROK 4: FINALIZACJA */}
            {step === 4 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-3xl font-light mb-8 flex items-center gap-3 italic">
                  <ShieldCheck className="text-[#D4AF37]" /> Ostatni krok
                </h2>
                <div className="bg-zinc-900/40 p-8 border border-[#D4AF37]/30 text-center">
                  <p className="text-zinc-400 text-sm mb-6 italic">
                    Podaj numer telefonu. Nasz doradca przygotuje finalny projekt i oddzwoni z propozycją terminu montażu.
                  </p>
                  <input 
                    type="tel" 
                    placeholder="Wpisz numer telefonu"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="max-w-xs w-full bg-black border border-zinc-800 p-4 text-center text-xl text-[#D4AF37] outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>
              </div>
            )}

            {/* PRZYCISKI STEROWANIA */}
            <div className="flex gap-4 pt-8 border-t border-zinc-900/50">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)} 
                  className="px-8 py-3 border border-zinc-800 text-xs uppercase tracking-widest hover:bg-zinc-900 transition-all text-zinc-400"
                >
                  Wstecz
                </button>
              )}
              
              <button 
                onClick={() => step < 4 ? setStep(step + 1) : handleOrder()} 
                className="px-10 py-4 bg-[#D4AF37] text-black text-xs uppercase tracking-[0.2em] font-bold ml-auto hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                {step === 4 ? 'Wyślij zapytanie' : 'Następny krok'}
              </button>
            </div>
          </div>

          {/* PODSUMOWANIE (BOCZNE) */}
          <div className="lg:sticky lg:top-40 h-fit">
            <div className="border border-[#D4AF37]/20 p-8 bg-[#0A0A0A] relative shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                <ShieldCheck size={120} />
              </div>
              <h4 className="text-[#D4AF37] uppercase text-[10px] tracking-[0.4em] mb-8 border-b border-[#D4AF37]/20 pb-4">Twoja Konfiguracja</h4>
              
              <div className="space-y-5 mb-10">
                <div className="flex justify-between items-end text-luxury">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Baza</span>
                  <span className="text-sm font-light border-b border-zinc-800 flex-1 mx-4 mb-1 border-dotted"></span>
                  <span className="text-sm">{config.type}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Wymiar</span>
                  <span className="text-sm font-light border-b border-zinc-800 flex-1 mx-4 mb-1 border-dotted"></span>
                  <span className="text-sm">{config.width}x{config.height} cm</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Wypełnienie</span>
                  <span className="text-sm font-light border-b border-zinc-800 flex-1 mx-4 mb-1 border-dotted"></span>
                  <span className="text-sm">{config.material}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Szacowany koszt</span>
                <div className="text-5xl font-light tracking-tighter text-[#D4AF37]">
                  {totalPrice.toLocaleString()} <span className="text-xs">PLN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA KONTAKT I LOKALIZACJA */}
      <section id="kontakt" className="bg-zinc-900/10 py-24 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            <div className="space-y-8">
              <div>
                <h3 className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] mb-4">Kontakt</h3>
                <h2 className="text-4xl font-light tracking-tight italic">Showroom Koziol Luxury Gates</h2>
              </div>
              
              <div className="space-y-6 text-zinc-400">
                <div className="flex items-start gap-4 text-luxury">
                  <div className="p-3 border border-[#D4AF37]/30 bg-zinc-900/50 text-[#D4AF37]">
                    <Box size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium italic">Adres Siedziby</p>
                    <p className="text-sm leading-relaxed">ul. Przykładowa 123<br />00-035 Ozorków</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 border border-[#D4AF37]/30 bg-zinc-900/50 text-[#D4AF37]">
                    <Settings size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium italic">Kontakt Bezpośredni</p>
                    <p className="text-sm leading-relaxed">+48 123 456 789<br />biuro@koziol-gates.pl</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="lokalizacja" className="space-y-4">
               <h3 className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] mb-4">Lokalizacja</h3>
               <div className="h-[400px] w-full border border-zinc-800 overflow-hidden relative">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24355.229058309502!2d19.278379899999997!3d51.95999555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471bb003bb221dc3%3A0xfa4a2b1a1b13f88e!2sElizy%20Orzeszkowej%2036A%2C%2095-035%20Ozork%C3%B3w!5e1!3m2!1spl!2spl!4v1771612009734!5m2!1spl!2spl" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    className="grayscale invert brightness-[0.7] contrast-[1.2] transition-all duration-1000 ease-in-out hover:grayscale-0 hover:invert-0 hover:brightness-100 hover:contrast-100"
                  ></iframe>
               </div>
            </div>

          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-zinc-900 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
        © 2026 Koziol Luxury Gates. Wszelkie prawa zastrzeżone.
      </footer>
    </main>
  );
}