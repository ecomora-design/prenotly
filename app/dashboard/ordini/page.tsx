"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/dashboard/PageHeader";
import { SkeletonTable } from "@/components/dashboard/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, RefreshCw, ShoppingBag, Clock, Truck, Store,
  ChefHat, Package, CheckCircle2, XCircle, MessageCircle,
  Lock, Unlock, Plus, Minus, Settings, AlertCircle, Calendar,
  ArrowRight, Send 
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
  customer_id: string | null;
  customers: { name: string | null; whatsapp_number: string | null } | null;
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
  confirmed:  { key: "confirmed",  label: "Confermati",      next: "preparing", nextLabel: "Prepara",  icon: CheckCircle2,  color: "#3B82F6", bg: "#DBEAFE", text: "#1E40AF" },
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

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);

  const loadOrders = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    else setRefreshing(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: link } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
    if (!link) { router.push("/onboarding"); return; }

    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .eq("tenant_id", link.tenant_id)
      .order("created_at", { ascending: false });

    const rawOrders = (ordersData as unknown as Order[]) || [];

    const { data: customersData } = await supabase
      .from("customers")
      .select("id, name, whatsapp_number")
      .eq("tenant_id", link.tenant_id);

    const customersMap: Record<string, { name: string; whatsapp_number: string | null }> = {};
    (customersData || []).forEach(c => {
      if (c.id) customersMap[c.id] = { name: c.name || "Cliente", whatsapp_number: c.whatsapp_number || null };
    });

    const enhancedOrders = rawOrders.map(o => {
      let customerInfo = null;
      if (o.customer_id && customersMap[o.customer_id]) {
        customerInfo = customersMap[o.customer_id];
      }
      return { ...o, customers: customerInfo };
    });

    setOrders(enhancedOrders);
    setLoading(false);
    setRefreshing(false);
  }, [supabase, router]);

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

  useEffect(() => {
    loadOrders(true);
    const interval = setInterval(() => { loadOrders(false); }, 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  useEffect(() => { if (tab === "capacity") loadSlots(); }, [tab, selectedDate]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    await loadOrders(false);
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

  
  const getWhatsAppMessage = (order: Order) => {
    const name = order.customers?.name?.split(' ')[0] || 'cliente';
    if (order.status === 'preparing') return `Ciao ${name}, il tuo ordine ${order.order_code} è in preparazione! 🍕`;
    if (order.status === 'ready') return `Ciao ${name}, il tuo ordine ${order.order_code} è pronto! 🛍️`;
    if (order.status === 'delivered') return `Ciao ${name}, l'ordine ${order.order_code} è stato consegnato. Buon appetito! 😋`;
    return `Ciao ${name}, abbiamo ricevuto il tuo ordine ${order.order_code}!`;
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <PageHeader
        title="Ordini"
        subtitle={counts.pending > 0 ? `${counts.pending} nuovi ordini da confermare` : "Tutto sotto controllo"}
        breadcrumb={[{ label: "Dashboard" }, { label: "Ordini" }]}
        actions={
          <button
            onClick={() => { loadOrders(false); if (tab === "capacity") loadSlots(); }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 border border-night/[0.08] hover:border-night/20 bg-white text-night px-4 py-2.5 rounded-full text-xs font-semibold transition disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Aggiorna
          </button>
        }
      />

      {/* TABS (Live / Capacità) - Larghezza piena su mobile, max su PC */}
      <div className="bg-white rounded-2xl p-1.5 border border-night/[0.06] flex gap-1 mb-6 w-full max-w-lg">
        <button
          onClick={() => setTab("live")}
          className={`flex-1 py-3 sm:py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${tab === "live" ? "bg-night text-white shadow-md" : "text-night/50 hover:text-night"}`}
        >
          <ShoppingBag size={16} />
          Ordini live
          {counts.pending > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {counts.pending}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("capacity")}
          className={`flex-1 py-3 sm:py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${tab === "capacity" ? "bg-night text-white shadow-md" : "text-night/50 hover:text-night"}`}
        >
          <Settings size={16} />
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
              {/* Status tabs orizzontali - Scroll fluido su mobile */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x hide-scrollbar">
                {TAB_ORDER.map((key) => {
                  const cfg = ORDER_STATUS[key];
                  const isActive = activeStatus === key;
                  const count = counts[key];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveStatus(key)}
                      className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold whitespace-nowrap transition shrink-0 border snap-start ${
                        isActive
                          ? "bg-night text-white border-night shadow-lg"
                          : "bg-white text-night/60 border-night/[0.06] hover:border-night/20"
                      }`}
                    >
                      <Icon size={18} style={{ color: isActive ? "#25D366" : cfg.color }} />
                      {cfg.label}
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isActive ? "bg-white/20" : "bg-night/5"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-night/[0.06] p-12 sm:p-20 text-center">
                  <ShoppingBag className="text-night/20 mx-auto mb-4" size={48} />
                  <p className="text-base font-semibold text-night/60">Nessun ordine in questa sezione</p>
                  <p className="text-sm text-night/40 mt-2">Quando arrivano nuovi ordini li troverai qui.</p>
                </div>
              ) : (
                /* GRIGLIA: 1 colonna mobile, 2 tablet, 3 desktop */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  <AnimatePresence>
                    {filtered.map((order) => {
                      const cfg = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || ORDER_STATUS.pending;
                      let customerPhone = order.customers?.whatsapp_number?.replace(/\D/g, "") || "";
                      if (customerPhone && !customerPhone.startsWith("39")) {
                        customerPhone = "39" + customerPhone;
                      }
                      const scheduledTime = order.scheduled_for
                        ? order.scheduled_for.substring(11, 16)
                        : null;

                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden hover:border-night/20 transition flex flex-col shadow-sm"
                        >
                          {/* Header Card */}
                          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="font-mono text-[11px] bg-night/5 px-2 py-0.5 rounded font-bold text-night/70">
                                  {order.order_code}
                                </span>
                                <span
                                  className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 uppercase tracking-wider"
                                  style={{ backgroundColor: cfg.bg, color: cfg.text }}
                                >
                                  <cfg.icon size={12} /> {cfg.label}
                                </span>
                              </div>
                              <h3 className="font-bold text-night text-lg sm:text-xl leading-tight truncate">
                                {order.customers?.name || "Cliente anonimo"}
                              </h3>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-2xl sm:text-3xl font-bold text-night tracking-tight">
                                €{Number(order.total).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Info pill */}
                          <div className="flex flex-wrap gap-2 px-5 pb-4 text-sm text-night/70">
                            <span className="inline-flex items-center gap-2 bg-cream px-3 py-1.5 rounded-lg border border-night/[0.04]">
                              {order.order_type === "delivery" ? <Truck size={16} /> : <Store size={16} />}
                              <strong className="text-night/90">
                                {order.order_type === "delivery" ? "Domicilio" : "Asporto"}
                              </strong>
                            </span>
                            {scheduledTime && (
                              <span className="inline-flex items-center gap-2 bg-cream px-3 py-1.5 rounded-lg border border-night/[0.04]">
                                <Clock size={16} />
                                <strong className="text-night/90">{scheduledTime}</strong>
                              </span>
                            )}
                          </div>

                          {/* Items */}
                          <div className="px-5 pb-4 flex-1">
                            <div className="bg-cream/50 rounded-xl p-4 space-y-2 border border-night/[0.02]">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-base items-start">
                                  <span className="text-night/90 pr-2">
                                    <strong className="text-night text-lg">{item.qty}×</strong> {item.name}
                                  </span>
                                  <span className="text-night/60 font-mono text-sm mt-0.5">
                                    €{(item.qty * item.price).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                              {order.notes && (
                                <div className="pt-3 mt-3 border-t border-night/[0.06] text-sm text-orange-700 font-medium flex items-start gap-2">
                                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                  <span className="bg-orange-100 px-2 py-1 rounded-md">{order.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Azioni */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-4 py-4 bg-cream/80 border-t border-night/[0.06]">
                            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                              {order.status !== "cancelled" && order.status !== "delivered" && (
                                <button
                                  onClick={() => updateStatus(order.id, "cancelled")}
                                  className="text-red-500 hover:bg-red-50 text-xs sm:text-sm font-bold px-3 sm:px-4 py-2.5 rounded-lg transition"
                                >
                                  Annulla
                                </button>
                              )}
                              {customerPhone && (
                                <a
                                  href={`https://wa.me/${customerPhone}?text=${encodeURIComponent(getWhatsAppMessage(order))}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Avvisa il cliente su WhatsApp"
                                  className="text-white bg-[#25D366] hover:bg-[#20ba5a] text-xs sm:text-sm font-bold px-4 py-2.5 rounded-lg transition inline-flex items-center gap-2 shrink-0 shadow-sm active:scale-95"
                                >
                                  <MessageCircle size={20} />
                                  Avvisa
                                </a>
                              )}
                            </div>
                            
                            {cfg.next && (
                              <button
                                onClick={() => updateStatus(order.id, cfg.next!)}
                                className="w-full sm:w-auto shrink-0 bg-night hover:bg-night/90 text-white text-sm sm:text-base font-bold px-4 sm:px-6 py-3.5 rounded-xl transition inline-flex items-center justify-center gap-2 active:scale-95 shadow-md"
                              >
                                {cfg.nextLabel}
                                <ArrowRight size={20} />
                              </button>
                            )}
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
          <div className="bg-white rounded-2xl border border-night/[0.06] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="bg-cream p-2.5 rounded-xl">
                <Calendar size={24} className="text-night/60" />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-cream border border-transparent rounded-xl px-4 py-3 text-base font-bold focus:bg-white focus:border-night/20 focus:outline-none transition w-full sm:w-auto"
              />
            </div>
            <p className="text-sm text-night/60 flex-1 sm:ml-4">
              Gestisci la disponibilità. Aggiungi ordini manuali per evitare sovraccarichi.
            </p>
          </div>

          {loadingSlots ? (
            <div className="bg-white rounded-2xl border border-night/[0.06] p-12 flex justify-center">
              <Loader2 className="animate-spin text-night/30" size={32} />
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-white rounded-2xl border border-night/[0.06] p-12 text-center">
              <AlertCircle className="text-night/20 mx-auto mb-3" size={40} />
              <p className="text-base font-semibold text-night/60">Ristorante chiuso</p>
              <p className="text-sm text-night/40 mt-1">Controlla gli orari in impostazioni.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden shadow-sm">
              {/* Header tabella (Solo Desktop) */}
              <div className="px-6 py-4 border-b border-night/[0.06] bg-cream/50 hidden lg:grid grid-cols-[100px_1fr_100px_100px_200px] gap-6 text-xs font-bold text-night/50 uppercase tracking-wider">
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
                      className={`grid grid-cols-1 lg:grid-cols-[100px_1fr_100px_100px_200px] gap-3 lg:gap-6 px-5 py-5 items-center transition ${
                        state === "blocked" ? "bg-red-50/60" : state === "full" ? "bg-yellow-50/60" : ""
                      }`}
                    >
                      {/* Orario e Contatori Mobile */}
                      <div className="flex justify-between items-center lg:block">
                        <div className={`font-mono font-bold text-2xl lg:text-xl ${state === "blocked" ? "text-red-400 line-through" : "text-night"}`}>
                          {slot.slot}
                        </div>
                        
                        {/* Contatori visibili solo su Mobile/Tablet */}
                        <div className="lg:hidden flex items-center gap-3 text-sm">
                           <span className="bg-white px-3 py-1.5 rounded-lg border border-night/10 shadow-sm">
                             Web: <strong className="text-night text-base">{slot.web_count}</strong>
                           </span>
                           <span className="bg-white px-3 py-1.5 rounded-lg border border-night/10 shadow-sm">
                             Manuali: <strong className="text-night text-base">{slot.manual_count}</strong>
                           </span>
                        </div>
                      </div>

                      {/* Barra occupazione */}
                      <div className="flex flex-col gap-2 w-full mt-2 lg:mt-0">
                        <div className="h-3 lg:h-2.5 bg-cream rounded-full overflow-hidden w-full shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all ${
                              state === "blocked" ? "bg-red-500" :
                              state === "full" ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-xs font-semibold text-night/60 text-right lg:text-left">
                          {slot.total} di {slot.capacity} posti occupati
                        </p>
                      </div>

                      {/* Contatori Desktop */}
                      <div className="hidden lg:block text-center text-base font-bold text-night">
                        {slot.web_count}
                      </div>
                      <div className="hidden lg:block text-center text-base font-bold text-night">
                        {slot.manual_count}
                      </div>

                      {/* Azioni (Bottoni grandi per Tablet/Mobile) */}
                      <div className="flex items-center justify-end gap-3 mt-3 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-0 border-night/[0.06]">
                        <button
                          onClick={() => saveSlot(slot, { manual_count: Math.max(0, slot.manual_count - 1) })}
                          disabled={slot.manual_count === 0 || savingSlot === slot.slot}
                          className="w-14 h-14 lg:w-10 lg:h-10 rounded-2xl lg:rounded-xl bg-cream hover:bg-night/10 disabled:opacity-30 flex items-center justify-center transition active:scale-95 border border-night/[0.05] shadow-sm"
                        >
                          <Minus size={24} className="lg:w-5 lg:h-5" />
                        </button>
                        <button
                          onClick={() => saveSlot(slot, { manual_count: slot.manual_count + 1 })}
                          disabled={savingSlot === slot.slot}
                          className="w-14 h-14 lg:w-10 lg:h-10 rounded-2xl lg:rounded-xl bg-cream hover:bg-night/10 flex items-center justify-center transition active:scale-95 border border-night/[0.05] shadow-sm"
                        >
                          <Plus size={24} className="lg:w-5 lg:h-5" />
                        </button>
                        <div className="w-px h-10 bg-night/10 mx-1"></div>
                        <button
                          onClick={() => saveSlot(slot, { is_blocked: !slot.is_blocked })}
                          disabled={savingSlot === slot.slot}
                          className={`w-14 h-14 lg:w-10 lg:h-10 rounded-2xl lg:rounded-xl flex items-center justify-center transition active:scale-95 border border-night/[0.05] shadow-sm ${
                            slot.is_blocked
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-cream hover:bg-night/10 text-night/70"
                          }`}
                        >
                          {slot.is_blocked ? <Unlock size={24} className="lg:w-5 lg:h-5" /> : <Lock size={24} className="lg:w-5 lg:h-5" />}
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
