"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Calendar, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";

type TimeOff = {
  id: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  notes: string | null;
  created_at: string;
};

const TYPE_CONFIG: Record<string, { label: string; emoji: string }> = {
  ferie: { label: "Ferie", emoji: "🏖️" },
  malattia: { label: "Malattia", emoji: "🤒" },
  permesso: { label: "Permesso", emoji: "📝" },
  altro: { label: "Altro", emoji: "📌" },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; accent: string; icon: any }> = {
  pending: { label: "In attesa", bg: "#FEF9C3", text: "#854D0E", accent: "#EAB308", icon: Clock },
  approved: { label: "Approvata", bg: "#DCFCE7", text: "#166534", accent: "#10B981", icon: CheckCircle2 },
  rejected: { label: "Rifiutata", bg: "#FEE2E2", text: "#991B1B", accent: "#EF4444", icon: XCircle },
};

type Props = {
  staffId: string;
  tenantId: string;
};

export default function TimeOffView({ staffId, tenantId }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TimeOff[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type: "ferie",
    start_date: "",
    end_date: "",
    notes: "",
  });

  async function load() {
    const { data, error } = await supabase
      .from("staff_time_off")
      .select("*")
      .eq("staff_id", staffId)
      .order("start_date", { ascending: false });

    if (error) console.error(error);
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [staffId]);

  async function handleSave() {
    if (!form.start_date || !form.end_date) {
      alert("Inserisci data inizio e fine");
      return;
    }
    if (form.end_date < form.start_date) {
      alert("La data di fine non può essere prima dell'inizio");
      return;
    }
    setSaving(true);

    const { error } = await supabase.from("staff_time_off").insert({
      staff_id: staffId,
      tenant_id: tenantId,
      start_date: form.start_date,
      end_date: form.end_date,
      type: form.type,
      status: "pending",
      notes: form.notes.trim() || null,
    });

    setSaving(false);
    if (error) {
      alert("Errore: " + error.message);
      return;
    }

    setForm({ type: "ferie", start_date: "", end_date: "", notes: "" });
    setShowModal(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Annullare questa richiesta?")) return;
    const { error } = await supabase.from("staff_time_off").delete().eq("id", id);
    if (error) alert("Errore: " + error.message);
    else load();
  }

  function daysBetween(start: string, end: string) {
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-night/30" size={24} /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <h2 className="text-lg font-bold text-night">Ferie e assenze</h2>
          <p className="text-xs text-night/50">{items.length} richiest{items.length === 1 ? "a" : "e"}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1 bg-night hover:bg-night/90 text-white px-3 py-2 rounded-full text-xs font-bold transition active:scale-95">
          <Plus size={14} /> Richiedi
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-night/[0.06]">
          <div className="w-14 h-14 bg-cream rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar size={26} className="text-night/30" />
          </div>
          <p className="font-bold text-night mb-1">Nessuna richiesta</p>
          <p className="text-sm text-night/50">Non hai ancora richiesto ferie o permessi.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const type = TYPE_CONFIG[item.type] || TYPE_CONFIG.altro;
            const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            const days = daysBetween(item.start_date, item.end_date);
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden">
                <div className="h-1" style={{ backgroundColor: status.accent }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl" style={{ backgroundColor: status.accent + "15" }}>
                        {type.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-night text-sm">{type.label}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase inline-flex items-center gap-1" style={{ backgroundColor: status.bg, color: status.text }}>
                            <StatusIcon size={9} /> {status.label}
                          </span>
                          <span className="text-[10px] font-bold text-night/60">
                            {formatDate(item.start_date)}{item.start_date !== item.end_date && ` → ${formatDate(item.end_date)}`}
                          </span>
                          <span className="text-[10px] font-bold text-night/40">({days}g)</span>
                        </div>
                      </div>
                    </div>
                    {item.status === "pending" && (
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" aria-label="Annulla">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  {item.notes && (
                    <div className="mt-2 px-3 py-2 bg-night/[0.03] text-[11px] text-night/70 rounded-lg">📝 {item.notes}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALE RICHIESTA */}
      <AnimatePresence>
        {showModal && (
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
                      <Calendar size={20} className="text-emerald-500" />
                      Richiedi ferie
                    </h3>
                    <p className="text-xs text-night/50 mt-0.5">Invia la richiesta al titolare</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-night/40 hover:text-night p-2 rounded-full hover:bg-white transition">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-night/[0.06] space-y-3">
                  <div>
                    <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Tipo</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => setForm({ ...form, type: key })}
                          className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${form.type === key ? "bg-night text-white" : "bg-[#FAFAFA] text-night/60 hover:bg-night/5"}`}
                        >
                          <span>{cfg.emoji}</span> {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Dal</p>
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-3 py-3 text-sm font-bold focus:border-night/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Al</p>
                      <input
                        type="date"
                        value={form.end_date}
                        min={form.start_date}
                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-3 py-3 text-sm font-bold focus:border-night/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Note (opzionale)"
                    className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm focus:border-night/30 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !form.start_date || !form.end_date}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-night/10 disabled:text-night/30 text-white py-4 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Invia richiesta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
