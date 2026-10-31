"use client";

import { ChevronLeft, ChevronRight, Clock, CheckCircle2, ArrowRight, MessageCircle, Calendar } from "lucide-react";

type Appointment = {
  id: string;
  booking_code: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  duration_minutes: number | null;
  customers: { name: string | null; whatsapp_number: string | null } | null;
};

type StaffInfo = {
  id: string;
  name: string;
  color: string;
  tenants: { business_name: string; slug: string } | null;
};

const STATUS_CONFIG: Record<string, { label: string; accent: string; bg: string; text: string }> = {
  pending: { label: "In attesa", accent: "#EAB308", bg: "#FEF9C3", text: "#854D0E" },
  confirmed: { label: "Confermato", accent: "#3B82F6", bg: "#DBEAFE", text: "#1E40AF" },
  completed: { label: "Completato", accent: "#10B981", bg: "#DCFCE7", text: "#166534" },
  cancelled: { label: "Annullato", accent: "#EF4444", bg: "#FEE2E2", text: "#991B1B" },
};

const DAY_NAMES = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

type Props = {
  staffInfo: StaffInfo;
  weekStart: Date;
  appointments: Appointment[];
  onPrev: () => void;
  onNext: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDayClick?: (date: Date) => void;
};

export default function WeekView({ staffInfo, weekStart, appointments, onPrev, onNext, onUpdateStatus, onDayClick }: Props) {
  // Costruisci array dei 7 giorni
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  // Raggruppa appuntamenti per giorno (chiave: YYYY-MM-DD in Rome)
  const byDay: Record<string, Appointment[]> = {};
  for (const app of appointments) {
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date(app.scheduled_at));
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(app);
  }
  for (const k of Object.keys(byDay)) {
    byDay[k].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  }

  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());

  // Label settimana
  const rangeLabel = `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]} — ${days[6].getDate()} ${MONTHS[days[6].getMonth()]}`;

  return (
    <div className="bg-white rounded-2xl border border-night/[0.06] shadow-sm overflow-hidden">
      {/* HEADER: settimana + frecce */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-night/[0.06] bg-[#FAFBFC]">
        <button
          onClick={onPrev}
          className="w-9 h-9 rounded-full hover:bg-white hover:shadow-sm flex items-center justify-center text-night/60 transition"
          aria-label="Settimana precedente"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-night/40">Settimana</p>
          <p className="text-sm font-bold text-night">{rangeLabel}</p>
        </div>
        <button
          onClick={onNext}
          className="w-9 h-9 rounded-full hover:bg-white hover:shadow-sm flex items-center justify-center text-night/60 transition"
          aria-label="Settimana successiva"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* GRIGLIA 7 GIORNI — scroll orizzontale su mobile */}
      <div className="overflow-x-auto">
        <div className="flex min-w-full" style={{ minWidth: "900px" }}>
          {days.map((day, idx) => {
            const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(day);
            const dayApps = byDay[key] || [];
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={`flex-1 min-w-[128px] border-r border-night/[0.04] last:border-r-0 ${isToday ? "bg-[#25D366]/[0.04]" : ""}`}
              >
                {/* Header giorno */}
                <button
                  onClick={() => onDayClick?.(day)}
                  className={`w-full px-2 py-3 text-center border-b border-night/[0.06] transition hover:bg-white ${isToday ? "bg-[#25D366]/10" : "bg-[#FAFBFC]"}`}
                >
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isToday ? "text-[#128C7E]" : "text-night/40"}`}>
                    {DAY_NAMES[idx]}
                  </p>
                  <p className={`text-lg font-black mt-0.5 ${isToday ? "text-[#128C7E]" : "text-night"}`}>
                    {day.getDate()}
                  </p>
                </button>

                {/* Appuntamenti del giorno */}
                <div className="p-2 space-y-2 min-h-[300px]">
                  {dayApps.length === 0 ? (
                    <p className="text-[10px] text-night/30 text-center pt-4">—</p>
                  ) : (
                    dayApps.map((app) => {
                      const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                      const time = new Date(app.scheduled_at).toLocaleTimeString("it-IT", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Rome",
                      });
                      const phone = app.customers?.whatsapp_number?.replace(/\D/g, "") || "";
                      return (
                        <div
                          key={app.id}
                          className="rounded-lg border overflow-hidden bg-white hover:shadow-md transition"
                          style={{ borderColor: config.accent + "40" }}
                        >
                          <div className="h-1" style={{ backgroundColor: config.accent }} />
                          <div className="p-2">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[11px] font-black text-night">{time}</span>
                              <span className="text-[8px] font-black uppercase" style={{ color: config.text }}>
                                {config.label}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold text-night truncate">
                              {app.customers?.name || "Cliente"}
                            </p>
                            {app.duration_minutes && (
                              <p className="text-[9px] text-night/50 flex items-center gap-0.5 mt-0.5">
                                <Clock size={8} /> {app.duration_minutes} min
                              </p>
                            )}
                            {/* Azioni rapide */}
                            <div className="flex items-center gap-1 mt-2">
                              {app.status === "pending" && (
                                <button
                                  onClick={() => onUpdateStatus(app.id, "confirmed")}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black py-1 rounded"
                                >
                                  Conferma
                                </button>
                              )}
                              {app.status === "confirmed" && (
                                <button
                                  onClick={() => onUpdateStatus(app.id, "completed")}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black py-1 rounded"
                                >
                                  Completa
                                </button>
                              )}
                              {phone && (
                                <a
                                  href={`https://wa.me/${phone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1 rounded"
                                  aria-label="WhatsApp"
                                >
                                  <MessageCircle size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hint mobile */}
      <div className="md:hidden px-4 py-2 border-t border-night/[0.04] bg-[#FAFBFC]">
        <p className="text-[10px] text-night/40 text-center">← scorri per vedere gli altri giorni →</p>
      </div>
    </div>
  );
}
