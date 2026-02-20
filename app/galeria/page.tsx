"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Maximize2, X, Ruler, PenTool, CircleDollarSign } from 'lucide-react';

export default function PublicGallery() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedImg, setSelectedImg] = useState<any>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      {/* NAGŁÓWEK */}
      <header className="max-w-7xl mx-auto mb-16 text-center">
        <h1 className="text-[#D4AF37] text-xs uppercase tracking-[0.5em] mb-4">Nasze Realizacje</h1>
        <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight italic">Luxury Gates Portfolio</h2>
      </header>

      {/* SIATKA ZDJĘĆ */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group relative cursor-pointer overflow-hidden border border-zinc-900 bg-zinc-900/20 transition-all hover:border-[#D4AF37]/50"
            onClick={() => setSelectedImg(item)}
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                src={item.image_url} 
                alt={item.description}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-light tracking-wide truncate">{item.description}</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-2">Zobacz szczegóły →</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL (PODGLĄD SZCZEGÓŁÓW) */}
      {selectedImg && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
          <button onClick={() => setSelectedImg(null)} className="absolute top-8 right-8 text-white hover:text-[#D4AF37] z-50">
            <X size={40} />
          </button>
          
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] lg:aspect-square">
              <img src={selectedImg.image_url} className="w-full h-full object-contain" alt="" />
            </div>
            
            <div className="space-y-8">
              <h3 className="text-[#D4AF37] text-xs uppercase tracking-[0.4em]">Specyfikacja Realizacji</h3>
              <h2 className="text-4xl font-light leading-tight">{selectedImg.description}</h2>
              
              <div className="grid grid-cols-1 gap-6 py-8 border-y border-zinc-800">
                <div className="flex items-center gap-4">
                  <Ruler className="text-[#D4AF37]" size={20} />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Wymiary</p>
                    <p className="text-lg font-light">{selectedImg.dimensions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <PenTool className="text-[#D4AF37]" size={20} />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Materiał i Wypełnienie</p>
                    <p className="text-lg font-light">{selectedImg.material} / {selectedImg.filling}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <CircleDollarSign className="text-[#D4AF37]" size={20} />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Orientacyjny koszt</p>
                    <p className="text-2xl font-mono text-[#D4AF37]">{selectedImg.price?.toLocaleString()} PLN</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                   setSelectedImg(null);
                   window.location.href = '/'; // Powrót do konfiguratora
                }}
                className="w-full py-5 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-white transition-all"
              >
                Chcę podobną bramę
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}