"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, Calendar, Clock, CheckCircle2, XCircle,
  RefreshCw, MessageCircle, User
} from "lucide-react";

type Booking = {
  id: string;
  booking_code: string;
  scheduled_at: string;
  duration_minutes: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  customers: { name: string | null; whatsapp_number: string } | null;
};

const STATUS_CONFIG = {
  pending: { label: "In attesa", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  confirmed: { label: "Confermato", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  completed: { label: "Completato", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "Annullato", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

export default function PrenotazioniPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>("tutti");

  async function load() {
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
      .select("*, customers(name, whatsapp_number)")
      .eq("tenant_id", link.tenant_id)
      .order("scheduled_at", { ascending: true });

    setBookings((data as unknown as Booking[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    await load();
  };

  const filtered = filter === "tutti" ? bookings : bookings.filter((b) => b.status === filter);

  // Raggruppa per data
  const groupedByDate = filtered.reduce((acc: Record<string, Booking[]>, b) => {
    const date = new Date(b.scheduled_at).toLocaleDateString("it-IT", {
      weekday: "long", day: "2-digit", month: "long",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(b);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">Prenotazioni</h1>
          <p className="text-gray-500 text-sm">Tutti gli appuntamenti ricevuti</p>
        </div>
        <button onClick={load} className="bg-white border border-gray-200 hover:border-night text-night px-4 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 transition">
          <RefreshCw size={16} />
          Aggiorna
        </button>
      </div>

      <div className="scroll-x flex gap-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {["tutti", "pending", "confirmed", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
              filter === f ? "bg-night text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f === "tutti" ? "Tutti" : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label || f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-lg font-bold text-night mb-2">Nessuna prenotazione</h2>
          <p className="text-gray-500 text-sm">
            {filter === "tutti" ? "Quando riceverai una prenotazione apparirà qui" : "Nessuna prenotazione in questo stato"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-sm font-bold text-night mb-3 capitalize">{date}</h2>
              <div className="space-y-2">
                {items.map((booking) => {
                  const config = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const StatusIcon = config.icon;
                  const customerPhone = booking.customers?.whatsapp_number?.replace(/\D/g, "") || "";
                  const time = new Date(booking.scheduled_at).toLocaleTimeString("it-IT", {
                    hour: "2-digit", minute: "2-digit",
                  });
                  return (
                    <div key={booking.id} className="bg-white rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex flex-col items-center justify-center shrink-0">
                            <span className="text-lg font-bold text-violet-600">{time}</span>
                            {booking.duration_minutes && (
                              <span className="text-[10px] text-violet-500 font-semibold">
                                {booking.duration_minutes} min
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-mono text-xs bg-soft px-2 py-0.5 rounded font-bold text-gray-600">
                                {booking.booking_code}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.color} inline-flex items-center gap-1`}>
                                <StatusIcon size={10} />
                                {config.label.toUpperCase()}
                              </span>
                            </div>
                            <h3 className="font-bold text-night flex items-center gap-2">
                              <User size={14} className="text-gray-400" />
                              {booking.customers?.name || "Cliente"}
                            </h3>
                            {booking.notes && (
                              <p className="text-xs text-gray-500 mt-1 italic">{booking.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {booking.status === "pending" && (
                            <button onClick={() => updateStatus(booking.id, "confirmed")} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition">
                              Conferma
                            </button>
                          )}
                          {booking.status === "confirmed" && (
                            <button onClick={() => updateStatus(booking.id, "completed")} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-full transition">
                              Completato
                            </button>
                          )}
                          {booking.status !== "cancelled" && booking.status !== "completed" && (
                            <button onClick={() => updateStatus(booking.id, "cancelled")} className="text-red-600 hover:bg-red-50 text-xs font-semibold px-4 py-2 rounded-full transition">
                              Annulla
                            </button>
                          )}
                          {customerPhone && (
                            <a
                              href={`https://wa.me/${customerPhone}?text=Ciao!%20Riguardo%20alla%20tua%20prenotazione%20${booking.booking_code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-violet-500 hover:text-violet-600 text-xs font-semibold inline-flex items-center gap-1.5 transition px-2 py-2"
                            >
                              <MessageCircle size={14} />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
