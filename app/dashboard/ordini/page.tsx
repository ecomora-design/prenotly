"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NotificationCenter from "@/components/NotificationCenter";
import ManualOrderModal from "@/components/ManualOrderModal";
import ReportModal from "@/components/ReportModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, RefreshCw, ShoppingBag, Clock, Truck, Store,
  ChefHat, Package, CheckCircle2, XCircle, MessageCircle,
  Lock, Unlock, Plus, Minus, Settings, AlertCircle, Calendar,
  ArrowRight, Wallet, TrendingUp, ReceiptText, Activity, Zap, UserPlus, FileText,
  ArrowUpRight, Utensils, MoreHorizontal
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
  pending:    { key: "pending",    label: "Nuovi",           next: "confirmed", nextLabel: "Accetta",         icon: Zap,           color: "#EAB308", bg: "#FEF9C3", text: "#854D0E", accent: "#EAB308" },
  confirmed:  { key: "confirmed",  label: "Accettati",       next: "preparing", nextLabel: "Prepara",         icon: CheckCircle2,  color: "#3B82F6", bg: "#DBEAFE", text: "#1E40AF", accent: "#3B82F6" },
  preparing:  { key: "preparing",  label: "In Cucina",       next: "ready",     nextLabel: "Pronto",          icon: ChefHat,       color: "#F97316", bg: "#FFEDD5", text: "#9A3412", accent: "#F97316" },
  ready:      { key: "ready",      label: "Pronti",          next: "delivered", nextLabel: "Consegnato",      icon: Package,       color: "#22C55E", bg: "#DCFCE7", text: "#166534", accent: "#22C55E" },
  delivered:  { key: "delivered",  label: "Consegnati",      next: null,        nextLabel: null,              icon: CheckCircle2,  color: "#6B7280", bg: "#F3F4F6", text: "#374151", accent: "#6B7280" },
  cancelled:  { key: "cancelled",  label: "Annullati",       next: null,        nextLabel: null,              icon: XCircle,       color: "#EF4444", bg: "#FEE2E2", text: "#991B1B", accent: "#EF4444" },
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
  const [tenantIdForNotif, setTenantIdForNotif] = useState<string>("");
  const [showManualModal, setShowManualModal] = useState(false);
  const [reportType, setReportType] = useState<"today" | "total" | null>(null);

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

    setTenantIdForNotif(link.tenant_id);

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
      const safeOverrides = data?.overrides || [];
      const safeWebCounts = data?.webCounts || {};
      const safeDefaultCapacity = data?.defaultCapacity || 5;

      const today = new Date(selectedDate + "T12:00:00");
      const [start, end] = ["12:00", "23:00"];
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);

      const generated: SlotData[] = [];
      let cur = new Date(today); cur.setHours(sh, sm, 0, 0);
      const endDate = new Date(today); endDate.setHours(eh, em, 0, 0);

      while (cur < endDate) {
        const slotStr = cur.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
        const override = safeOverrides.find((o: any) => o.slot === slotStr);
        const webCount = safeWebCounts[slotStr] || 0;
        const manualCount = override?.manual_orders_count || 0;
        const capacity = override?.capacity_override || safeDefaultCapacity;
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

  const getAppMessage = (order: Order) => {
    const name = order.customers?.name?.split(' ')[0] || 'cliente';
    if (order.status === 'preparing') return `Ciao ${name}, il tuo ordine ${order.order_code} è in preparazione! 🍕`;
    if (order.status === 'ready') return `Ciao ${name}, il tuo ordine ${order.order_code} è pronto! 🛍️`;
    if (order.status === 'delivered') return `Ciao ${name}, l'ordine ${order.order_code} è stato consegnato. Buon appetito! 😋`;
    return `Ciao ${name}, abbiamo ricevuto il tuo ordine ${order.order_code}!`;
  };

  // ── CALCOLO INCASSI (con fuso orario italiano) ──
  // Data di oggi in formato YYYY-MM-DD (fuso Italia)
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
  
  // Inizio e fine giornata italiana convertiti in UTC per il confronto
  const now = new Date();
  const todayStart = new Date(todayStr + "T00:00:00+02:00");
  const todayEnd = new Date(todayStr + "T23:59:59+02:00");

  const todayOrders = orders.filter(o => {
    if (!o.created_at) return false;
    const created = new Date(o.created_at);
    return created >= todayStart && created <= todayEnd;
  });

  // Considera "consegnati" anche eventuali "completed" per compatibilità
  const isDelivered = (s: string) => s === "delivered" || s === "completed";
  
  const todayDelivered = todayOrders.filter(o => isDelivered(o.status));
  const todayRevenue = todayDelivered.reduce((sum, o) => sum + Number(o.total || 0), 0);
  
  const allDelivered = orders.filter(o => isDelivered(o.status));
  const totalRevenue = allDelivered.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const averageTicket = allDelivered.length > 0 ? (totalRevenue / allDelivered.length) : 0;

  // Debug in console per capire i numeri
  console.log("[KPI Debug]", {
    oggi: todayStr,
    ordiniOggi: todayOrders.length,
    consegnatiOggi: todayDelivered.length,
    incassoOggi: todayRevenue,
    ordiniTotali: orders.length,
    consegnatiTotali: allDelivered.length,
    incassoTotale: totalRevenue,
  });

  const reportOrders = reportType === "today" ? todayDelivered : reportType === "total" ? allDelivered : [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">

      {/* HEADER */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-3">
              <Activity size={12} /> Live · Aggiornamento automatico
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-night tracking-tight">Ordini</h1>
            <p className="text-night/50 text-sm mt-1">
              {counts.pending > 0
                ? `${counts.pending} nuov${counts.pending === 1 ? 'o ordine' : 'i ordini'} da accettare`
                : "Tutto sotto controllo. Nessun ordine in attesa."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tenantIdForNotif && <NotificationCenter tenantId={tenantIdForNotif} brandColor="#25D366" />}
            <button
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-4 py-2.5 rounded-full text-xs font-bold transition shadow-md active:scale-95"
            >
              <UserPlus size={14} />
              Nuovo Ordine
            </button>
            <button
              onClick={() => { loadOrders(false); if (tab === "capacity") loadSlots(); }}
              disabled={refreshing}
              className="inline-flex items-center gap-2 border border-night/[0.08] hover:border-night/20 bg-white text-night px-4 py-2.5 rounded-full text-xs font-bold transition disabled:opacity-50 shadow-sm"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Aggiorna
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Incasso Oggi", value: `€${todayRevenue.toFixed(2)}`, icon: Wallet, color: "#10B981", hint: `${todayDelivered.length} consegnati` },
            { label: "Ordini Oggi", value: todayOrders.length, icon: ShoppingBag, color: "#3B82F6", hint: `${counts.pending} da accettare` },
            { label: "Incasso Totale", value: `€${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "#8B5CF6", hint: `${allDelivered.length} totali` },
            { label: "Ticket Medio", value: `€${averageTicket.toFixed(2)}`, icon: ReceiptText, color: "#F97316", hint: "Media ordine" },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => { if (i === 0) setReportType("today"); if (i === 2) setReportType("total"); }}
              className={`bg-white rounded-2xl p-4 md:p-5 border border-night/[0.06] shadow-sm relative overflow-hidden group hover:shadow-md hover:border-night/[0.12] transition ${(i === 0 || i === 2) ? "cursor-pointer active:scale-[0.98]" : ""}`}
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.06] group-hover:opacity-[0.1] transition" style={{ backgroundColor: kpi.color }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <kpi.icon size={16} style={{ color: kpi.color }} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-night/40">{kpi.label}</p>
              </div>
              <p className="text-2xl md:text-3xl font-black text-night tracking-tight leading-none">{kpi.value}</p>
              <p className="text-[11px] text-night/40 mt-2">{kpi.hint}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* TAB SWITCHER */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="inline-flex bg-white rounded-full p-1 border border-night/[0.06] shadow-sm">
          <button
            onClick={() => setTab("live")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition flex items-center gap-2 ${tab === "live" ? "bg-night text-white shadow-md" : "text-night/50 hover:text-night"}`}
          >
            <Activity size={15} />
            Ordini Live
            {counts.pending > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px]">
                {counts.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("capacity")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition flex items-center gap-2 ${tab === "capacity" ? "bg-night text-white shadow-md" : "text-night/50 hover:text-night"}`}
          >
            <Settings size={15} />
            Capacità
          </button>
        </div>
      </div>

      {/* ═══════════ TAB LIVE ═══════════ */}
      {tab === "live" && (
        <div className="px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-night/[0.06] animate-pulse">
                  <div className="h-4 bg-night/5 rounded w-24 mb-3" />
                  <div className="h-6 bg-night/5 rounded w-40 mb-4" />
                  <div className="h-20 bg-night/5 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* STATUS TABS */}
              <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-1 px-1 hide-scrollbar snap-x">
                {TAB_ORDER.map((key) => {
                  const cfg = ORDER_STATUS[key];
                  const isActive = activeStatus === key;
                  const count = counts[key];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveStatus(key)}
                      className={`group flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition shrink-0 border-2 snap-start ${
                        isActive
                          ? "bg-night text-white border-night shadow-lg"
                          : "bg-white text-night/70 border-transparent hover:border-night/10"
                      }`}
                    >
                      <Icon size={16} style={{ color: isActive ? "#25D366" : cfg.color }} />
                      {cfg.label}
                      <span className={`text-xs font-black px-2 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : count > 0 ? "bg-night text-white" : "bg-night/5 text-night/50"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ORDERS GRID */}
              {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-night/[0.06] p-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="text-night/20" size={36} />
                  </div>
                  <p className="text-lg font-bold text-night/60 mb-1">Nessun ordine qui</p>
                  <p className="text-sm text-night/40">Gli ordini in questo stato appariranno qui.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {filtered.map((order) => {
                      const cfg = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || ORDER_STATUS.pending;
                      const customerPhone = order.customers?.whatsapp_number?.replace(/\D/g, "") || "";
                      const scheduledTime = order.scheduled_for ? order.scheduled_for.substring(11, 16) : null;

                      return (
                        <motion.div
                          key={order.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden hover:shadow-xl transition-all flex flex-col relative"
                        >
                          {/* Stripe colorata in alto */}
                          <div className="h-1.5 w-full" style={{ backgroundColor: cfg.accent }} />

                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="font-mono text-[11px] bg-night/[0.04] px-2 py-1 rounded font-black text-night/60">
                                  {order.order_code}
                                </span>
                                {order.order_code.startsWith("MAN-") && (
                                  <span className="text-[9px] font-black px-2 py-1 rounded-full bg-purple-100 text-purple-700 uppercase tracking-wider inline-flex items-center gap-1">
                                    <FileText size={9} /> Manuale
                                  </span>
                                )}
                                <span
                                  className="text-[9px] font-black px-2 py-1 rounded-full inline-flex items-center gap-1 uppercase tracking-wider"
                                  style={{ backgroundColor: cfg.bg, color: cfg.text }}
                                >
                                  <cfg.icon size={10} /> {cfg.label}
                                </span>
                              </div>
                              <h3 className="font-black text-night text-lg leading-tight truncate">
                                {order.customers?.name || "Cliente"}
                              </h3>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-2xl font-black text-night tracking-tight leading-none">
                                €{Number(order.total).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-wrap gap-2 px-5 pb-3">
                            <span className="inline-flex items-center gap-1.5 bg-night/[0.04] text-night/70 px-2.5 py-1 rounded-lg text-xs font-bold">
                              {order.order_type === "delivery" ? <Truck size={13} /> : <Store size={13} />}
                              {order.order_type === "delivery" ? "Domicilio" : "Asporto"}
                            </span>
                            {scheduledTime && (
                              <span className="inline-flex items-center gap-1.5 bg-night/[0.04] text-night/70 px-2.5 py-1 rounded-lg text-xs font-bold">
                                <Clock size={13} />
                                {scheduledTime}
                              </span>
                            )}
                          </div>

                          {/* Items */}
                          <div className="px-5 pb-4 flex-1">
                            <div className="bg-[#FAFAFA] rounded-xl p-3 space-y-1.5 border border-night/[0.03]">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-start gap-2 text-sm">
                                  <span className="text-night/80 leading-snug">
                                    <strong className="text-night font-black">{item.qty}×</strong> {item.name}
                                  </span>
                                  <span className="text-night/40 font-mono text-xs whitespace-nowrap mt-0.5">
                                    €{(item.qty * item.price).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                              {order.notes && (
                                <div className="pt-2 mt-2 border-t border-night/[0.06] text-xs text-orange-700 font-bold flex items-start gap-1.5">
                                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                  <span className="bg-orange-50 px-1.5 py-0.5 rounded">{order.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="px-4 py-3 bg-[#FAFAFA] border-t border-night/[0.04] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              {order.status !== "cancelled" && order.status !== "delivered" && (
                                <button
                                  onClick={() => updateStatus(order.id, "cancelled")}
                                  className="text-red-500 hover:bg-red-50 text-xs font-bold px-3 py-2 rounded-lg transition"
                                >
                                  Annulla
                                </button>
                              )}
                              {customerPhone && (
                                <a
                                  href={`https://wa.me/${customerPhone}?text=${encodeURIComponent(getAppMessage(order))}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Avvisa su App"
                                  className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold px-3 py-2 rounded-lg transition inline-flex items-center gap-1.5"
                                >
                                  <MessageCircle size={14} />
                                  Avvisa
                                </a>
                              )}
                            </div>

                            {cfg.next && (
                              <button
                                onClick={() => updateStatus(order.id, cfg.next!)}
                                className="bg-night hover:bg-night/90 text-white text-sm font-black px-5 py-2.5 rounded-xl transition inline-flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                                style={{ backgroundColor: cfg.accent }}
                              >
                                {cfg.nextLabel}
                                <ArrowRight size={15} />
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
        </div>
      )}

      {/* ═══════════ TAB CAPACITY ═══════════ */}
      {tab === "capacity" && (
        <div className="px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="bg-white rounded-2xl border border-night/[0.06] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="bg-cream p-2.5 rounded-xl">
                <Calendar size={22} className="text-night/60" />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-cream border border-transparent rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-night/20 focus:outline-none transition w-full sm:w-auto"
              />
            </div>
            <p className="text-sm text-night/60 flex-1">
              Gestisci la disponibilità degli orari. Aggiungi ordini manuali per evitare sovraccarichi.
            </p>
          </div>

          {loadingSlots ? (
            <div className="bg-white rounded-2xl border border-night/[0.06] p-12 flex justify-center">
              <Loader2 className="animate-spin text-night/30" size={32} />
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-white rounded-2xl border border-night/[0.06] p-12 text-center">
              <AlertCircle className="text-night/20 mx-auto mb-3" size={40} />
              <p className="text-base font-bold text-night/60">Nessuno slot disponibile</p>
              <p className="text-sm text-night/40 mt-1">Controlla gli orari in impostazioni.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-night/[0.06] bg-cream/30 hidden lg:grid grid-cols-[100px_1fr_100px_100px_200px] gap-6 text-[10px] font-black text-night/40 uppercase tracking-widest">
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
                      className={`grid grid-cols-1 lg:grid-cols-[100px_1fr_100px_100px_200px] gap-3 lg:gap-6 px-5 py-4 items-center transition ${
                        state === "blocked" ? "bg-red-50/60" : state === "full" ? "bg-yellow-50/60" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center lg:block">
                        <div className={`font-mono font-black text-2xl lg:text-xl ${state === "blocked" ? "text-red-400 line-through" : "text-night"}`}>
                          {slot.slot}
                        </div>
                        <div className="lg:hidden flex items-center gap-2 text-xs">
                          <span className="bg-white px-2.5 py-1 rounded-lg border border-night/10 font-bold">
                            W: {slot.web_count}
                          </span>
                          <span className="bg-white px-2.5 py-1 rounded-lg border border-night/10 font-bold">
                            M: {slot.manual_count}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 w-full mt-2 lg:mt-0">
                        <div className="h-2.5 bg-cream rounded-full overflow-hidden w-full">
                          <div
                            className={`h-full rounded-full transition-all ${
                              state === "blocked" ? "bg-red-500" : state === "full" ? "bg-yellow-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-[11px] font-bold text-night/50 text-right lg:text-left">
                          {slot.total} / {slot.capacity} posti
                        </p>
                      </div>

                      <div className="hidden lg:block text-center text-base font-black text-night">{slot.web_count}</div>
                      <div className="hidden lg:block text-center text-base font-black text-night">{slot.manual_count}</div>

                      <div className="flex items-center justify-end gap-2 mt-2 lg:mt-0 pt-3 lg:pt-0 border-t lg:border-0 border-night/[0.06]">
                        <button
                          onClick={() => saveSlot(slot, { manual_count: Math.max(0, slot.manual_count - 1) })}
                          disabled={slot.manual_count === 0 || savingSlot === slot.slot}
                          className="w-12 h-12 lg:w-9 lg:h-9 rounded-xl bg-cream hover:bg-night/10 disabled:opacity-30 flex items-center justify-center transition active:scale-95 font-bold"
                        >
                          <Minus size={18} className="lg:w-4 lg:h-4" />
                        </button>
                        <button
                          onClick={() => saveSlot(slot, { manual_count: slot.manual_count + 1 })}
                          disabled={savingSlot === slot.slot}
                          className="w-12 h-12 lg:w-9 lg:h-9 rounded-xl bg-cream hover:bg-night/10 flex items-center justify-center transition active:scale-95 font-bold"
                        >
                          <Plus size={18} className="lg:w-4 lg:h-4" />
                        </button>
                        <div className="w-px h-8 bg-night/10 mx-1"></div>
                        <button
                          onClick={() => saveSlot(slot, { is_blocked: !slot.is_blocked })}
                          disabled={savingSlot === slot.slot}
                          className={`w-12 h-12 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center transition active:scale-95 ${
                            slot.is_blocked
                              ? "bg-red-500 text-white hover:bg-red-600 shadow"
                              : "bg-cream hover:bg-night/10 text-night/70"
                          }`}
                        >
                          {slot.is_blocked ? <Unlock size={18} className="lg:w-4 lg:h-4" /> : <Lock size={18} className="lg:w-4 lg:h-4" />}
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

      {tenantIdForNotif && (
        <ManualOrderModal
          isOpen={showManualModal}
          onClose={() => setShowManualModal(false)}
          tenantId={tenantIdForNotif}
          onSaved={() => loadOrders(false)}
        />
      )}
      {reportType && (
        <ReportModal
          isOpen={!!reportType}
          onClose={() => setReportType(null)}
          type={reportType}
          orders={reportOrders}
        />
      )}
    </div>
  );
}
