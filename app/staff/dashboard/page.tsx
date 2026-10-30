"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import StatsCards from "./StatsCards";
import {
  Loader2, Calendar, Clock, CheckCircle2, XCircle, LogOut,
  User, RefreshCw, MessageCircle, Timer, ArrowRight, Scissors
} from "lucide-react";

type StaffInfo = {
  id: string;
  name: string;
  role: string | null;
  color: string;
  tenant_id: string;
  tenants: { business_name: string; slug: string; brand_color: string | null } | null;
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

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: s } = await supabase
        .from("staff")
        .select("id, name, role, color, tenant_id, tenants(business_name, slug, brand_color)")
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

  useEffect(() => { if (staffInfo) loadAppointments(); }, [staffInfo, selectedDate]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    loadAppointments();
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
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">I tuoi appuntamenti</h1>
          <p className="text-sm text-gray-500">Visualizza e gestisci la tua agenda</p>
        </div>

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
      </div>
    </div>
  );
}
