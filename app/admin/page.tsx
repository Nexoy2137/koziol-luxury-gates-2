"use client";
import { useEffect, useState, useRef } from 'react';

import type { ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { getRalDisplayColor, ralCodeToNamePl } from '@/lib/ralColors';
import { useToast } from '@/context/ToastContext';
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
  const [ralColors, setRalColors] = useState<Array<{ code: string; name?: string; price: number }>>([]);
  const [paintTypes, setPaintTypes] = useState<Array<{ label: string; price: number }>>([]);
  const [allowOtherRal, setAllowOtherRal] = useState<boolean>(true);
  const [otherRalPrice, setOtherRalPrice] = useState<number>(0);
  const [hasOptionsChanges, setHasOptionsChanges] = useState(false);
  const [saveOptionsStatus, setSaveOptionsStatus] = useState<'idle' | 'saving'>('idle');
  
  // --- REFERENCJE I POMOCNICZE ---
  const optionsSnapshotRef = useRef<{
    steelTypes: Array<{ label: string; price: number }>;
    ralColors: Array<{ code: string; name?: string; price: number }>;
    paintTypes: Array<{ label: string; price: number }>;
    allowOtherRal: boolean;
    otherRalPrice: number;
  } | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const activeTabRef = useRef<'leads' | 'prices' | 'gallery' | 'options'>(activeTab);
  const toast = useToast();
  const seenUnreadLeadIdsRef = useRef<number[]>([]);

  // --- STAN DLA NOWEJ REALIZACJI ---
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    description: '',
    dimensions: '',
    price: '',
    // zostawiamy stare pola dla zgodności ze starymi rekordami
    model_id: '',
    material_id: '',
    // nowe: osobne modele dla bramy i furtki na jednym zdjęciu
    gate_model_id: '',
    wicket_model_id: '',
    product: '' as string,
    hasGate: false,
    hasWicket: false,
    steel_type: '',
    ral_code: '',
    paint_type: '',
  });

  const updateNewItemProductFlags = (next: { hasGate?: boolean; hasWicket?: boolean }) => {
    setNewItem((prev) => {
      const hasGate = typeof next.hasGate === 'boolean' ? next.hasGate : prev.hasGate;
      const hasWicket = typeof next.hasWicket === 'boolean' ? next.hasWicket : prev.hasWicket;

      let product = '';
      if (hasGate && hasWicket) {
        product = 'brama+furtka';
      } else if (hasGate) {
        product = 'brama';
      } else if (hasWicket) {
        product = 'furtka';
      }

      return {
        ...prev,
        hasGate,
        hasWicket,
        product,
      };
    });
  };

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
        const stMapped = st
          .map((x: any) => {
            if (typeof x === 'string') return { label: x, price: 0 };
            return {
              label: String(x?.label || '').trim(),
              price: Number(x?.price) || 0,
            };
          })
          .filter((x: any) => x.label && x.label.trim().length >= 2);
        const rcMapped = rc
          .map((x: any) => ({
            code: String(x?.code || '').trim(),
            name: x?.name ? String(x.name).trim() : undefined,
            price: Number(x?.price) || 0,
          }))
          .filter((x: any) => x.code.length >= 4);
        const ptMapped = pt
          .map((x: any) => ({
            label: String(x?.label || '').trim(),
            price: Number(x?.price) || 0,
          }))
          .filter((x: any) => x.label.length >= 2);
        const allowVal = typeof v.allowOtherRal === 'boolean' ? v.allowOtherRal : true;
        const otherPrice = typeof v.otherRalPrice === 'number' ? v.otherRalPrice : 0;
        setSteelTypes(stMapped);
        setRalColors(rcMapped);
        setPaintTypes(ptMapped);
        setAllowOtherRal(allowVal);
        setOtherRalPrice(otherPrice);
        optionsSnapshotRef.current = { steelTypes: stMapped, ralColors: rcMapped, paintTypes: ptMapped, allowOtherRal: allowVal, otherRalPrice: otherPrice };
      } else {
        // domyślne opcje (jeśli brak w bazie)
        const defSt = [
          { label: 'S235', price: 0 },
          { label: 'S355', price: 0 },
          { label: 'Ocynk + malowanie proszkowe', price: 0 },
        ];
        const defRc = [
          { code: 'RAL 9005', name: 'Czarny głęboki', price: 0 },
          { code: 'RAL 7016', name: 'Antracyt', price: 0 },
          { code: 'RAL 8017', name: 'Brąz czekoladowy', price: 0 },
          { code: 'RAL 9016', name: 'Biały', price: 0 },
        ];
        const defPt = [
          { label: 'Standard (mat)', price: 0 },
          { label: 'Struktura drobna', price: 0 },
        ];
        setSteelTypes(defSt);
        setRalColors(defRc);
        setPaintTypes(defPt);
        setAllowOtherRal(true);
        setOtherRalPrice(0);
        optionsSnapshotRef.current = { steelTypes: defSt, ralColors: defRc, paintTypes: defPt, allowOtherRal: true, otherRalPrice: 0 };
      }
    } catch (err: any) {
      console.error("Błąd pobierania danych:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // Porównanie opcji z snapshotem (wykrywanie niezapisanych zmian)
  useEffect(() => {
    const snap = optionsSnapshotRef.current;
    if (!snap) return;
    const curr = {
      steelTypes,
      ralColors,
      paintTypes,
      allowOtherRal,
      otherRalPrice,
    };
    const snapStr = JSON.stringify(snap);
    const currStr = JSON.stringify(curr);
    setHasOptionsChanges(snapStr !== currStr);
  }, [steelTypes, ralColors, paintTypes, allowOtherRal, otherRalPrice]);

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
      await toast.showAlert("Błąd wgrywania (spróbuj pliku bez spacji jeśli ten nie przechodzi): " + error.message);
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
      await toast.showAlert("Błąd bazy: " + error.message);
      setSaveStatus('idle');
    }
  }

  const deletePriceItem = async (id: string, isTemp: boolean) => {
    const ok = await toast.showConfirm("Usunąć pozycję z cennika?");
    if (!ok) return;
    if (isTemp) {
      setPrices(prices.filter(p => p.id !== id));
      return;
    }
    try {
      const { error } = await supabase.from('prices').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      await toast.showAlert("Błąd usuwania: " + error.message);
    }
  };

  // --- LOGIKA GALERII ---

  const handleGalleryImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const fileName = `portfolio/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
      setPendingImageUrl(publicUrl);
    } catch (error: any) {
      await toast.showAlert("Błąd wgrywania: " + error.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddGalleryItem = async () => {
    if (!pendingImageUrl) {
      await toast.showAlert("Najpierw dodaj zdjęcie.");
      return;
    }
    const ok = await toast.showConfirm("Czy na pewno dodać tę realizację?");
    if (!ok) return;
    try {
      const { error } = await supabase.from('gallery').insert([{
        image_url: pendingImageUrl,
        description: newItem.description || null,
        dimensions: newItem.dimensions || null,
        price: parseFloat(newItem.price) || 0,
        model_id: newItem.model_id || newItem.gate_model_id || newItem.wicket_model_id || null,
        material_id: newItem.material_id || null,
        gate_model_id: newItem.gate_model_id || null,
        wicket_model_id: newItem.wicket_model_id || null,
        product: newItem.product || null,
        steel_type: newItem.steel_type || null,
        ral_code: newItem.ral_code || null,
        paint_type: newItem.paint_type || null,
      }]);
      if (error) throw error;
      setPendingImageUrl(null);
      setNewItem({ description: '', dimensions: '', price: '', model_id: '', material_id: '', gate_model_id: '', wicket_model_id: '', product: '', hasGate: false, hasWicket: false, steel_type: '', ral_code: '', paint_type: '' });
      await fetchData();
    } catch (error: any) {
      await toast.showAlert("Błąd zapisu: " + error.message);
    }
  };

  const updateLead = async (id: number, changes: Record<string, any>) => {
    try {
      const { error } = await supabase.from('leads').update(changes).eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      await toast.showAlert("Błąd aktualizacji zgłoszenia: " + error.message);
    }
  };

  const saveConfiguratorOptions = async () => {
    setSaveOptionsStatus('saving');
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
      optionsSnapshotRef.current = {
        steelTypes,
        ralColors,
        paintTypes,
        allowOtherRal,
        otherRalPrice,
      };
      setHasOptionsChanges(false);
      await toast.showAlert('Opcje konfiguratora zapisane.');
      await fetchData();
    } catch (e: any) {
      await toast.showAlert('Błąd zapisu opcji: ' + (e?.message || e));
    } finally {
      setSaveOptionsStatus('idle');
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
      await toast.showAlert("Błąd przenoszenia do odczytanych: " + error.message);
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
    <div style={{ minHeight: "100vh", background: "#000", color: "#e4e4e7", fontFamily: "var(--font-inter, system-ui, sans-serif)", paddingBottom: 100 }}>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleConfigImageUpload} />

      <style>{`
        .admin-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border:1px solid rgba(63,63,70,0.6); border-radius:10px; background:linear-gradient(160deg,rgba(9,9,11,0.9) 0%,rgba(4,4,6,0.95) 100%); color:#a1a1aa; font-size:11px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; cursor:pointer; transition:all 0.25s; }
        .admin-btn:hover { border-color:rgba(212,175,55,0.5); color:#D4AF37; background:rgba(212,175,55,0.08); }
        .admin-tab { flex:1; padding:18px 16px; display:flex; align-items:center; justify-content:center; gap:10px; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; cursor:pointer; transition:all 0.25s; border:none; border-radius:12px; }
        .admin-tab.active { background:#D4AF37; color:#000; box-shadow:0 0 24px rgba(212,175,55,0.35); }
        .admin-tab:not(.active) { background:transparent; color:#71717a; }
        .admin-tab:not(.active):hover { background:rgba(255,255,255,0.06); color:#a1a1aa; }
        .admin-input { width:100%; background:rgba(0,0,0,0.6); border:1px solid rgba(63,63,70,0.5); border-radius:10px; padding:12px 16px; font-size:13px; color:#e4e4e7; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
        .admin-input:focus { border-color:rgba(212,175,55,0.5); box-shadow:0 0 0 2px rgba(212,175,55,0.1); }
        .admin-card { border:1px solid rgba(63,63,70,0.5); border-radius:16px; background:linear-gradient(160deg,rgba(12,12,14,0.95) 0%,rgba(6,6,8,0.98) 100%); padding:28px; box-shadow:0 4px 24px rgba(0,0,0,0.25); transition:border-color 0.2s; }
        .admin-card:hover { border-color:rgba(212,175,55,0.2); }
        .admin-section-title { font-size:9px; font-weight:700; letter-spacing:0.45em; text-transform:uppercase; color:#D4AF37; margin-bottom:24px; display:flex; align-items:center; gap:10px; }
        .admin-lead-card { border:1px solid rgba(63,63,70,0.5); border-radius:14px; background:linear-gradient(160deg,rgba(12,12,14,0.9) 0%,rgba(6,6,8,0.95) 100%); padding:32px; transition:border-color 0.2s; }
        .admin-lead-config-item { display:inline-flex; align-items:center; gap:8px; margin-right:24px; margin-bottom:12px; }
        .admin-lead-actions { display:flex; flex-wrap:wrap; align-items:center; gap:20px; }
        .admin-lead-card:hover { border-color:rgba(63,63,70,0.8); }
        .admin-lead-card.unread { border-color:rgba(212,175,55,0.35); }
        .admin-price-row { display:grid; grid-template-columns:1fr 100px 120px 40px; gap:12px; align-items:center; padding:14px 0; border-bottom:1px solid rgba(63,63,70,0.4); }
        .admin-price-row:last-child { border-bottom:none; }
        @media(max-width:640px){ .admin-price-row { grid-template-columns:1fr 80px 80px 32px; } }
        .admin-select { width:100%; background:rgba(0,0,0,0.6); border:1px solid rgba(63,63,70,0.5); border-radius:10px; padding:12px 16px; font-size:13px; color:#e4e4e7; outline:none; transition:border-color 0.2s, box-shadow 0.2s; appearance:none; cursor:pointer; }
        .admin-select:focus { border-color:rgba(212,175,55,0.5); box-shadow:0 0 0 2px rgba(212,175,55,0.1); }
        @media(max-width:768px){ .admin-main { padding:40px 20px 48px !important; } .admin-header-inner { padding:0 24px !important; } }
        .admin-compact { padding:6px 10px !important; font-size:11px !important; min-height:32px !important; }
      `}</style>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid rgba(63,63,70,0.5)", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="admin-header-inner" style={{ maxWidth: 1320, margin: "0 auto", padding: "0 40px", height: 80, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Kozioł" style={{ height: 76, width: 76, borderRadius: 6 }} />
            <div>
              <h1 style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", margin: 0 }}>
                System <span style={{ color: "#D4AF37" }}>Zarządzania</span>
              </h1>
              <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#52525b", margin: 0 }}>
                Kozioł Luxury Gates — Internal Access
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => router.push('/')} className="admin-btn">
              ← Strona główna
            </button>
            <button onClick={() => router.push('/konto')} className="admin-btn">
              Ustawienia
            </button>
            <button
              onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
              className="admin-btn"
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.5)"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(63,63,70,0.6)"; (e.currentTarget as HTMLButtonElement).style.color = "#a1a1aa"; }}
            >
              <LogOut size={14} />
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main" style={{ maxWidth: 1320, margin: "0 auto", padding: "56px 40px 64px" }}>
        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 56, background: "linear-gradient(160deg, rgba(12,12,14,0.95) 0%, rgba(6,6,8,0.98) 100%)", padding: 8, borderRadius: 16, border: "1px solid rgba(63,63,70,0.5)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
          {[
            { id: 'leads', label: 'Zgłoszenia', icon: Users },
            { id: 'prices', label: 'Cennik', icon: Database },
            { id: 'gallery', label: 'Portfolio', icon: ImageIcon },
            { id: 'options', label: 'Opcje', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={async () => {
                if (activeTab === 'leads' && tab.id !== 'leads') {
                  await flushSeenLeadsToRead();
                }
                setActiveTab(tab.id as any);
              }}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
              {tab.id === 'leads' && leadGroups?.new?.length > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: activeTab === 'leads' ? "#000" : "#D4AF37", color: activeTab === 'leads' ? "#D4AF37" : "#000", fontSize: 9, fontWeight: 800 }}>
                  {leadGroups.new.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ZGŁOSZENIA */}
        {activeTab === 'leads' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* OCHRONA ANTY-SPAM DLA KONFIGURATORA */}
            <section className="admin-card flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px]">
                <div className="flex flex-col gap-2">
                  <label className="uppercase tracking-[0.25em] text-zinc-500">
                    Minimalny odstęp (sekundy)
                  </label>
                  <input
                    type="number"
                    min={10}
                    className="admin-input"
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
                    className="admin-input"
                    value={antiSpamMaxPerDay}
                    onChange={(e) =>
                      setAntiSpamMaxPerDay(
                        Math.max(1, parseInt(e.target.value) || 0)
                      )
                    }
                  />
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
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
                      await toast.showAlert('Ustawienia anty-spam zapisane.');
                    } catch (error: any) {
                      await toast.showAlert('Błąd zapisu ustawień: ' + error.message);
                    }
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 999,
                    padding: "10px 22px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    background: "#D4AF37",
                    color: "#000",
                    border: "none",
                    boxShadow: "0 0 28px rgba(212,175,55,0.32)",
                    cursor: "pointer",
                    transition: "background 0.25s, box-shadow 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#C9A227";
                    e.currentTarget.style.boxShadow = "0 0 52px rgba(212,175,55,0.62)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#D4AF37";
                    e.currentTarget.style.boxShadow = "0 0 28px rgba(212,175,55,0.32)";
                  }}
                >
                  Zapisz ustawienia
                </button>
              </div>
            </section>
            {/* NOWE ZGŁOSZENIA */}
            <section>
              <div className="flex items-center justify-between mb-8">
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
                <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
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
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: compact ? "#71717a" : "#a1a1aa" }}>
                        <span className="admin-lead-config-item">
                          <Layers size={compact ? 12 : 14} /> {cfg?.type}{" "}
                          <span style={{ color: "#52525b" }}>({cfg?.product || label})</span>
                        </span>
                        {cfg?.width && cfg?.height && (
                          <span className="admin-lead-config-item">
                            <Maximize2 size={compact ? 12 : 14} /> {cfg.width}x{cfg.height} CM
                          </span>
                        )}
                        {cfg?.material && (
                          <span className="admin-lead-config-item">
                            <Info size={compact ? 12 : 14} /> {cfg.material}
                          </span>
                        )}
                        {cfg?.steelType && (
                          <span className="admin-lead-config-item">
                            <Info size={compact ? 12 : 14} /> {cfg.steelType}
                          </span>
                        )}
                        {cfg?.ral && (
                          <span className="admin-lead-config-item">
                            <Info size={compact ? 12 : 14} />{" "}
                            {cfg.ral === "INNY" && cfg.ralCustomCode ? cfg.ralCustomCode : cfg.ral}
                          </span>
                        )}
                        {cfg?.paintType && (
                          <span className="admin-lead-config-item">
                            <Info size={compact ? 12 : 14} /> {cfg.paintType}
                          </span>
                        )}
                      </div>
                    );

                    return (
                      <div
                        key={lead.id}
                        className="admin-lead-card unread flex flex-col md:flex-row md:items-center"
                        style={{ borderLeft: "4px solid #D4AF37", padding: 36, gap: 32, maxWidth: "100%" }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 16 }}>
                              <h3 style={{ fontSize: 28, fontWeight: 300, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
                                {lead.customer_phone}
                              </h3>
                              <span style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", fontSize: 8, fontWeight: 800, padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(212,175,55,0.3)", textTransform: "uppercase" }}>
                                Nowe zapytanie
                              </span>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px" }}>
                              {lead.created_at && (
                                <span style={{ fontSize: 10, color: "#71717a", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                                  {new Date(lead.created_at).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                              {(lead.customer_city || lead.customer_postal_code) && (
                                <span style={{ fontSize: 10, color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase" }}>
                                  {lead.customer_postal_code} {lead.customer_city}
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <p style={{ fontSize: 9, fontWeight: 800, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.35em", margin: "0 0 4px 0" }}>
                              Konfiguracja
                            </p>
                            {renderConfigRow(primaryDetails, primaryDetails?.product || "brama")}
                          </div>

                          {secondaryDetails && (
                            <div style={{ paddingTop: 20, marginTop: 12, borderTop: "1px solid rgba(63,63,70,0.6)", display: "flex", flexDirection: "column", gap: 10 }}>
                              <p style={{ fontSize: 9, fontWeight: 800, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.25em", margin: 0 }}>
                                Drugi element (brama / furtka)
                              </p>
                              {renderConfigRow(secondaryDetails, secondaryDetails?.product || "furtka", true)}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 24, paddingTop: 16, borderTop: "1px solid rgba(63,63,70,0.5)", minWidth: 200 }}>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 9, fontWeight: 800, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 8px 0" }}>
                              Cena konfiguracji (łącznie)
                            </p>
                            <p style={{ fontSize: 32, fontWeight: 300, color: "#fff", fontStyle: "italic", margin: 0 }}>
                              {lead.total_price?.toLocaleString()}{" "}
                              <span style={{ fontSize: 14, color: "#71717a", fontStyle: "normal" }}>PLN</span>
                            </p>
                          </div>
                          <div className="admin-lead-actions">
                            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10, fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.2em", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={!!lead.called}
                                onChange={() => updateLead(lead.id, { called: !lead.called })}
                                style={{ width: 18, height: 18, accentColor: "#D4AF37" }}
                              />
                              Dzwoniono
                            </label>
                            <button
                              onClick={async () => {
                                const ok = await toast.showConfirm("Usunąć?");
                                if (ok) { await supabase.from("leads").delete().eq("id", lead.id); await fetchData(); }
                              }}
                              style={{ padding: 12, color: "#71717a", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(63,63,70,0.5)"; e.currentTarget.style.color = "#ef4444"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
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

            {/* ODCZYTANE ZGŁOSZENIA */}
            <section>
              <div className="flex items-center justify-between mb-8">
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
                <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                  {leadGroups.read.map((lead) => {
                    const rawDetails = (lead.details || {}) as any;
                    const primaryDetails = rawDetails.primary || rawDetails;
                    const secondaryDetails =
                      rawDetails.primary || rawDetails.secondary
                        ? rawDetails.secondary
                        : null;

                    const renderConfigRow = (cfg: any, label: string) => (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#71717a" }}>
                        <span className="admin-lead-config-item">
                          <Layers size={12} /> {cfg?.type}{" "}
                          <span style={{ color: "#52525b" }}>({cfg?.product || label})</span>
                        </span>
                        {cfg?.width && cfg?.height && (
                          <span className="admin-lead-config-item">
                            <Maximize2 size={12} /> {cfg.width}x{cfg.height} CM
                          </span>
                        )}
                        {cfg?.material && (
                          <span className="admin-lead-config-item">
                            <Info size={12} /> {cfg.material}
                          </span>
                        )}
                        {cfg?.steelType && (
                          <span className="admin-lead-config-item">
                            <Info size={12} /> {cfg.steelType}
                          </span>
                        )}
                        {cfg?.ral && (
                          <span className="admin-lead-config-item">
                            <Info size={12} />{" "}
                            {cfg.ral === "INNY" && cfg.ralCustomCode ? cfg.ralCustomCode : cfg.ral}
                          </span>
                        )}
                        {cfg?.paintType && (
                          <span className="admin-lead-config-item">
                            <Info size={12} /> {cfg.paintType}
                          </span>
                        )}
                      </div>
                    );

                    return (
                      <div
                        key={lead.id}
                        className="admin-lead-card flex flex-col md:flex-row md:items-center"
                        style={{ padding: 36, gap: 32, maxWidth: "100%" }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <h3 style={{ fontSize: 20, fontWeight: 300, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
                              {lead.customer_phone}
                            </h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px" }}>
                              {lead.created_at && (
                                <span style={{ fontSize: 10, color: "#71717a", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                                  {new Date(lead.created_at).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                              {(lead.customer_city || lead.customer_postal_code) && (
                                <span style={{ fontSize: 10, color: "#71717a", fontWeight: 800, textTransform: "uppercase" }}>
                                  {lead.customer_postal_code} {lead.customer_city}
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <p style={{ fontSize: 9, fontWeight: 800, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.35em", margin: "0 0 4px 0" }}>
                              Konfiguracja
                            </p>
                            {renderConfigRow(primaryDetails, primaryDetails?.product || "brama")}
                          </div>
                          {secondaryDetails && (
                            <div style={{ paddingTop: 20, marginTop: 12, borderTop: "1px solid rgba(63,63,70,0.6)", display: "flex", flexDirection: "column", gap: 10 }}>
                              <p style={{ fontSize: 9, fontWeight: 800, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.25em", margin: 0 }}>
                                Drugi element (brama / furtka)
                              </p>
                              {renderConfigRow(secondaryDetails, secondaryDetails?.product || "furtka")}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 24, paddingTop: 16, borderTop: "1px solid rgba(63,63,70,0.5)", minWidth: 200 }}>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 9, fontWeight: 800, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 8px 0" }}>
                              Cena
                            </p>
                            <p style={{ fontSize: 24, fontWeight: 300, color: "#fff", fontStyle: "italic", margin: 0 }}>
                              {lead.total_price?.toLocaleString()}{" "}
                              <span style={{ fontSize: 10, color: "#71717a", fontStyle: "normal" }}>PLN</span>
                            </p>
                          </div>
                          <div className="admin-lead-actions">
                            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10, fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.2em", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={!!lead.called}
                                onChange={() => updateLead(lead.id, { called: !lead.called })}
                                style={{ width: 18, height: 18, accentColor: "#D4AF37" }}
                              />
                              Dzwoniono
                            </label>
                            <button
                              onClick={() => updateLead(lead.id, { is_read: false })}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                borderRadius: 999,
                                padding: "10px 22px",
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                background: "transparent",
                                color: "#D4AF37",
                                border: "1.5px solid #D4AF37",
                                cursor: "pointer",
                                transition: "all 0.25s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(212,175,55,0.12)";
                                e.currentTarget.style.borderColor = "#E8C97A";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.borderColor = "#D4AF37";
                              }}
                            >
                              Cofnij do nowych
                            </button>
                            <button
                              onClick={async () => {
                                const ok = await toast.showConfirm("Usunąć?");
                                if (ok) { await supabase.from("leads").delete().eq("id", lead.id); await fetchData(); }
                              }}
                              style={{ padding: 12, color: "#71717a", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(63,63,70,0.5)"; e.currentTarget.style.color = "#ef4444"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 120 }}>
            {/* MODELE BRAM */}
            <section style={{ marginBottom: 56 }}>
              <div style={{ 
                padding: "24px 28px", 
                background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 100%)", 
                borderLeft: "4px solid #D4AF37", 
                borderRadius: "0 12px 12px 0",
                marginBottom: 32,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 20,
              }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, color: "#D4AF37", letterSpacing: "0.4em", textTransform: "uppercase", margin: "0 0 6px 0" }}>
                    Dział: Model bramy
                  </p>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontStyle: "italic", letterSpacing: "-0.02em", margin: 0 }}>
                    Modele Bram
                  </h2>
                  <p style={{ fontSize: 10, color: "#71717a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", margin: "8px 0 0 0" }}>
                    Zarządzaj typami i ceną bazową
                  </p>
                </div>
                <button 
                  onClick={() => addTempPriceOption('base')}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "12px 24px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "#D4AF37", color: "#000", border: "none", boxShadow: "0 0 28px rgba(212,175,55,0.32)", cursor: "pointer", transition: "all 0.25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A227"; e.currentTarget.style.boxShadow = "0 0 52px rgba(212,175,55,0.62)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.boxShadow = "0 0 28px rgba(212,175,55,0.32)"; }}
                >
                  <Plus size={18} /> Dodaj model
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {prices.filter(p => p.category === 'base').map((item) => (
                  <div key={item.id} className="admin-card flex flex-col md:flex-row md:items-start" style={{ padding: 28, gap: 28, maxWidth: "100%" }}>
                    <div 
                      onClick={() => { setSelectedItemId(item.id); fileInputRef.current?.click(); }}
                      style={{ width: 140, height: 140, minWidth: 140, minHeight: 140, background: "rgba(0,0,0,0.8)", border: "1px solid rgba(63,63,70,0.5)", borderRadius: 14, cursor: "pointer", overflow: "hidden", flexShrink: 0 }}
                      className="group"
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

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 w-full" style={{ gap: 24 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Nazwa</label>
                        <input 
                          value={item.name} 
                          onChange={(e) => handleLocalUpdate(item.id, 'name', e.target.value)}
                          className="admin-input font-semibold uppercase"
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Cena bazowa</label>
                        <input 
                          type="number"
                          value={item.value} 
                          onChange={(e) => handleLocalUpdate(item.id, 'value', parseFloat(e.target.value))}
                          className="admin-input font-semibold text-[#D4AF37]"
                        />
                      </div>
                      <div className="md:col-span-2" style={{ paddingTop: 24, marginTop: 16, borderTop: "1px solid rgba(63,63,70,0.5)", display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 24px" }}>
                          {[
                            { key: 'max_width', label: 'Max szerokość (cm)' },
                            { key: 'min_width', label: 'Min szerokość (cm)' },
                            { key: 'max_height', label: 'Max wysokość (cm)' },
                            { key: 'min_height', label: 'Min wysokość (cm)' },
                          ].map(({ key, label }) => (
                            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <label className="text-[10px] text-zinc-500 uppercase font-black">{label}</label>
                              <input 
                                type="number"
                                value={(item as any)[key] || ''} 
                                onChange={(e) => handleLocalUpdate(item.id, key as any, parseInt(e.target.value))}
                                className="admin-input"
                                style={{ width: 100 }}
                              />
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => deletePriceItem(item.id, !!item.isTemp)} 
                          style={{ alignSelf: "flex-end", padding: 10, color: "#71717a", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(63,63,70,0.5)"; e.currentTarget.style.color = "#ef4444"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* MODELE FURTEK */}
            <section style={{ marginBottom: 56, paddingTop: 12, borderTop: "1px solid rgba(63,63,70,0.4)" }}>
              <div style={{ 
                padding: "24px 28px", 
                background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 100%)", 
                borderLeft: "4px solid #D4AF37", 
                borderRadius: "0 12px 12px 0",
                marginBottom: 32,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 20,
              }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, color: "#D4AF37", letterSpacing: "0.4em", textTransform: "uppercase", margin: "0 0 6px 0" }}>
                    Dział: Model furtki
                  </p>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontStyle: "italic", letterSpacing: "-0.02em", margin: 0 }}>
                    Modele Furtek
                  </h2>
                  <p style={{ fontSize: 10, color: "#71717a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", margin: "8px 0 0 0" }}>
                    Oddzielna baza modeli dla furtki (konfigurator)
                  </p>
                </div>
                <button 
                  onClick={() => addTempPriceOption('wicket_base')}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "12px 24px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "#D4AF37", color: "#000", border: "none", boxShadow: "0 0 28px rgba(212,175,55,0.32)", cursor: "pointer", transition: "all 0.25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A227"; e.currentTarget.style.boxShadow = "0 0 52px rgba(212,175,55,0.62)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.boxShadow = "0 0 28px rgba(212,175,55,0.32)"; }}
                >
                  <Plus size={18} /> Dodaj model
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {prices.filter(p => p.category === 'wicket_base').map((item) => (
                  <div key={item.id} className="admin-card flex flex-col md:flex-row md:items-start" style={{ padding: 28, gap: 28, maxWidth: "100%" }}>
                    <div 
                      onClick={() => { setSelectedItemId(item.id); fileInputRef.current?.click(); }}
                      style={{ width: 140, height: 140, minWidth: 140, minHeight: 140, background: "rgba(0,0,0,0.8)", border: "1px solid rgba(63,63,70,0.5)", borderRadius: 14, cursor: "pointer", overflow: "hidden", flexShrink: 0 }}
                      className="group"
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

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 w-full" style={{ gap: 24 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Nazwa</label>
                        <input 
                          value={item.name} 
                          onChange={(e) => handleLocalUpdate(item.id, 'name', e.target.value)}
                          className="admin-input font-semibold uppercase"
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Cena bazowa</label>
                        <input 
                          type="number"
                          value={item.value} 
                          onChange={(e) => handleLocalUpdate(item.id, 'value', parseFloat(e.target.value))}
                          className="admin-input font-semibold text-[#D4AF37]"
                        />
                      </div>
                      <div className="md:col-span-2" style={{ paddingTop: 24, marginTop: 16, borderTop: "1px solid rgba(63,63,70,0.5)", display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 24px" }}>
                          {[
                            { key: 'max_width', label: 'Max szerokość (cm)' },
                            { key: 'min_width', label: 'Min szerokość (cm)' },
                            { key: 'max_height', label: 'Max wysokość (cm)' },
                            { key: 'min_height', label: 'Min wysokość (cm)' },
                          ].map(({ key, label }) => (
                            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <label className="text-[10px] text-zinc-500 uppercase font-black">{label}</label>
                              <input 
                                type="number"
                                value={(item as any)[key] || ''} 
                                onChange={(e) => handleLocalUpdate(item.id, key as any, parseInt(e.target.value))}
                                className="admin-input"
                                style={{ width: 100 }}
                              />
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => deletePriceItem(item.id, !!item.isTemp)} 
                          style={{ alignSelf: "flex-end", padding: 10, color: "#71717a", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(63,63,70,0.5)"; e.currentTarget.style.color = "#ef4444"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* MATERIAŁY */}
            <section style={{ paddingTop: 12, borderTop: "1px solid rgba(63,63,70,0.4)" }}>
              <div style={{ 
                padding: "24px 28px", 
                background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 100%)", 
                borderLeft: "4px solid #D4AF37", 
                borderRadius: "0 12px 12px 0",
                marginBottom: 32,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 20,
              }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, color: "#D4AF37", letterSpacing: "0.4em", textTransform: "uppercase", margin: "0 0 6px 0" }}>
                    Dział: Materiał
                  </p>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontStyle: "italic", letterSpacing: "-0.02em", margin: 0 }}>
                    Materiały & Wypełnienia
                  </h2>
                  <p style={{ fontSize: 10, color: "#71717a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", margin: "8px 0 0 0" }}>
                    Ceny za metr kwadratowy (m²)
                  </p>
                </div>
                <button 
                  onClick={() => addTempPriceOption('material')}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "12px 24px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "transparent", color: "#D4AF37", border: "1.5px solid #D4AF37", cursor: "pointer", transition: "all 0.25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,175,55,0.12)"; e.currentTarget.style.borderColor = "#E8C97A"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#D4AF37"; }}
                >
                  <Plus size={18} /> Dodaj materiał
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 24 }}>
                {prices.filter(p => p.category === 'material').map((item) => (
                  <div key={item.id} className="admin-card flex items-center" style={{ padding: 28, gap: 28 }}>
                    <div 
                      onClick={() => { setSelectedItemId(item.id); fileInputRef.current?.click(); }}
                      style={{ width: 140, height: 140, minWidth: 140, minHeight: 140, background: "rgba(0,0,0,0.8)", border: "1px solid rgba(63,63,70,0.5)", borderRadius: 14, cursor: "pointer", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      {item.image_url ? (
                        <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                      ) : (
                        <Camera size={40} style={{ color: "#52525b" }} />
                      )}
                    </div>
                    <div className="flex-1" style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.35em", textTransform: "uppercase" }}>
                          Nazwa materiału
                        </label>
                        <input 
                          value={item.name} 
                          onChange={(e) => handleLocalUpdate(item.id, 'name', e.target.value)}
                          className="admin-input font-semibold uppercase"
                          placeholder="np. Deska, Full, Siatka"
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.35em", textTransform: "uppercase" }}>
                          Cena (PLN / m²)
                        </label>
                        <input 
                          type="number"
                          value={item.value} 
                          onChange={(e) => handleLocalUpdate(item.id, 'value', parseFloat(e.target.value))}
                          className="admin-input font-semibold text-[#D4AF37]"
                          style={{ width: 120 }}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => deletePriceItem(item.id, !!item.isTemp)} 
                      style={{ padding: 10, color: "#71717a", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer", flexShrink: 0 }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(63,63,70,0.5)"; e.currentTarget.style.color = "#ef4444"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
                    >
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
          <div className="animate-in fade-in duration-700" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <section className="admin-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <h2 className="text-[#D4AF37] font-black uppercase tracking-[0.15em] italic flex items-center gap-2" style={{ fontSize: 14, margin: 0 }}>
                  <Plus size={16} /> Nowa realizacja
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ gap: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>Model bramy</label>
                  <select className="admin-select admin-compact" value={newItem.gate_model_id} onChange={e => { const v = e.target.value; setNewItem(prev => ({ ...prev, gate_model_id: v, model_id: v || prev.model_id })); updateNewItemProductFlags({ hasGate: !!v }); }}>
                    <option value="">--</option>
                    {prices.filter(p => p.category === 'base').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>Model furtki</label>
                  <select className="admin-select admin-compact" value={newItem.wicket_model_id} onChange={e => { const v = e.target.value; setNewItem(prev => ({ ...prev, wicket_model_id: v, model_id: prev.gate_model_id ? prev.model_id : (v || prev.model_id) })); updateNewItemProductFlags({ hasWicket: !!v }); }}>
                    <option value="">--</option>
                    {prices.filter(p => p.category === 'wicket_base').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>Materiał</label>
                  <select className="admin-select admin-compact" value={newItem.material_id} onChange={e => setNewItem({...newItem, material_id: e.target.value})}>
                    <option value="">--</option>
                    {prices.filter(p => p.category === 'material').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>Stal</label>
                  <select className="admin-select admin-compact" value={newItem.steel_type} onChange={(e) => setNewItem({ ...newItem, steel_type: e.target.value })}>
                    <option value="">--</option>
                    {steelTypes.map((s) => <option key={s.label} value={s.label}>{s.label}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>Kolor RAL</label>
                  <select className="admin-select admin-compact" value={ralColors.find(c => c.code === newItem.ral_code) ? newItem.ral_code : ''} onChange={(e) => setNewItem({ ...newItem, ral_code: e.target.value })}>
                    <option value="">--</option>
                    {ralColors.map((c) => <option key={c.code} value={c.code}>{c.code} {(c.name || ralCodeToNamePl(c.code)) ? `– ${c.name || ralCodeToNamePl(c.code)}` : ''}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>RAL ręcznie</label>
                  <input type="text" className="admin-input admin-compact" placeholder="np. RAL 7024" value={newItem.ral_code} onChange={(e) => setNewItem({ ...newItem, ral_code: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>Malowanie</label>
                  <select className="admin-select admin-compact" value={newItem.paint_type} onChange={(e) => setNewItem({ ...newItem, paint_type: e.target.value })}>
                    <option value="">--</option>
                    {paintTypes.map((p) => <option key={p.label} value={p.label}>{p.label}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: "span 2" }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>Opis / miasto</label>
                  <input className="admin-input admin-compact" placeholder="Opis" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>Cena</label>
                  <input type="number" className="admin-input admin-compact" placeholder="0" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} style={{ color: "#D4AF37" }} />
                </div>
                <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", justifyContent: "flex-end" }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase", visibility: "hidden" }}>Akcja</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <label
                      className={`cursor-pointer flex items-center gap-2 rounded-full border transition-all ${uploading ? 'border-[#D4AF37] animate-pulse bg-[#D4AF37]/10' : 'border-zinc-600 hover:border-[#D4AF37] bg-transparent hover:bg-[#D4AF37]/5'}`}
                      style={{ padding: "8px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: uploading ? "#D4AF37" : "#a1a1aa", textTransform: "uppercase" }}
                    >
                      <Upload size={16} />
                      {uploading ? 'Wgrywanie...' : 'Dodaj zdjęcie'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleGalleryImageSelect} disabled={uploading} />
                    </label>
                    <button
                      onClick={handleAddGalleryItem}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "10px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "#D4AF37", color: "#000", border: "none", boxShadow: "0 0 24px rgba(212,175,55,0.35)", cursor: "pointer", transition: "all 0.25s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A227"; e.currentTarget.style.boxShadow = "0 0 36px rgba(212,175,55,0.5)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.boxShadow = "0 0 24px rgba(212,175,55,0.35)"; }}
                    >
                      <Plus size={16} /> Dodaj realizację
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6" style={{ gap: 12 }}>
              {gallery.map((item) => (
                <div key={item.id} className="admin-card flex flex-col group overflow-hidden" style={{ padding: 0 }}>
                  <div className="aspect-[4/5] overflow-hidden bg-black relative">
                    <img src={item.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" />
                  </div>
                  
                  <div className="flex-1 flex flex-col" style={{ padding: 12, gap: 8 }}>
                    <h4 className="font-black uppercase text-white truncate" style={{ fontSize: 12 }}>{item.description || 'Realizacja'}</h4>
                    <div className="flex-1 font-black uppercase" style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 5 }}>
                      <div className="text-[#D4AF37] flex items-center gap-2">
                        <CheckCircle size={12}/>
                        {/* Model bramy / furtki (nowe pola + fallback do starego) */}
                        {(() => {
                          const gate = item.gate_model_id
                            ? prices.find(p => p.id === item.gate_model_id)
                            : null;
                          const wicket = item.wicket_model_id
                            ? prices.find(p => p.id === item.wicket_model_id)
                            : null;
                          const legacy = (!gate && !wicket && item.model_id)
                            ? prices.find(p => p.id === item.model_id)
                            : null;

                          if (gate && wicket) {
                            return `BRAMA: ${gate.name} / FURTKA: ${wicket.name}`;
                          }
                          if (gate) return `BRAMA: ${gate.name}`;
                          if (wicket) return `FURTKA: ${wicket.name}`;
                          if (legacy) return legacy.name;
                          return 'Brak powiązania';
                        })()}
                      </div>
                      {item.material_id && (
                        <div className="text-zinc-500 flex items-center gap-2">
                          <CheckCircle size={12}/>
                          {prices.find(p => p.id === item.material_id)?.name || 'Brak powiązania'}
                        </div>
                      )}
                      {item.steel_type && (
                        <div className="text-zinc-500 flex items-center gap-2">
                          <CheckCircle size={12}/> {item.steel_type}
                        </div>
                      )}
                      {item.ral_code && (
                        <div className="text-zinc-500 flex items-center gap-2">
                          <CheckCircle size={12}/> {item.ral_code}
                        </div>
                      )}
                      {item.paint_type && (
                        <div className="text-zinc-500 flex items-center gap-2">
                          <CheckCircle size={12}/> {item.paint_type}
                        </div>
                      )}
                    </div>
                    <div className="border-t border-zinc-800 flex items-center justify-between" style={{ paddingTop: 10 }}>
                       <p className="font-light text-white italic" style={{ fontSize: 15 }}>{item.price?.toLocaleString()} <span className="text-zinc-500 not-italic uppercase" style={{ fontSize: 11 }}>PLN</span></p>
                       <button onClick={async () => { const ok = await toast.showConfirm('Usunąć?'); if (ok) { await supabase.from('gallery').delete().eq('id', item.id); await fetchData(); } }} className="text-zinc-800 hover:text-red-500 transition-all">
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
          <div className="animate-in fade-in duration-700" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* STAL */}
            <section style={{ marginBottom: 32 }}>
              <div style={{
                padding: "24px 28px",
                background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 100%)",
                borderLeft: "4px solid #D4AF37",
                borderRadius: "0 12px 12px 0",
                marginBottom: 24,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 20,
              }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, color: "#D4AF37", letterSpacing: "0.4em", textTransform: "uppercase", margin: "0 0 6px 0" }}>
                    Dział: Konfigurator
                  </p>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontStyle: "italic", letterSpacing: "-0.02em", margin: 0 }}>
                    Typy stali / zabezpieczenia
                  </h2>
                  <p style={{ fontSize: 10, color: "#71717a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", margin: "8px 0 0 0" }}>
                    Lista w konfiguratorze bramy i furtki
                  </p>
                </div>
                <button
                  onClick={() => setSteelTypes((prev) => [...prev, { label: 'NOWA OPCJA', price: 0 }])}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "10px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "#D4AF37", color: "#000", border: "none", boxShadow: "0 0 24px rgba(212,175,55,0.35)", cursor: "pointer", transition: "all 0.25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A227"; e.currentTarget.style.boxShadow = "0 0 36px rgba(212,175,55,0.5)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.boxShadow = "0 0 24px rgba(212,175,55,0.35)"; }}
                >
                  <Plus size={16} /> Dodaj
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {steelTypes.map((t, idx) => (
                  <div key={`${t.label}-${idx}`} className="admin-card flex items-center" style={{ padding: 20, gap: 16 }}>
                    <input
                      value={t.label}
                      onChange={(e) => setSteelTypes((prev) => prev.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))}
                      className="admin-input admin-compact flex-1"
                      placeholder="Nazwa opcji"
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="number"
                        value={t.price}
                        onChange={(e) => setSteelTypes((prev) => prev.map((x, i) => i === idx ? { ...x, price: Number(e.target.value) || 0 } : x))}
                        className="admin-input admin-compact"
                        style={{ width: 90, color: "#D4AF37" }}
                        placeholder="0"
                      />
                      <span style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>PLN</span>
                    </div>
                    <button onClick={() => setSteelTypes((prev) => prev.filter((_, i) => i !== idx))} style={{ padding: 8, color: "#71717a", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#71717a"; }} title="Usuń">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* RAL */}
            <section style={{ paddingTop: 12, borderTop: "1px solid rgba(63,63,70,0.4)" }}>
              <div style={{
                padding: "24px 28px",
                background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 100%)",
                borderLeft: "4px solid #D4AF37",
                borderRadius: "0 12px 12px 0",
                marginBottom: 24,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 20,
              }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, color: "#D4AF37", letterSpacing: "0.4em", textTransform: "uppercase", margin: "0 0 6px 0" }}>
                    Dział: Konfigurator
                  </p>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontStyle: "italic", letterSpacing: "-0.02em", margin: 0 }}>
                    Kolory RAL
                  </h2>
                  <p style={{ fontSize: 10, color: "#71717a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", margin: "8px 0 0 0" }}>
                    Paleta kolorów RAL Classic w konfiguratorze · <a href="https://www.ral-farben.de/en/all-ral-colours" target="_blank" rel="noopener noreferrer" style={{ color: "#D4AF37", textDecoration: "underline" }}>wzornik RAL</a>
                  </p>
                </div>
                <button
                  onClick={() => setRalColors((prev) => [...prev, { code: 'RAL XXXX', name: 'Nowy kolor', price: 0 }])}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "10px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "#D4AF37", color: "#000", border: "none", boxShadow: "0 0 24px rgba(212,175,55,0.35)", cursor: "pointer", transition: "all 0.25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A227"; e.currentTarget.style.boxShadow = "0 0 36px rgba(212,175,55,0.5)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.boxShadow = "0 0 24px rgba(212,175,55,0.35)"; }}
                >
                  <Plus size={16} /> Dodaj kolor
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20, padding: "16px 20px", background: "rgba(0,0,0,0.3)", borderRadius: 12, border: "1px solid rgba(63,63,70,0.4)", marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
                  <input type="checkbox" checked={allowOtherRal} onChange={(e) => setAllowOtherRal(e.target.checked)} style={{ accentColor: "#D4AF37", width: 16, height: 16 }} />
                  Pokazuj „Inny kolor RAL (do wpisania)”
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>Dopłata:</span>
                  <input type="number" value={otherRalPrice} onChange={(e) => setOtherRalPrice(Number(e.target.value) || 0)} className="admin-input admin-compact" style={{ width: 80, color: "#D4AF37" }} />
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>PLN</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ralColors.map((c, idx) => {
                  const hex = getRalDisplayColor(c.code);
                  const notFound = c.code.trim() && !hex;
                  return (
                  <div key={`ral-${idx}`} className="admin-card flex flex-wrap items-center" style={{ padding: 16, gap: 12 }}>
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        border: "1px solid rgba(63,63,70,0.6)",
                        background: hex || "rgba(30,30,30,0.8)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, color: "#71717a", fontWeight: 700,
                      }}
                      title={notFound ? "Nie znaleziono w bazie RAL Classic" : undefined}
                    >
                      {notFound ? "?" : null}
                    </div>
                    <input
                      value={c.code}
                      onChange={(e) => {
                        const v = e.target.value;
                        const plName = ralCodeToNamePl(v);
                        setRalColors((prev) => prev.map((x, i) => i === idx ? { ...x, code: v, name: plName ?? x.name } : x));
                      }}
                      className="admin-input admin-compact"
                      placeholder="RAL 7016"
                      style={{ width: 100 }}
                    />
                    <input value={c.name || ''} onChange={(e) => setRalColors((prev) => prev.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} className="admin-input admin-compact" placeholder="Antracyt" style={{ minWidth: 120, flex: 1 }} />
                    {notFound && (
                      <span style={{ fontSize: 10, color: "#a16207", fontWeight: 600 }}>
                        Nie znaleziono w bazie RAL
                      </span>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="number" value={c.price} onChange={(e) => setRalColors((prev) => prev.map((x, i) => i === idx ? { ...x, price: Number(e.target.value) || 0 } : x))} className="admin-input admin-compact" style={{ width: 70, color: "#D4AF37" }} placeholder="0" />
                      <span style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>PLN</span>
                    </div>
                    <button onClick={() => setRalColors((prev) => prev.filter((_, i) => i !== idx))} style={{ padding: 8, color: "#71717a", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#71717a"; }} title="Usuń">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  );
                })}
              </div>
            </section>

            {/* TYPY MALOWANIA */}
            <section style={{ paddingTop: 12, borderTop: "1px solid rgba(63,63,70,0.4)" }}>
              <div style={{
                padding: "24px 28px",
                background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 100%)",
                borderLeft: "4px solid #D4AF37",
                borderRadius: "0 12px 12px 0",
                marginBottom: 24,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 20,
              }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, color: "#D4AF37", letterSpacing: "0.4em", textTransform: "uppercase", margin: "0 0 6px 0" }}>
                    Dział: Konfigurator
                  </p>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontStyle: "italic", letterSpacing: "-0.02em", margin: 0 }}>
                    Typy malowania
                  </h2>
                  <p style={{ fontSize: 10, color: "#71717a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", margin: "8px 0 0 0" }}>
                    Opcje malowania w konfiguratorze
                  </p>
                </div>
                <button
                  onClick={() => setPaintTypes((prev) => [...prev, { label: 'NOWY TYP MALOWANIA', price: 0 }])}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "10px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "#D4AF37", color: "#000", border: "none", boxShadow: "0 0 24px rgba(212,175,55,0.35)", cursor: "pointer", transition: "all 0.25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A227"; e.currentTarget.style.boxShadow = "0 0 36px rgba(212,175,55,0.5)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.boxShadow = "0 0 24px rgba(212,175,55,0.35)"; }}
                >
                  <Plus size={16} /> Dodaj
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {paintTypes.map((p, idx) => (
                  <div key={`${p.label}-${idx}`} className="admin-card flex items-center" style={{ padding: 20, gap: 16 }}>
                    <input value={p.label} onChange={(e) => setPaintTypes((prev) => prev.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))} className="admin-input admin-compact flex-1" placeholder="Nazwa typu malowania" />
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="number" value={p.price} onChange={(e) => setPaintTypes((prev) => prev.map((x, i) => i === idx ? { ...x, price: Number(e.target.value) || 0 } : x))} className="admin-input admin-compact" style={{ width: 90, color: "#D4AF37" }} placeholder="0" />
                      <span style={{ fontSize: 9, fontWeight: 800, color: "#71717a", letterSpacing: "0.2em", textTransform: "uppercase" }}>PLN</span>
                    </div>
                    <button onClick={() => setPaintTypes((prev) => prev.filter((_, i) => i !== idx))} style={{ padding: 8, color: "#71717a", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#71717a"; }} title="Usuń">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <p style={{ fontSize: 11, color: "#71717a", margin: 0 }}>
              Zapisz zmiany przyciskiem na dole ekranu, gdy pojawią się niezapisane zmiany.
            </p>
          </div>
        )}

        {/* Pływający przycisk Zapisz (Cennik lub Opcje) */}
        {((activeTab === 'prices' && hasChanges) || (activeTab === 'options' && hasOptionsChanges)) && (
          <div
            style={{
              position: "fixed",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "10px 20px 10px 24px",
              background: "rgba(0,0,0,0.95)",
              border: "1px solid rgba(212,175,55,0.5)",
              borderRadius: 999,
              boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(212,175,55,0.15)",
              backdropFilter: "blur(16px)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 800, color: "#D4AF37", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              <AlertCircle size={14} />
              Niezapisane zmiany
            </span>
            {activeTab === 'prices' ? (
              <button
                onClick={saveAllChanges}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "10px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "#D4AF37", color: "#000", border: "none", boxShadow: "0 0 20px rgba(212,175,55,0.35)", cursor: "pointer", transition: "all 0.25s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A227"; e.currentTarget.style.boxShadow = "0 0 28px rgba(212,175,55,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.boxShadow = "0 0 20px rgba(212,175,55,0.35)"; }}
              >
                {saveStatus === 'saving' ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                Zapisz cennik
              </button>
            ) : (
              <button
                onClick={saveConfiguratorOptions}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "10px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "#D4AF37", color: "#000", border: "none", boxShadow: "0 0 20px rgba(212,175,55,0.35)", cursor: "pointer", transition: "all 0.25s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A227"; e.currentTarget.style.boxShadow = "0 0 28px rgba(212,175,55,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.boxShadow = "0 0 20px rgba(212,175,55,0.35)"; }}
              >
                {saveOptionsStatus === 'saving' ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                Zapisz opcje
              </button>
            )}
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