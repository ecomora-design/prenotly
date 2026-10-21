"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TableMap from "@/components/TableMap";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Lock, Unlock, Save, X, Loader2, Users, LayoutGrid, 
  CheckCircle2, Calendar, MapPin, Crown, Utensils, Activity
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
  const [activeTab, setActiveTab] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    table_number: "",
    capacity: "2",
    shape: "square",
    zone: "Sala Principale"
  });
  
  const [isCombined, setIsCombined] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
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

    if (!error && data) {
      setTables(data);
      const zones = Array.from(new Set(data.map((t: any) => t.zone || 'Sala Principale')));
      if (zones.length > 0 && !activeTab) setActiveTab(zones[0] as string);
    }

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
    setTableError(null);
    setSaving(true);

    // Controllo pre-salvataggio: esiste già un tavolo con questo numero nella stessa zona?
    const existing = tables.find(
      (t) => t.table_number === parseInt(newTable.table_number) && (t.zone || "Sala Principale") === newTable.zone
    );
    if (existing) {
      setTableError(`Esiste già un Tavolo ${newTable.table_number} in "${newTable.zone}". Scegli un altro numero o cambia zona.`);
      setSaving(false);
      return;
    }

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
      if (error.message.includes("duplicate")) {
        setTableError("Questo tavolo esiste già nella zona selezionata. Scegli un numero diverso.");
      } else {
        setTableError("Errore: " + error.message);
      }
    } else if (isCombined && inserted && tablesToMerge.length > 0) {
      await supabase.from("tables").update({ parent_table_id: inserted.id }).in("id", tablesToMerge);
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
    if (!confirm("Eliminare questo tavolo?")) return;
    setTables(prev => prev.filter(t => t.id !== id));
    await supabase.from("tables").delete().eq("id", id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-[#050505]">
        <Loader2 className="animate-spin text-[#25D366]" size={40} />
      </div>
    );
  }

  const zones = Array.from(new Set(tables.map(t => t.zone || 'Sala Principale')));
  const activeTables = tables.filter(t => t.is_active && !t.parent_table_id).length;
  const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-bold uppercase tracking-widest mb-3">
            <Activity size={12} /> Control Room
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Gestione Sala</h1>
          <p className="text-white/40 text-sm mt-1">Monitora tavoli e occupazione in tempo reale.</p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setTableError(null); }}
          className="bg-[#25D366] hover:bg-[#20ba5a] text-black px-5 py-3 rounded-xl font-bold text-sm transition inline-flex items-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] active:scale-95 w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> Aggiungi Tavolo
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Tavoli Totali", value: tables.length, icon: LayoutGrid, color: "text-blue-400" },
          { label: "Tavoli Attivi", value: activeTables, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Coperti Totali", value: totalCapacity, icon: Users, color: "text-purple-400" },
          { label: "Prenotazioni Oggi", value: todaysBookings, icon: Calendar, color: "text-orange-400" },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden group hover:border-white/10 transition"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
              <kpi.icon size={64} className={kpi.color} />
            </div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">{kpi.label}</p>
            <p className="text-3xl font-black">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* PIANTINA PRINCIPALE (Sinistra) */}
        <div className="lg:col-span-8">
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-[28px] p-6">
            {/* Tabs per le zone */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar">
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setActiveTab(zone)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition shrink-0 ${
                    activeTab === zone 
                      ? "bg-[#25D366] text-black shadow-[0_0_15px_rgba(37,211,102,0.3)]" 
                      : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/[0.06]"
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-5 mb-6 text-[11px] font-bold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-white/40">Libero</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="text-white/40">Occupato</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="text-white/40">Disattivato</span>
              </div>
            </div>

            {/* Mappa */}
            {activeTab && (
              <TableMap 
                tables={tables.filter(t => (t.zone || 'Sala Principale') === activeTab)} 
                selectedId={null} 
                onSelect={() => {}} 
                brandColor="#25D366"
                isAdmin={true}
              />
            )}
          </div>
        </div>

        {/* LISTA TAVOLI (Destra) */}
        <div className="lg:col-span-4">
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-[28px] p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Utensils size={16} className="text-[#25D366]" /> Elenco Tavoli
              </h2>
              <span className="text-[10px] font-bold text-white/30 bg-white/[0.03] px-2 py-1 rounded-full">
                {tables.length} totali
              </span>
            </div>

            {tables.length === 0 ? (
              <div className="text-center py-10">
                <LayoutGrid className="mx-auto text-white/10 mb-2" size={32} />
                <p className="text-xs text-white/30">Nessun tavolo creato</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 hide-scrollbar">
                {tables.map(t => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                    key={t.id} 
                    className={`rounded-xl p-3 border transition-all flex items-center justify-between ${
                      !t.is_active 
                        ? 'border-white/[0.03] bg-white/[0.01]' 
                        : t.parent_table_id 
                        ? 'border-blue-500/20 bg-blue-500/[0.03]' 
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                        !t.is_active 
                          ? 'bg-white/[0.03] text-white/20' 
                          : t.parent_table_id 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-[#25D366]/10 text-[#25D366]'
                      }`}>
                        {t.table_number}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-white text-sm">Tavolo {t.table_number}</p>
                          {t.parent_table_id && (
                            <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">UNITO</span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
                          <Users size={10} /> {t.capacity} posti · {t.zone || 'Sala'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      <button 
                        onClick={() => toggleTableActive(t.id, t.is_active)} 
                        className={`p-1.5 rounded-lg transition ${t.is_active ? 'text-white/30 hover:bg-red-500/10 hover:text-red-400' : 'text-red-400 hover:bg-red-500/10'}`}
                      >
                        {t.is_active ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>
                      <button 
                        onClick={() => deleteTable(t.id)} 
                        className="p-1.5 rounded-lg text-white/30 hover:bg-red-500/10 hover:text-red-400 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALE AGGIUNTA */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0A0A0A] border border-white/[0.08] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <Plus size={18} className="text-[#25D366]" /> Nuovo Tavolo
                  </h3>
                  <p className="text-[11px] text-white/40 mt-0.5">Configura un nuovo tavolo per la tua sala</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setTableError(null); }} className="text-white/40 hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>
              
              
              {tableError && (
                <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-400 text-xs font-black">!</span>
                  </div>
                  <p className="text-xs text-red-300 font-medium leading-relaxed flex-1">{tableError}</p>
                  <button onClick={() => setTableError(null)} className="text-red-400/50 hover:text-red-400 text-lg leading-none">×</button>
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Numero *</span>
                    <input 
                      type="number" min="1" 
                      value={newTable.table_number} 
                      onChange={e => setNewTable({...newTable, table_number: e.target.value})} 
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:bg-white/[0.05] focus:border-[#25D366]/50 focus:outline-none transition" 
                      placeholder="Es. 1" 
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Posti</span>
                    <input 
                      type="number" min="1" 
                      value={newTable.capacity} 
                      onChange={e => setNewTable({...newTable, capacity: e.target.value})} 
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:bg-white/[0.05] focus:border-[#25D366]/50 focus:outline-none transition" 
                    />
                  </label>
                </div>
                
                <label className="block">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Zona</span>
                  <input 
                    type="text" 
                    value={newTable.zone} 
                    onChange={e => setNewTable({...newTable, zone: e.target.value})} 
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:bg-white/[0.05] focus:border-[#25D366]/50 focus:outline-none transition" 
                    placeholder="Sala Principale" 
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Forma</span>
                  <select 
                    value={newTable.shape} 
                    onChange={e => setNewTable({...newTable, shape: e.target.value})} 
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:bg-white/[0.05] focus:border-[#25D366]/50 focus:outline-none transition"
                  >
                    <option value="square">Quadrato</option>
                    <option value="round">Rotondo</option>
                  </select>
                </label>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-blue-300">Tavolo Unito?</p>
                      <p className="text-[10px] text-blue-400/70">Unisci più tavoli per gruppi grandi</p>
                    </div>
                    <button 
                      onClick={() => setIsCombined(!isCombined)} 
                      className={`w-10 h-5 rounded-full transition relative ${isCombined ? "bg-blue-500" : "bg-white/20"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isCombined ? "left-5" : "left-1"}`} />
                    </button>
                  </div>
                  
                  {isCombined && (
                    <div className="pt-3 border-t border-blue-500/20">
                      <p className="text-[10px] font-bold text-blue-300 uppercase mb-2">Seleziona i tavoli:</p>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {tables.filter(t => !t.parent_table_id).map(t => (
                          <label key={t.id} className="flex items-center gap-2 text-xs text-blue-200 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={tablesToMerge.includes(t.id)}
                              onChange={(e) => {
                                if (e.target.checked) setTablesToMerge([...tablesToMerge, t.id]);
                                else setTablesToMerge(tablesToMerge.filter(id => id !== t.id));
                              }}
                              className="rounded border-blue-500/30 text-blue-500"
                            />
                            Tavolo {t.table_number} ({t.capacity} posti)
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/[0.06]">
                <button 
                  onClick={handleAddTable} 
                  disabled={saving || !newTable.table_number} 
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] disabled:bg-white/10 disabled:text-white/30 text-black py-3.5 rounded-xl font-black transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.2)]"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                  Salva Tavolo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
