"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShoppingBag, Clock, Store, Truck, ChefHat, Package, CheckCircle2, RefreshCw } from "lucide-react";

type Order = {
  id: string;
  order_code: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  order_type: "takeaway" | "delivery";
  status: string;
  scheduled_for: string | null;
  created_at: string;
  customers: { name: string | null; whatsapp_number: string | null } | null;
};

const STATUS_CONFIG: Record<string, { label: string; accent: string; bg: string; text: string; next?: { to: string; label: string } }> = {
  pending:   { label: "Nuovo",     accent: "#EAB308", bg: "#FEF9C3", text: "#854D0E", next: { to: "confirmed", label: "Accetta" } },
  confirmed: { label: "Accettato", accent: "#3B82F6", bg: "#DBEAFE", text: "#1E40AF", next: { to: "preparing", label: "In cucina" } },
  preparing: { label: "In cucina", accent: "#F97316", bg: "#FFEDD5", text: "#9A3412", next: { to: "ready",     label: "Pronto" } },
  ready:     { label: "Pronto",    accent: "#22C55E", bg: "#DCFCE7", text: "#166534", next: { to: "delivered", label: "Consegnato" } },
  delivered: { label: "Consegnato", accent: "#6B7280", bg: "#F3F4F6", text: "#374151" },
  cancelled: { label: "Annullato", accent: "#EF4444", bg: "#FEE2E2", text: "#991B1B" },
};

const FILTER_TABS = [
  { key: "active", label: "Attivi" },
  { key: "pending", label: "Nuovi" },
  { key: "confirmed", label: "Accettati" },
  { key: "preparing", label: "In cucina" },
  { key: "ready", label: "Pronti" },
];

type Props = { tenantId: string; };

export default function OrdersView({ tenantId }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("active");

  async function load() {
    setRefreshing(true);
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
    const dayStart = new Date(todayStr + "T00:00:00").toISOString();

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("created_at", dayStart)
      .order("created_at", { ascending: false });

    if (error) { console.error(error); setRefreshing(false); setLoading(false); return; }

    const ids = (data || []).map((o: any) => o.customer_id).filter(Boolean);
    const custMap: Record<string, any> = {};
    if (ids.length > 0) {
      const { data: custs } = await supabase.from("customers").select("id, name, whatsapp_number").in("id", ids);
      (custs || []).forEach(c => { custMap[c.id] = { name: c.name, whatsapp_number: c.whatsapp_number }; });
    }

    setOrders(((data || []) as any[]).map(o => ({
      ...o,
      customers: o.customer_id ? custMap[o.customer_id] : null,
    })));
    setRefreshing(false);
    setLoading(false);
  }

  useEffect(() => { load(); }, [tenantId]);

  async function advance(id: string, nextStatus: string) {
    await supabase.from("orders").update({ status: nextStatus }).eq("id", id);
    load();
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin text-night/30" size={24} /></div>;
  }

  const filtered = orders.filter(o => {
    if (filter === "active") return ["pending", "confirmed", "preparing", "ready"].includes(o.status);
    return o.status === filter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-night">Ordini · Oggi</h2>
          <p className="text-xs text-night/50">{filtered.length} ordin{filtered.length === 1 ? "e" : "i"}</p>
        </div>
        <button onClick={load} disabled={refreshing} className="inline-flex items-center gap-1.5 text-xs font-bold text-night/60 hover:text-night transition">
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Aggiorna
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {FILTER_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              filter === t.key ? "bg-night text-white" : "bg-white text-night/60 border border-night/[0.08] hover:text-night"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-night/[0.06]">
          <div className="w-14 h-14 bg-cream rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingBag size={26} className="text-night/30" />
          </div>
          <p className="font-bold text-night mb-1">Nessun ordine</p>
          <p className="text-sm text-night/50">Non ci sono ordini in questa categoria oggi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const config = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
            const time = new Date(o.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
            const itemCount = (o.items || []).reduce((s, i) => s + i.qty, 0);
            const TypeIcon = o.order_type === "delivery" ? Truck : Store;
            return (
              <div key={o.id} className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden">
                <div className="h-1" style={{ backgroundColor: config.accent }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: config.accent + "15" }}>
                        <ShoppingBag size={18} style={{ color: config.accent }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-night text-sm truncate">{o.customers?.name || "Cliente"} · €{Number(o.total).toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase" style={{ backgroundColor: config.bg, color: config.text }}>{config.label}</span>
                          <span className="text-[10px] font-bold text-night/60 flex items-center gap-0.5"><TypeIcon size={10} /> {o.order_type === "delivery" ? "Domicilio" : "Asporto"}</span>
                          <span className="text-[10px] font-bold text-night/60 flex items-center gap-0.5"><Clock size={10} /> {time}</span>
                          <span className="text-[10px] font-bold text-night/60">{itemCount} articol{itemCount === 1 ? "o" : "i"}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-night/40 bg-night/5 px-2 py-1 rounded">{o.order_code}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-night/[0.04]">
                    {config.next ? (
                      <button onClick={() => advance(o.id, config.next!.to)} className="w-full text-white text-xs font-black py-2 rounded-lg inline-flex items-center justify-center gap-1" style={{ backgroundColor: config.accent }}>
                        {config.next.label} →
                      </button>
                    ) : (
                      <span className="block text-center text-[10px] font-black text-night/40 uppercase tracking-widest">— {config.label} —</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
