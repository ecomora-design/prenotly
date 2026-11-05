"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, ChefHat, CheckCircle2, Clock, Utensils, Flame,
  Package, Timer, AlertCircle
} from "lucide-react";

type OrderItem = { name: string; qty: number };
type TableOrder = {
  id: string;
  table_id: string;
  status: string;
  party_size: number;
  items: OrderItem[];
  sent_items_count: number;
  prepared_items_count?: number;
  opened_at: string;
  tables: { table_number: number; zone: string | null } | null;
};

type Props = { tenantId: string };

const COLUMNS = [
  {
    key: "sent",
    label: "Da preparare",
    icon: Clock,
    accent: "#EAB308",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  {
    key: "preparing",
    label: "In preparazione",
    icon: Flame,
    accent: "#F97316",
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
  },
  {
    key: "ready",
    label: "Pronta",
    icon: CheckCircle2,
    accent: "#10B981",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
  },
];

export default function KitchenView({ tenantId }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<TableOrder[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setRefreshing(true);

    const { data, error } = await supabase
      .from("table_orders")
      .select("id, table_id, status, party_size, items, sent_items_count, opened_at, tables(table_number, zone)")
      .eq("tenant_id", tenantId)
      .in("status", ["sent", "sent_partial", "preparing", "ready"])
      .order("opened_at", { ascending: true });

    if (error) { console.error(error); setRefreshing(false); setLoading(false); return; }
    setOrders((data || []) as any);
    setRefreshing(false);
    setLoading(false);
  }

  useEffect(() => { load(); }, [tenantId]);

  // Realtime
  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel("kitchen-realtime-v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "table_orders", filter: `tenant_id=eq.${tenantId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tenantId]);

  // Restituisce solo i piatti NON ancora preparati
  function getNewItems(o: TableOrder): OrderItem[] {
    const preparedCount = o.prepared_items_count || 0;
    return (o.items || []).slice(preparedCount);
  }

  async function setStatus(id: string, status: "preparing" | "ready" | "sent") {
    setUpdating(id);
    try {
      const res = await fetch(`/api/table-orders/${id}/kitchen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Errore"); return; }
      load();
    } catch (err: any) {
      alert(err.message || "Errore");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin text-night/30" size={24} /></div>;
  }

  // Raggruppa per stato
  const byStatus: Record<string, TableOrder[]> = { sent: [], preparing: [], ready: [] };
  orders.forEach((o) => {
    const s = o.status === "sent_partial" ? "sent" : o.status;
    if (byStatus[s]) byStatus[s].push(o);
  });

  const totalActive = orders.length;

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-night flex items-center gap-2">
            <ChefHat size={20} className="text-orange-500" />
            Cucina
          </h2>
          <p className="text-xs text-night/50">{totalActive} {totalActive === 1 ? "comanda attiva" : "comande attive"}</p>
        </div>
        <button onClick={load} disabled={refreshing} className="p-2 text-night/60 hover:text-night rounded-lg hover:bg-white transition">
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {totalActive === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-night/[0.06]">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <ChefHat size={28} className="text-orange-400" />
          </div>
          <p className="font-bold text-night mb-1">Nessuna comanda in cucina</p>
          <p className="text-sm text-night/50">Aspettando che il cameriere invii le comande.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const Icon = col.icon;
            const columnOrders = byStatus[col.key] || [];
            return (
              <div key={col.key} className="flex flex-col">
                {/* Intestazione colonna */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-2 ${col.bg} border ${col.border}`}>
                  <div className="flex items-center gap-2">
                    <Icon size={16} style={{ color: col.accent }} />
                    <span className={`text-xs font-black uppercase tracking-wider ${col.text}`}>{col.label}</span>
                  </div>
                  <span className={`text-xs font-black ${col.text} bg-white/60 px-2 py-0.5 rounded-full`}>
                    {columnOrders.length}
                  </span>
                </div>

                {/* Card comande */}
                <div className="space-y-2 flex-1">
                  <AnimatePresence mode="popLayout">
                    {columnOrders.length === 0 && (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-8 text-xs text-night/30 italic"
                      >
                        Nessuna comanda
                      </motion.div>
                    )}
                    {columnOrders.map((o) => {
                      const tavolo = o.tables?.table_number || "?";
                      const zone = o.tables?.zone || "Sala";
                      const isUpdating = updating === o.id;

                      return (
                        <motion.div
                          key={o.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`bg-white rounded-2xl border-2 overflow-hidden ${
                            o.status === "ready" ? "border-emerald-300" :
                            o.status === "preparing" ? "border-orange-300" :
                            "border-amber-300"
                          }`}
                        >
                          {/* Header card */}
                          <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: col.accent + "15" }}>
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ backgroundColor: col.accent + "25", color: col.accent }}>
                                {tavolo}
                              </div>
                              <div>
                                <p className="font-black text-night text-sm leading-tight">Tavolo {tavolo}</p>
                                <p className="text-[10px] text-night/50">{zone} · {o.party_size} coperti</p>
                              </div>
                            </div>
                            <p className="text-[10px] font-bold text-night/40">
                              {new Date(o.opened_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" })}
                            </p>
                          </div>

                          {/* Lista piatti */}
                          <div className="px-3 py-2">
                            <div className="space-y-1">
                              {getNewItems(o).map((item, idx) => (
                                <div key={idx} className="flex items-baseline gap-2 text-sm">
                                  <span className="font-black text-night w-6 shrink-0">{item.qty}×</span>
                                  <span className="font-bold text-night flex-1">{item.name}</span>
                                </div>
                              ))}
                              {getNewItems(o).length === 0 && (
                                <p className="text-[10px] text-night/40 italic text-center py-1">
                                  Nessun piatto nuovo da preparare
                                </p>
                              )}
                            </div>

                            {/* Azioni */}
                            <div className="mt-3 pt-2 border-t border-night/[0.04]">
                              {o.status === "sent" || o.status === "sent_partial" ? (
                                <button
                                  onClick={() => setStatus(o.id, "preparing")}
                                  disabled={isUpdating}
                                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5"
                                >
                                  {isUpdating ? <RefreshCw className="animate-spin" size={12} /> : <Flame size={14} />}
                                  Inizia preparazione
                                </button>
                              ) : o.status === "preparing" ? (
                                <button
                                  onClick={() => setStatus(o.id, "ready")}
                                  disabled={isUpdating}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5"
                                >
                                  {isUpdating ? <RefreshCw className="animate-spin" size={12} /> : <CheckCircle2 size={14} />}
                                  Segna come pronta
                                </button>
                              ) : (
                                <div className="space-y-1.5">
                                  <div className="text-center text-[10px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 py-1.5 rounded-lg">
                                    ✓ Pronta - in attesa di ritiro
                                  </div>
                                  <button
                                    onClick={() => setStatus(o.id, "preparing")}
                                    disabled={isUpdating}
                                    className="w-full bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 py-1.5 rounded-lg font-bold text-[10px] transition"
                                  >
                                    Riprendi
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nota in fondo */}
      {totalActive > 0 && (
        <p className="text-center text-[10px] text-night/40 mt-6">
          💡 Le comande si aggiornano automaticamente. Il cameriere vede lo stato in tempo reale.
        </p>
      )}
    </div>
  );
}
