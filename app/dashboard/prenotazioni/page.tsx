"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/dashboard/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Calendar, Clock, CheckCircle2, XCircle,
  RefreshCw, MessageCircle, User, ChevronLeft, ChevronRight, 
  Users, LayoutGrid, ArrowRight, CalendarDays
} from "lucide-react";

type Booking = {
  id: string;
  booking_code: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  party_size: number | null;
  customers: { name: string | null; whatsapp_number: string } | null;
  tables: { table_number: number } | null;
};

const STATUS_CONFIG = {
  pending: { label: "In attesa", color: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-400" },
  confirmed: { label: "Confermato", color: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-500" },
  completed: { label: "Completato", color: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "Annullato", color: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-500" },
};

const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTHS_SHORT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

export default function PrenotazioniPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Genera i prossimi 14 giorni
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

    const { data } = await supabase
      .from("bookings")
      .select("*, customers(name, whatsapp_number), tables(table_number)")
      .eq("tenant_id", link.tenant_id)
      .order("scheduled_at", { ascending: true });

    setBookings((data as unknown as Booking[]) || []);
    setLoading(false);
    setRefreshing(false);
  }, [supabase, router]);

  useEffect(() => { load(true); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    await load(false);
  };

  // Filtra prenotazioni per il giorno selezionato
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const dailyBookings = bookings.filter((b) => b.scheduled_at.split("T")[0] === selectedDateStr);

  // Raggruppa per orario
  const groupedByTime = dailyBookings.reduce((acc: Record<string, Booking[]>, b) => {
    const time = new Date(b.scheduled_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
    if (!acc[time]) acc[time] = [];
    acc[time].push(b);
    return acc;
  }, {});

  const sortedTimes = Object.keys(groupedByTime).sort();

  // KPI Calcoli
  const totalCovers = dailyBookings.reduce((acc, b) => acc + (b.party_size || 0), 0);
  const totalBookings = dailyBookings.length;
  const confirmedBookings = dailyBookings.filter(b => b.status === "confirmed").length;

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-night" size={40} /><p className="mt-4 text-night/50 font-medium">Caricamento agenda...</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-24">
      
      <PageHeader
        title="Agenda Sala"
        subtitle="Gestisci i tavoli e le prenotazioni della giornata."
        breadcrumb={[{ label: "Dashboard" }, { label: "Prenotazioni" }]}
        actions={
          <button onClick={() => load(false)} disabled={refreshing} className="bg-white border border-night/[0.08] hover:border-night/20 text-night px-5 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 transition shadow-sm disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Aggiorna
          </button>
        }
      />

      {/* KPI GIORNALIERI */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-night/[0.06] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0"><CalendarDays className="text-orange-500" size={20} /></div>
          <div><p className="text-[10px] font-bold text-night/40 uppercase tracking-wider">Prenotazioni</p><p className="text-xl font-black text-night">{totalBookings}</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-night/[0.06] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><Users className="text-blue-500" size={20} /></div>
          <div><p className="text-[10px] font-bold text-night/40 uppercase tracking-wider">Coperti</p><p className="text-xl font-black text-night">{totalCovers}</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-night/[0.06] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0"><CheckCircle2 className="text-emerald-500" size={20} /></div>
          <div><p className="text-[10px] font-bold text-night/40 uppercase tracking-wider">Confermati</p><p className="text-xl font-black text-night">{confirmedBookings}</p></div>
        </div>
      </div>

      {/* DATE PICKER ORIZZONTALE */}
      <div className="mb-8 overflow-hidden">
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar snap-x">
          {dateStrip.map((d) => {
            const isSelected = d.toDateString() === selectedDate.toDateString();
            const isToday = d.toDateString() === new Date().toDateString();
            
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(d)}
                className={`relative flex flex-col items-center justify-center min-w-[76px] py-4 rounded-2xl transition-all snap-start shrink-0 border ${
                  isSelected ? "bg-night text-white border-night shadow-xl scale-105" : "bg-white border-night/[0.06] text-night/60 hover:bg-cream/50 hover:border-night/20"
                }`}
              >
                {isToday && !isSelected && <span className="absolute top-2 w-1.5 h-1.5 bg-wa rounded-full"></span>}
                <span className={`text-[11px] font-bold uppercase tracking-widest ${isSelected ? "text-white/60" : "text-night/40"}`}>{DAYS_SHORT[d.getDay()]}</span>
                <span className={`text-2xl font-black my-1 ${isSelected ? "text-white" : "text-night"}`}>{d.getDate()}</span>
                <span className={`text-[10px] font-semibold ${isSelected ? "text-white/50" : "text-night/40"}`}>{MONTHS_SHORT[d.getMonth()]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TIMELINE */}
      {sortedTimes.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-16 text-center shadow-sm border border-night/[0.04]">
          <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center mx-auto mb-6"><Calendar size={40} className="text-night/20" /></div>
          <h2 className="text-xl font-bold text-night mb-2">Nessuna prenotazione</h2>
          <p className="text-night/50">Non ci sono tavoli prenotati per questa data.</p>
        </motion.div>
      ) : (
        <div className="relative border-l-2 border-night/[0.06] ml-4 md:ml-8 space-y-10 pb-10">
          {sortedTimes.map((time) => (
            <div key={time} className="relative pl-6 md:pl-10">
              
              {/* PALLINO TIMELINE */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-night shadow-sm z-10" />
              
              {/* ORARIO */}
              <h3 className="text-2xl font-black text-night mb-4 tracking-tight flex items-baseline gap-2">
                {time}
                <span className="text-xs font-bold text-night/40 uppercase tracking-wider">{groupedByTime[time].length} {groupedByTime[time].length === 1 ? 'prenotazione' : 'prenotazioni'}</span>
              </h3>

              {/* CARDS */}
              <div className="grid md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {groupedByTime[time].map((booking) => {
                    const config = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                    const customerPhone = booking.customers?.whatsapp_number?.replace(/\D/g, "") || "";

                    return (
                      <motion.div
                        key={booking.id}
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl border border-night/[0.06] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group relative"
                      >
                        {/* Header Card */}
                        <div className="flex items-center justify-between p-4 border-b border-night/[0.04] bg-cream/20">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-night text-white flex flex-col items-center justify-center shrink-0">
                              <span className="text-[8px] font-bold uppercase tracking-widest text-white/60">Tav.</span>
                              <span className="text-lg font-black leading-none">{booking.tables?.table_number || "-"}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-night text-base leading-tight">{booking.customers?.name || "Cliente"}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${config.color} inline-flex items-center gap-1 uppercase tracking-wider`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} /> {config.label}
                                </span>
                                <span className="text-[10px] font-bold text-night/50 bg-white border border-night/5 px-1.5 py-0.5 rounded-md flex items-center gap-1"><Users size={10} /> {booking.party_size || 2}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Note */}
                        {booking.notes && (
                          <div className="px-4 py-3 border-b border-night/[0.04] bg-orange-50/50 text-xs text-orange-800 flex items-start gap-2">
                            <span className="shrink-0 mt-0.5">📝</span> <p>{booking.notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="p-3 bg-white flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1">
                            {booking.status !== "cancelled" && booking.status !== "completed" && (
                              <button onClick={() => updateStatus(booking.id, "cancelled")} className="text-red-500 hover:bg-red-50 text-[11px] font-bold px-3 py-2 rounded-lg transition">Annulla</button>
                            )}
                            {customerPhone && (
                              <a href={`https://wa.me/${customerPhone}?text=Ciao!%20Riguardo%20alla%20tua%20prenotazione%20${booking.booking_code}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:bg-emerald-50 text-[11px] font-bold px-3 py-2 rounded-lg transition inline-flex items-center gap-1.5">
                                <MessageCircle size={14} /> Avvisa
                              </a>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {booking.status === "pending" && (
                              <button onClick={() => updateStatus(booking.id, "confirmed")} className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg transition shadow-sm active:scale-95">Conferma</button>
                            )}
                            {booking.status === "confirmed" && (
                              <button onClick={() => updateStatus(booking.id, "completed")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg transition shadow-sm active:scale-95">Completato</button>
                            )}
                          </div>
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
  );
}
