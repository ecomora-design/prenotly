"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, XCircle, Clock, Calendar, User } from "lucide-react";

type TimeOff = {
  id: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  notes: string | null;
  created_at: string;
  approved_at: string | null;
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
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
  staffName: string;
  staffColor: string;
};

export default function TimeOffApproval({ isOpen, onClose, staffId, staffName, staffColor }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TimeOff[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending">("pending");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("staff_time_off")
      .select("*")
      .eq("staff_id", staffId)
      .order("start_date", { ascending: false });

    if (error) console.error(error);
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, staffId]);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setUpdating(id);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("staff_time_off")
      .update({
        status,
        approved_at: new Date().toISOString(),
        approved_by: user?.id || null,
      })
      .eq("id", id);

    setUpdating(null);
    if (error) { alert("Errore: " + error.message); return; }
    load();
  }

  function daysBetween(start: string, end: string) {
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
  }

  const filtered = filter === "pending" ? items.filter(i => i.status === "pending") : items;
  const pendingCount = items.filter(i => i.status === "pending").length;

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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: staffColor }}>
                    {staffName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-night leading-tight">{staffName}</h3>
                    <p className="text-xs text-night/50">Ferie e assenze</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-night/40 hover:text-night p-2 rounded-full hover:bg-white transition">
                  <X size={20} />
                </button>
              </div>
              {pendingCount > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                  <Clock size={11} /> {pendingCount} in attesa
                </div>
              )}
            </div>

            <div className="p-5">
              {/* Filter */}
              <div className="flex gap-1.5 mb-4">
                <button onClick={() => setFilter("pending")} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filter === "pending" ? "bg-night text-white" : "bg-white text-night/60 border border-night/[0.08]"}`}>
                  In attesa ({pendingCount})
                </button>
                <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filter === "all" ? "bg-night text-white" : "bg-white text-night/60 border border-night/[0.08]"}`}>
                  Tutte ({items.length})
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-night/30" size={24} /></div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-night/[0.06]">
                  <Calendar size={40} className="text-night/20 mx-auto mb-3" />
                  <p className="font-bold text-night mb-1">
                    {filter === "pending" ? "Nessuna richiesta in attesa" : "Nessuna richiesta"}
                  </p>
                  <p className="text-sm text-night/50">
                    {filter === "pending" ? "Tutte le richieste sono state gestite." : "Questo operatore non ha ancora richiesto ferie."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((item) => {
                    const type = TYPE_CONFIG[item.type] || TYPE_CONFIG.altro;
                    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                    const StatusIcon = status.icon;
                    const days = daysBetween(item.start_date, item.end_date);
                    const isUpdating = updating === item.id;
                    return (
                      <div key={item.id} className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden">
                        <div className="h-1" style={{ backgroundColor: status.accent }} />
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl" style={{ backgroundColor: status.accent + "15" }}>
                              {type.emoji}
                            </div>
                            <div className="min-w-0 flex-1">
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
                          {item.notes && (
                            <div className="mb-3 px-3 py-2 bg-night/[0.03] text-[11px] text-night/70 rounded-lg">📝 {item.notes}</div>
                          )}
                          {item.status === "pending" && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => updateStatus(item.id, "rejected")}
                                disabled={isUpdating}
                                className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black py-2.5 rounded-lg inline-flex items-center justify-center gap-1 transition disabled:opacity-50"
                              >
                                {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <><XCircle size={12} /> Rifiuta</>}
                              </button>
                              <button
                                onClick={() => updateStatus(item.id, "approved")}
                                disabled={isUpdating}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 rounded-lg inline-flex items-center justify-center gap-1 transition disabled:opacity-50"
                              >
                                {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <><CheckCircle2 size={12} /> Approva</>}
                              </button>
                            </div>
                          )}
                          {item.status === "approved" && item.approved_at && (
                            <p className="text-[10px] text-emerald-600 font-bold text-center">
                              ✓ Approvata il {new Date(item.approved_at).toLocaleDateString("it-IT")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
