"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NotificationCenter from "@/components/NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Calendar, Clock, CheckCircle2, XCircle,
  RefreshCw, MessageCircle, User, ChevronLeft, ChevronRight,
  Users, ArrowRight, CalendarDays, Activity, Zap,
  UserPlus, X, Plus, Save, FileText, TrendingUp, Scissors,
  DollarSign, Timer
} from "lucide-react";

type Appointment = {
  id: string;
  booking_code: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  duration_minutes: number | null;
  customers: { name: string | null; app_number: string | null } | null;
};

const STATUS_CONFIG = {
  pending: { label: "In attesa", color: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-400", accent: "#EAB308", bg: "#FEF9C3", text: "#854D0E" },
  confirmed: { label: "Confermato", color: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-500", accent: "#3B82F6", bg: "#DBEAFE", text: "#1E40AF" },
  completed: { label: "Completato", color: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500", accent: "#10B981", bg: "#DCFCE7", text: "#166534" },
  cancelled: { label: "Annullato", color: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-500", accent: "#EF4444", bg: "#FEE2E2", text: "#991B1B" },
};

const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTHS_SHORT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

export default function AppuntamentiPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tenantId, setTenantId] = useState<string>("");
  const [showManualModal, setShowManualModal] = useState(false);

  const dateStrip = useMemo(() => {
    const days = [];
    for (let i = -2; i < 12; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const load = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    else setRefreshing(true);

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
      .from("bookings")
      .select("id, booking_code, scheduled_at, status, notes, duration_minutes, customer_id")
      .eq("tenant_id", link.tenant_id)
      .eq("booking_type", "appointment")
      .order("scheduled_at", { ascending: true });

    const rawAppointments = data || [];

    const { data: customers } = await supabase
      .from("customers")
      .select("id, name, app_number")
      .eq("tenant_id", link.tenant_id);

    const custMap: Record<string, { name: string | null; app_number: string | null }> = {};
    (customers || []).forEach((c: any) => { custMap[c.id] = { name: c.name, app_number: c.app_number }; });

    setAppointments(
      rawAppointments.map((a: any) => ({
        ...a,
        customers: custMap[a.customer_id] || null,
      }))
    );
    setLoading(false);
    setRefreshing(false);
  }, [supabase, router]);

  useEffect(() => { load(true); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    await load(false);
  };

  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const dailyAppointments = appointments.filter(
    (a) => a.scheduled_at.split("T")[0] === selectedDateStr
  );

  const groupedByTime = dailyAppointments.reduce((acc: Record<string, Appointment[]>, a) => {
    const time = new Date(a.scheduled_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
    if (!acc[time]) acc[time] = [];
    acc[time].push(a);
    return acc;
  }, {});

  const sortedTimes = Object.keys(groupedByTime).sort();

  const totalAppointments = dailyAppointments.length;
  const confirmedCount = dailyAppointments.filter(a => a.status === "confirmed").length;
  const pendingCount = dailyAppointments.filter(a => a.status === "pending").length;
  const completedCount = dailyAppointments.filter(a => a.status === "completed").length;
  const totalMinutes = dailyAppointments.filter(a => a.status !== "cancelled").reduce((s, a) => s + (a.duration_minutes || 30), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin text-night" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">

      {/* HEADER */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-widest mb-3">
              <Activity size={12} /> Agenda Live
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-night tracking-tight">Appuntamenti</h1>
            <p className="text-night/50 text-sm mt-1">
              {pendingCount > 0
                ? pendingCount + " appuntament" + (pendingCount === 1 ? "o" : "i") + " da confermare"
                : "Tutto sotto controllo. Nessun appuntamento in attesa."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tenantId && <NotificationCenter tenantId={tenantId} brandColor="#8B5CF6" />}
            <button
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-4 py-2.5 rounded-full text-xs font-bold transition shadow-md active:scale-95"
            >
              <UserPlus size={14} /> Nuovo Appuntamento
            </button>
            <button
              onClick={() => load(false)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 border border-night/[0.08] hover:border-night/20 bg-white text-night px-4 py-2.5 rounded-full text-xs font-bold transition shadow-sm disabled:opacity-50"
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
            { label: "Totale", value: totalAppointments, icon: CalendarDays, color: "#8B5CF6", hint: "Oggi" },
            { label: "Confermati", value: confirmedCount, icon: CheckCircle2, color: "#10B981", hint: "Pronti" },
            { label: "In Attesa", value: pendingCount, icon: Clock, color: "#EAB308", hint: "Da confermare" },
            { label: "Completati", value: completedCount, icon: Zap, color: "#3B82F6", hint: "Serviti" },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-4 md:p-5 border border-night/[0.06] shadow-sm relative overflow-hidden group hover:shadow-md transition"
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.06] group-hover:opacity-[0.1] transition" style={{ backgroundColor: kpi.color }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.color + "15" }}>
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

      {/* DATE PICKER */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-3xl p-3 border border-night/[0.06] shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x px-1">
            {dateStrip.map((d) => {
              const isSelected = d.toDateString() === selectedDate.toDateString();
              const isToday = d.toDateString() === new Date().toDateString();

              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(d)}
                  className={"relative flex flex-col items-center justify-center min-w-[72px] py-3 rounded-2xl transition-all snap-start shrink-0 border-2 " +
                    (isSelected
                      ? "bg-night text-white border-night shadow-lg scale-105"
                      : "bg-white border-transparent text-night/60 hover:bg-cream/50 hover:border-night/10")
                  }
                >
                  {isToday && !isSelected && <span className="absolute top-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>}
                  <span className={"text-[10px] font-black uppercase tracking-widest " + (isSelected ? "text-white/60" : "text-night/40")}>{DAYS_SHORT[d.getDay()]}</span>
                  <span className={"text-2xl font-black my-0.5 " + (isSelected ? "text-white" : "text-night")}>{d.getDate()}</span>
                  <span className={"text-[10px] font-bold " + (isSelected ? "text-white/50" : "text-night/40")}>{MONTHS_SHORT[d.getMonth()]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="px-4 sm:px-6 lg:px-8">
        {sortedTimes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-16 text-center shadow-sm border border-night/[0.04]"
          >
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={36} className="text-night/20" />
            </div>
            <h2 className="text-xl font-bold text-night mb-2">Nessun appuntamento</h2>
            <p className="text-sm text-night/50 mb-6">Non ci sono appuntamenti per questa data.</p>
            <button
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-5 py-3 rounded-full font-bold text-sm transition active:scale-95"
            >
              <Plus size={16} /> Aggiungi Appuntamento
            </button>
          </motion.div>
        ) : (
          <div className="relative border-l-2 border-night/[0.06] ml-4 md:ml-6 space-y-10 pb-10">
            {sortedTimes.map((time) => (
              <div key={time} className="relative pl-6 md:pl-10">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-night shadow-sm z-10" />

                <div className="flex items-baseline gap-3 mb-4">
                  <h3 className="text-3xl font-black text-night tracking-tight leading-none">{time}</h3>
                  <span className="text-[10px] font-black text-night/40 uppercase tracking-widest bg-white px-2.5 py-1 rounded-full border border-night/[0.06]">
                    {groupedByTime[time].length} {groupedByTime[time].length === 1 ? "app." : "app."}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {groupedByTime[time].map((appointment) => {
                      const config = STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                      const customerPhone = appointment.customers?.app_number?.replace(/\D/g, "") || "";

                      return (
                        <motion.div
                          key={appointment.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden hover:shadow-xl transition-all flex flex-col relative"
                        >
                          <div className="h-1.5 w-full" style={{ backgroundColor: config.accent }} />

                          <div className="flex items-center justify-between p-4 border-b border-night/[0.04]">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: config.accent + "15" }}>
                                <Scissors size={20} style={{ color: config.accent }} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-black text-night text-base leading-tight truncate">
                                  {appointment.customers?.name || "Cliente"}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1" style={{ backgroundColor: config.bg, color: config.text }}>
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.accent }} /> {config.label}
                                  </span>
                                  {appointment.duration_minutes && (
                                    <span className="text-[10px] font-bold text-night/50 bg-cream px-2 py-0.5 rounded flex items-center gap-1">
                                      <Timer size={10} /> {appointment.duration_minutes} min
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] font-black text-night/40 bg-night/5 px-2 py-1 rounded shrink-0">
                              {appointment.booking_code}
                            </span>
                          </div>

                          {appointment.notes && (
                            <div className="px-4 py-3 border-b border-night/[0.04] bg-orange-50/50 text-xs text-orange-800 font-bold flex items-start gap-2">
                              <span className="shrink-0">📝</span>
                              <p>{appointment.notes}</p>
                            </div>
                          )}

                          <div className="px-3 py-3 bg-[#FAFAFA] border-t border-night/[0.04] flex items-center justify-between gap-2 mt-auto">
                            <div className="flex items-center gap-1">
                              {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                                <button onClick={() => updateStatus(appointment.id, "cancelled")} className="text-red-500 hover:bg-red-50 text-[11px] font-bold px-3 py-2 rounded-lg transition">
                                  Annulla
                                </button>
                              )}
                              {customerPhone && (
                                <a href={"https://wa.me/" + customerPhone + "?text=Ciao!%20Riguardo%20al%20tuo%20appuntamento%20" + appointment.booking_code} target="_blank" rel="noopener noreferrer" className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold px-3 py-2 rounded-lg transition inline-flex items-center gap-1.5">
                                  <MessageCircle size={14} /> Avvisa
                                </a>
                              )}
                            </div>

                            {appointment.status === "pending" && (
                              <button onClick={() => updateStatus(appointment.id, "confirmed")} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2.5 rounded-lg transition shadow-sm active:scale-95 inline-flex items-center gap-1.5">
                                Conferma <ArrowRight size={12} />
                              </button>
                            )}
                            {appointment.status === "confirmed" && (
                              <button onClick={() => updateStatus(appointment.id, "completed")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-lg transition shadow-sm active:scale-95 inline-flex items-center gap-1.5">
                                Completato <CheckCircle2 size={12} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE NUOVO APPUNTAMENTO */}
      <AnimatePresence>
        {showManualModal && (
          <ManualAppointmentModal
            tenantId={tenantId}
            onClose={() => setShowManualModal(false)}
            onSaved={() => load(false)}
            selectedDate={selectedDate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MODALE APPUNTAMENTO MANUALE ──
function ManualAppointmentModal({ tenantId, onClose, onSaved, selectedDate }: { tenantId: string; onClose: () => void; onSaved: () => void; selectedDate: Date }) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    serviceId: "",
    serviceName: "",
    duration: 30,
    time: "10:00",
    notes: "",
    status: "confirmed",
  });

  useEffect(() => {
    supabase.from("services").select("id, name, duration_minutes, price").eq("tenant_id", tenantId).eq("is_available", true).order("name").then(({ data }) => setServices(data || []));
  }, [tenantId, supabase]);

  const handleServiceChange = (serviceId: string) => {
    const svc = services.find(s => s.id === serviceId);
    if (svc) {
      setForm({
        ...form,
        serviceId,
        serviceName: svc.name,
        duration: svc.duration_minutes || 30,
      });
    } else {
      setForm({ ...form, serviceId: "", serviceName: "", duration: 30 });
    }
  };

  const handleSave = async () => {
    if (!form.customerName || !form.serviceName || !form.time) {
      alert("Inserisci nome, servizio e orario");
      return;
    }
    setSaving(true);

    try {
      const code = "PR-" + Math.random().toString(36).substring(2, 6).toUpperCase();
      let customerId: string | null = null;

      if (form.customerPhone) {
        const { data: existing } = await supabase
          .from("customers")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("app_number", form.customerPhone)
          .maybeSingle();
        if (existing) {
          customerId = existing.id;
          await supabase.from("customers").update({ name: form.customerName }).eq("id", customerId);
        } else {
          const { data: created } = await supabase.from("customers").insert({ tenant_id: tenantId, name: form.customerName, app_number: form.customerPhone }).select("id").single();
          customerId = created?.id || null;
        }
      } else {
        const { data: created } = await supabase.from("customers").insert({ tenant_id: tenantId, name: form.customerName, app_number: "" }).select("id").single();
        customerId = created?.id || null;
      }

      const dateStr = selectedDate.toISOString().split("T")[0];
      const scheduledAt = new Date(dateStr + "T" + form.time + ":00").toISOString();

      const { error } = await supabase.from("bookings").insert({
        tenant_id: tenantId,
        customer_id: customerId,
        booking_code: code,
        booking_type: "appointment",
        scheduled_at: scheduledAt,
        duration_minutes: form.duration,
        service_id: form.serviceId || null,
        status: form.status,
        notes: form.notes || null,
      });

      if (error) throw error;

      onSaved();
      onClose();
    } catch (err: any) {
      alert("Errore: " + (err.message || "Errore sconosciuto"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[#FAFAFA] rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-xl pt-3 pb-4 px-6 border-b border-night/[0.06] z-10">
          <div className="w-12 h-1.5 bg-night/10 rounded-full mx-auto mb-4 md:hidden" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-night flex items-center gap-2">
                <UserPlus size={20} className="text-violet-500" />
                Nuovo Appuntamento
              </h3>
              <p className="text-xs text-night/50 mt-0.5">Registra un appuntamento ricevuto al telefono</p>
            </div>
            <button onClick={onClose} className="text-night/40 hover:text-night p-2 rounded-full hover:bg-white transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-night/[0.06]">
            <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-3">Cliente</p>
            <div className="space-y-3">
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Nome cliente *"
                className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-semibold focus:border-night/30 focus:outline-none"
              />
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="Telefono (opzionale)"
                className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-semibold focus:border-night/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-night/[0.06] space-y-3">
            <div>
              <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Servizio</p>
              <select
                value={form.serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-bold focus:border-night/30 focus:outline-none"
              >
                <option value="">Seleziona servizio</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.duration_minutes ? "(" + s.duration_minutes + " min)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Orario</p>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-bold focus:border-night/30 focus:outline-none"
                />
              </div>
              <div>
                <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Durata (min)</p>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 30 })}
                  className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-bold focus:border-night/30 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Stato</p>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-bold focus:border-night/30 focus:outline-none"
              >
                <option value="confirmed">Confermato</option>
                <option value="pending">In attesa</option>
                <option value="completed">Completato</option>
              </select>
            </div>

            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Note (opzionale)"
              className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm focus:border-night/30 focus:outline-none"
            />
          </div>

          <div className="bg-night rounded-2xl p-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-white/10 disabled:text-white/30 text-white py-4 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              Salva Appuntamento
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
