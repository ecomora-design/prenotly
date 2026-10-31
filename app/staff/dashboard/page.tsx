"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import StatsCards from "./StatsCards";
import WeekView from "./WeekView";
import TablesView from "./TablesView";
import OrdersView from "./OrdersView";
import { planHasFeature } from "@/lib/planFeatures";
import {
  Loader2, Calendar, Clock, CheckCircle2, XCircle, LogOut, Lock, Crown,
  User, RefreshCw, MessageCircle, Timer, ArrowRight, Scissors
} from "lucide-react";

type StaffInfo = {
  id: string;
  name: string;
  role: string | null;
  color: string;
  tenant_id: string;
  tenants: { business_name: string; slug: string; brand_color: string | null; plan_type: string | null; category: string | null; product_type: string | null; business_type: string | null } | null;
};

type Appointment = {
  id: string;
  booking_code: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  duration_minutes: number | null;
  customers: { name: string | null; whatsapp_number: string | null } | null;
};

const STATUS_CONFIG = {
  pending: { label: "In attesa", accent: "#EAB308", bg: "#FEF9C3", text: "#854D0E" },
  confirmed: { label: "Confermato", accent: "#3B82F6", bg: "#DBEAFE", text: "#1E40AF" },
  completed: { label: "Completato", accent: "#10B981", bg: "#DCFCE7", text: "#166534" },
  cancelled: { label: "Annullato", accent: "#EF4444", bg: "#FEE2E2", text: "#991B1B" },
};

const DAYS = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTHS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

export default function StaffDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [mainTab, setMainTab] = useState<"appointments" | "tables" | "orders">("appointments");

  // Determina se l'attività è food (ristorante/pizzeria) o service (estetista/parrucchiere)
  const isFood = !!(
    staffInfo?.tenants &&
    (
      staffInfo.tenants.category === "ristoranti" ||
      staffInfo.tenants.category === "pizzerie" ||
      staffInfo.tenants.product_type === "food" ||
      staffInfo.tenants.business_type === "restaurant"
    )
  );

  // Imposta il tab di default in base al tipo di attività
  useEffect(() => {
    if (staffInfo) {
      setMainTab(isFood ? "tables" : "appointments");
    }
  }, [staffInfo, isFood]);
  const [weekAppointments, setWeekAppointments] = useState<Appointment[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    // Lunedì della settimana corrente (in timezone Europe/Rome)
    const now = new Date();
    const day = now.getDay(); // 0=dom, 1=lun, ..., 6=sab
    const diff = day === 0 ? -6 : 1 - day; // se domenica, torna al lunedì precedente
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: s } = await supabase
        .from("staff")
        .select("id, name, role, color, tenant_id, tenants(business_name, slug, brand_color, plan_type, category, product_type, business_type)")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!s) {
        // Non è staff → rimanda alla dashboard titolare
        router.push("/dashboard");
        return;
      }

      setStaffInfo(s as any);
      setLoading(false);
    }
    init();
  }, []);

  async function loadAppointments() {
    if (!staffInfo) return;
    setRefreshing(true);

    const dateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(selectedDate);
    const dayStart = new Date(dateStr + "T00:00:00").toISOString();
    const dayEnd = new Date(dateStr + "T23:59:59").toISOString();

    const { data, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, booking_code, scheduled_at, status, notes, duration_minutes, customer_id")
      .eq("tenant_id", staffInfo.tenant_id)
      .eq("staff_id", staffInfo.id)
      .eq("booking_type", "appointment")
      .gte("scheduled_at", dayStart)
      .lte("scheduled_at", dayEnd)
      .order("scheduled_at", { ascending: true });

    if (bookingsError) {
      console.error("bookings load error:", bookingsError);
      setRefreshing(false);
      return;
    }

    // Carica clienti
    const ids = (data || []).map((b: any) => b.customer_id).filter(Boolean);
    let custMap: Record<string, { name: string | null; whatsapp_number: string | null }> = {};
    if (ids.length > 0) {
      const { data: customers } = await supabase.from("customers").select("id, name, whatsapp_number").in("id", ids);
      (customers || []).forEach((c: any) => { custMap[c.id] = { name: c.name, whatsapp_number: c.whatsapp_number }; });
    }

    setAppointments(((data || []) as any[]).map(a => ({
      ...a,
      customers: a.customer_id ? (custMap[a.customer_id] || null) : null,
    })));
    setRefreshing(false);
  }

  async function loadWeekAppointments() {
    if (!staffInfo) return;
    setRefreshing(true);

    // Lunedì e domenica della settimana selezionata (timezone Europe/Rome)
    const monday = new Date(weekStart);
    const sunday = new Date(weekStart);
    sunday.setDate(sunday.getDate() + 6);
    const mondayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(monday);
    const sundayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(sunday);
    const weekStartISO = new Date(mondayStr + "T00:00:00").toISOString();
    const weekEndISO = new Date(sundayStr + "T23:59:59").toISOString();

    const { data, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, booking_code, scheduled_at, status, notes, duration_minutes, customer_id")
      .eq("tenant_id", staffInfo.tenant_id)
      .eq("staff_id", staffInfo.id)
      .eq("booking_type", "appointment")
      .gte("scheduled_at", weekStartISO)
      .lte("scheduled_at", weekEndISO)
      .order("scheduled_at", { ascending: true });

    if (bookingsError) {
      console.error("week bookings load error:", bookingsError);
      setRefreshing(false);
      return;
    }

    // Carica clienti
    const ids = (data || []).map((b: any) => b.customer_id).filter(Boolean);
    let custMap: Record<string, { name: string | null; whatsapp_number: string | null }> = {};
    if (ids.length > 0) {
      const { data: customers } = await supabase.from("customers").select("id, name, whatsapp_number").in("id", ids);
      (customers || []).forEach((c: any) => { custMap[c.id] = { name: c.name, whatsapp_number: c.whatsapp_number }; });
    }

    setWeekAppointments(((data || []) as any[]).map(a => ({
      ...a,
      customers: a.customer_id ? (custMap[a.customer_id] || null) : null,
    })));
    setRefreshing(false);
  }

  useEffect(() => { if (staffInfo) loadAppointments(); }, [staffInfo, selectedDate]);
  useEffect(() => { if (staffInfo && viewMode === "week") loadWeekAppointments(); }, [staffInfo, weekStart, viewMode]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    if (viewMode === "week") {
      loadWeekAppointments();
    } else {
      loadAppointments();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading || !staffInfo) {
    return <div className="flex items-center justify-center h-screen bg-[#FAFAFA]"><Loader2 className="animate-spin text-wa" size={32} /></div>;
  }

  // Date strip
  const dateStrip = [];
  for (let i = -2; i < 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dateStrip.push(d);
  }

  const dailyAppointments = appointments;
  const groupedByTime = dailyAppointments.reduce((acc: Record<string, Appointment[]>, a) => {
    const time = new Date(a.scheduled_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
    if (!acc[time]) acc[time] = [];
    acc[time].push(a);
    return acc;
  }, {});
  const sortedTimes = Object.keys(groupedByTime).sort();

  // CONTROLLO PIANO PREMIUM
  const isPremium = planHasFeature(staffInfo.tenants?.plan_type, "staff");
  
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm text-center max-w-md w-full border border-night/[0.06]">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <Lock size={36} className="text-amber-500" />
          </div>
          <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
            <Crown size={11} /> Funzione Premium
          </div>
          <h1 className="text-2xl font-bold text-night mb-3">Area Staff Bloccata</h1>
          <p className="text-gray-500 text-sm mb-6">
            L&apos;area operatore è disponibile solo per gli account con piano <strong>Premium Pro (99,99 €/mese)</strong>.
            Chiedi al titolare dell&apos;attività di effettuare l&apos;upgrade.
          </p>
          <button onClick={handleLogout} className="w-full bg-night hover:bg-night/90 text-white py-3 rounded-full font-bold text-sm transition">
            Torna al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-night/[0.06] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: staffInfo.color }}>
              {staffInfo.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-night text-sm leading-tight">{staffInfo.name}</p>
              <p className="text-[11px] text-night/50">{staffInfo.role || "Operatore"} · {staffInfo.tenants?.business_name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-night/50 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* TABS PRINCIPALI (condizionali per tipo attività) */}
        <div className={`mb-5 grid ${isFood ? "grid-cols-2" : "grid-cols-1"} gap-1 bg-white border border-night/[0.08] rounded-2xl p-1 shadow-sm`}>
          {!isFood && (
            <button onClick={() => setMainTab("appointments")} className={`py-2.5 rounded-xl text-xs md:text-sm font-bold transition ${mainTab === "appointments" ? "bg-night text-white" : "text-night/60 hover:text-night"}`}>Appuntamenti</button>
          )}
          {isFood && (
            <>
              <button onClick={() => setMainTab("tables")} className={`py-2.5 rounded-xl text-xs md:text-sm font-bold transition ${mainTab === "tables" ? "bg-night text-white" : "text-night/60 hover:text-night"}`}>Tavoli</button>
              <button onClick={() => setMainTab("orders")} className={`py-2.5 rounded-xl text-xs md:text-sm font-bold transition ${mainTab === "orders" ? "bg-night text-white" : "text-night/60 hover:text-night"}`}>Ordini</button>
            </>
          )}
        </div>

        <div className={!isFood && mainTab === "appointments" ? "block" : "hidden"}>
        <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">I tuoi appuntamenti</h1>
            <p className="text-sm text-gray-500">Visualizza e gestisci la tua agenda</p>
          </div>
          {/* TOGGLE VISTA */}
          <div className="inline-flex bg-white border border-night/[0.08] rounded-full p-1 shadow-sm">
            <button
              onClick={() => setViewMode("day")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                viewMode === "day" ? "bg-night text-white" : "text-night/60 hover:text-night"
              }`}
            >
              Giorno
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                viewMode === "week" ? "bg-night text-white" : "text-night/60 hover:text-night"
              }`}
            >
              Settimana
            </button>
          </div>
        </div>

        {viewMode === "day" && (
        <>
        {/* DATE STRIP */}
        <div className="bg-white rounded-2xl p-3 border border-night/[0.06] shadow-sm mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {dateStrip.map((d) => {
              const isSelected = d.toDateString() === selectedDate.toDateString();
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(d)}
                  className={`relative flex flex-col items-center justify-center min-w-[64px] py-2.5 rounded-xl transition shrink-0 border-2 ${
                    isSelected ? "bg-night text-white border-night" : "bg-white border-transparent text-night/60 hover:bg-cream"
                  }`}
                >
                  {isToday && !isSelected && <span className="absolute top-1 w-1 h-1 rounded-full bg-emerald-500" />}
                  <span className={`text-[9px] font-black uppercase ${isSelected ? "text-white/60" : "text-night/40"}`}>{DAYS[d.getDay()]}</span>
                  <span className={`text-xl font-black ${isSelected ? "text-white" : "text-night"}`}>{d.getDate()}</span>
                  <span className={`text-[9px] font-bold ${isSelected ? "text-white/50" : "text-night/40"}`}>{MONTHS[d.getMonth()]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STATS */}
        <StatsCards />

        {/* REFRESH */}
        <div className="flex justify-end mb-3">
          <button onClick={loadAppointments} disabled={refreshing} className="inline-flex items-center gap-2 text-xs font-bold text-night/60 hover:text-night transition">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Aggiorna
          </button>
        </div>

        {/* TIMELINE */}
        {sortedTimes.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-night/[0.04]">
            <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} className="text-night/20" />
            </div>
            <h2 className="text-lg font-bold text-night mb-1">Nessun appuntamento</h2>
            <p className="text-sm text-night/50">Non hai appuntamenti per questa data.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-night/[0.06] ml-4 space-y-8 pb-10">
            {sortedTimes.map(time => (
              <div key={time} className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-night shadow-sm z-10" />
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className="text-2xl font-black text-night tracking-tight">{time}</h3>
                  <span className="text-[10px] font-black text-night/40 uppercase bg-white px-2 py-1 rounded-full border border-night/[0.06]">
                    {groupedByTime[time].length}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {groupedByTime[time].map(appointment => {
                    const config = STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                    const customerPhone = appointment.customers?.whatsapp_number?.replace(/\D/g, "") || "";
                    return (
                      <motion.div key={appointment.id} layout className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden shadow-sm">
                        <div className="h-1.5 w-full" style={{ backgroundColor: config.accent }} />
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: config.accent + "15" }}>
                              <Scissors size={18} style={{ color: config.accent }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-night truncate">{appointment.customers?.name || "Cliente"}</h4>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase" style={{ backgroundColor: config.bg, color: config.text }}>{config.label}</span>
                                {appointment.duration_minutes && (
                                  <span className="text-[10px] font-bold text-night/50 flex items-center gap-0.5">
                                    <Timer size={9} /> {appointment.duration_minutes} min
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-night/40 bg-night/5 px-2 py-1 rounded">{appointment.booking_code}</span>
                          </div>

                          {appointment.notes && (
                            <div className="mt-2 px-3 py-2 bg-orange-50 text-[11px] text-orange-800 font-bold rounded-lg">📝 {appointment.notes}</div>
                          )}

                          <div className="mt-3 pt-3 border-t border-night/[0.04] flex items-center justify-between gap-2">
                            {appointment.status === "pending" && (
                              <button onClick={() => updateStatus(appointment.id, "confirmed")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-2 rounded-lg flex items-center justify-center gap-1">
                                Conferma <ArrowRight size={12} />
                              </button>
                            )}
                            {appointment.status === "confirmed" && (
                              <button onClick={() => updateStatus(appointment.id, "completed")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 rounded-lg flex items-center justify-center gap-1">
                                Completato <CheckCircle2 size={12} />
                              </button>
                            )}
                            {appointment.status === "completed" && (
                              <span className="flex-1 text-center text-[10px] font-black text-emerald-600 uppercase tracking-widest">✓ Completato</span>
                            )}
                            {appointment.status === "cancelled" && (
                              <span className="flex-1 text-center text-[10px] font-black text-red-500 uppercase tracking-widest">✗ Annullato</span>
                            )}
                            {customerPhone && (
                              <a href={`https://wa.me/${customerPhone}?text=${encodeURIComponent("Ciao! Le ricordo l'appuntamento " + appointment.booking_code + " da " + (staffInfo.tenants?.business_name || "noi"))}`} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg">
                                <MessageCircle size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        )}

        {viewMode === "week" && (
          <WeekView
            staffInfo={staffInfo}
            weekStart={weekStart}
            appointments={weekAppointments}
            onPrev={() => {
              const prev = new Date(weekStart);
              prev.setDate(prev.getDate() - 7);
              setWeekStart(prev);
            }}
            onNext={() => {
              const next = new Date(weekStart);
              next.setDate(next.getDate() + 7);
              setWeekStart(next);
            }}
            onUpdateStatus={updateStatus}
            onDayClick={(d) => {
              setSelectedDate(d);
              setViewMode("day");
            }}
          />
        )}
        </div>

        <div className={isFood && mainTab === "tables" ? "block" : "hidden"}>
          <TablesView tenantId={staffInfo.tenant_id} />
        </div>

        <div className={isFood && mainTab === "orders" ? "block" : "hidden"}>
          <OrdersView tenantId={staffInfo.tenant_id} />
        </div>
      </div>
    </div>
  );
}
