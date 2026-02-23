"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  LogOut, Upload, Trash2, Camera, RefreshCcw, 
  Users, Database, Image as ImageIcon, Plus, Save, 
  ChevronRight, CheckCircle, AlertCircle, Link as LinkIcon,
  X, ExternalLink, Settings, Info, Layers, Maximize2
} from 'lucide-react';

export default function AdminPanel() {
  // --- STANY SYSTEMOWE ---
  const [prices, setPrices] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'prices' | 'gallery'>('prices');
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [hasChanges, setHasChanges] = useState(false);
  
  // --- REFERENCJE I POMOCNICZE ---
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // --- STAN DLA NOWEJ REALIZACJI ---
  const [newItem, setNewItem] = useState({
    description: '',
    dimensions: '',
    price: '',
    model_id: '',
    material_id: ''
  });

  // --- INICJALIZACJA ---
  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/login');
  }

  async function fetchData() {
    try {
      setLoading(true);
      // Sortowanie po ID zamiast created_at, aby uniknąć błędu z Twojego screena nr 1
      const { data: p, error: pErr } = await supabase.from('prices').select('*').order('id', { ascending: true });
      const { data: g, error: gErr } = await supabase.from('gallery').select('*').order('id', { ascending: false });
      const { data: l, error: lErr } = await supabase.from('leads').select('*').order('id', { ascending: false });
      
      if (pErr) throw pErr;
      if (gErr) throw gErr;
      if (lErr) throw lErr;

      setPrices(p || []);
      setGallery(g || []);
      setLeads(l || []);
      setHasChanges(false);
    } catch (err: any) {
      console.error("Błąd pobierania danych:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- LOGIKA KONFIGURATORA (CENNIK) ---

  const handleLocalUpdate = (id: string, field: string, value: any) => {
    setHasChanges(true);
    setPrices(current => current.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addTempPriceOption = (category: 'base' | 'material') => {
    const tempId = `temp-${Date.now()}`;
    const newEntry = {
      id: tempId,
      name: category === 'base' ? "NOWY MODEL BRAMY" : "NOWY MATERIAŁ",
      value: 0,
      category: category,
      max_value: category === 'base' ? 600 : null,
      image_url: null,
      isTemp: true
    };
    setPrices([newEntry, ...prices]);
    setHasChanges(true);
  };

  const handleConfigImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedItemId) return;

    try {
      setUploading(true);
      // Oryginalna nazwa pliku bez usuwania znaków
      const fileName = `config/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
      handleLocalUpdate(selectedItemId, 'image_url', publicUrl);
    } catch (error: any) {
      alert("Błąd wgrywania (spróbuj pliku bez spacji jeśli ten nie przechodzi): " + error.message);
    } finally {
      setUploading(false);
      setSelectedItemId(null);
    }
  };

  async function saveAllChanges() {
    setSaveStatus('saving');
    try {
      for (const item of prices) {
        // Usuwamy isTemp i ewentualne created_at przed wysyłką do bazy
        const { isTemp, id, created_at, ...payload } = item;
        if (item.isTemp) {
          const { error } = await supabase.from('prices').insert([payload]);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('prices').update(payload).eq('id', item.id);
          if (error) throw error;
        }
      }
      setSaveStatus('success');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
      await fetchData();
    } catch (error: any) {
      alert("Błąd bazy: " + error.message);
      setSaveStatus('idle');
    }
  }

  const deletePriceItem = async (id: string, isTemp: boolean) => {
    if (!confirm("Usunąć pozycję z cennika?")) return;
    if (isTemp) {
      setPrices(prices.filter(p => p.id !== id));
      return;
    }
    try {
      const { error } = await supabase.from('prices').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      alert("Błąd usuwania: " + error.message);
    }
  };

  // --- LOGIKA GALERII ---

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileName = `portfolio/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
      
      const { error: dbError } = await supabase.from('gallery').insert([{ 
        image_url: publicUrl,
        description: newItem.description,
        dimensions: newItem.dimensions,
        price: parseFloat(newItem.price) || 0,
        model_id: newItem.model_id || null,
        material_id: newItem.material_id || null
      }]);

      if (dbError) throw dbError;

      setNewItem({ description: '', dimensions: '', price: '', model_id: '', material_id: '' });
      await fetchData();
    } catch (error: any) {
      alert("Błąd galerii: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <RefreshCcw className="animate-spin text-[#D4AF37]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans pb-20">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleConfigImageUpload} />

      {/* HEADER */}
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-[#D4AF37] rounded-full shadow-[0_0_15px_#D4AF37]" />
              <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                SYSTEM<span className="text-[#D4AF37]"> ZARZĄDZANIA</span>
              </h1>
            </div>
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.5em] mt-1 font-bold">Koziol Luxury Gates | Internal Access</p>
          </div>
          
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            className="group flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 px-6 py-3 transition-all rounded-sm"
          >
            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Wyloguj sesję</span>
            <LogOut size={16} className="text-zinc-700" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* TABY */}
        <div className="flex gap-1 md:gap-4 mb-16 bg-zinc-900/30 p-1 rounded-sm border border-zinc-900">
          {[
            { id: 'leads', label: 'Zgłoszenia', icon: Users },
            { id: 'prices', label: 'Konfigurator Cennika', icon: Database },
            { id: 'gallery', label: 'Realizacje Portfolio', icon: ImageIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-5 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-[#D4AF37] text-black shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-800/50'
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ZGŁOSZENIA */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-zinc-900/10 border-l-4 border-l-[#D4AF37] border-y border-r border-zinc-900 p-8 flex flex-col md:flex-row justify-between items-center group">
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <h3 className="text-3xl font-light text-white tracking-tighter">{lead.customer_phone}</h3>
                    <div className="bg-[#D4AF37]/10 text-[#D4AF37] text-[8px] font-black px-3 py-1 uppercase rounded-full border border-[#D4AF37]/20">Nowe zapytanie</div>
                  </div>
                  <div className="flex flex-wrap gap-8 text-[10px] text-zinc-500 uppercase font-black">
                    <span className="flex items-center gap-2"><Layers size={14}/> {lead.details?.type}</span>
                    <span className="flex items-center gap-2"><Maximize2 size={14}/> {lead.details?.width}x{lead.details?.height} CM</span>
                    <span className="flex items-center gap-2"><Info size={14}/> {lead.details?.material}</span>
                  </div>
                </div>
                <div className="flex items-center gap-12 mt-8 md:mt-0">
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-600 uppercase font-black mb-1">Cena konfiguracji</p>
                    <p className="text-4xl font-light text-white italic">{lead.total_price?.toLocaleString()} <span className="text-sm text-zinc-700 not-italic">PLN</span></p>
                  </div>
                  <button onClick={() => { if(confirm('Usunąć?')) supabase.from('leads').delete().eq('id', lead.id).then(() => fetchData()) }} className="text-zinc-800 hover:text-red-500 transition-all">
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CENNIK */}
        {activeTab === 'prices' && (
          <div className="space-y-24 pb-40">
            {hasChanges && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 bg-black border border-[#D4AF37] p-2 pr-2 pl-10 rounded-full shadow-2xl">
                <span className="text-[11px] uppercase font-black text-[#D4AF37] tracking-[0.2em] flex items-center gap-3">
                  <AlertCircle size={18} /> Niezapisane zmiany
                </span>
                <button 
                  onClick={saveAllChanges}
                  className="bg-[#D4AF37] text-black px-12 py-5 rounded-full text-[12px] font-black uppercase hover:bg-white transition-all flex items-center gap-3"
                >
                  {saveStatus === 'saving' ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                  Zapisz wszystko
                </button>
              </div>
            )}

            {/* MODELE */}
            <section>
              <div className="flex justify-between items-end mb-12 border-l-4 border-[#D4AF37] pl-8">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">Modele Bram</h2>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] mt-2 font-bold">Zarządzaj typami i ceną bazową</p>
                </div>
                <button onClick={() => addTempPriceOption('base')} className="bg-white text-black px-8 py-4 text-[11px] font-black uppercase hover:bg-[#D4AF37] transition-all flex items-center gap-3">
                  <Plus size={18} /> Dodaj model
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {prices.filter(p => p.category === 'base').map((item) => (
                  <div key={item.id} className="bg-zinc-900/10 border border-zinc-900 p-8 flex flex-col md:flex-row gap-10 items-start group">
                    <div 
                      onClick={() => { setSelectedItemId(item.id); fileInputRef.current?.click(); }}
                      className="w-52 h-52 bg-black border border-zinc-800 relative group cursor-pointer overflow-hidden flex-shrink-0"
                    >
                      {item.image_url ? (
                        <img src={item.image_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all duration-700" />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-800 group-hover:text-[#D4AF37]">
                          <Camera size={40} />
                          <span className="text-[10px] font-black uppercase mt-3">Wgraj zdjęcie</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                      <div className="space-y-3">
                        <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Nazwa</label>
                        <input 
                          value={item.name} 
                          onChange={(e) => handleLocalUpdate(item.id, 'name', e.target.value)}
                          className="w-full bg-black border border-zinc-800 p-5 text-sm font-black uppercase outline-none focus:border-[#D4AF37] text-white"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Cena bazowa</label>
                        <input 
                          type="number"
                          value={item.value} 
                          onChange={(e) => handleLocalUpdate(item.id, 'value', parseFloat(e.target.value))}
                          className="w-full bg-black border border-zinc-800 p-5 text-sm font-black text-[#D4AF37] outline-none"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-between items-center border-t border-zinc-900 pt-8 mt-4">
                        <div className="flex items-center gap-6">
                          <label className="text-[10px] text-zinc-600 uppercase font-black">Max szerokość (cm):</label>
                          <input 
                            type="number"
                            value={item.max_value || ''} 
                            onChange={(e) => handleLocalUpdate(item.id, 'max_value', parseInt(e.target.value))}
                            className="bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm w-32 outline-none text-white"
                          />
                        </div>
                        <button onClick={() => deletePriceItem(item.id, !!item.isTemp)} className="text-zinc-800 hover:text-red-500">
                          <Trash2 size={22} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* MATERIAŁY */}
            <section>
              <div className="flex justify-between items-end mb-12 border-l-4 border-[#D4AF37] pl-8">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">Materiały & Wypełnienia</h2>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] mt-2 font-bold">Ceny za metr kwadratowy (m²)</p>
                </div>
                <button onClick={() => addTempPriceOption('material')} className="bg-zinc-800 text-white px-8 py-4 text-[11px] font-black uppercase hover:bg-white hover:text-black transition-all">
                  <Plus size={18} /> Dodaj materiał
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prices.filter(p => p.category === 'material').map((item) => (
                  <div key={item.id} className="bg-zinc-900/10 border border-zinc-900 p-6 flex gap-6 items-center group">
                    <div 
                      onClick={() => { setSelectedItemId(item.id); fileInputRef.current?.click(); }}
                      className="w-20 h-20 bg-black border border-zinc-800 flex-shrink-0 relative cursor-pointer"
                    >
                      {item.image_url ? (
                        <img src={item.image_url} className="w-full h-full object-cover opacity-60" />
                      ) : (
                        <Camera className="m-auto mt-6 text-zinc-800" size={20} />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <input 
                        value={item.name} 
                        onChange={(e) => handleLocalUpdate(item.id, 'name', e.target.value)}
                        className="w-full bg-transparent border-b border-zinc-800 text-[12px] font-black uppercase outline-none focus:border-[#D4AF37] text-white pb-1"
                      />
                      <div className="flex items-center gap-3">
                        <input 
                          type="number"
                          value={item.value} 
                          onChange={(e) => handleLocalUpdate(item.id, 'value', parseFloat(e.target.value))}
                          className="bg-black border border-zinc-800 px-3 py-1.5 text-xs text-[#D4AF37] font-black w-28"
                        />
                        <span className="text-[9px] text-zinc-600 uppercase font-black">PLN / M²</span>
                      </div>
                    </div>
                    <button onClick={() => deletePriceItem(item.id, !!item.isTemp)} className="text-zinc-800 hover:text-red-500 p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* PORTFOLIO */}
        {activeTab === 'gallery' && (
          <div className="space-y-20 animate-in fade-in duration-700">
            <section className="bg-zinc-900/20 border border-zinc-800 p-10 md:p-16">
              <h2 className="text-[#D4AF37] text-3xl font-black uppercase tracking-[0.2em] italic mb-12 flex items-center gap-6">
                <Plus size={32} /> Nowa realizacja
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[11px] text-zinc-500 uppercase font-black tracking-widest">Model Bramy</label>
                      <select 
                        className="w-full bg-black border border-zinc-800 p-5 text-sm font-black uppercase text-white outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
                        value={newItem.model_id}
                        onChange={e => setNewItem({...newItem, model_id: e.target.value})}
                      >
                        <option value="">-- WYBIERZ --</option>
                        {prices.filter(p => p.category === 'base').map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] text-zinc-500 uppercase font-black tracking-widest">Materiał</label>
                      <select 
                        className="w-full bg-black border border-zinc-800 p-5 text-sm font-black uppercase text-white outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
                        value={newItem.material_id}
                        onChange={e => setNewItem({...newItem, material_id: e.target.value})}
                      >
                        <option value="">-- WYBIERZ --</option>
                        {prices.filter(p => p.category === 'material').map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <input 
                      className="w-full bg-black border border-zinc-800 p-5 text-sm font-black uppercase outline-none focus:border-zinc-500 text-white"
                      placeholder="OPIS / MIASTO"
                      value={newItem.description}
                      onChange={e => setNewItem({...newItem, description: e.target.value})}
                    />
                    <input 
                      type="number"
                      className="w-full bg-black border border-zinc-800 p-5 text-sm font-black text-[#D4AF37] outline-none"
                      placeholder="CENA REALIZACJI"
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: e.target.value})}
                    />
                  </div>
                </div>

                <label className={`
                  flex-1 border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-12 text-center
                  ${uploading ? 'border-[#D4AF37] animate-pulse' : 'border-zinc-800 bg-black hover:border-[#D4AF37]'}
                `}>
                  <Upload className="text-zinc-800 mb-6" size={60} />
                  <span className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-600 leading-relaxed">
                    {uploading ? 'WGRYWANIE...' : 'DODAJ ZDJĘCIE'}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleGalleryUpload} disabled={uploading} />
                </label>
              </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {gallery.map((item) => (
                <div key={item.id} className="bg-zinc-900/10 border border-zinc-900 flex flex-col group">
                  <div className="aspect-[4/5] overflow-hidden bg-black relative">
                    <img src={item.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" />
                  </div>
                  
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <h4 className="text-[11px] font-black uppercase text-white truncate">{item.description || 'REALIZACJA'}</h4>
                    <div className="flex-1 space-y-1">
                      <div className="text-[8px] text-[#D4AF37] font-black uppercase flex items-center gap-2">
                        <CheckCircle size={10}/> {prices.find(p => p.id === item.model_id)?.name || 'Brak powiązania'}
                      </div>
                      <div className="text-[8px] text-zinc-600 font-black uppercase flex items-center gap-2">
                        <CheckCircle size={10}/> {prices.find(p => p.id === item.material_id)?.name || 'Brak powiązania'}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
                       <p className="text-lg font-light text-white italic">{item.price?.toLocaleString()} <span className="text-[10px] text-zinc-600 not-italic uppercase">PLN</span></p>
                       <button onClick={() => { if(confirm('Usunąć?')) supabase.from('gallery').delete().eq('id', item.id).then(() => fetchData()) }} className="text-zinc-800 hover:text-red-500 transition-all">
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fade-in 0.8s ease-out forwards; }
        
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23D4AF37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1.25rem center;
          background-size: 1.2em;
        }
      `}</style>
    </div>
  );
}