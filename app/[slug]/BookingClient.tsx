"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Clock, CheckCircle2,
  Scissors, ArrowLeft, Sparkles, MapPin, Phone,
  CalendarDays, User, PhoneCall, Loader2, Info, MessageCircle
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  duration_minutes: number | null;
  image_url?: string | null;
};

type Props = {
  tenantName: string;
  tenantAddress?: string | null;
  tenantPhone?: string | null;
  tenantDescription?: string | null;
  whatsappNumber: string;
  services: Service[];
  openingHours: Record<string, string> | null;
  brandColor?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  slug: string;
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTHS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

export default function BookingClient({
  tenantName,
  tenantAddress,
  tenantPhone,
  tenantDescription,
  whatsappNumber,
  services,
  openingHours,
  brandColor = "#8B5CF6",
  logoUrl,
  coverImageUrl,
  slug,
}: Props) {
  const [step, setStep] = useState<"service" | "datetime" | "confirm" | "done">("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [lastBookingSnapshot, setLastBookingSnapshot] = useState<any>(null);

  const [busySlots, setBusySlots] = useState<{ start: string; end: string }[]>([]);
  const [loadingBusy, setLoadingBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {};
    services.forEach((s) => {
      const cat = s.category || "Servizi";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    });
    return grouped;
  }, [services]);

  const availableDays = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayKey = DAY_KEYS[d.getDay()];
      const hours = openingHours?.[dayKey];
      if (hours && hours !== "chiuso") days.push(d);
    }
    return days;
  }, [openingHours]);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;

    async function loadBusy(showLoader = false) {
      if (showLoader) setLoadingBusy(true);
      try {
        const dateStr = selectedDate!.toISOString().split("T")[0];
        const res = await fetch(`/api/google/calendar/busy?slug=${slug}&date=${dateStr}`);
        const data = await res.json();
        if (!cancelled) setBusySlots(data.busy || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setBusySlots([]);
      } finally {
        if (showLoader && !cancelled) setLoadingBusy(false);
      }
    }

    loadBusy(true);
    const interval = setInterval(() => loadBusy(false), 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedDate, slug]);

  const timeSlots = useMemo(() => {
    if (!selectedDate || !selectedService) return [];
    const dayKey = DAY_KEYS[selectedDate.getDay()];
    const hours = openingHours?.[dayKey];
    if (!hours || hours === "chiuso") return [];

    const [start, end] = hours.split("-");
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const duration = selectedService.duration_minutes || 30;
    const slots: { time: string; isBusy: boolean }[] = [];

    const startDate = new Date(selectedDate);
    startDate.setHours(startH, startM, 0, 0);
    const endDate = new Date(selectedDate);
    endDate.setHours(endH, endM, 0, 0);

    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    if (isToday) now.setHours(now.getHours() + 1);

    let current = new Date(startDate);
    while (current.getTime() + duration * 60000 <= endDate.getTime()) {
      if (!isToday || current >= now) {
        const slotStart = current.getTime();
        const slotEnd = slotStart + duration * 60000;
        const isBusy = busySlots.some((busy) => {
          if (!busy.start || !busy.end) return false;
          const busyStart = new Date(busy.start).getTime();
          const busyEnd = new Date(busy.end).getTime();
          if (isNaN(busyStart) || isNaN(busyEnd)) return false;
          return slotStart < busyEnd && slotEnd > busyStart;
        });
        slots.push({
          time: current.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
          isBusy,
        });
      }
      current = new Date(current.getTime() + 30 * 60000);
    }
    return slots;
  }, [selectedDate, selectedService, openingHours, busySlots]);

  const buildBookingWhatsAppUrl = () => {
    if (!lastBookingSnapshot) return "#";
    const lines: string[] = [];
    lines.push(`💇 *Nuova prenotazione - ${tenantName}*`);
    lines.push("");
    lines.push(`🔖 Codice: *${lastBookingSnapshot.code}*`);
    lines.push(`✂️ Servizio: ${lastBookingSnapshot.serviceName}`);
    if (lastBookingSnapshot.duration) lines.push(`⏱️ Durata: ${lastBookingSnapshot.duration} min`);
    if (lastBookingSnapshot.date) {
      const d = lastBookingSnapshot.date;
      lines.push(`📅 Data: ${DAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`);
    }
    if (lastBookingSnapshot.time) lines.push(`⏰ Orario: ${lastBookingSnapshot.time}`);
    lines.push(`💶 Prezzo: €${lastBookingSnapshot.price.toFixed(2)}`);
    lines.push("");
    lines.push(`👤 Nome: ${lastBookingSnapshot.customerName}`);
    lines.push(`📞 Telefono: ${lastBookingSnapshot.customerPhone}`);
    if (lastBookingSnapshot.notes) lines.push(`📝 Note: ${lastBookingSnapshot.notes}`);

    const phone = whatsappNumber.replace(/\s|\+|-/g, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const sendBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const [h, m] = selectedTime.split(":").map(Number);
      const dt = new Date(selectedDate);
      dt.setHours(h, m, 0, 0);

      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          customerName,
          customerPhone,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          price: Number(selectedService.price),
          durationMinutes: selectedService.duration_minutes,
          scheduledAt: dt.toISOString(),
          bookingType: "appointment",
          notes,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setSubmitError(data.message || "Questo orario è appena stato prenotato. Scegline un altro.");
        setSubmitting(false);
        const dateStr = selectedDate.toISOString().split("T")[0];
        const busyRes = await fetch(`/api/google/calendar/busy?slug=${slug}&date=${dateStr}`);
        const busyData = await busyRes.json();
        setBusySlots(busyData.busy || []);
        setSelectedTime(null);
        setStep("datetime");
        return;
      }

      if (!res.ok) {
        setSubmitError(data.error || "Errore durante la prenotazione. Riprova.");
        setSubmitting(false);
        return;
      }

      setBookingCode(data.booking?.booking_code || "PRENOTAZIONE");
      setLastBookingSnapshot({
        code: data.booking?.booking_code || "PRENOTAZIONE",
        serviceName: selectedService.name,
        price: Number(selectedService.price),
        duration: selectedService.duration_minutes,
        date: selectedDate,
        time: selectedTime,
        customerName,
        customerPhone,
        notes,
      });
      setStep("done");
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitError("Errore di connessione. Riprova.");
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === "datetime") setStep("service");
    if (step === "confirm") setStep("datetime");
  };

  const stepIndex = step === "service" ? 0 : step === "datetime" ? 1 : step === "confirm" ? 2 : 3;

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      {/* HERO */}
      <div className="relative h-52 md:h-64 overflow-hidden">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt={tenantName} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}DD 50%, ${brandColor}88 100%)` }}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-6 right-6 w-40 h-40 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-white blur-3xl" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {step !== "service" && step !== "done" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={goBack}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-lg active:scale-95 transition z-10"
          >
            <ArrowLeft size={20} className="text-night" />
          </motion.button>
        )}

        <button
          onClick={() => setInfoOpen(true)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-lg active:scale-95 transition z-10"
        >
          <Info size={18} className="text-night" />
        </button>

        <div className="absolute bottom-4 left-4">
          <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white text-[11px] font-semibold">Aperto ora</span>
          </div>
        </div>
      </div>

      {/* CARD ATTIVITÀ */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Logo centrato dentro la card */}
          <div className="flex flex-col items-center pt-6 pb-4">
            <div className="mb-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={tenantName}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-2xl"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl ring-4 ring-white shadow-2xl"
                  style={{ backgroundColor: brandColor }}
                >
                  {tenantName.charAt(0)}
                </div>
              )}
            </div>
            <h1 className="text-lg font-bold text-night text-center px-4 leading-tight">
              {tenantName}
            </h1>
            {tenantAddress && (
              <p className="text-xs text-gray-500 mt-1 text-center px-4 flex items-center justify-center gap-1">
                <MapPin size={11} /> {tenantAddress}
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 border-t border-gray-100">
            {tenantPhone && (
              <a
                href={`tel:${tenantPhone}`}
                className="py-3.5 flex items-center justify-center gap-2 text-xs font-bold text-night active:bg-soft transition border-r border-gray-100"
              >
                <Phone size={14} style={{ color: brandColor }} />
                Chiama
              </a>
            )}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\s|\+|-/g, "")}?text=Ciao!%20Vorrei%20informazioni`}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-3.5 flex items-center justify-center gap-2 text-xs font-bold text-night active:bg-soft transition ${!tenantPhone ? "col-span-2" : ""}`}
            >
              <MessageCircle size={14} style={{ color: brandColor }} />
              WhatsApp
            </a>
          </div>

          {/* Progress */}
          {step !== "done" && (
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                {[
                  { n: 0, label: "Servizio" },
                  { n: 1, label: "Data e ora" },
                  { n: 2, label: "Conferma" },
                ].map((s) => {
                  const active = stepIndex === s.n;
                  const completed = stepIndex > s.n;
                  return (
                    <div key={s.n} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="h-1 w-full rounded-full transition-all"
                        style={{
                          backgroundColor: active || completed ? brandColor : "#E5E7EB",
                        }}
                      />
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          active ? "" : "text-gray-400"
                        }`}
                        style={active ? { color: brandColor } : undefined}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* CONTENUTO */}
      <div className="max-w-3xl mx-auto px-4 mt-5">
        <AnimatePresence mode="wait">
          {step === "service" && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-5">
                <h2 className="text-xl font-bold text-night">Cosa vuoi prenotare?</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Scegli il servizio che preferisci
                </p>
              </div>

              {Object.entries(servicesByCategory).map(([category, items], catIdx) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIdx * 0.05 }}
                  className="mb-7"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-night">{category}</h3>
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                      {items.length} {items.length === 1 ? "servizio" : "servizi"}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {items.map((item, idx) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedService(item);
                          setStep("datetime");
                        }}
                        className="w-full bg-white rounded-2xl p-3 flex gap-3 shadow-sm hover:shadow-md transition-shadow text-left"
                      >
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-20 h-20 rounded-xl object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-night text-[15px] leading-snug">
                              {item.name}
                            </h4>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-night text-base">
                                €{Number(item.price).toFixed(2)}
                              </p>
                              {item.duration_minutes && (
                                <span className="text-[10px] text-gray-500 flex items-center gap-1 bg-soft px-2 py-0.5 rounded-full font-semibold">
                                  <Clock size={10} /> {item.duration_minutes} min
                                </span>
                              )}
                            </div>
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: brandColor }}
                            >
                              <ChevronRight size={18} />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {step === "datetime" && selectedService && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="rounded-2xl p-3 mb-5 flex items-center gap-3 shadow-sm"
                style={{
                  backgroundColor: `${brandColor}10`,
                  border: `1px solid ${brandColor}30`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: brandColor }}
                >
                  <Scissors size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-night text-sm truncate">
                    {selectedService.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    €{Number(selectedService.price).toFixed(2)} ·{" "}
                    {selectedService.duration_minutes} min
                  </p>
                </div>
                <button
                  onClick={() => setStep("service")}
                  className="text-xs font-bold shrink-0 px-3 py-1.5 rounded-full"
                  style={{ color: brandColor, backgroundColor: `${brandColor}15` }}
                >
                  Cambia
                </button>
              </div>

              <h2 className="text-xl font-bold text-night mb-3">Scegli il giorno</h2>

              <div className="scroll-x flex gap-2 pb-2 mb-5 -mx-1 px-1">
                {availableDays.map((d) => {
                  const active = selectedDate?.toDateString() === d.toDateString();
                  return (
                    <motion.button
                      key={d.toISOString()}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedDate(d);
                        setSelectedTime(null);
                      }}
                      className={`min-w-[60px] py-3 rounded-2xl flex flex-col items-center transition shrink-0 ${
                        active ? "text-white shadow-md" : "bg-white text-night"
                      }`}
                      style={
                        active
                          ? { backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }
                          : undefined
                      }
                    >
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          active ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {DAY_SHORT[d.getDay()]}
                      </span>
                      <span className="text-lg font-bold mt-0.5">{d.getDate()}</span>
                      <span className={`text-[9px] ${active ? "text-white/70" : "text-gray-400"}`}>
                        {MONTHS[d.getMonth()].slice(0, 3)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {selectedDate && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-night">Scegli l&apos;orario</h2>
                    {loadingBusy && (
                      <Loader2 className="animate-spin text-gray-400" size={16} />
                    )}
                  </div>

                  {timeSlots.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center text-gray-500 text-sm shadow-sm">
                      <Sparkles size={24} className="mx-auto mb-2 text-gray-300" />
                      Nessun orario disponibile per questo giorno
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map((slot) => {
                        const active = selectedTime === slot.time;
                        const disabled = slot.isBusy;
                        return (
                          <motion.button
                            key={slot.time}
                            whileTap={{ scale: disabled ? 1 : 0.95 }}
                            disabled={disabled}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`py-3 rounded-xl text-sm font-bold transition ${
                              disabled
                                ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                                : active
                                ? "text-white shadow-md"
                                : "bg-white text-night shadow-sm active:bg-soft"
                            }`}
                            style={
                              active && !disabled
                                ? {
                                    backgroundColor: brandColor,
                                    boxShadow: `0 4px 12px ${brandColor}40`,
                                  }
                                : undefined
                            }
                          >
                            {slot.time}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {timeSlots.some((s) => s.isBusy) && (
                    <p className="text-[11px] text-gray-400 mt-3 text-center">
                      Gli orari barrati sono già occupati
                    </p>
                  )}
                </motion.div>
              )}

              <button
                onClick={() => setStep("confirm")}
                disabled={!selectedDate || !selectedTime}
                className="w-full mt-6 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition active:scale-[0.98]"
                style={
                  !selectedDate || !selectedTime
                    ? undefined
                    : { backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }
                }
              >
                Continua
              </button>
            </motion.div>
          )}

          {step === "confirm" && selectedService && selectedDate && selectedTime && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-night mb-5">I tuoi dati</h2>

              <div
                className="rounded-2xl p-4 mb-5 text-white shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-2">
                  Riepilogo
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-80">Servizio</span>
                    <span className="font-semibold text-right">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Data</span>
                    <span className="font-semibold">
                      {DAY_LABELS[selectedDate.getDay()].slice(0, 3)} {selectedDate.getDate()}{" "}
                      {MONTHS[selectedDate.getMonth()].slice(0, 3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Orario</span>
                    <span className="font-semibold">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/20 mt-2">
                    <span className="opacity-80">Prezzo</span>
                    <span className="font-bold text-lg">
                      €{Number(selectedService.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3 mb-5">
                <label className="block">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User size={12} /> Il tuo nome
                  </span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Mario Rossi"
                    className="w-full bg-transparent border-0 text-base font-semibold text-night placeholder-gray-300 focus:outline-none p-0"
                  />
                </label>
                <div className="border-t border-gray-100 pt-3">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <PhoneCall size={12} /> Telefono
                    </span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+39 333 1234567"
                      className="w-full bg-transparent border-0 text-base font-semibold text-night placeholder-gray-300 focus:outline-none p-0"
                    />
                  </label>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                      Note (opzionale)
                    </span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Es. capelli molto lunghi..."
                      rows={2}
                      className="w-full bg-transparent border-0 text-sm text-night placeholder-gray-300 focus:outline-none p-0 resize-none"
                    />
                  </label>
                </div>
              </div>

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm mb-4 flex items-start gap-2"
                >
                  <span>⚠️</span>
                  <span>{submitError}</span>
                </motion.div>
              )}

              <button
                onClick={sendBooking}
                disabled={!customerName || !customerPhone || submitting}
                className="w-full disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition active:scale-[0.98] flex items-center justify-center gap-2"
                style={
                  !customerName || !customerPhone || submitting
                    ? undefined
                    : { backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }
                }
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                    Verifica disponibilità...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Conferma prenotazione
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Riceverai il codice di prenotazione per confermare su WhatsApp
              </p>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.1 }}
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: `${brandColor}15` }}
              >
                <CheckCircle2 size={52} style={{ color: brandColor }} />
              </motion.div>
              <h2 className="text-2xl font-bold text-night mb-2">
                Prenotazione confermata!
              </h2>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto text-sm">
                Grazie {customerName}! Ti aspettiamo{" "}
                <strong className="text-night">
                  {selectedDate && DAY_LABELS[selectedDate.getDay()].toLowerCase()}{" "}
                  {selectedDate?.getDate()}{" "}
                  {selectedDate && MONTHS[selectedDate.getMonth()].toLowerCase()}
                </strong>{" "}
                alle <strong className="text-night">{selectedTime}</strong>
              </p>

              {bookingCode && (
                <div className="bg-soft rounded-2xl p-4 mb-6 max-w-sm mx-auto">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                    Codice prenotazione
                  </p>
                  <p className="font-mono text-lg font-bold text-night">
                    {bookingCode}
                  </p>
                </div>
              )}

              <div
                className="rounded-2xl p-4 mb-6 max-w-sm mx-auto text-sm"
                style={{ backgroundColor: `${brandColor}10`, border: `1px solid ${brandColor}30` }}
              >
                <p className="text-night font-semibold mb-1">
                  📲 Ultimo passaggio
                </p>
                <p className="text-gray-600 text-xs">
                  Clicca il pulsante qui sotto per inviare la prenotazione su WhatsApp.
                </p>
              </div>

              <a
                href={buildBookingWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-white py-4 rounded-2xl font-bold transition active:scale-95 flex items-center justify-center gap-2 mb-3 max-w-sm mx-auto"
                style={{ backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}
              >
                <MessageCircle size={20} />
                Invia prenotazione su WhatsApp
              </a>

              <button
                onClick={() => {
                  setStep("service");
                  setSelectedService(null);
                  setSelectedDate(null);
                  setSelectedTime(null);
                  setCustomerName("");
                  setCustomerPhone("");
                  setNotes("");
                  setBookingCode(null);
                  setLastBookingSnapshot(null);
                }}
                className="text-night px-8 py-3.5 rounded-2xl font-bold transition active:scale-95 bg-soft max-w-sm mx-auto block w-full"
              >
                Prenota un altro servizio
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INFO MODAL */}
      <AnimatePresence>
        {infoOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => setInfoOpen(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#F5F5F7] rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-[#F5F5F7] pt-3 pb-4 px-6 border-b border-gray-200/50 z-10">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-night">Informazioni</h3>
                  <button
                    onClick={() => setInfoOpen(false)}
                    className="text-gray-500 p-2 hover:bg-white rounded-full transition"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {tenantDescription && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-night mb-2">Chi siamo</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {tenantDescription}
                    </p>
                  </div>
                )}

                {openingHours && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={16} style={{ color: brandColor }} />
                      <h3 className="text-sm font-bold text-night">Orari</h3>
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(openingHours).map(([day, hours]) => {
                        const isToday = DAY_KEYS[new Date().getDay()] === day;
                        return (
                          <div
                            key={day}
                            className={`flex justify-between items-center text-sm py-1 px-2 rounded-lg ${
                              isToday ? "bg-soft font-bold" : ""
                            }`}
                          >
                            <span className="text-xs uppercase font-semibold text-gray-500">
                              {day}
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                hours === "chiuso" ? "text-red-400" : "text-gray-700"
                              }`}
                            >
                              {hours}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(tenantAddress || tenantPhone) && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-night mb-3">Contatti</h3>
                    {tenantAddress && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(tenantAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 mb-3 active:bg-soft rounded-lg p-2 -m-2 transition"
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${brandColor}15` }}
                        >
                          <MapPin size={16} style={{ color: brandColor }} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Indirizzo</p>
                          <p className="text-sm text-night font-semibold">
                            {tenantAddress}
                          </p>
                        </div>
                      </a>
                    )}
                    {tenantPhone && (
                      <a
                        href={`tel:${tenantPhone}`}
                        className="flex items-start gap-3 active:bg-soft rounded-lg p-2 -m-2 transition"
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${brandColor}15` }}
                        >
                          <Phone size={16} style={{ color: brandColor }} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Telefono</p>
                          <p className="text-sm text-night font-semibold">
                            {tenantPhone}
                          </p>
                        </div>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
