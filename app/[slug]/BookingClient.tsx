"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Phone, MessageCircle, ChevronRight,
  CheckCircle2, MapPin, Scissors, Sunrise, Sun, Sunset,
  ArrowRight, Calendar as CalendarIcon
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number | null;
  price: number;
  image_url: string | null;
};

type Props = {
  tenantName: string;
  tenantAddress: string | null;
  tenantPhone: string | null;
  tenantDescription: string | null;
  whatsappNumber: string;
  services: Service[];
  openingHours: Record<string, string> | null;
  brandColor: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  slug: string;
};

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTH_SHORT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export default function BookingClient({
  tenantName, tenantAddress, tenantPhone, tenantDescription,
  whatsappNumber, services, openingHours, brandColor, logoUrl, slug
}: Props) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateStrip = useMemo(() => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const selectedDayHours = openingHours?.[DAY_KEYS[selectedDate.getDay()]];

  const timeSlots = useMemo(() => {
    if (!selectedService) return [];
    const hours = openingHours?.[DAY_KEYS[selectedDate.getDay()]];
    if (!hours || hours === "chiuso" || hours.trim() === "") return [];
    const shifts = hours.split(",").map(s => s.trim()).filter(Boolean);
    const slots: string[] = [];
    const duration = selectedService.duration_minutes || 30;
    shifts.forEach(shift => {
      const [start, end] = shift.split("-");
      if (!start || !end) return;
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      if (isNaN(sh) || isNaN(eh)) return;
      const startMin = sh * 60 + (sm || 0);
      const endMin = eh * 60 + (em || 0);
      for (let m = startMin; m + duration <= endMin; m += duration) {
        const h = Math.floor(m / 60);
        const mm = m % 60;
        slots.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
      }
    });
    return slots;
  }, [selectedService, selectedDate, openingHours]);

  const groupedSlots = useMemo(() => {
    const groups = [
      { label: "Mattina", icon: Sunrise, slots: [] as string[] },
      { label: "Pomeriggio", icon: Sun, slots: [] as string[] },
      { label: "Sera", icon: Sunset, slots: [] as string[] },
    ];
    timeSlots.forEach(slot => {
      const h = parseInt(slot.split(":")[0]);
      if (h < 12) groups[0].slots.push(slot);
      else if (h < 17) groups[1].slots.push(slot);
      else groups[2].slots.push(slot);
    });
    return groups.filter(g => g.slots.length > 0);
  }, [timeSlots]);

  const handleBook = async () => {
    if (!selectedService || !selectedTime || !customerName || !customerPhone) return;
    setSubmitting(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const scheduledAt = new Date(`${dateStr}T${selectedTime}:00`).toISOString();
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          customerName,
          customerPhone,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          price: selectedService.price,
          durationMinutes: selectedService.duration_minutes || 30,
          scheduledAt,
          bookingType: "appointment",
          notes,
        }),
      });
      if (!res.ok) throw new Error("Errore durante la prenotazione");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Errore sconosciuto");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF7F3] via-[#FFFDFB] to-[#F0E6D8] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12 }}
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-8"
            style={{ backgroundColor: brandColor + "20", border: `2px solid ${brandColor}` }}
          >
            <CheckCircle2 size={48} style={{ color: brandColor }} strokeWidth={2.5} />
          </motion.div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: brandColor }}>Prenotazione confermata</p>
          <h1 className="text-3xl font-serif text-night mb-3">Ti aspettiamo!</h1>
          <p className="text-night/60 text-sm mb-8">
            Il tuo appuntamento da <strong className="text-night">{tenantName}</strong> è confermato.
          </p>
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-night/[0.06] text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: brandColor + "15" }}>
                <Scissors size={18} style={{ color: brandColor }} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-night/40">Servizio</p>
                <p className="text-sm font-bold text-night">{selectedService?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: brandColor + "15" }}>
                <CalendarIcon size={18} style={{ color: brandColor }} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-night/40">Data</p>
                <p className="text-sm font-bold text-night">{selectedDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: brandColor + "15" }}>
                <Clock size={18} style={{ color: brandColor }} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-night/40">Orario</p>
                <p className="text-sm font-bold text-night">{selectedTime}</p>
              </div>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="mt-6 w-full text-white py-4 rounded-2xl font-black text-sm transition active:scale-95" style={{ backgroundColor: brandColor }}>
            Torna alla Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F3] via-[#FFFDFB] to-[#F0E6D8] relative overflow-hidden pb-20">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: brandColor }} />
      <div className="absolute bottom-40 left-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ backgroundColor: brandColor }} />

      <div className="relative z-10 max-w-lg mx-auto px-4">
        
        {/* HERO */}
        <div className="pt-10 pb-8 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative inline-block mb-5"
          >
            <div className="absolute inset-0 rounded-[32px] blur-2xl opacity-40" style={{ backgroundColor: brandColor }} />
            {logoUrl ? (
              <img src={logoUrl} alt={tenantName} className="relative w-24 h-24 rounded-[32px] object-cover ring-4 ring-white shadow-xl" />
            ) : (
              <div className="relative w-24 h-24 rounded-[32px] flex items-center justify-center text-white font-serif text-4xl ring-4 ring-white shadow-xl" style={{ backgroundColor: brandColor }}>
                {tenantName.charAt(0)}
              </div>
            )}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl md:text-4xl font-serif text-night mb-2 tracking-tight"
          >
            {tenantName}
          </motion.h1>
          
          {tenantDescription && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-night/50 text-sm max-w-sm mx-auto mb-4"
            >
              {tenantDescription}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-center gap-2 flex-wrap"
          >
            {tenantPhone && (
              <a href={`tel:${tenantPhone}`} className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur border border-night/[0.06] text-night/70 px-3 py-1.5 rounded-full text-[11px] font-bold hover:bg-white transition shadow-sm">
                <Phone size={11} /> Chiama
              </a>
            )}
            <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`} className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur border border-night/[0.06] text-night/70 px-3 py-1.5 rounded-full text-[11px] font-bold hover:bg-white transition shadow-sm">
              <MessageCircle size={11} /> WhatsApp
            </a>
            {tenantAddress && (
              <a href={`https://maps.google.com/?q=${encodeURIComponent(tenantAddress)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur border border-night/[0.06] text-night/70 px-3 py-1.5 rounded-full text-[11px] font-bold hover:bg-white transition shadow-sm">
                <MapPin size={11} /> Dove siamo
              </a>
            )}
          </motion.div>
        </div>

        {/* PROGRESS */}
        <div className="mb-10 flex items-center justify-center gap-1">
          {[1, 2, 3].map((n, i) => (
            <div key={n} className="flex items-center">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step >= n ? "text-white" : "bg-white text-night/30 border border-night/[0.06]"
                }`}
                style={step >= n ? { backgroundColor: brandColor, ...(step === n ? { boxShadow: `0 0 0 4px ${brandColor}20` } : {}) } : undefined}
              >
                {step > n ? <CheckCircle2 size={16} /> : n}
              </div>
              {i < 2 && (
                <div className={`w-16 md:w-24 h-0.5 mx-1 transition-colors ${step > n ? "" : "bg-night/[0.08]"}`} style={step > n ? { backgroundColor: brandColor } : undefined} />
              )}
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-night mb-1">Cosa desideri?</h2>
                <p className="text-night/50 text-sm">Scegli il servizio che preferisci</p>
              </div>

              <div className="space-y-3">
                {services.map((s, idx) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { setSelectedService(s); setStep(2); }}
                    className="w-full text-left bg-white rounded-2xl p-4 border border-night/[0.06] hover:border-night/20 hover:shadow-lg transition-all group flex items-center gap-4"
                  >
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: brandColor + "12" }}>
                        <Scissors size={24} style={{ color: brandColor }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-night text-base leading-tight truncate mb-1">{s.name}</h3>
                      {s.description && (
                        <p className="text-xs text-night/50 line-clamp-1 mb-1">{s.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs">
                        {s.duration_minutes && (
                          <span className="inline-flex items-center gap-1 text-night/50 font-semibold">
                            <Clock size={11} /> {s.duration_minutes} min
                          </span>
                        )}
                        <span className="font-black text-night">€{Number(s.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-night/20 group-hover:text-night group-hover:translate-x-1 transition shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && selectedService && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="bg-white rounded-2xl p-3 border border-night/[0.06] flex items-center gap-3 mb-6 shadow-sm">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: brandColor + "15" }}>
                  <Scissors size={16} style={{ color: brandColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-night/40 uppercase tracking-widest">Servizio scelto</p>
                  <p className="text-sm font-bold text-night truncate">{selectedService.name}</p>
                </div>
                <button onClick={() => { setStep(1); setSelectedTime(null); }} className="text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-night/5 transition" style={{ color: brandColor }}>
                  Cambia
                </button>
              </div>

              <div className="mb-4">
                <h2 className="text-2xl font-serif text-night mb-1">Quando vuoi venire?</h2>
                <p className="text-night/50 text-sm">Scegli data e orario</p>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-3">Il giorno</p>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {dateStrip.map((d) => {
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    return (
                      <button
                        key={d.toISOString()}
                        onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                        className={`min-w-[64px] py-3 rounded-2xl flex flex-col items-center transition-all shrink-0 border-2 ${
                          isSelected 
                            ? "text-white shadow-md scale-105 border-transparent" 
                            : "bg-white border-night/[0.06] text-night hover:border-night/20"
                        }`}
                        style={isSelected ? { backgroundColor: brandColor } : undefined}
                      >
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? "opacity-70" : "text-night/40"}`}>{DAY_SHORT[d.getDay()]}</span>
                        <span className="text-xl font-black my-0.5">{d.getDate()}</span>
                        <span className={`text-[9px] font-bold ${isSelected ? "opacity-70" : "text-night/40"}`}>{MONTH_SHORT[d.getMonth()]}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedDayHours && (
                  <p className="mt-2 text-[11px] text-night/40 font-semibold text-center">
                    {selectedDayHours === "chiuso" ? "Chiuso in questo giorno" : `Orari: ${selectedDayHours.replace(/,/g, " · ")}`}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-3">L'orario</p>
                {groupedSlots.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-night/[0.06]">
                    <div className="w-14 h-14 mx-auto rounded-full bg-night/5 flex items-center justify-center mb-3">
                      <CalendarIcon size={24} className="text-night/20" />
                    </div>
                    <p className="font-bold text-night mb-1">Nessun orario disponibile</p>
                    <p className="text-xs text-night/50">Il salone è chiuso o non ci sono slot in questo giorno</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedSlots.map((group) => (
                      <div key={group.label}>
                        <div className="flex items-center gap-2 mb-2">
                          <group.icon size={14} style={{ color: brandColor }} />
                          <span className="text-[10px] font-black text-night/40 uppercase tracking-widest">{group.label}</span>
                          <div className="flex-1 h-px bg-night/[0.06]" />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {group.slots.map((time) => {
                            const isSelected = selectedTime === time;
                            return (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                                  isSelected 
                                    ? "text-white shadow-md border-transparent" 
                                    : "bg-white border-night/[0.06] text-night hover:border-night/20"
                                }`}
                                style={isSelected ? { backgroundColor: brandColor } : undefined}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!selectedTime}
                className={`w-full text-white py-4 rounded-2xl font-black text-sm transition active:scale-[0.98] flex items-center justify-center gap-2 ${
                  !selectedTime ? "bg-night/10 text-night/30 cursor-not-allowed" : "shadow-lg"
                }`}
                style={!selectedTime ? undefined : { backgroundColor: brandColor }}
              >
                Continua <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && selectedService && selectedTime && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-night mb-1">Ultimo passo</h2>
                <p className="text-night/50 text-sm">Conferma i tuoi dati</p>
              </div>

              <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-night/[0.06] mb-5">
                <div className="p-5 text-white" style={{ backgroundColor: brandColor }}>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">La tua prenotazione</p>
                  <p className="font-serif text-xl">{tenantName}</p>
                </div>
                
                <div className="relative h-6 flex items-center px-4">
                  <div className="absolute -left-3 w-6 h-6 rounded-full bg-[#FAF7F3]" />
                  <div className="flex-1 border-t-2 border-dashed border-night/10" />
                  <div className="absolute -right-3 w-6 h-6 rounded-full bg-[#FAF7F3]" />
                </div>

                <div className="px-5 pb-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-night/50 font-semibold">Servizio</span>
                    <span className="text-sm font-bold text-night text-right">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-night/50 font-semibold">Data</span>
                    <span className="text-sm font-bold text-night">{selectedDate.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-night/50 font-semibold">Ora</span>
                    <span className="text-sm font-bold text-night">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-dashed border-night/10">
                    <span className="text-xs text-night/50 font-semibold">Totale</span>
                    <span className="text-lg font-black text-night">€{Number(selectedService.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="bg-white rounded-2xl p-4 border border-night/[0.06]">
                  <label className="block">
                    <span className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2 block">Il tuo nome *</span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Es. Mario Rossi"
                      className="w-full bg-transparent border-0 text-base font-semibold text-night placeholder-night/30 focus:outline-none p-0"
                    />
                  </label>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-night/[0.06]">
                  <label className="block">
                    <span className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2 block">Telefono *</span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Es. 333 1234567"
                      className="w-full bg-transparent border-0 text-base font-semibold text-night placeholder-night/30 focus:outline-none p-0"
                    />
                  </label>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-night/[0.06]">
                  <label className="block">
                    <span className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2 block">Note (opzionale)</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Es. esigenze particolari..."
                      rows={2}
                      className="w-full bg-transparent border-0 text-sm text-night placeholder-night/30 focus:outline-none p-0 resize-none"
                    />
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm mb-5">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-4 rounded-2xl font-bold text-sm text-night bg-white border border-night/[0.06] hover:border-night/20 transition active:scale-95"
                >
                  Indietro
                </button>
                <button
                  onClick={handleBook}
                  disabled={submitting || !customerName || !customerPhone}
                  className={`flex-1 text-white py-4 rounded-2xl font-black text-sm transition active:scale-[0.98] flex items-center justify-center gap-2 ${
                    submitting || !customerName || !customerPhone ? "bg-night/10 text-night/30 cursor-not-allowed" : "shadow-lg"
                  }`}
                  style={submitting || !customerName || !customerPhone ? undefined : { backgroundColor: brandColor }}
                >
                  {submitting ? "Prenotando..." : <>Conferma Prenotazione <CheckCircle2 size={16} /></>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
