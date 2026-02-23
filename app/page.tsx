"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, Ruler, Box, ShieldCheck, Loader2, 
  LayoutGrid, Phone, MapPin, Mail, ChevronRight, 
  CheckCircle2, ArrowRight, Instagram, Facebook 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [dbPrices, setDbPrices] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [phone, setPhone] = useState('');
  
  const [config, setConfig] = useState({
    type: '',
    basePrice: 0,
    width: 400,
    height: 150,
    material: '',
    materialPrice: 0,
    maxWidth: 600
  });

  const [totalPrice, setTotalPrice] = useState(0);

  // POBIERANIE DANYCH
  useEffect(() => {
    async function fetchData() {
      const { data: prices } = await supabase.from('prices').select('*').order('id', { ascending: true });
      const { data: portfolio } = await supabase.from('gallery').select('*').limit(6).order('id', { ascending: false });
      
      if (prices) {
        setDbPrices(prices);
        const firstBase = prices.find(p => p.category === 'base');
        const firstMat = prices.find(p => p.category === 'material');
        if (firstBase && firstMat) {
          setConfig(prev => ({
            ...prev,
            type: firstBase.name,
            basePrice: firstBase.value,
            maxWidth: firstBase.max_value || 600,
            material: firstMat.name,
            materialPrice: firstMat.value
          }));
        }
      }
      if (portfolio) setGallery(portfolio);
      setLoading(false);
    }
    fetchData();
  }, []);

  // KALKULACJA
  useEffect(() => {
    const area = (config.width / 100) * (config.height / 100);
    const calculated = Number(config.basePrice) + (area * Number(config.materialPrice));
    setTotalPrice(Math.round(calculated));
  }, [config]);

  // WYSYŁKA
  const handleOrder = async () => {
    if (!phone || phone.length < 9) {
      alert("Proszę podać poprawny numer telefonu.");
      return;
    }

    const { error } = await supabase.from('leads').insert([{
      customer_phone: phone,
      total_price: totalPrice,
      details: {
        wybrany_model: config.type,
        cena_bazowa: config.basePrice + " PLN",
        material: config.material,
        cena_m2: config.materialPrice + " PLN",
        szerokosc: config.width + " cm",
        wysokosc: config.height + " cm",
        powierzchnia: ((config.width * config.height) / 10000).toFixed(2) + " m2"
      }
    }]);

    if (!error) setStep(5);
    else alert("Błąd bazy: " + error.message);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="relative w-20 h-20 mb-4">
        <div className="absolute inset-0 border-t-2 border-[#D4AF37] rounded-full animate-spin" />
        <div className="absolute inset-2 border-r-2 border-[#D4AF37]/30 rounded-full animate-spin-reverse" />
      </div>
      <p className="text-[#D4AF37] font-black uppercase text-[10px] tracking-[0.5em]">Koziol Luxury Gates</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020202] text-zinc-400 font-sans selection:bg-[#D4AF37] selection:text-black">
      
      {/* --- NAV --- */}
      <nav className="fixed top-0 w-full z-[100] border-b border-zinc-900 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
              KOZIOL<span className="text-[#D4AF37]"> GATES</span>
            </span>
            <span className="text-[8px] text-zinc-600 uppercase tracking-[0.5em] mt-1 font-bold">Luxury Gate Manufacturer</span>
          </div>
          <div className="hidden md:flex gap-12 text-[10px] uppercase font-black tracking-widest">
            <a href="#konfigurator" className="text-white hover:text-[#D4AF37] transition-all">Konfigurator</a>
            <a href="#portfolio" className="hover:text-white transition-all">Realizacje</a>
            <a href="#kontakt" className="hover:text-white transition-all">Showroom</a>
          </div>
          <a href="tel:+48123456789" className="bg-[#D4AF37] text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
            Kontakt
          </a>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="pt-40 pb-20 px-6 text-center">
        <h2 className="text-[#D4AF37] text-[10px] uppercase tracking-[0.8em] font-black mb-6">Handmade Excellence</h2>
        <h1 className="text-5xl md:text-8xl font-light text-white italic tracking-tighter mb-8 leading-[1.1]">
          Twój wjazd w <br /> <span className="text-[#D4AF37] font-serif">Nowym Wymiarze</span>
        </h1>
        <p className="max-w-2xl mx-auto text-zinc-500 text-sm leading-relaxed mb-12 uppercase tracking-widest">
          Projektujemy i wykonujemy bramy, które są wizytówką najbardziej prestiżowych posiadłości.
        </p>
      </section>

      {/* --- KONFIGURATOR --- */}
      <section id="konfigurator" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* BOX KONFIGURATORA */}
          <div className="lg:col-span-8 bg-[#0A0A0A] border border-zinc-900 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]" />
            
            {/* STEPS */}
            <div className="flex gap-4 mb-16">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex-1 space-y-4">
                   <div className={`h-[1px] transition-all duration-700 ${step >= s ? 'bg-[#D4AF37]' : 'bg-zinc-800'}`} />
                   <span className={`text-[9px] font-black uppercase tracking-tighter ${step === s ? 'text-white' : 'text-zinc-700'}`}>Krok 0{s}</span>
                </div>
              ))}
            </div>

            <div className="min-h-[450px]">
              {step === 1 && (
                <div className="animate-in fade-in duration-700">
                  <h3 className="text-3xl font-light text-white italic mb-10">Wybierz bazę projektu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dbPrices.filter(p => p.category === 'base').map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => setConfig({ ...config, type: item.name, basePrice: item.value, maxWidth: item.max_value || 600 })}
                        className={`group cursor-pointer border transition-all relative overflow-hidden ${config.type === item.name ? 'border-[#D4AF37] bg-zinc-900/50' : 'border-zinc-800 hover:border-zinc-700'}`}
                      >
                        <div className="aspect-[16/9] overflow-hidden bg-black">
                          {item.image_url ? (
                            <img src={item.image_url} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                          ) : <div className="w-full h-full flex items-center justify-center"><Box size={40} className="text-zinc-900"/></div>}
                        </div>
                        <div className="p-4 flex justify-between items-center bg-black/60 backdrop-blur-md absolute bottom-0 w-full">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">{item.name}</span>
                          <div className={`w-2 h-2 rounded-full ${config.type === item.name ? 'bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]' : 'bg-zinc-800'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in duration-700">
                  <h3 className="text-3xl font-light text-white italic mb-10">Precyzja wymiaru</h3>
                  <div className="space-y-16 bg-black/40 p-10 border border-zinc-900">
                    <div className="space-y-6 text-center">
                      <div className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.4em]">Szerokość (cm)</div>
                      <div className="text-6xl font-light text-white italic">{config.width}</div>
                      <input type="range" min="200" max={config.maxWidth} step="10" value={config.width} onChange={(e) => setConfig({...config, width: parseInt(e.target.value)})} className="w-full accent-[#D4AF37] h-[2px] bg-zinc-800 appearance-none cursor-pointer" />
                      <p className="text-[8px] text-zinc-700 uppercase font-bold tracking-widest">Limit dla modelu {config.type}: {config.maxWidth}cm</p>
                    </div>
                    <div className="space-y-6 text-center pt-8 border-t border-zinc-900/50">
                      <div className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.4em]">Wysokość (cm)</div>
                      <div className="text-6xl font-light text-white italic">{config.height}</div>
                      <input type="range" min="100" max="250" step="5" value={config.height} onChange={(e) => setConfig({...config, height: parseInt(e.target.value)})} className="w-full accent-[#D4AF37] h-[2px] bg-zinc-800 appearance-none cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in duration-700">
                  <h3 className="text-3xl font-light text-white italic mb-10">Materiał i wypełnienie</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {dbPrices.filter(p => p.category === 'material').map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => setConfig({ ...config, material: item.name, materialPrice: item.value })}
                        className={`flex items-center gap-6 p-5 border cursor-pointer transition-all ${config.material === item.name ? 'border-[#D4AF37] bg-zinc-900/40' : 'border-zinc-800 hover:border-zinc-700'}`}
                      >
                        <div className="w-16 h-16 bg-black border border-zinc-900 shrink-0">
                          {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] text-[#D4AF37] font-black uppercase tracking-widest mb-1">Materiał Premium</p>
                          <h4 className="text-lg font-light text-white uppercase">{item.name}</h4>
                        </div>
                        {config.material === item.name && <CheckCircle2 size={24} className="text-[#D4AF37]" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="animate-in fade-in duration-700 text-center py-16">
                   <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#D4AF37]/30">
                     <Phone className="text-[#D4AF37]" size={30} />
                   </div>
                   <h3 className="text-3xl font-light text-white italic mb-4">Gotowy na projekt?</h3>
                   <p className="text-zinc-500 text-xs mb-10 max-w-sm mx-auto tracking-widest uppercase">Podaj numer telefonu, nasz doradca oddzwoni z propozycją terminu montażu.</p>
                   <input 
                    type="tel" placeholder="+48 000 000 000" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full max-w-md bg-transparent border-b-2 border-zinc-800 p-6 text-center text-4xl text-[#D4AF37] outline-none focus:border-[#D4AF37] transition-all font-light italic"
                   />
                </div>
              )}

              {step === 5 && (
                <div className="animate-in zoom-in duration-1000 text-center py-20">
                  <div className="w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(212,175,55,0.4)]">
                    <ShieldCheck size={48} className="text-black" />
                  </div>
                  <h2 className="text-4xl font-light text-white mb-4 italic">Zgłoszenie przyjęte</h2>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-12">Twój unikalny kod projektu: #{Math.floor(1000 + Math.random() * 9000)}</p>
                  <button onClick={() => setStep(1)} className="text-[#D4AF37] font-black uppercase text-[10px] tracking-widest flex items-center gap-2 mx-auto border border-[#D4AF37]/20 px-8 py-4 hover:bg-[#D4AF37] hover:text-black transition-all">
                    Nowa konfiguracja <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* NAV DOLNA */}
            {step < 5 && (
              <div className="mt-20 flex justify-between items-center">
                <button 
                  disabled={step === 1} onClick={() => setStep(step - 1)}
                  className={`text-[10px] font-black uppercase tracking-widest ${step === 1 ? 'opacity-0' : 'text-zinc-500 hover:text-white transition-all'}`}
                >
                  Wstecz
                </button>
                <button 
                  onClick={() => step < 4 ? setStep(step + 1) : handleOrder()}
                  className="bg-[#D4AF37] text-black px-12 py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-xl flex items-center gap-3"
                >
                  {step === 4 ? 'Wyślij projekt' : 'Dalej'} <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="lg:col-span-4 lg:sticky lg:top-40">
            <div className="bg-black border border-zinc-900 p-10 relative">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                <Box size={150} />
              </div>
              <h4 className="text-[10px] text-[#D4AF37] uppercase font-black tracking-[0.6em] mb-12 border-b border-zinc-900 pb-4">Karta Projektu</h4>
              
              <div className="space-y-6 mb-20">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-zinc-700 uppercase font-black">Model:</span>
                  <span className="text-sm text-white italic border-b border-zinc-900 flex-1 mx-4 mb-1 border-dotted"></span>
                  <span className="text-sm text-white uppercase font-bold tracking-tighter">{config.type || '---'}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-zinc-700 uppercase font-black">Szerokość:</span>
                  <span className="text-sm text-white italic border-b border-zinc-900 flex-1 mx-4 mb-1 border-dotted"></span>
                  <span className="text-sm text-white">{config.width} cm</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-zinc-700 uppercase font-black">Wypełnienie:</span>
                  <span className="text-sm text-white italic border-b border-zinc-900 flex-1 mx-4 mb-1 border-dotted"></span>
                  <span className="text-sm text-white uppercase font-bold tracking-tighter text-right max-w-[120px]">{config.material || '---'}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-900">
                <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Wycena Inwestycji</span>
                <div className="text-6xl font-light text-white tracking-tighter mt-4 italic">
                  {totalPrice.toLocaleString()} <span className="text-xs text-[#D4AF37] not-italic font-black">PLN</span>
                </div>
                <p className="text-[8px] text-zinc-800 uppercase font-black mt-6 tracking-widest italic leading-relaxed">
                  *Cena obejmuje projekt, produkcję oraz cynkowanie ogniowe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PORTFOLIO (Z BAZY) --- */}
      <section id="portfolio" className="bg-[#050505] py-32 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-20">
            <div>
              <h2 className="text-[#D4AF37] text-[10px] uppercase tracking-[0.8em] font-black mb-4">Latest Works</h2>
              <h3 className="text-5xl font-light text-white italic">Ostatnie realizacje</h3>
            </div>
            <button className="text-zinc-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border-b border-zinc-800 pb-1">Zobacz pełną galerię</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gallery.map((img) => (
              <div key={img.id} className="group relative aspect-[4/5] bg-zinc-900 overflow-hidden cursor-crosshair">
                <img src={img.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-60 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-8 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                   <p className="text-[9px] text-[#D4AF37] uppercase font-black tracking-widest mb-2">Realizacja #{img.id}</p>
                   <p className="text-white text-lg italic font-light">{img.description || 'Luxury Residence'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER / SHOWROOM --- */}
      <footer id="kontakt" className="bg-black pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32">
            <div>
              <h4 className="text-4xl font-light text-white italic mb-12 leading-tight">Odwiedź nasz showroom i poczuj <span className="text-[#D4AF37]">jakość premium</span> na własne oczy.</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="space-y-4">
                   <div className="text-[#D4AF37] font-black uppercase text-[10px] tracking-widest">Lokalizacja</div>
                   <p className="text-zinc-400 text-sm italic">ul. Przykładowa 123<br/>00-035 Ozorków, Polska</p>
                </div>
                <div className="space-y-4">
                   <div className="text-[#D4AF37] font-black uppercase text-[10px] tracking-widest">Kontakt</div>
                   <p className="text-zinc-400 text-sm italic">+48 123 456 789<br/>biuro@koziol-gates.pl</p>
                </div>
              </div>
              <div className="flex gap-6 mt-12 pt-12 border-t border-zinc-900/50">
                <Instagram className="text-zinc-700 hover:text-[#D4AF37] cursor-pointer" />
                <Facebook className="text-zinc-700 hover:text-[#D4AF37] cursor-pointer" />
              </div>
            </div>
            
            <div className="h-[400px] bg-zinc-900 border border-zinc-800 grayscale invert brightness-[0.4] hover:grayscale-0 hover:invert-0 hover:brightness-100 transition-all duration-1000">
               <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19642.87154247494!2d19.2748!3d51.964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ba76766436f51%3A0x6790b8f36c568f6a!2sOzork%C3%B3w!5e0!3m2!1spl!2spl!4v123456789" 
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" 
               />
            </div>
          </div>
          
          <div className="pt-12 border-t border-zinc-900 text-center flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-[10px] uppercase font-black tracking-[0.5em] text-zinc-700">© 2026 Koziol Luxury Gates</span>
            <div className="flex gap-8 text-[9px] uppercase font-black tracking-widest text-zinc-500">
               <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- STYLES --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:italic,wght@400;700&display=swap');
        
        html { scroll-behavior: smooth; }
        
        .font-serif { font-family: 'Playfair Display', serif; }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse { animation: spin-reverse 3s linear infinite; }

        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #D4AF37;
          cursor: pointer;
          border: 4px solid #000;
          box-shadow: 0 0 15px rgba(212,175,55,0.4);
          transition: all 0.3s ease;
        }

        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 25px rgba(212,175,55,0.6);
        }
      `}</style>
    </main>
  );
}