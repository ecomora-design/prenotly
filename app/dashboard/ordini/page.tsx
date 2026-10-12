"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, ShoppingBag, Clock, MapPin, CheckCircle2,
  XCircle, ChefHat, Package, Truck, RefreshCw, MessageCircle, Phone
} from "lucide-react";

type Order = {
  id: string;
  order_code: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  order_type: "takeaway" | "delivery";
  delivery_address: string | null;
  status: string;
  scheduled_for: string | null;
  notes: string | null;
  created_at: string;
  customers: { name: string | null; whatsapp_number: string } | null;
};

const STATUS_CONFIG = {
  pending: { label: "Nuovo", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  confirmed: { label: "Confermato", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  preparing: { label: "In preparazione", color: "bg-orange-50 text-orange-700 border-orange-200", icon: ChefHat },
  ready: { label: "Pronto", color: "bg-green-50 text-green-700 border-green-200", icon: Package },
  delivered: { label: "Consegnato", color: "bg-gray-100 text-gray-600 border-gray-200", icon: CheckCircle2 },
  cancelled: { label: "Annullato", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

export default function OrdiniPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("tutti");
  const [tenantId, setTenantId] = useState<string | null>(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: link } = await supabase
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link) { router.push("/onboarding"); return; }
    setTenantId(link.tenant_id);

    const { data } = await supabase
      .from("orders")
      .select("*, customers(name, whatsapp_number)")
      .eq("tenant_id", link.tenant_id)
      .order("created_at", { ascending: false });

    setOrders((data as unknown as Order[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    await load();
  };

  const filtered = filter === "tutti" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">Ordini</h1>
          <p className="text-gray-500 text-sm">Tutti gli ordini ricevuti</p>
        </div>
        <button onClick={load} className="bg-white border border-gray-200 hover:border-night text-night px-4 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 transition">
          <RefreshCw size={16} />
          Aggiorna
        </button>
      </div>

      {/* Filtri */}
      <div className="scroll-x flex gap-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {["tutti", "pending", "confirmed", "preparing", "ready", "delivered"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
              filter === f ? "bg-night text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f === "tutti" ? "Tutti" : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label || f}
            {f !== "tutti" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({orders.filter((o) => o.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-lg font-bold text-night mb-2">Nessun ordine</h2>
          <p className="text-gray-500 text-sm">
            {filter === "tutti" ? "Quando riceverai un ordine apparirà qui" : "Nessun ordine in questo stato"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const config = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            const customerPhone = order.customers?.whatsapp_number?.replace(/\D/g, "") || "";
            return (
              <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs bg-soft px-2 py-0.5 rounded font-bold text-gray-600">
                        {order.order_code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.color} inline-flex items-center gap-1`}>
                        <StatusIcon size={10} />
                        {config.label.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-bold text-night">
                      {order.customers?.name || "Cliente anonimo"}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                      <span className="inline-flex items-center gap-1">
                        {order.order_type === "delivery" ? <Truck size={11} /> : <ShoppingBag size={11} />}
                        {order.order_type === "delivery" ? "Domicilio" : "Asporto"}
                      </span>
                      {order.scheduled_for && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(order.scheduled_for).toLocaleString("it-IT", {
                            day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Totale</p>
                    <p className="text-2xl font-bold text-night">€{Number(order.total).toFixed(2)}</p>
                  </div>
                </div>

                {/* Piatti */}
                <div className="bg-soft rounded-xl p-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ordine</p>
                  <ul className="space-y-1">
                    {order.items.map((item, i) => (
                      <li key={i} className="text-sm flex justify-between text-gray-700">
                        <span>{item.qty}x {item.name}</span>
                        <span className="font-semibold">€{(item.qty * item.price).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Indirizzo / Note */}
                {order.delivery_address && (
                  <p className="text-xs text-gray-600 mb-2 flex items-start gap-2">
                    <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
                    <strong>Consegna a:</strong> {order.delivery_address}
                  </p>
                )}
                {order.notes && (
                  <p className="text-xs text-gray-600 mb-3 italic">
                    Note: {order.notes}
                  </p>
                )}

                {/* Azioni */}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-2 flex-wrap">
                    {order.status === "pending" && (
                      <button onClick={() => updateStatus(order.id, "confirmed")} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition">
                        Conferma
                      </button>
                    )}
                    {order.status === "confirmed" && (
                      <button onClick={() => updateStatus(order.id, "preparing")} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-full transition">
                        In preparazione
                      </button>
                    )}
                    {order.status === "preparing" && (
                      <button onClick={() => updateStatus(order.id, "ready")} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-full transition">
                        Pronto
                      </button>
                    )}
                    {order.status === "ready" && (
                      <button onClick={() => updateStatus(order.id, "delivered")} className="bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-full transition">
                        Consegnato
                      </button>
                    )}
                    {order.status !== "cancelled" && order.status !== "delivered" && (
                      <button onClick={() => updateStatus(order.id, "cancelled")} className="text-red-600 hover:bg-red-50 text-xs font-semibold px-4 py-2 rounded-full transition">
                        Annulla
                      </button>
                    )}
                  </div>

                  {customerPhone && (
                    <a
                      href={`https://wa.me/${customerPhone}?text=Ciao!%20Riguardo%20al%20tuo%20ordine%20${order.order_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wa hover:text-waDark text-xs font-semibold inline-flex items-center gap-1.5 transition"
                    >
                      <MessageCircle size={14} />
                      Contatta cliente
                    </a>
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
