"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, ChefHat, CheckCircle2, Clock, Utensils, AlertCircle } from "lucide-react";

type OrderItem = { name: string; qty: number };
type TableOrder = {
  id: string;
  table_id: string;
  status: string;
  party_size: number;
  items: OrderItem[];
  sent_items_count: number;
  opened_at: string;
  tables: { table_number: number; zone: string | null } | null;
};

type Props = { tenantId: string };

export default function KitchenView({ tenantId }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<TableOrder[]>([]);

  async function load() {
    setRefreshing(true);

    const { data, error } = await supabase
      .from("table_orders")
      .select("id, table_id, status, party_size, items, sent_items_count, opened_at, tables(table_number, zone)")
      .eq("tenant_id", tenantId)
      .in("status", ["sent", "sent_partial", "ready"])
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
      .channel("kitchen-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "table_orders", filter: `tenant_id=eq.${tenantId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tenantId]);

  async function markReady(id: string) {
    await supabase.from("table_orders").update({ status: "ready" }).eq("id", id);
    load();
  }

  async function markSent(id: string) {
    // riporta a "sent" se qualcuno clicca "Riprendi"
    await supabase.from("table_orders").update({ status: "sent" }).eq("id", id);
    load();
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin text-night/30" size={24} /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-night flex items-center gap-2">
            <ChefHat size={18} className="text-orange-500" />
            Comande in cucina
          </h2>
          <p className="text-xs text-night/50">{orders.length} comande</p>
        </div>
        <button onClick={load} disabled={refreshing} className="p-2 text-night/60 hover:text-night rounded-lg hover:bg-white">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-night/[0.06]">
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <ChefHat size={26} className="text-orange-400" />
          </div>
          <p className="font-bold text-night mb-1">Nessuna comanda in cucina</p>
          <p className="text-sm text-night/50">Aspettando che il cameriere invii le comande.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {orders.map((o) => {
            const isReady = o.status === "ready";
            const tavolo = o.tables?.table_number || "?";
            const zone = o.tables?.zone || "Sala";
            return (
              <div
                key={o.id}
                className={`bg-white rounded-2xl border-2 overflow-hidden ${
                  isReady ? "border-emerald-300 opacity-70" : "border-orange-300"
                }`}
              >
                <div className={`px-4 py-3 flex items-center justify-between ${
                  isReady ? "bg-emerald-50" : "bg-orange-50"
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                      isReady ? "bg-emerald-200 text-emerald-800" : "bg-orange-200 text-orange-800"
                    }`}>
                      {tavolo}
                    </div>
                    <div>
                      <p className="font-black text-night text-sm">Tavolo {tavolo}</p>
                      <p className="text-[10px] text-night/50">{zone} · {o.party_size} coperti</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-night/40 font-bold">{new Date(o.opened_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" })}</p>
                    {isReady && <span className="inline-flex items-center gap-1 bg-emerald-200 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase mt-1"><CheckCircle2 size={9} /> Pronta</span>}
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-[10px] font-black text-night/40 uppercase tracking-wider mb-2">Piatti</p>
                  <div className="space-y-1.5">
                    {(o.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-baseline gap-2 text-sm">
                        <span className="font-black text-orange-600 w-7 shrink-0">{item.qty}×</span>
                        <span className="font-bold text-night flex-1">{item.name}</span>
                      </div>
                    ))}
                  </div>

                  {!isReady ? (
                    <button
                      onClick={() => markReady(o.id)}
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-sm transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      Pronta
                    </button>
                  ) : (
                    <button
                      onClick={() => markSent(o.id)}
                      className="w-full mt-4 bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
                    >
                      <Clock size={14} />
                      Riprendi (non ancora pronta)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
