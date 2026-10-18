"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TableMap from "@/components/TableMap";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Lock, Unlock, Save, X, Loader2, Users, LayoutGrid, 
  CheckCircle2, Calendar, MapPin
} from "lucide-react";

type Table = {
  id: string;
  table_number: number;
  capacity: number;
  shape: string;
  is_active: boolean;
  zone: string;
  parent_table_id: string | null;
};

export default function GestioneTavoliPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [todaysBookings, setTodaysBookings] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    table_number: "",
    capacity: "2",
    shape: "square",
    zone: "Sala Principale"
  });
  
  // Stati per il Tavolo Unito
  const [isCombined, setIsCombined] = useState(false);
  const [tablesToMerge, setTablesToMerge] = useState<string[]>([]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: link } = await supabase
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link) { router.push("/onboarding"); return; }
    setTenantId(link.tenant_id);

    const { data, error } = await supabase
      .from("tables")
      .select("*")
      .eq("tenant_id", link.tenant_id)
      .order("table_number", { ascending: true });

    if (!error && data) setTables(data);

    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", link.tenant_id)
      .gte("scheduled_at", `${today}T00:00:00`)
      .lte("scheduled_at", `${today}T23:59:59`);

    setTodaysBookings(count || 0);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddTable = async () => {
    if (!tenantId || !newTable.table_number) return;
    setSaving(true);

    const nextIndex = tables.length;
    const position_x = nextIndex % 4;
    const position_y = Math.floor(nextIndex / 4);

    const { data: inserted, error } = await supabase.from("tables").insert({
      tenant_id: tenantId,
      table_number: parseInt(newTable.table_number),
      capacity: parseInt(newTable.capacity),
      position_x,
      position_y,
      shape: newTable.shape,
      zone: newTable.zone,
      is_active: true
    }).select().single();

    if (error) {
      alert("Errore: " + error.message);
    } else if (isCombined && inserted && tablesToMerge.length > 0) {
      await supabase
        .from("tables")
        .update({ parent_table_id: inserted.id })
        .in("id", tablesToMerge);
    }

    if (!error) {
      setIsModalOpen(false);
      setNewTable({ table_number: "", capacity: "2", shape: "square", zone: "Sala Principale" });
      setIsCombined(false);
      setTablesToMerge([]);
      await loadData();
    }
    setSaving(false);
  };

  const toggleTableActive = async (id: string, currentStatus: boolean) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t));
    await supabase.from("tables").update({ is_active: !currentStatus }).eq("id", id);
  };

  const deleteTable = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo tavolo?")) return;
    setTables(prev => prev.filter(t => t.id !== id));
    await supabase.from("tables").delete().eq("id", id);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[70vh]"><Loader2 className="animate-spin text-night" size={40} /></div>;
  }

  const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);
  const activeTables = tables.filter(t => t.is_active && !t.parent_table_id).length;
  const zones = Array.from(new Set(tables.map(t => t.zone || 'Sala Principale')));

  return (
    <div className="max-w-7xl mx-auto pb-24 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-night mb-1">Gestione Sala</h1>
          <p className="text-night/50 text-sm">Configura la piantina e monitora l'occupazione.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-night hover:bg-night/90 text-white px-5 py-3 rounded-xl font-bold text-sm transition inline-flex items-center gap-2 shadow-md active:scale-95 w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> Aggiungi Tavolo
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Tavoli Totali", value: tables.length, icon: LayoutGrid, color: "text-blue-500" },
          { label: "Tavoli Attivi", value: activeTables, icon: CheckCircle2, color: "text-green-500" },
          { label: "Coperti Totali", value: totalCapacity, icon: Users, color: "text-purple-500" },
          { label: "Prenotazioni Oggi", value: todaysBookings, icon: Calendar, color: "text-orange-500" },
        ].map((kpi, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white rounded-2xl p-5 border border-night/[0.06] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition"><kpi.icon size={48} className={kpi.color} /></div>
            <p className="text-[11px] font-bold text-night/40 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-3xl font-black text-night">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-sm font-bold text-night/50 uppercase tracking-wider mb-3">Configurazione Tavoli</h2>
          {tables.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-night/[0.06]">
              <LayoutGrid className="mx-auto text-night/20 mb-3" size={40} />
              <p className="text-base font-semibold text-night/60">Nessun tavolo creato</p>
              <p className="text-xs text-night/40 mt-1">Clicca "Aggiungi Tavolo" per iniziare a costruire la tua sala.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {tables.map(t => (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={t.id} className={`bg-white rounded-xl p-4 border transition-all flex items-center justify-between ${!t.is_active ? 'border-red-100 bg-red-50/30' : t.parent_table_id ? 'border-blue-100 bg-blue-50/30' : 'border-night/[0.06] shadow-sm'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${!t.is_active ? 'bg-red-100 text-red-500' : t.parent_table_id ? 'bg-blue-100 text-blue-600' : 'bg-cream text-night'}`}>
                      {t.table_number}
                    </div>
                    <div>
                      <p className="font-bold text-night flex items-center gap-2">
                        Tavolo {t.table_number}
                        <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t.zone || 'Sala'}</span>
                        {t.parent_table_id && <span className="text-[10px] text-blue-600">🔗 Unito</span>}
                      </p>
                      <p className="text-xs text-night/50 flex items-center gap-1 mt-0.5">
                        <Users size={12} /> {t.capacity} posti
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleTableActive(t.id, t.is_active)} className={`p-2 rounded-lg transition ${t.is_active ? 'text-gray-400 hover:bg-gray-100 hover:text-red-500' : 'text-red-500 hover:bg-red-100'}`}>
                      {t.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button onClick={() => deleteTable(t.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-night/50 uppercase tracking-wider">Anteprima Piantina</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-night/40 bg-white px-3 py-1 rounded-full border border-night/[0.06]">
              <MapPin size={12} /> {zones.length} Zone
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-night/[0.06] shadow-sm">
            {zones.map(z => (
              <div key={z} className="mb-8 last:mb-0">
                <h3 className="text-xs font-bold text-night/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-night/20"></span> {z}
                </h3>
                <TableMap 
                  tables={tables.filter(t => (t.zone || 'Sala Principale') === z)} 
                  selectedId={null} 
                  onSelect={() => {}} 
                  brandColor="#25D366" 
                />
              </div>
            ))}
            {tables.length === 0 && (
              <div className="text-center py-20 text-night/30"><p>Aggiungi un tavolo per vedere la piantina</p></div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-night/[0.06] flex items-center justify-between bg-cream/30">
                <h3 className="font-bold text-night text-lg">Aggiungi Tavolo</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-night/40 hover:text-night p-1"><X size={20} /></button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-night/60 mb-1 block">Numero Tavolo *</span>
                    <input type="number" min="1" value={newTable.table_number} onChange={e => setNewTable({...newTable, table_number: e.target.value})} className="w-full bg-cream border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-night/20 focus:outline-none transition" placeholder="Es. 1" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-night/60 mb-1 block">Posti (Persone)</span>
                    <input type="number" min="1" value={newTable.capacity} onChange={e => setNewTable({...newTable, capacity: e.target.value})} className="w-full bg-cream border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-night/20 focus:outline-none transition" />
                  </label>
                </div>
                
                <label className="block">
                  <span className="text-xs font-bold text-night/60 mb-1 block">Zona (es. Sala Interna, Esterno)</span>
                  <input type="text" value={newTable.zone} onChange={e => setNewTable({...newTable, zone: e.target.value})} className="w-full bg-cream border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-night/20 focus:outline-none transition" placeholder="Sala Principale" />
                </label>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-blue-900">Tavolo Unito?</p>
                      <p className="text-[10px] text-blue-700">Unisci due o più tavoli per grandi gruppi</p>
                    </div>
                    <button onClick={() => setIsCombined(!isCombined)} className={`w-10 h-5 rounded-full transition relative ${isCombined ? "bg-blue-600" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isCombined ? "left-5" : "left-1"}`} />
                    </button>
                  </div>
                  
                  {isCombined && (
                    <div className="pt-3 border-t border-blue-200">
                      <p className="text-xs font-bold text-blue-900 mb-2">Seleziona i tavoli da unire:</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {tables.filter(t => !t.parent_table_id).map(t => (
                          <label key={t.id} className="flex items-center gap-2 text-xs text-blue-800">
                            <input 
                              type="checkbox" 
                              checked={tablesToMerge.includes(t.id)}
                              onChange={(e) => {
                                if (e.target.checked) setTablesToMerge([...tablesToMerge, t.id]);
                                else setTablesToMerge(tablesToMerge.filter(id => id !== t.id));
                              }}
                              className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                            />
                            Tavolo {t.table_number} ({t.capacity} posti)
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <label className="block">
                  <span className="text-xs font-bold text-night/60 mb-1 block">Forma</span>
                  <select value={newTable.shape} onChange={e => setNewTable({...newTable, shape: e.target.value})} className="w-full bg-cream border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-night/20 focus:outline-none transition">
                    <option value="square">Quadrato</option>
                    <option value="round">Rotondo</option>
                  </select>
                </label>
              </div>

              <div className="p-4 bg-cream/50 border-t border-night/[0.06]">
                <button onClick={handleAddTable} disabled={saving || !newTable.table_number} className="w-full bg-night hover:bg-night/90 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Salva Tavolo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
