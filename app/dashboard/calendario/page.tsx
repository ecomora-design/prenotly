"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, ChevronLeft, ChevronRight, Plus, X, Ban,
  Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2,
  Scissors, Trash2
} from "lucide-react";

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTHS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

type Event = {
  id: string;
  summary: string;
  start: string;
  end: string;
  colorId?: string;
  isBlocked: boolean;
  isBooking: boolean;
};

export default function CalendarioPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  const [blockForm, setBlockForm] = useState({
    startTime: "09:00",
    endTime: "13:00",
    reason: "Chiusura",
  });

  const [saving, setSaving] = useState(false);

  // Genera griglia mese
  const monthGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentDate]);

  async function loadEvents() {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month, 1).toISOString().split("T")[0];
      const end = new Date(year, month + 1, 0).toISOString().split("T")[0];

      const res = await fetch(`/api/google/calendar/list?start=${start}&end=${end}`);
      const data = await res.json();
      setEvents(data.events || []);
      setGoogleConnected(data.google_connected);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      await loadEvents();
    }
    init();
  }, [currentDate]);

  const eventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((e) => e.start.startsWith(dateStr));
  };

  const handleBlock = async () => {
    if (!selectedDate) return;
    setSaving(true);

    const dateStr = selectedDate.toISOString().split("T")[0];

    try {
      const res = await fetch("/api/google/calendar/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          startTime: blockForm.startTime,
          endTime: blockForm.endTime,
          reason: blockForm.reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBlockModalOpen(false);
        await loadEvents();
      } else {
        alert(data.error || "Errore");
      }
    } catch (err) {
      console.error(err);
      alert("Errore di connessione");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, summary: string) => {
    const isBooking = summary.startsWith("💇");
    const msg = isBooking
      ? "Eliminare questa prenotazione dal calendario?"
      : "Sbloccare questa fascia oraria?";
    if (!confirm(msg)) return;

    try {
      const res = await fetch("/api/google/calendar/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (data.success) await loadEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  if (loading && !googleConnected) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">Calendario</h1>
        <p className="text-gray-500 text-sm">
          Gestisci appuntamenti e disponibilità
        </p>
      </div>

      {!googleConnected && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-bold text-night mb-1">Google Calendar non collegato</p>
            <p className="text-sm text-gray-600 mb-3">
              Collega il tuo calendario per gestire disponibilità e appuntamenti in automatico.
            </p>
            <a
              href="/dashboard/impostazioni"
              className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition"
            >
              Vai a Impostazioni
            </a>
          </div>
        </div>
      )}

      {/* Header mese */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-10 h-10 rounded-xl hover:bg-soft flex items-center justify-center transition">
            <ChevronLeft size={20} className="text-night" />
          </button>
          <h2 className="text-lg font-bold text-night">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="w-10 h-10 rounded-xl hover:bg-soft flex items-center justify-center transition">
            <ChevronRight size={20} className="text-night" />
          </button>
        </div>

        {/* Giorni settimana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_SHORT.map((d) => (
            <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Griglia giorni */}
        <div className="grid grid-cols-7 gap-1">
          {monthGrid.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />;

            const dayEvents = eventsForDay(day);
            const bookings = dayEvents.filter((e) => e.isBooking).length;
            const blocked = dayEvents.filter((e) => e.isBlocked).length;
            const today = isToday(day);

            return (
              <button
                key={i}
                onClick={() => { setSelectedDate(day); setBlockModalOpen(true); }}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition relative ${
                  today
                    ? "bg-wa/10 border-2 border-wa"
                    : "hover:bg-soft border-2 border-transparent"
                }`}
              >
                <span className={`text-sm font-semibold ${today ? "text-waDark" : "text-night"}`}>
                  {day.getDate()}
                </span>
                <div className="flex gap-0.5">
                  {bookings > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-wa" title={`${bookings} prenotazioni`} />
                  )}
                  {blocked > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" title={`${blocked} blocchi`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-wa" />
            Prenotazione
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            Orario bloccato
          </div>
        </div>
      </div>

      {/* Lista eventi del mese */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-night mb-4 flex items-center gap-2">
          <CalendarIcon size={18} className="text-wa" />
          Eventi di questo mese
        </h3>

        {events.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            Nessun evento in questo mese
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((ev) => {
              const start = new Date(ev.start);
              const end = new Date(ev.end);
              return (
                <div
                  key={ev.id}
                  className={`rounded-xl p-3 flex items-center justify-between gap-3 ${
                    ev.isBlocked ? "bg-red-50 border border-red-100" : "bg-wa/5 border border-wa/20"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      ev.isBlocked ? "bg-red-500 text-white" : "bg-wa text-white"
                    }`}>
                      {ev.isBlocked ? <Ban size={18} /> : <Scissors size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-night text-sm truncate">
                        {ev.summary?.replace("💇 ", "").replace("🚫 ", "")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {start.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })} ·{" "}
                        {start.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })} -{" "}
                        {end.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(ev.id, ev.summary)}
                    className={`p-2 rounded-full transition shrink-0 ${
                      ev.isBlocked ? "hover:bg-red-100 text-red-500" : "hover:bg-wa/10 text-waDark"
                    }`}
                    title={ev.isBlocked ? "Sblocca" : "Annulla prenotazione"}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL BLOCCA / VISUALIZZA */}
      {blockModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center">
          <div className="bg-white rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 md:p-8">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-night">
                  {DAY_SHORT[selectedDate.getDay()]} {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {eventsForDay(selectedDate).length} eventi
                </p>
              </div>
              <button
                onClick={() => setBlockModalOpen(false)}
                className="text-gray-500 p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={22} />
              </button>
            </div>

            {/* Eventi del giorno */}
            {eventsForDay(selectedDate).length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Eventi del giorno
                </p>
                {eventsForDay(selectedDate).map((ev) => {
                  const start = new Date(ev.start);
                  const end = new Date(ev.end);
                  return (
                    <div
                      key={ev.id}
                      className={`rounded-xl p-3 flex items-center justify-between gap-3 ${
                        ev.isBlocked ? "bg-red-50" : "bg-wa/5"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-night text-sm truncate">
                          {ev.summary?.replace("💇 ", "").replace("🚫 ", "")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {start.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {end.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(ev.id, ev.summary)}
                        className="p-2 rounded-full text-red-500 hover:bg-red-100 transition shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Form blocco */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-bold text-night mb-3 flex items-center gap-2">
                <Ban size={16} className="text-red-500" />
                Blocca una fascia oraria
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500 mb-1.5 block">Dalle</span>
                  <input
                    type="time"
                    value={blockForm.startTime}
                    onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-wa focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500 mb-1.5 block">Alle</span>
                  <input
                    type="time"
                    value={blockForm.endTime}
                    onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-wa focus:outline-none"
                  />
                </label>
              </div>

              <label className="block mb-5">
                <span className="text-xs font-semibold text-gray-500 mb-1.5 block">Motivo (opzionale)</span>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder="Es. pausa pranzo, formazione, chiusura"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-wa focus:outline-none"
                />
              </label>

              <button
                onClick={handleBlock}
                disabled={saving || !googleConnected}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Blocco in corso...
                  </>
                ) : (
                  <>
                    <Ban size={18} />
                    Blocca questa fascia
                  </>
                )}
              </button>

              {!googleConnected && (
                <p className="text-xs text-red-500 text-center mt-3">
                  Devi prima collegare Google Calendar
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
