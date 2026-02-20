"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, LogOut, Upload, Trash2, Camera, RefreshCcw, Users, Database, Image as ImageIcon } from 'lucide-react';

export default function AdminPanel() {
  const [prices, setPrices] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prices' | 'gallery' | 'leads'>('leads');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const [newItem, setNewItem] = useState({
    description: '', dimensions: '', material: '', filling: '', price: ''
  });

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/login');
  }

  async function fetchData() {
    const { data: p } = await supabase.from('prices').select('*').order('category');
    const { data: g } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    const { data: l } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    
    if (p) setPrices(p);
    if (g) setGallery(g);
    if (l) setLeads(l);
    setLoading(false);
  }

  const handleFileUpload = async (e: any) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      
      let { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('gallery').insert([{
        image_url: publicUrl,
        ...newItem,
        price: parseFloat(newItem.price) || 0
      }]);

      if (dbError) throw dbError;
      alert("Dodano do galerii!");
      fetchData();
      setNewItem({ description: '', dimensions: '', material: '', filling: '', price: '' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-[#D4AF37] bg-black min-h-screen">Inicjalizacja systemu...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-[#D4AF37] text-xl uppercase tracking-widest font-bold italic">Admin Panel</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Koziol Luxury Gates v1.0</p>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-zinc-500 hover:text-red-500 flex items-center gap-2 transition-all text-xs uppercase tracking-widest">
          <LogOut size={16} /> Wyloguj
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* TABS NAVIGATION */}
        <div className="flex gap-4 mb-8 border-b border-zinc-900">
          <button onClick={() => setActiveTab('leads')} className={`pb-4 px-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'leads' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-zinc-500'}`}>
            <Users size={16} /> Zgłoszenia ({leads.length})
          </button>
          <button onClick={() => setActiveTab('prices')} className={`pb-4 px-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'prices' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-zinc-500'}`}>
            <Database size={16} /> Cennik
          </button>
          <button onClick={() => setActiveTab('gallery')} className={`pb-4 px-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'gallery' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-zinc-500'}`}>
            <ImageIcon size={16} /> Galeria
          </button>
        </div>

        {/* TAB 1: LEADS (ZGŁOSZENIA) */}
        {activeTab === 'leads' && (
          <div className="animate-in fade-in duration-500 space-y-4">
            {leads.length === 0 ? (
              <p className="text-zinc-600 italic text-center py-20">Brak nowych zgłoszeń od klientów.</p>
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="bg-zinc-900/30 border border-zinc-800 p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-[#D4AF37]/30 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[#D4AF37] font-bold text-lg tracking-wider">{lead.customer_phone}</span>
                      <span className="text-[10px] text-zinc-600 uppercase bg-black px-2 py-1">{new Date(lead.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      {lead.details.type} | {lead.details.width}x{lead.details.height}cm | {lead.details.material}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Wycena</p>
                      <p className="text-xl text-[#D4AF37] font-light">{lead.total_price?.toLocaleString()} PLN</p>
                    </div>
                    <button 
                      onClick={async () => { if(confirm('Usunąć zgłoszenie?')) { await supabase.from('leads').delete().eq('id', lead.id); fetchData(); } }}
                      className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PRICES (CENNIK) */}
        {activeTab === 'prices' && (
          <div className="animate-in fade-in duration-500 grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-6">Bazy i Konstrukcje</h2>
              <div className="space-y-3">
                {prices.filter(p => p.category === 'base').map((item) => (
                  <div key={item.id} className="bg-zinc-900/20 border border-zinc-800 p-4 flex justify-between items-center">
                    <span className="text-xs uppercase tracking-tighter">{item.name}</span>
                    <input type="number" defaultValue={item.value} onBlur={(e) => supabase.from('prices').update({ value: parseFloat(e.target.value) }).eq('id', item.id).then(fetchData)} className="bg-black border border-zinc-700 p-2 w-28 text-right text-sm text-[#D4AF37] outline-none focus:border-[#D4AF37]" />
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-6">Materiały i Wypełnienia</h2>
              <div className="space-y-3">
                {prices.filter(p => p.category === 'material').map((item) => (
                  <div key={item.id} className="bg-zinc-900/20 border border-zinc-800 p-4 flex justify-between items-center">
                    <span className="text-xs uppercase tracking-tighter">{item.name}</span>
                    <input type="number" defaultValue={item.value} onBlur={(e) => supabase.from('prices').update({ value: parseFloat(e.target.value) }).eq('id', item.id).then(fetchData)} className="bg-black border border-zinc-700 p-2 w-28 text-right text-sm text-[#D4AF37] outline-none focus:border-[#D4AF37]" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: GALLERY (GALERIA) */}
        {activeTab === 'gallery' && (
          <div className="animate-in fade-in duration-500 space-y-12">
            <section className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-sm max-w-2xl">
              <h2 className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-8 flex items-center gap-2">
                <Camera size={16} /> Dodaj nową realizację do portfolio
              </h2>
              <div className="space-y-4">
                <input placeholder="Opis (np. Brama Ozorków Modern)" className="w-full bg-black border border-zinc-800 p-3 text-sm" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Wymiary" className="bg-black border border-zinc-800 p-3 text-sm" value={newItem.dimensions} onChange={e => setNewItem({...newItem, dimensions: e.target.value})} />
                  <input placeholder="Materiał" className="bg-black border border-zinc-800 p-3 text-sm" value={newItem.material} onChange={e => setNewItem({...newItem, material: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Wypełnienie" className="bg-black border border-zinc-800 p-3 text-sm" value={newItem.filling} onChange={e => setNewItem({...newItem, filling: e.target.value})} />
                  <input type="number" placeholder="Cena" className="bg-black border border-zinc-800 p-3 text-sm" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                </div>
                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-800 p-10 cursor-pointer hover:border-[#D4AF37] transition-all group">
                  {uploading ? <RefreshCcw className="animate-spin text-[#D4AF37]" /> : <Upload className="group-hover:text-[#D4AF37] transition-colors" size={32} />}
                  <span className="text-[10px] uppercase tracking-[0.2em]">{uploading ? 'Trwa wysyłanie...' : 'Wybierz plik zdjęcia'}</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </section>

            <section>
              <h2 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-6">Podgląd Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {gallery.map((img) => (
                  <div key={img.id} className="group relative aspect-square border border-zinc-800 overflow-hidden bg-zinc-900">
                    <img src={img.image_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all" alt="" />
                    <button onClick={async () => { if(confirm('Usunąć zdjęcie?')) { await supabase.from('gallery').delete().eq('id', img.id); fetchData(); } }} className="absolute bottom-2 right-2 p-2 bg-red-600/80 rounded-full opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}