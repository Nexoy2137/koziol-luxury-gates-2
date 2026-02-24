"use client";
import { useEffect, useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
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
  const [activeTab, setActiveTab] = useState<'leads' | 'prices' | 'gallery' | 'options'>('prices');
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [hasChanges, setHasChanges] = useState(false);
  const [seenUnreadLeadIds, setSeenUnreadLeadIds] = useState<number[]>([]);
  const [antiSpamDelaySec, setAntiSpamDelaySec] = useState<number>(180);
  const [antiSpamMaxPerDay, setAntiSpamMaxPerDay] = useState<number>(5);
  const [steelTypes, setSteelTypes] = useState<Array<{ label: string; price: number }>>([]);
  const [ralColors, setRalColors] = useState<Array<{ code: string; name?: string; hex?: string; price: number }>>([]);
  const [paintTypes, setPaintTypes] = useState<Array<{ label: string; price: number }>>([]);
  const [allowOtherRal, setAllowOtherRal] = useState<boolean>(true);
  const [otherRalPrice, setOtherRalPrice] = useState<number>(0);
  
  // --- REFERENCJE I POMOCNICZE ---
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const activeTabRef = useRef<'leads' | 'prices' | 'gallery' | 'options'>(activeTab);
  const seenUnreadLeadIdsRef = useRef<number[]>([]);

  // --- STAN DLA NOWEJ REALIZACJI ---
  const [newItem, setNewItem] = useState({
    description: '',
    dimensions: '',
    price: '',
    model_id: '',
    material_id: '',
    product: '' as '' | 'brama' | 'furtka',
    steel_type: '',
    ral_code: '',
    paint_type: '',
  });

  // --- INICJALIZACJA ---
  useEffect(() => {
    checkUser();
    // przy starcie odtwarzamy ostatnio wybraną sekcję i ewentualnie
    // dopiero po odświeżeniu/aplikacji pendingu przenosimy do odczytanych
    const init = async () => {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('admin-active-tab') as
          | 'leads'
          | 'prices'
          | 'gallery'
          | 'options'
          | null;
        if (stored === 'leads' || stored === 'prices' || stored === 'gallery' || stored === 'options') {
          setActiveTab(stored);
        }

        const pendingKey = 'admin-pending-mark-read-ids';
        const pendingRaw = window.localStorage.getItem(pendingKey);
        if (pendingRaw) {
          try {
            const ids = (JSON.parse(pendingRaw) as unknown[])
              .map((x) => Number(x))
              .filter((n) => Number.isFinite(n) && n > 0);
            if (ids.length) {
              const { error } = await supabase
                .from('leads')
                .update({ is_read: true })
                .in('id', ids);
              if (error) throw error;
            }
          } catch (e: any) {
            console.error('Błąd aplikowania pendingu odczytanych:', e?.message || e);
          } finally {
            window.localStorage.removeItem(pendingKey);
          }
        }
      }
      await fetchData();
    };

    init();
  }, []);

  // zapamiętywanie aktywnej zakładki między odświeżeniami
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('admin-active-tab', activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    seenUnreadLeadIdsRef.current = seenUnreadLeadIds;
  }, [seenUnreadLeadIds]);

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
      const { data: s, error: sErr } = await supabase.from('settings').select('*');
      
      if (pErr) throw pErr;
      if (gErr) throw gErr;
      if (lErr) throw lErr;
      if (sErr && sErr.code !== 'PGRST116') throw sErr;

      setPrices(p || []);
      setGallery(g || []);
      setLeads(l || []);
      setHasChanges(false);

      const antiSpamRow = (s || []).find((row: any) => row.key === 'anti_spam_config');
      if (antiSpamRow && antiSpamRow.value) {
        const cfg = antiSpamRow.value as { delaySec?: number; maxPerDay?: number };
        if (typeof cfg.delaySec === 'number' && cfg.delaySec > 0) {
          setAntiSpamDelaySec(cfg.delaySec);
        }
        if (typeof cfg.maxPerDay === 'number' && cfg.maxPerDay > 0) {
          setAntiSpamMaxPerDay(cfg.maxPerDay);
        }
      }

      const optRow = (s || []).find((row: any) => row.key === 'configurator_options');
      if (optRow && optRow.value) {
        const v = optRow.value as any;
        const st = Array.isArray(v.steelTypes) ? v.steelTypes : [];
        const rc = Array.isArray(v.ralColors) ? v.ralColors : [];
        const pt = Array.isArray(v.paintTypes) ? v.paintTypes : [];
        setSteelTypes(
          st
            .map((x: any) => {
              if (typeof x === 'string') return { label: x, price: 0 };
              return {
                label: String(x?.label || '').trim(),
                price: Number(x?.price) || 0,
              };
            })
            .filter((x: any) => x.label && x.label.trim().length >= 2)
        );
        setRalColors(
          rc
            .map((x: any) => ({
              code: String(x?.code || '').trim(),
              name: x?.name ? String(x.name).trim() : undefined,
              hex: x?.hex ? String(x.hex).trim() : undefined,
              price: Number(x?.price) || 0,
            }))
            .filter((x: any) => x.code.length >= 4)
        );
        setPaintTypes(
          pt
            .map((x: any) => ({
              label: String(x?.label || '').trim(),
              price: Number(x?.price) || 0,
            }))
            .filter((x: any) => x.label.length >= 2)
        );
        setAllowOtherRal(
          typeof v.allowOtherRal === 'boolean' ? v.allowOtherRal : true
        );
        setOtherRalPrice(typeof v.otherRalPrice === 'number' ? v.otherRalPrice : 0);
      } else {
        // domyślne opcje (jeśli brak w bazie)
        setSteelTypes([
          { label: 'S235', price: 0 },
          { label: 'S355', price: 0 },
          { label: 'Ocynk + malowanie proszkowe', price: 0 },
        ]);
        setRalColors([
          { code: 'RAL 9005', name: 'Czarny głęboki', hex: '#0A0A0A', price: 0 },
          { code: 'RAL 7016', name: 'Antracyt', hex: '#383E42', price: 0 },
          { code: 'RAL 8017', name: 'Brąz czekoladowy', hex: '#4E3B31', price: 0 },
          { code: 'RAL 9016', name: 'Biały', hex: '#F6F6F6', price: 0 },
        ]);
        setPaintTypes([
          { label: 'Standard (mat)', price: 0 },
          { label: 'Struktura drobna', price: 0 },
        ]);
        setAllowOtherRal(true);
        setOtherRalPrice(0);
      }
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

  const addTempPriceOption = (category: 'base' | 'wicket_base' | 'material') => {
    const tempId = `temp-${Date.now()}`;
    const newEntry = {
      id: tempId,
      name:
        category === 'base'
          ? 'NOWY MODEL BRAMY'
          : category === 'wicket_base'
            ? 'NOWY MODEL FURTKI'
            : 'NOWY MATERIAŁ',
      value: 0,
      category: category,
      max_width: category === 'base' ? 600 : category === 'wicket_base' ? 200 : null,
      max_height: category === 'base' ? 250 : category === 'wicket_base' ? 220 : null,
      min_width: category === 'base' ? 200 : category === 'wicket_base' ? 80 : null,
      min_height: category === 'base' ? 100 : category === 'wicket_base' ? 100 : null,
      image_url: null,
      isTemp: true
    };
    setPrices([newEntry, ...prices]);
    setHasChanges(true);
  };

  const handleConfigImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
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
        description: newItem.description || null,
        dimensions: newItem.dimensions || null,
        price: parseFloat(newItem.price) || 0,
        model_id: newItem.model_id || null,
        material_id: newItem.material_id || null,
        product: newItem.product || null,
        steel_type: newItem.steel_type || null,
        ral_code: newItem.ral_code || null,
        paint_type: newItem.paint_type || null,
      }]);

      if (dbError) throw dbError;

      setNewItem({
        description: '',
        dimensions: '',
        price: '',
        model_id: '',
        material_id: '',
        product: '',
        steel_type: '',
        ral_code: '',
        paint_type: '',
      });
      await fetchData();
    } catch (error: any) {
      alert("Błąd galerii: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateLead = async (id: number, changes: Record<string, any>) => {
    try {
      const { error } = await supabase.from('leads').update(changes).eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      alert("Błąd aktualizacji zgłoszenia: " + error.message);
    }
  };

  const saveConfiguratorOptions = async () => {
    try {
      const payload = {
        key: 'configurator_options',
        value: {
          steelTypes: steelTypes
            .map((s) => ({
              label: String(s.label || '').trim(),
              price: Number(s.price) || 0,
            }))
            .filter((s) => s.label.length >= 2),
          ralColors: ralColors
            .map((c) => ({
              code: String(c.code || '').trim(),
              name: c.name ? String(c.name).trim() : undefined,
              hex: c.hex ? String(c.hex).trim() : undefined,
              price: Number(c.price) || 0,
            }))
            .filter((c) => c.code.length >= 4),
          paintTypes: paintTypes
            .map((p) => ({
              label: String(p.label || '').trim(),
              price: Number(p.price) || 0,
            }))
            .filter((p) => p.label.length >= 2),
          allowOtherRal,
          otherRalPrice: Number(otherRalPrice) || 0,
        },
      };
      const { error } = await supabase
        .from('settings')
        .upsert(payload, { onConflict: 'key' as any });
      if (error) throw error;
      alert('Opcje konfiguratora zapisane.');
      await fetchData();
    } catch (e: any) {
      alert('Błąd zapisu opcji: ' + (e?.message || e));
    }
  };

  const leadGroups = {
    new: [...leads]
      .filter((lead) => !lead.is_read)
      .sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      }),
    read: [...leads]
      .filter((lead) => lead.is_read)
      .sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      }),
  };

  const queuePendingMarkRead = (ids: number[]) => {
    if (typeof window === 'undefined') return;
    const key = 'admin-pending-mark-read-ids';
    const existingRaw = window.localStorage.getItem(key);
    const existing = existingRaw ? (JSON.parse(existingRaw) as unknown[]) : [];
    const merged = Array.from(
      new Set(
        [...existing, ...ids]
          .map((x) => Number(x))
          .filter((n) => Number.isFinite(n) && n > 0)
      )
    );
    window.localStorage.setItem(key, JSON.stringify(merged));
  };

  const flushSeenLeadsToRead = async () => {
    if (!seenUnreadLeadIdsRef.current.length) return;
    const ids = [...seenUnreadLeadIdsRef.current];
    queuePendingMarkRead(ids);
    setSeenUnreadLeadIds([]);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ is_read: true })
        .in('id', ids);
      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      alert("Błąd przenoszenia do odczytanych: " + error.message);
    }
  };

  // gdy użytkownik jest w zakładce Zgłoszenia, zapamiętujemy które NOWE zgłoszenia zobaczył (ale nie przenosimy od razu)
  useEffect(() => {
    if (activeTab !== 'leads') return;
    const ids = leads.filter((l) => !l.is_read).map((l) => l.id as number);
    if (!ids.length) return;
    setSeenUnreadLeadIds((prev) => Array.from(new Set([...prev, ...ids])));
  }, [activeTab, leads]);

  // przy odświeżeniu/wyjściu ze strony: zapisujemy pending do localStorage (aplikuje się przy następnym wejściu)
  useEffect(() => {
    const handler = () => {
      if (activeTabRef.current !== 'leads') return;
      const ids = seenUnreadLeadIdsRef.current;
      if (!ids.length) return;
      queuePendingMarkRead(ids);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, []);

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
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/')}
              className="group flex items-center gap-2 bg-zinc-900/40 border border-zinc-800 px-3 py-2 text-[9px] uppercase font-black tracking-widest text-zinc-500 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-all"
            >
              ← Strona główna
            </button>
            <button
              onClick={() => router.push('/konto')}
              className="group flex items-center gap-2 bg-zinc-900/40 border border-zinc-800 px-4 py-2 text-[9px] uppercase font-black tracking-widest text-zinc-500 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-all"
            >
              Ustawienia konta
            </button>
            <button 
              onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
              className="group flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 px-6 py-3 transition-all rounded-sm"
            >
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Wyloguj sesję</span>
              <LogOut size={16} className="text-zinc-700" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* TABY */}
        <div className="flex gap-1 md:gap-4 mb-16 bg-zinc-900/30 p-1 rounded-sm border border-zinc-900">
          {[
            { id: 'leads', label: 'Zgłoszenia', icon: Users },
            { id: 'prices', label: 'Konfigurator Cennika', icon: Database },
            { id: 'gallery', label: 'Realizacje Portfolio', icon: ImageIcon },
            { id: 'options', label: 'Opcje (Stal / RAL)', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={async () => {
                if (activeTab === 'leads' && tab.id !== 'leads') {
                  await flushSeenLeadsToRead();
                }
                setActiveTab(tab.id as any);
              }}
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
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* OCHRONA ANTY-SPAM DLA KONFIGURATORA */}
            <section className="bg-zinc-900/40 border border-zinc-900 px-6 py-5 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 mb-1">
                    Ochrona formularza konfiguratora
                  </p>
                  <p className="text-xs text-zinc-400 max-w-xl">
                    Z jednego urządzenia można wysłać ograniczoną liczbę zapytań, aby zabezpieczyć system przed spamem i automatycznymi zgłoszeniami.
                  </p>
                </div>
                <div className="flex flex-col md:items-end gap-1 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
                  <span>
                    Aktualny odstęp:{" "}
                    <span className="text-[#D4AF37]">
                      {antiSpamDelaySec} s
                    </span>
                  </span>
                  <span>
                    Maks. zapytań dziennie:{" "}
                    <span className="text-[#D4AF37]">
                      {antiSpamMaxPerDay}
                    </span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
                <div className="flex flex-col gap-2">
                  <label className="uppercase tracking-[0.25em] text-zinc-500">
                    Minimalny odstęp (sekundy)
                  </label>
                  <input
                    type="number"
                    min={10}
                    className="bg-black border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                    value={antiSpamDelaySec}
                    onChange={(e) =>
                      setAntiSpamDelaySec(
                        Math.max(10, parseInt(e.target.value) || 0)
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="uppercase tracking-[0.25em] text-zinc-500">
                    Maks. zapytań dziennie
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="bg-black border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                    value={antiSpamMaxPerDay}
                    onChange={(e) =>
                      setAntiSpamMaxPerDay(
                        Math.max(1, parseInt(e.target.value) || 0)
                      )
                    }
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={async () => {
                      try {
                        const payload = {
                          key: 'anti_spam_config',
                          value: {
                            delaySec: antiSpamDelaySec,
                            maxPerDay: antiSpamMaxPerDay,
                          },
                        };
                        const { error } = await supabase
                          .from('settings')
                          .upsert(payload, { onConflict: 'key' as any });
                        if (error) throw error;
                        alert('Ustawienia anty-spam zapisane.');
                      } catch (error: any) {
                        alert('Błąd zapisu ustawień: ' + error.message);
                      }
                    }}
                    className="w-full md:w-auto px-6 py-3 bg-[#D4AF37] text-black text-[11px] font-black uppercase tracking-[0.25em] hover:bg-white transition-all"
                  >
                    Zapisz ustawienia
                  </button>
                </div>
              </div>
            </section>
            {/* NOWE ZGŁOSZENIA */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-black flex items-center gap-3">
                  <Users size={16} /> Nowe zgłoszenia
                </h2>
                <span className="text-[10px] text-zinc-500 uppercase">
                  {leadGroups.new.length} oczekujących
                </span>
              </div>
              {leadGroups.new.length === 0 ? (
                <p className="text-[11px] text-zinc-600 italic">
                  Brak nowych zgłoszeń.
                </p>
              ) : (
                <div className="space-y-6">
                  {leadGroups.new.map((lead) => {
                    const rawDetails = (lead.details || {}) as any;
                    const primaryDetails = rawDetails.primary || rawDetails;
                    const secondaryDetails =
                      rawDetails.primary || rawDetails.secondary
                        ? rawDetails.secondary
                        : null;

                    const renderConfigRow = (
                      cfg: any,
                      label: string,
                      compact: boolean = false
                    ) => (
                      <div
                        className={`flex flex-wrap gap-4 text-[10px] uppercase font-black ${
                          compact ? "text-zinc-500" : "text-zinc-500"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Layers size={compact ? 12 : 14} /> {cfg?.type}{" "}
                          <span className="text-zinc-700">
                            ({cfg?.product || label})
                          </span>
                        </span>
                        {cfg?.width && cfg?.height && (
                          <span className="flex items-center gap-2">
                            <Maximize2 size={compact ? 12 : 14} /> {cfg.width}x
                            {cfg.height} CM
                          </span>
                        )}
                        {cfg?.material && (
                          <span className="flex items-center gap-2">
                            <Info size={compact ? 12 : 14} /> {cfg.material}
                          </span>
                        )}
                        {cfg?.steelType && (
                          <span className="flex items-center gap-2">
                            <Info size={compact ? 12 : 14} /> {cfg.steelType}
                          </span>
                        )}
                        {cfg?.ral && (
                          <span className="flex items-center gap-2">
                            <Info size={compact ? 12 : 14} />{" "}
                            {cfg.ral === "INNY" && cfg.ralCustomCode
                              ? cfg.ralCustomCode
                              : cfg.ral}
                          </span>
                        )}
                        {cfg?.paintType && (
                          <span className="flex items-center gap-2">
                            <Info size={compact ? 12 : 14} /> {cfg.paintType}
                          </span>
                        )}
                      </div>
                    );

                    return (
                      <div
                        key={lead.id}
                        className="bg-zinc-900/20 border-l-4 border-l-[#D4AF37] border-y border-r border-zinc-900 p-8 flex flex-col md:flex-row justify-between items-center gap-6"
                      >
                        <div className="space-y-4 w-full">
                          <div className="flex flex-wrap items-center gap-4">
                            <h3 className="text-3xl font-light text-white tracking-tighter">
                              {lead.customer_phone}
                            </h3>
                            <div className="bg-[#D4AF37]/10 text-[#D4AF37] text-[8px] font-black px-3 py-1 uppercase rounded-full border border-[#D4AF37]/20">
                              Nowe zapytanie
                            </div>
                            {lead.created_at && (
                              <span className="text-[10px] text-zinc-500 uppercase font-black">
                                {new Date(lead.created_at).toLocaleString(
                                  "pl-PL",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            )}
                            {(lead.customer_city ||
                              lead.customer_postal_code) && (
                              <div className="text-[10px] text-zinc-400 uppercase font-black flex items-center gap-2">
                                <span>
                                  {lead.customer_postal_code}{" "}
                                  {lead.customer_city}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Konfiguracja główna */}
                          {renderConfigRow(
                            primaryDetails,
                            primaryDetails?.product || "brama"
                          )}

                          {/* Druga konfiguracja (np. furtka) */}
                          {secondaryDetails && (
                            <div className="mt-3 border-t border-zinc-800 pt-3">
                              <p className="mb-2 text-[9px] uppercase tracking-[0.25em] text-zinc-500">
                                Drugi element (brama / furtka)
                              </p>
                              {renderConfigRow(
                                secondaryDetails,
                                secondaryDetails?.product || "furtka",
                                true
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-600 uppercase font-black mb-1">
                              Cena konfiguracji (łącznie)
                            </p>
                            <p className="text-4xl font-light text-white italic">
                              {lead.total_price?.toLocaleString()}{" "}
                              <span className="text-sm text-zinc-700 not-italic">
                                PLN
                              </span>
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                              <input
                                type="checkbox"
                                checked={!!lead.called}
                                onChange={() =>
                                  updateLead(lead.id, { called: !lead.called })
                                }
                                className="h-4 w-4 accent-[#D4AF37] bg-black border-zinc-700"
                              />
                              Dzwoniono
                            </label>
                            <button
                              onClick={() => {
                                if (confirm("Usunąć?")) {
                                  supabase
                                    .from("leads")
                                    .delete()
                                    .eq("id", lead.id)
                                    .then(() => fetchData());
                                }
                              }}
                              className="text-zinc-800 hover:text-red-500 transition-all ml-2"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ODCZYTANE ZGŁOSZENIA */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs uppercase tracking-[0.4em] text-zinc-500 font-black flex items-center gap-3">
                  <CheckCircle size={16} /> Odczytane zgłoszenia
                </h2>
                <span className="text-[10px] text-zinc-500 uppercase">
                  {leadGroups.read.length} obsłużonych
                </span>
              </div>
              {leadGroups.read.length === 0 ? (
                <p className="text-[11px] text-zinc-600 italic">
                  Brak odczytanych zgłoszeń.
                </p>
              ) : (
                <div className="space-y-4">
                  {leadGroups.read.map((lead) => {
                    const rawDetails = (lead.details || {}) as any;
                    const primaryDetails = rawDetails.primary || rawDetails;
                    const secondaryDetails =
                      rawDetails.primary || rawDetails.secondary
                        ? rawDetails.secondary
                        : null;

                    const renderConfigRow = (cfg: any, label: string) => (
                      <div className="flex flex-wrap gap-4 text-[10px] text-zinc-600 uppercase font-black">
                        <span className="flex items-center gap-2">
                          <Layers size={12} /> {cfg?.type}{" "}
                          <span className="text-zinc-700">
                            ({cfg?.product || label})
                          </span>
                        </span>
                        {cfg?.width && cfg?.height && (
                          <span className="flex items-center gap-2">
                            <Maximize2 size={12} /> {cfg.width}x{cfg.height} CM
                          </span>
                        )}
                        {cfg?.material && (
                          <span className="flex items-center gap-2">
                            <Info size={12} /> {cfg.material}
                          </span>
                        )}
                        {cfg?.steelType && (
                          <span className="flex items-center gap-2">
                            <Info size={12} /> {cfg.steelType}
                          </span>
                        )}
                        {cfg?.ral && (
                          <span className="flex items-center gap-2">
                            <Info size={12} />{" "}
                            {cfg.ral === "INNY" && cfg.ralCustomCode
                              ? cfg.ralCustomCode
                              : cfg.ral}
                          </span>
                        )}
                        {cfg?.paintType && (
                          <span className="flex items-center gap-2">
                            <Info size={12} /> {cfg.paintType}
                          </span>
                        )}
                      </div>
                    );

                    return (
                      <div
                        key={lead.id}
                        className="bg-zinc-900/10 border border-zinc-900 p-6 flex flex-col md:flex-row justify-between items-center gap-4"
                      >
                        <div className="space-y-2 w-full">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-light text-white tracking-tight">
                              {lead.customer_phone}
                            </h3>
                            {lead.created_at && (
                              <span className="text-[10px] text-zinc-600 uppercase font-black">
                                {new Date(lead.created_at).toLocaleString(
                                  "pl-PL",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            )}
                            {(lead.customer_city ||
                              lead.customer_postal_code) && (
                              <span className="text-[10px] text-zinc-500 uppercase font-black">
                                {lead.customer_postal_code}{" "}
                                {lead.customer_city}
                              </span>
                            )}
                          </div>
                          {renderConfigRow(
                            primaryDetails,
                            primaryDetails?.product || "brama"
                          )}
                          {secondaryDetails && (
                            <div className="mt-2 border-t border-zinc-800 pt-2">
                              <p className="mb-1 text-[9px] uppercase tracking-[0.25em] text-zinc-500">
                                Drugi element (brama / furtka)
                              </p>
                              {renderConfigRow(
                                secondaryDetails,
                                secondaryDetails?.product || "furtka"
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                          <p className="text-lg font-light text-white italic">
                            {lead.total_price?.toLocaleString()}{" "}
                            <span className="text-[10px] text-zinc-700 not-italic">
                              PLN
                            </span>
                          </p>
                          <div className="flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                              <input
                                type="checkbox"
                                checked={!!lead.called}
                                onChange={() =>
                                  updateLead(lead.id, { called: !lead.called })
                                }
                                className="h-4 w-4 accent-[#D4AF37] bg-black border-zinc-700"
                              />
                              Dzwoniono
                            </label>
                            <button
                              onClick={() => updateLead(lead.id, { is_read: false })}
                              className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] border border-zinc-700 text-zinc-400 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                            >
                              Cofnij do nowych
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Usunąć?")) {
                                  supabase
                                    .from("leads")
                                    .delete()
                                    .eq("id", lead.id)
                                    .then(() => fetchData());
                                }
                              }}
                              className="text-zinc-800 hover:text-red-500 transition-all ml-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
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
                      <div className="md:col-span-2 flex flex-col gap-4 border-t border-zinc-900 pt-8 mt-4">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] text-zinc-600 uppercase font-black">
                              Max szerokość (cm):
                            </label>
                            <input 
                              type="number"
                              value={item.max_width || ''} 
                              onChange={(e) => handleLocalUpdate(item.id, 'max_width', parseInt(e.target.value))}
                              className="bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm w-32 outline-none text-white"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] text-zinc-600 uppercase font-black">
                              Min szerokość (cm):
                            </label>
                            <input 
                              type="number"
                              value={item.min_width || ''} 
                              onChange={(e) => handleLocalUpdate(item.id, 'min_width', parseInt(e.target.value))}
                              className="bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm w-32 outline-none text-white"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] text-zinc-600 uppercase font-black">
                              Max wysokość (cm):
                            </label>
                            <input 
                              type="number"
                              value={item.max_height || ''} 
                              onChange={(e) => handleLocalUpdate(item.id, 'max_height', parseInt(e.target.value))}
                              className="bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm w-32 outline-none text-white"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] text-zinc-600 uppercase font-black">
                              Min wysokość (cm):
                            </label>
                            <input 
                              type="number"
                              value={item.min_height || ''} 
                              onChange={(e) => handleLocalUpdate(item.id, 'min_height', parseInt(e.target.value))}
                              className="bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm w-32 outline-none text-white"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button onClick={() => deletePriceItem(item.id, !!item.isTemp)} className="text-zinc-800 hover:text-red-500">
                            <Trash2 size={22} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* MODELE FURTEK */}
            <section>
              <div className="flex justify-between items-end mb-12 border-l-4 border-[#D4AF37] pl-8">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">Modele Furtek</h2>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] mt-2 font-bold">Oddzielna baza modeli dla furtki (konfigurator)</p>
                </div>
                <button onClick={() => addTempPriceOption('wicket_base')} className="bg-white text-black px-8 py-4 text-[11px] font-black uppercase hover:bg-[#D4AF37] transition-all flex items-center gap-3">
                  <Plus size={18} /> Dodaj model
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {prices.filter(p => p.category === 'wicket_base').map((item) => (
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
                      <div className="md:col-span-2 flex flex-col gap-4 border-t border-zinc-900 pt-8 mt-4">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] text-zinc-600 uppercase font-black">
                              Max szerokość (cm):
                            </label>
                            <input 
                              type="number"
                              value={item.max_width || ''} 
                              onChange={(e) => handleLocalUpdate(item.id, 'max_width', parseInt(e.target.value))}
                              className="bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm w-32 outline-none text-white"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] text-zinc-600 uppercase font-black">
                              Min szerokość (cm):
                            </label>
                            <input 
                              type="number"
                              value={item.min_width || ''} 
                              onChange={(e) => handleLocalUpdate(item.id, 'min_width', parseInt(e.target.value))}
                              className="bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm w-32 outline-none text-white"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] text-zinc-600 uppercase font-black">
                              Max wysokość (cm):
                            </label>
                            <input 
                              type="number"
                              value={item.max_height || ''} 
                              onChange={(e) => handleLocalUpdate(item.id, 'max_height', parseInt(e.target.value))}
                              className="bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm w-32 outline-none text-white"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] text-zinc-600 uppercase font-black">
                              Min wysokość (cm):
                            </label>
                            <input 
                              type="number"
                              value={item.min_height || ''} 
                              onChange={(e) => handleLocalUpdate(item.id, 'min_height', parseInt(e.target.value))}
                              className="bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm w-32 outline-none text-white"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button onClick={() => deletePriceItem(item.id, !!item.isTemp)} className="text-zinc-800 hover:text-red-500">
                            <Trash2 size={22} />
                          </button>
                        </div>
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
                      <label className="text-[11px] text-zinc-500 uppercase font-black tracking-widest">
                        Model (brama / furtka)
                      </label>
                      <select 
                        className="w-full bg-black border border-zinc-800 p-5 text-sm font-black uppercase text-white outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
                        value={newItem.model_id}
                        onChange={e => {
                          const value = e.target.value;
                          const selected = prices.find(p => String(p.id) === value);
                          const product =
                            selected?.category === 'wicket_base'
                              ? 'furtka'
                              : selected
                                ? 'brama'
                                : '';
                          setNewItem({
                            ...newItem,
                            model_id: value,
                            product,
                          });
                        }}
                      >
                        <option value="">-- WYBIERZ --</option>
                        {prices
                          .filter(p => p.category === 'base' || p.category === 'wicket_base')
                          .map(p => (
                            <option key={p.id} value={p.id}>
                              {p.category === 'wicket_base' ? 'FURTKA: ' : 'BRAMA: '}
                              {p.name}
                            </option>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                      <label className="text-[11px] text-zinc-500 uppercase font-black tracking-widest">
                        Typ stali
                      </label>
                      <select
                        className="w-full bg-black border border-zinc-800 p-5 text-sm font-black uppercase text-white outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
                        value={newItem.steel_type}
                        onChange={(e) =>
                          setNewItem({ ...newItem, steel_type: e.target.value })
                        }
                      >
                        <option value="">-- BRAK / NIE DOTYCZY --</option>
                        {steelTypes.map((s) => (
                          <option key={s.label} value={s.label}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-500 uppercase font-black tracking-widest">
                        Kolor RAL
                      </label>
                      <select
                        className="w-full bg-black border border-zinc-800 p-4 text-[11px] font-black uppercase text-white outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
                        value={ralColors.find(c => c.code === newItem.ral_code) ? newItem.ral_code : ''}
                        onChange={(e) =>
                          setNewItem({ ...newItem, ral_code: e.target.value })
                        }
                      >
                        <option value="">-- BRAK / NIE DOTYCZY --</option>
                        {ralColors.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} {c.name ? `– ${c.name}` : ''}
                          </option>
                        ))}
                      </select>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                        Lub wpisz ręcznie dokładny kod RAL (np. RAL 7024)
                      </p>
                      <input
                        type="text"
                        value={newItem.ral_code}
                        onChange={(e) =>
                          setNewItem({ ...newItem, ral_code: e.target.value })
                        }
                        placeholder="Np. RAL 7024"
                        className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] text-zinc-500 uppercase font-black tracking-widest">
                        Typ malowania
                      </label>
                      <select
                        className="w-full bg-black border border-zinc-800 p-5 text-sm font-black uppercase text-white outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
                        value={newItem.paint_type}
                        onChange={(e) =>
                          setNewItem({ ...newItem, paint_type: e.target.value })
                        }
                      >
                        <option value="">-- BRAK / NIE DOTYCZY --</option>
                        {paintTypes.map((p) => (
                          <option key={p.label} value={p.label}>
                            {p.label}
                          </option>
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
                    <div className="flex-1 space-y-1 text-[8px] font-black uppercase">
                      <div className="text-[#D4AF37] flex items-center gap-2">
                        <CheckCircle size={10}/>
                        {prices.find(p => p.id === item.model_id)?.name || 'Brak powiązania'}
                      </div>
                      {item.material_id && (
                        <div className="text-zinc-600 flex items-center gap-2">
                          <CheckCircle size={10}/>
                          {prices.find(p => p.id === item.material_id)?.name || 'Brak powiązania'}
                        </div>
                      )}
                      {item.steel_type && (
                        <div className="text-zinc-600 flex items-center gap-2">
                          <CheckCircle size={10}/> {item.steel_type}
                        </div>
                      )}
                      {item.ral_code && (
                        <div className="text-zinc-600 flex items-center gap-2">
                          <CheckCircle size={10}/> {item.ral_code}
                        </div>
                      )}
                      {item.paint_type && (
                        <div className="text-zinc-600 flex items-center gap-2">
                          <CheckCircle size={10}/> {item.paint_type}
                        </div>
                      )}
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

        {/* OPCJE KONFIGURATORA (STAL / RAL) */}
        {activeTab === 'options' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="bg-zinc-900/20 border border-zinc-900 p-10 md:p-14">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 mb-2">
                    Konfigurator — opcje
                  </p>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white italic">
                    Typ stali & paleta RAL
                  </h2>
                  <p className="text-xs text-zinc-500 mt-3 max-w-2xl">
                    Te listy pojawiają się w konfiguratorze (brama i furtka) i są zapisywane do zgłoszeń.
                  </p>
                </div>
                <button
                  onClick={saveConfiguratorOptions}
                  className="bg-[#D4AF37] text-black px-10 py-4 text-[11px] font-black uppercase tracking-[0.25em] hover:bg-white transition-all w-full md:w-auto"
                >
                  Zapisz opcje
                </button>
              </div>

              {/* STAL */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] uppercase tracking-[0.35em] text-[#D4AF37] font-black">
                    Typy stali / zabezpieczenia
                  </h3>
                  <button
                    onClick={() =>
                      setSteelTypes((prev) => [...prev, { label: 'NOWA OPCJA', price: 0 }])
                    }
                    className="bg-zinc-800 text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all flex items-center gap-3"
                  >
                    <Plus size={16} /> Dodaj
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {steelTypes.map((t, idx) => (
                    <div
                      key={`${t.label}-${idx}`}
                      className="flex flex-col gap-2 bg-black/40 border border-zinc-800 p-4"
                    >
                      <div className="flex gap-3 items-center">
                        <input
                          value={t.label}
                          onChange={(e) =>
                            setSteelTypes((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, label: e.target.value } : x
                              )
                            )
                          }
                          className="flex-1 bg-black border border-zinc-800 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]"
                          placeholder="Nazwa opcji"
                        />
                        <input
                          type="number"
                          value={t.price}
                          onChange={(e) =>
                            setSteelTypes((prev) =>
                              prev.map((x, i) =>
                                i === idx
                                  ? { ...x, price: Number(e.target.value) || 0 }
                                  : x
                              )
                            )
                          }
                          className="w-24 bg-black border border-zinc-800 px-3 py-2 text-xs text-[#D4AF37] outline-none focus:border-[#D4AF37]"
                          placeholder="0"
                        />
                        <span className="text-[9px] uppercase text-zinc-500">PLN</span>
                        <button
                          onClick={() =>
                            setSteelTypes((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="ml-1 text-zinc-800 hover:text-red-500 transition-all"
                          title="Usuń"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RAL */}
              <div className="space-y-6 mt-14">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] uppercase tracking-[0.35em] text-[#D4AF37] font-black">
                    Kolory RAL
                  </h3>
                  <button
                    onClick={() =>
                      setRalColors((prev) => [
                        ...prev,
                        { code: 'RAL XXXX', name: 'Nowy kolor', hex: '#111111', price: 0 },
                      ])
                    }
                    className="bg-zinc-800 text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all flex items-center gap-3"
                  >
                    <Plus size={16} /> Dodaj
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500">
                  W konfiguratorze użytkownik zobaczy kilka podstawowych kolorów RAL oraz (opcjonalnie)
                  dodatkową opcję „Inny kolor RAL (do wpisania)” z linkiem do{" "}
                  <a
                    href="https://www.ral-farben.de/en/all-ral-colours"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#D4AF37]"
                  >
                    oficjalnej strony RAL
                  </a>.
                </p>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2 border-t border-zinc-900 mt-4">
                  <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
                    <input
                      type="checkbox"
                      checked={allowOtherRal}
                      onChange={(e) => setAllowOtherRal(e.target.checked)}
                      className="h-4 w-4 accent-[#D4AF37] bg-black border-zinc-700"
                    />
                    Pokazuj opcję <span className="text-white">„Inny kolor RAL (do wpisania)”</span>
                  </label>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span className="uppercase tracking-[0.25em]">Dopłata za inny kolor:</span>
                    <input
                      type="number"
                      value={otherRalPrice}
                      onChange={(e) => setOtherRalPrice(Number(e.target.value) || 0)}
                      className="w-24 bg-black border border-zinc-800 px-3 py-1.5 text-xs text-[#D4AF37] outline-none focus:border-[#D4AF37]"
                    />
                    <span className="text-[9px] uppercase text-zinc-500">PLN</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {ralColors.map((c, idx) => (
                    <div
                      key={`${c.code}-${idx}`}
                      className="bg-black/40 border border-zinc-800 p-4 grid grid-cols-1 md:grid-cols-[56px_1fr_1fr_120px_120px_40px] gap-3 items-center"
                    >
                      <div className="h-10 w-10 rounded-full border border-zinc-700" style={{ background: c.hex || '#111' }} />
                      <input
                        value={c.code}
                        onChange={(e) =>
                          setRalColors((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, code: e.target.value } : x))
                          )
                        }
                        className="bg-black border border-zinc-800 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]"
                        placeholder="RAL 7016"
                      />
                      <input
                        value={c.name || ''}
                        onChange={(e) =>
                          setRalColors((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x))
                          )
                        }
                        className="bg-black border border-zinc-800 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]"
                        placeholder="Antracyt"
                      />
                      <input
                        value={c.hex || ''}
                        onChange={(e) =>
                          setRalColors((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, hex: e.target.value } : x))
                          )
                        }
                        className="bg-black border border-zinc-800 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]"
                        placeholder="#383E42"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={c.price}
                          onChange={(e) =>
                            setRalColors((prev) =>
                              prev.map((x, i) =>
                                i === idx
                                  ? { ...x, price: Number(e.target.value) || 0 }
                                  : x
                              )
                            )
                          }
                          className="w-24 bg-black border border-zinc-800 px-3 py-2 text-xs text-[#D4AF37] outline-none focus:border-[#D4AF37]"
                          placeholder="0"
                        />
                        <span className="text-[9px] uppercase text-zinc-500">PLN</span>
                      </div>
                      <button
                        onClick={() => setRalColors((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-zinc-800 hover:text-red-500 transition-all"
                        title="Usuń"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* TYPY MALOWANIA */}
              <div className="space-y-6 mt-14">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] uppercase tracking-[0.35em] text-[#D4AF37] font-black">
                    Typy malowania
                  </h3>
                  <button
                    onClick={() =>
                      setPaintTypes((prev) => [...prev, { label: 'NOWY TYP MALOWANIA', price: 0 }])
                    }
                    className="bg-zinc-800 text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all flex items-center gap-3"
                  >
                    <Plus size={16} /> Dodaj
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paintTypes.map((p, idx) => (
                    <div
                      key={`${p.label}-${idx}`}
                      className="flex flex-col gap-2 bg-black/40 border border-zinc-800 p-4"
                    >
                      <div className="flex gap-3 items-center">
                        <input
                          value={p.label}
                          onChange={(e) =>
                            setPaintTypes((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, label: e.target.value } : x
                              )
                            )
                          }
                          className="flex-1 bg-black border border-zinc-800 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]"
                          placeholder="Nazwa typu malowania"
                        />
                        <input
                          type="number"
                          value={p.price}
                          onChange={(e) =>
                            setPaintTypes((prev) =>
                              prev.map((x, i) =>
                                i === idx
                                  ? { ...x, price: Number(e.target.value) || 0 }
                                  : x
                              )
                            )
                          }
                          className="w-24 bg-black border border-zinc-800 px-3 py-2 text-xs text-[#D4AF37] outline-none focus:border-[#D4AF37]"
                          placeholder="0"
                        />
                        <span className="text-[9px] uppercase text-zinc-500">PLN</span>
                        <button
                          onClick={() =>
                            setPaintTypes((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="ml-1 text-zinc-800 hover:text-red-500 transition-all"
                          title="Usuń"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
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