"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ShoppingBag, Search, RefreshCw, MessageCircle } from "lucide-react";

type Order = {
  id: string;
  order_code: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  order_type: string;
  status: string;
  created_at: string;
  tenants: { business_name: string; slug: string } | null;
  customers: { name: string | null; whatsapp_number: string } | null;
};

export default function AdminOrdiniPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tutti");

  async function load() {
    const { data } = await supabase
      .from("orders")
      .select("*, tenants(business_name, slug), customers(name, whatsapp_number)")
      .order("created_at", { ascending: false })
      .limit(200);
    setOrders((data as unknown as Order[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = orders.filter((o) => {
    if (filter !== "tutti" && o.status !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.order_code.toLowerCase().includes(q) ||
      (o.tenants?.business_name || "").toLowerCase().includes(q) ||
      (o.customers?.name || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Ordini globali</h1>
          <p className="text-white/60 text-sm">{orders.length} ordini totali</p>
        </div>
        <button onClick={load} className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 transition">
          <RefreshCw size={16} />
          Aggiorna
        </button>
      </div>

      <div className="scroll-x flex gap-2 mb-4 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {["tutti", "pending", "confirmed", "preparing", "ready", "delivered"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
              filter === f ? "bg-wa text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {f === "tutti" ? "Tutti" : f}
          </button>
        ))}
      </div>

      <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Cerca per codice, attività o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-wa placeholder-white/40"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-lg font-bold mb-2">Nessun ordine</h2>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const phone = (o.customers?.whatsapp_number || "").replace(/\D/g, "");
            return (
              <div key={o.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded font-bold">
                        {o.order_code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 uppercase">
                        {o.status}
                      </span>
                      <span className="text-xs text-white/50">
                        {new Date(o.created_at).toLocaleString("it-IT", {
                          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="font-semibold text-sm">
                      {o.tenants?.business_name} → {o.customers?.name || "Cliente"}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">€{Number(o.total).toFixed(2)}</p>
                    <p className="text-[10px] text-white/50 uppercase">{o.order_type}</p>
                    {phone && (
                      <a
                        href={`https://wa.me/${phone}?text=Ciao!%20Riguardo%20all'ordine%20${o.order_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-wa text-xs font-semibold inline-flex items-center gap-1 mt-1"
                      >
                        <MessageCircle size={12} />
                        WhatsApp
                      </a>
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
