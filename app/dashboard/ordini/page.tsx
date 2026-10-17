"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/dashboard/PageHeader";
import { SkeletonTable } from "@/components/dashboard/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, RefreshCw, ShoppingBag, Clock, Truck, Store,
  ChefHat, Package, CheckCircle2, XCircle, MessageCircle,
  Lock, Unlock, Plus, Minus, Settings, AlertCircle, Calendar,
  ArrowRight, 
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

type SlotData = {
  slot: string;
  web_count: number;
  manual_count: number;
  total: number;
  capacity: number;
  available: boolean;
  is_blocked: boolean;
};

const ORDER_STATUS = {
  pending:    { key: "pending",    label: "Nuovi",           next: "confirmed", nextLabel: "Conferma",         icon: ShoppingBag,   color: "#EAB308", bg: "#FEF9C3", text: "#854D0E" },
  confirmed:  { key: "confirmed",  label: "Confermati",      next: "preparing", nextLabel: "In preparazione",  icon: CheckCircle2,  color: "#3B82F6", bg: "#DBEAFE", text: "#1E40AF" },
  preparing:  { key: "preparing",  label: "In preparazione", next: "ready",     nextLabel: "Pronto",           icon: ChefHat,       color: "#F97316", bg: "#FFEDD5", text: "#9A3412" },
  ready:      { key: "ready",      label: "Pronti",          next: "delivered", nextLabel: "Consegnato",       icon: Package,       color: "#22C55E", bg: "#DCFCE7", text: "#166534" },
  delivered:  { key: "delivered",  label: "Consegnati",      next: null,        nextLabel: null,               icon: CheckCircle2,  color: "#6B7280", bg: "#F3F4F6", text: "#374151" },
  cancelled:  { key: "cancelled",  label: "Annullati",       next: null,        nextLabel: null,               icon: XCircle,       color: "#EF4444", bg: "#FEE2E2", text: "#991B1B" },
};

const TAB_ORDER = ["pending", "confirmed", "preparing", "ready", "delivered"] as const;

export default function OrdiniPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<"live" | "capacity">("live");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatus, setActiveStatus] = useState<string>("pending");
  const [refreshing, setRefreshing] = useState(false);

  // Capacity
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);

  async function loadOrders() {
    setRefreshing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: link } = await supabase
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link) { router.push("/onboarding"); return; }

    const { data } = await supabase
      .from("orders")
      .select("*, customers(name, whatsapp_number)")
      .eq("tenant_id", link.tenant_id)
      .order("created_at", { ascending: false });

    setOrders((data as unknown as Order[]) || []);
    setLoading(false);
    setRefreshing(false);
  }

  async function loadSlots() {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/orders/slots-manage?date=${selectedDate}`);
      const data = await res.json();
      const today = new Date(selectedDate + "T12:00:00");
      const dayKey = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][today.getDay()];
      const hours = data.openingHours?.[dayKey];

      if (!hours || hours === "chiuso") { setSlots([]); setLoadingSlots(false); return; }

      const [start, end] = hours.split("-");
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);

      const generated: SlotData[] = [];
      let cur = new Date(today); cur.setHours(sh, sm, 0, 0);
      const endDate = new Date(today); endDate.setHours(eh, em, 0, 0);

      while (cur < endDate) {
        const slotStr = cur.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
        const override = data.overrides.find((o: any) => o.slot === slotStr);
        const webCount = data.webCounts[slotStr] || 0;
        const manualCount = override?.manual_orders_count || 0;
        const capacity = override?.capacity_override || data.defaultCapacity;
        const total = webCount + manualCount;
        generated.push({
          slot: slotStr, web_count: webCount, manual_count: manualCount,
          total, capacity, is_blocked: override?.is_blocked || false,
          available: !override?.is_blocked && total < capacity,
        });
        cur = new Date(cur.getTime() + 30 * 60000);
      }
      setSlots(generated);
    } catch (err) { console.error(err); }
    finally { setLoadingSlots(false); }
  }

  useEffect(() => { loadOrders(); }, []);
  useEffect(() => { if (tab === "capacity") loadSlots(); }, [tab, selectedDate]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    await loadOrders();
  };

  const saveSlot = async (slot: SlotData, patch: Partial<SlotData>) => {
    setSavingSlot(slot.slot);
    try {
      await fetch("/api/orders/slots-manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          slot: slot.slot,
          manual_orders_count: patch.manual_count ?? slot.manual_count,
          is_blocked: patch.is_blocked ?? slot.is_blocked,
          capacity_override: patch.capacity ?? slot.capacity,
        }),
      });
      await loadSlots();
    } finally { setSavingSlot(null); }
  };

  const counts = {
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    ready: orders.filter(o => o.status === "ready").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  const filtered = orders.filter(o => o.status === activeStatus);

  return (
    <div>
      <PageHeader
        title="Ordini"
        subtitle={counts.pending > 0 ? `${counts.pending} nuovi ordini da confermare` : "Tutto sotto controllo"}
        breadcrumb={[{ label: "Dashboard" }, { label: "Ordini" }]}
        actions={
          <button
            onClick={() => { loadOrders(); if (tab === "capacity") loadSlots(); }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 border border-night/[0.08] hover:border-night/20 bg-white text-night px-4 py-2.5 rounded-full text-xs font-semibold transition disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Aggiorna
          </button>
        }
      />

      {/* TABS LIVE / CAPACITY */}
      <div className="bg-white rounded-2xl p-1.5 border border-night/[0.06] flex gap-1 mb-6 max-w-md">
        <button
          onClick={() => setTab("live")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${tab === "live" ? "bg-night text-white" : "text-night/50"}`}
        >
          <ShoppingBag size={15} />
          Ordini live
          {counts.pending > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {counts.pending}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("capacity")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${tab === "capacity" ? "bg-night text-white" : "text-night/50"}`}
        >
          <Settings size={15} />
          Capacità
        </button>
      </div>

      {/* ═══════════ TAB LIVE ═══════════ */}
      {tab === "live" && (
        <>
          {loading ? (
            <SkeletonTable rows={4} />
          ) : (
            <>
              {/* Status tabs orizzontali */}
              <div className="scroll-x flex gap-2 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
                {TAB_ORDER.map((key) => {
                  const cfg = ORDER_STATUS[key];
                  const isActive = activeStatus === key;
                  const count = counts[key];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveStatus(key)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition shrink-0 border ${
                        isActive
                          ? "bg-night text-white border-night"
                          : "bg-white text-night/60 border-night/[0.06] hover:border-night/20"
                      }`}
                    >
                      <Icon size={14} style={{ color: isActive ? "#25D366" : cfg.color }} />
                      {cfg.label}
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${isActive ? "bg-white/20" : "bg-night/5"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Lista ordini */}
              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-night/[0.06] p-12 text-center">
                  <ShoppingBag className="text-night/20 mx-auto mb-3" size={40} />
                  <p className="text-sm font-semibold text-night/60">
                    Nessun ordine in questa sezione
                  </p>
                  <p className="text-xs text-night/40 mt-1">
                    Quando arrivano nuovi ordini li troverai qui
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filtered.map((order) => {
                      const cfg = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || ORDER_STATUS.pending;
                      const customerPhone = order.customers?.whatsapp_number?.replace(/\D/g, "") || "";
                      const scheduledTime = order.scheduled_for
                        ? new Date(order.scheduled_for).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
                        : null;

                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden hover:border-night/10 transition"
                        >
                          {/* Header ordine */}
                          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="font-mono text-[11px] bg-night/5 px-2 py-0.5 rounded font-bold text-night/70">
                                  {order.order_code}
                                </span>
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                                  style={{ backgroundColor: cfg.bg, color: cfg.text }}
                                >
                                  <cfg.icon size={10} /> {cfg.label.toUpperCase()}
                                </span>
                              </div>
                              <h3 className="font-bold text-night text-base leading-tight">
                                {order.customers?.name || "Cliente anonimo"}
                              </h3>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-2xl font-bold text-night tracking-tight">
                                €{Number(order.total).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Info orario/tipo */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 pb-3 text-xs text-night/50">
                            <span className="inline-flex items-center gap-1.5">
                              {order.order_type === "delivery" ? <Truck size={12} /> : <Store size={12} />}
                              <strong className="text-night/80">
                                {order.order_type === "delivery" ? "Domicilio" : "Asporto"}
                              </strong>
                            </span>
                            {scheduledTime && (
                              <span className="inline-flex items-center gap-1.5">
                                <Clock size={12} />
                                <strong className="text-night/80">{scheduledTime}</strong>
                              </span>
                            )}
                            {order.delivery_address && (
                              <span className="truncate">{order.delivery_address}</span>
                            )}
                          </div>

                          {/* Items */}
                          <div className="px-5 pb-4">
                            <div className="bg-cream rounded-xl p-3 space-y-1">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-night/80">
                                    <strong className="text-night">{item.qty}×</strong> {item.name}
                                  </span>
                                  <span className="text-night/60 font-mono text-xs">
                                    €{(item.qty * item.price).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                              {order.notes && (
                                <div className="pt-2 mt-2 border-t border-night/[0.06] text-xs text-orange-700 italic flex items-start gap-1.5">
                                  <AlertCircle size={11} className="shrink-0 mt-0.5" />
                                  {order.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Azioni */}
                          <div className="flex items-center justify-between gap-2 px-5 py-3 bg-cream/50 border-t border-night/[0.06]">
                            <div className="flex items-center gap-1">
                              {order.status !== "cancelled" && order.status !== "delivered" && (
                                <button
                                  onClick={() => updateStatus(order.id, "cancelled")}
                                  className="text-red-500 hover:bg-red-50 text-xs font-semibold px-3 py-2 rounded-lg transition"
                                >
                                  Annulla
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {customerPhone && (
                                <a
                                  href={`https://wa.me/${customerPhone}?text=Ciao!%20Riguardo%20all'ordine%20${order.order_code}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-waDark hover:bg-wa/10 text-xs font-semibold px-3 py-2 rounded-lg transition inline-flex items-center gap-1.5"
                                >
                                  <MessageCircle size={13} />
                                  WhatsApp
                                </a>
                              )}
                              {cfg.next && (
                                <button
                                  onClick={() => updateStatus(order.id, cfg.next!)}
                                  className="bg-night hover:bg-night/90 text-white text-xs font-bold px-4 py-2.5 rounded-full transition inline-flex items-center gap-1.5 active:scale-95"
                                >
                                  {cfg.nextLabel}
                                  <ArrowRight size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ═══════════ TAB CAPACITY ═══════════ */}
      {tab === "capacity" && (
        <div className="space-y-4">
          {/* Selettore data */}
          <div className="bg-white rounded-2xl border border-night/[0.06] p-4 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-night/40" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-cream border border-transparent rounded-xl px-3 py-2 text-sm font-semibold focus:bg-white focus:border-night/20 focus:outline-none transition"
              />
            </div>
            <p className="text-xs text-night/50 flex-1">
              Aggiungi ordini ricevuti al telefono o di persona per evitare sovraccarichi.
            </p>
          </div>

          {loadingSlots ? (
            <div className="bg-white rounded-2xl border border-night/[0.06] p-12 flex justify-center">
              <Loader2 className="animate-spin text-night/30" size={24} />
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-white rounded-2xl border border-night/[0.06] p-12 text-center">
              <AlertCircle className="text-night/20 mx-auto mb-2" size={32} />
              <p className="text-sm font-semibold text-night/60">Ristorante chiuso</p>
              <p className="text-xs text-night/40 mt-1">
                Controlla gli orari di apertura in impostazioni
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden">
              {/* Header legenda */}
              <div className="px-5 py-3 border-b border-night/[0.06] bg-cream/50 hidden md:grid grid-cols-[80px_1fr_120px_120px_180px] gap-4 text-[10px] font-bold text-night/40 uppercase tracking-wider">
                <span>Orario</span>
                <span>Occupazione</span>
                <span className="text-center">Web</span>
                <span className="text-center">Manuali</span>
                <span className="text-right">Azioni</span>
              </div>

              <div className="divide-y divide-night/[0.04]">
                {slots.map((slot) => {
                  const isFull = slot.total >= slot.capacity;
                  const percent = Math.min((slot.total / slot.capacity) * 100, 100);
                  const state = slot.is_blocked ? "blocked" : isFull ? "full" : "ok";

                  return (
                    <div
                      key={slot.slot}
                      className={`grid grid-cols-1 md:grid-cols-[80px_1fr_120px_120px_180px] gap-3 md:gap-4 px-5 py-3 items-center transition ${
                        state === "blocked" ? "bg-red-50/50" : state === "full" ? "bg-yellow-50/50" : ""
                      }`}
                    >
                      {/* Orario */}
                      <div className={`font-mono font-bold text-lg ${state === "blocked" ? "text-red-400 line-through" : "text-night"}`}>
                        {slot.slot}
                      </div>

                      {/* Barra occupazione */}
                      <div className="flex flex-col gap-1.5">
                        <div className="h-2 bg-cream rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              state === "blocked" ? "bg-red-400" :
                              state === "full" ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-night/50">
                          {slot.total} di {slot.capacity} posti
                        </p>
                      </div>

                      {/* Web count */}
                      <div className="md:text-center text-xs">
                        <span className="md:hidden font-semibold text-night/50">Web: </span>
                        <strong className="text-night">{slot.web_count}</strong>
                      </div>

                      {/* Manual count */}
                      <div className="md:text-center text-xs">
                        <span className="md:hidden font-semibold text-night/50">Manuali: </span>
                        <strong className="text-night">{slot.manual_count}</strong>
                      </div>

                      {/* Azioni */}
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => saveSlot(slot, { manual_count: Math.max(0, slot.manual_count - 1) })}
                          disabled={slot.manual_count === 0 || savingSlot === slot.slot}
                          className="w-8 h-8 rounded-lg bg-cream hover:bg-night/10 disabled:opacity-30 flex items-center justify-center transition"
                          title="Rimuovi ordine manuale"
                        >
                          <Minus size={14} />
                        </button>
                        <button
                          onClick={() => saveSlot(slot, { manual_count: slot.manual_count + 1 })}
                          disabled={savingSlot === slot.slot}
                          className="w-8 h-8 rounded-lg bg-cream hover:bg-night/10 flex items-center justify-center transition"
                          title="Aggiungi ordine manuale"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => saveSlot(slot, { is_blocked: !slot.is_blocked })}
                          disabled={savingSlot === slot.slot}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                            slot.is_blocked
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-cream hover:bg-night/10"
                          }`}
                          title={slot.is_blocked ? "Sblocca" : "Blocca slot"}
                        >
                          {slot.is_blocked ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

