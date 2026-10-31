"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, Calendar, Users } from "lucide-react";

type Table = { id: string; table_number: number; zone: string | null; capacity: number };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onSaved: () => void;
};

export default function ManualTableModal({ isOpen, onClose, tenantId, onSaved }: Props) {
  const supabase = createClient();
  const [tables, setTables] = useState<Table[]>([]);
  const [saving, setSaving] = useState(false);

  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    date: todayStr,
    time: "20:00",
    partySize: 2,
    tableId: "",
    notes: "",
    status: "confirmed",
  });

  useEffect(() => {
    if (isOpen && tenantId) {
      supabase.from("tables")
        .select("id, table_number, zone, capacity")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("table_number")
        .then(({ data }) => setTables(data || []));
    }
  }, [isOpen, tenantId, supabase]);

  const resetForm = () => {
    setForm({
      customerName: "",
      customerPhone: "",
      date: todayStr,
      time: "20:00",
      partySize: 2,
      tableId: "",
      notes: "",
      status: "confirmed",
    });
  };

  const handleSave = async () => {
    if (!form.customerName.trim()) {
      alert("Inserisci il nome del cliente");
      return;
    }
    if (!form.time) {
      alert("Inserisci l'orario");
      return;
    }
    setSaving(true);

    try {
      // 1. Trova o crea customer
      let customerId: string | null = null;
      const phone = form.customerPhone.trim();
      if (phone) {
        const { data: existing } = await supabase
          .from("customers")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("whatsapp_number", phone)
          .maybeSingle();

        if (existing) {
          customerId = existing.id;
          await supabase.from("customers").update({ name: form.customerName.trim() }).eq("id", customerId);
        } else {
          const { data: created } = await supabase.from("customers").insert({
            tenant_id: tenantId,
            name: form.customerName.trim(),
            whatsapp_number: phone,
          }).select("id").single();
          customerId = created?.id || null;
        }
      } else {
        const { data: created } = await supabase.from("customers").insert({
          tenant_id: tenantId,
          name: form.customerName.trim(),
          whatsapp_number: "",
        }).select("id").single();
        customerId = created?.id || null;
      }

      // 2. Crea booking
      const code = "TB-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const scheduledAt = new Date(form.date + "T" + form.time + ":00").toISOString();

      const { error } = await supabase.from("bookings").insert({
        tenant_id: tenantId,
        customer_id: customerId,
        booking_code: code,
        booking_type: "table",
        scheduled_at: scheduledAt,
        duration_minutes: 120,
        party_size: form.partySize,
        table_id: form.tableId || null,
        status: form.status,
        notes: form.notes.trim() || null,
      });

      if (error) throw error;

      resetForm();
      onSaved();
      onClose();
    } catch (err: any) {
      alert("Errore: " + (err.message || "Errore sconosciuto"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                    <Calendar size={20} className="text-blue-500" />
                    Nuova Prenotazione Tavolo
                  </h3>
                  <p className="text-xs text-night/50 mt-0.5">Registra una prenotazione tavolo</p>
                </div>
                <button onClick={onClose} className="text-night/40 hover:text-night p-2 rounded-full hover:bg-white transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-night/[0.06] space-y-3">
                <p className="text-[10px] font-black text-night/40 uppercase tracking-widest">Cliente</p>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Nome cliente *"
                  className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-semibold focus:border-night/30 focus:outline-none transition"
                />
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  placeholder="Telefono (opzionale)"
                  className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-semibold focus:border-night/30 focus:outline-none transition"
                />
              </div>

              <div className="bg-white rounded-2xl p-4 border border-night/[0.06] space-y-3">
                <p className="text-[10px] font-black text-night/40 uppercase tracking-widest">Prenotazione</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-night/40 mb-1">Data</p>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-3 py-2.5 text-sm font-bold focus:border-night/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-night/40 mb-1">Ora</p>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-3 py-2.5 text-sm font-bold focus:border-night/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-night/40 mb-1">Coperti</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setForm({ ...form, partySize: Math.max(1, form.partySize - 1) })}
                      className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-night/[0.08] font-black text-night hover:bg-night hover:text-white transition"
                    >
                      −
                    </button>
                    <div className="flex-1 h-10 rounded-xl bg-[#FAFAFA] border border-night/[0.08] flex items-center justify-center gap-1.5">
                      <Users size={14} className="text-night/40" />
                      <span className="font-black text-night">{form.partySize}</span>
                    </div>
                    <button
                      onClick={() => setForm({ ...form, partySize: form.partySize + 1 })}
                      className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-night/[0.08] font-black text-night hover:bg-night hover:text-white transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-night/40 mb-1">Tavolo (opzionale)</p>
                  <select
                    value={form.tableId}
                    onChange={(e) => setForm({ ...form, tableId: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-3 py-2.5 text-sm font-semibold focus:border-night/30 focus:outline-none"
                  >
                    <option value="">Da assegnare</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        Tavolo {t.table_number} · {t.zone || "Sala"} · max {t.capacity}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Note (allergie, compleanno, ecc.)"
                  className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm focus:border-night/30 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !form.customerName.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-night/10 disabled:text-night/30 text-white py-4 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                Salva Prenotazione
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
