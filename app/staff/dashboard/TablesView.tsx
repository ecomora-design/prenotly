"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Users, Clock, CheckCircle2, XCircle, RefreshCw, MapPin } from "lucide-react";

type TableBooking = {
  id: string;
  booking_code: string;
  scheduled_at: string;
  status: string;
  party_size: number | null;
  notes: string | null;
  customers: { name: string | null; whatsapp_number: string | null } | null;
  tables: { table_number: number; zone: string | null } | null;
};

const STATUS_CONFIG: Record<string, { label: string; accent: string; bg: string; text: string }> = {
  pending:   { label: "In attesa", accent: "#EAB308", bg: "#FEF9C3", text: "#854D0E" },
  confirmed: { label: "Confermato", accent: "#3B82F6", bg: "#DBEAFE", text: "#1E40AF" },
  completed: { label: "Arrivato", accent: "#10B981", bg: "#DCFCE7", text: "#166534" },
  cancelled: { label: "Annullato", accent: "#EF4444", bg: "#FEE2E2", text: "#991B1B" },
};

type Props = { tenantId: string; };

export default function TablesView({ tenantId }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
    const dayStart = new Date(todayStr + "T00:00:00").toISOString();
    const dayEnd = new Date(todayStr + "T23:59:59").toISOString();

    const { data, error } = await supabase
      .from("bookings")
      .select("id, booking_code, scheduled_at, status, party_size, notes, customer_id, table_id")
      .eq("tenant_id", tenantId)
      .eq("booking_type", "table")
      .gte("scheduled_at", dayStart)
      .lte("scheduled_at", dayEnd)
      .order("scheduled_at", { ascending: true });

    if (error) { console.error(error); setRefreshing(false); setLoading(false); return; }

    // Carica clienti e tavoli
    const custIds = (data || []).map((b: any) => b.customer_id).filter(Boolean);
    const tableIds = (data || []).map((b: any) => b.table_id).filter(Boolean);

    const custMap: Record<string, any> = {};
    if (custIds.length > 0) {
      const { data: custs } = await supabase.from("customers").select("id, name, whatsapp_number").in("id", custIds);
      (custs || []).forEach(c => { custMap[c.id] = { name: c.name, whatsapp_number: c.whatsapp_number }; });
    }
    const tableMap: Record<string, any> = {};
    if (tableIds.length > 0) {
      const { data: tbls } = await supabase.from("tables").select("id, table_number, zone").in("id", tableIds);
      (tbls || []).forEach(t => { tableMap[t.id] = { table_number: t.table_number, zone: t.zone }; });
    }

    setBookings(((data || []) as any[]).map(b => ({
      ...b,
      customers: b.customer_id ? custMap[b.customer_id] : null,
      tables: b.table_id ? tableMap[b.table_id] : null,
    })));
    setRefreshing(false);
    setLoading(false);
  }

  useEffect(() => { load(); }, [tenantId]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    load();
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin text-night/30" size={24} /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-night">Prenotazioni tavoli · Oggi</h2>
          <p className="text-xs text-night/50">{bookings.length} prenotazion{bookings.length === 1 ? "e" : "i"}</p>
        </div>
        <button onClick={load} disabled={refreshing} className="inline-flex items-center gap-1.5 text-xs font-bold text-night/60 hover:text-night transition">
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Aggiorna
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-night/[0.06]">
          <div className="w-14 h-14 bg-cream rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar size={26} className="text-night/30" />
          </div>
          <p className="font-bold text-night mb-1">Nessuna prenotazione tavoli</p>
          <p className="text-sm text-night/50">Non ci sono tavoli prenotati per oggi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const config = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
            const time = new Date(b.scheduled_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden">
                <div className="h-1" style={{ backgroundColor: config.accent }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: config.accent + "15" }}>
                        <Clock size={18} style={{ color: config.accent }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-night text-sm truncate">{time} · {b.customers?.name || "Cliente"}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase" style={{ backgroundColor: config.bg, color: config.text }}>{config.label}</span>
                          {b.party_size && <span className="text-[10px] font-bold text-night/60 flex items-center gap-0.5"><Users size={10} /> {b.party_size} coperti</span>}
                          {b.tables && <span className="text-[10px] font-bold text-night/60 flex items-center gap-0.5"><MapPin size={10} /> Tav. {b.tables.table_number}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-night/40 bg-night/5 px-2 py-1 rounded">{b.booking_code}</span>
                  </div>
                  {b.notes && <div className="mt-2 px-3 py-2 bg-orange-50 text-[11px] text-orange-800 font-bold rounded-lg">📝 {b.notes}</div>}
                  <div className="mt-3 pt-3 border-t border-night/[0.04] flex items-center gap-2">
                    {b.status === "pending" && (
                      <button onClick={() => updateStatus(b.id, "confirmed")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-2 rounded-lg">Conferma</button>
                    )}
                    {b.status === "confirmed" && (
                      <button onClick={() => updateStatus(b.id, "completed")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 rounded-lg inline-flex items-center justify-center gap-1">
                        <CheckCircle2 size={12} /> Arrivato
                      </button>
                    )}
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <button onClick={() => updateStatus(b.id, "cancelled")} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg" aria-label="Annulla">
                        <XCircle size={14} />
                      </button>
                    )}
                    {b.status === "completed" && <span className="flex-1 text-center text-[10px] font-black text-emerald-600 uppercase tracking-widest">✓ Arrivato</span>}
                    {b.status === "cancelled" && <span className="flex-1 text-center text-[10px] font-black text-red-500 uppercase tracking-widest">✗ Annullato</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
