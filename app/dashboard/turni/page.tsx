"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, X, Save, ChevronLeft, ChevronRight,
  Calendar, Clock, User, AlertCircle
} from "lucide-react";

type Staff = { id: string; name: string; color: string; role: string | null };
type Shift = {
  id: string;
  staff_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
};

const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export default function TurniPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    staff_id: "",
    shift_date: "",
    start_time: "09:00",
    end_time: "17:00",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: link } = await supabase
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!link) { router.push("/onboarding"); return; }
    setTenantId(link.tenant_id);

    const { data: staffData } = await supabase
      .from("staff")
      .select("id, name, color, role")
      .eq("tenant_id", link.tenant_id)
      .eq("is_active", true)
      .order("sort_order");
    setStaff(staffData || []);

    await loadShifts(link.tenant_id);
    setLoading(false);
  }

  async function loadShifts(tid: string) {
    const monday = new Date(weekStart);
    const sunday = new Date(weekStart);
    sunday.setDate(sunday.getDate() + 6);

    const mondayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(monday);
    const sundayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(sunday);

    const { data } = await supabase
      .from("staff_shifts")
      .select("*")
      .eq("tenant_id", tid)
      .gte("shift_date", mondayStr)
      .lte("shift_date", sundayStr)
      .order("shift_date")
      .order("start_time");

    setShifts(data || []);
  }

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (tenantId) loadShifts(tenantId); }, [weekStart, tenantId]);

  function openNew(dateStr: string, staffId?: string) {
    setEditingId(null);
    setForm({
      staff_id: staffId || (staff[0]?.id || ""),
      shift_date: dateStr,
      start_time: "09:00",
      end_time: "17:00",
      notes: "",
    });
    setError(null);
    setShowModal(true);
  }

  function openEdit(shift: Shift) {
    setEditingId(shift.id);
    setForm({
      staff_id: shift.staff_id,
      shift_date: shift.shift_date,
      start_time: shift.start_time.slice(0, 5),
      end_time: shift.end_time.slice(0, 5),
      notes: shift.notes || "",
    });
    setError(null);
    setShowModal(true);
  }

  async function handleSave() {
    if (!tenantId || !form.staff_id || !form.shift_date) {
      setError("Seleziona staff e data");
      return;
    }
    if (form.end_time <= form.start_time) {
      setError("L'orario di fine deve essere dopo quello di inizio");
      return;
    }
    setSaving(true);
    setError(null);

    if (editingId) {
      const { error: err } = await supabase
        .from("staff_shifts")
        .update({
          staff_id: form.staff_id,
          shift_date: form.shift_date,
          start_time: form.start_time,
          end_time: form.end_time,
          notes: form.notes.trim() || null,
        })
        .eq("id", editingId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("staff_shifts").insert({
        tenant_id: tenantId,
        staff_id: form.staff_id,
        shift_date: form.shift_date,
        start_time: form.start_time,
        end_time: form.end_time,
        notes: form.notes.trim() || null,
      });
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setShowModal(false);
    if (tenantId) loadShifts(tenantId);
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo turno?")) return;
    await supabase.from("staff_shifts").delete().eq("id", id);
    if (tenantId) loadShifts(tenantId);
  }

  function formatWeekRange() {
    const sunday = new Date(weekStart);
    sunday.setDate(sunday.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return `${weekStart.toLocaleDateString("it-IT", opts)} – ${sunday.toLocaleDateString("it-IT", opts)}`;
  }

  function getDayKey(offset: number): string {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + offset);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(d);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-wa" size={32} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">Turni staff</h1>
          <p className="text-sm text-gray-500">Pianifica i turni settimanali del tuo team</p>
        </div>
        <button
          onClick={() => openNew(getDayKey(0))}
          className="inline-flex items-center gap-2 bg-wa hover:bg-waDark text-white px-5 py-2.5 rounded-full text-sm font-bold transition shadow-md"
        >
          <Plus size={16} /> Nuovo turno
        </button>
      </div>

      {staff.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-bold">Nessun operatore attivo</p>
            <p className="text-xs text-amber-700 mt-0.5">Aggiungi prima gli operatori da <a href="/dashboard/staff" className="underline font-bold">Staff</a>.</p>
          </div>
        </div>
      )}

      {/* NAV SETTIMANA */}
      <div className="bg-white rounded-2xl p-3 border border-night/[0.06] shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}
            className="p-2 text-night/50 hover:text-night hover:bg-night/5 rounded-lg transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-black text-night/40 uppercase tracking-wider">Settimana</p>
            <p className="text-sm font-bold text-night">{formatWeekRange()}</p>
          </div>
          <button
            onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}
            className="p-2 text-night/50 hover:text-night hover:bg-night/5 rounded-lg transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* GRIGLIA SETTIMANALE */}
      <div className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden shadow-sm">
        <div className="grid grid-cols-7">
          {DAYS.map((day, i) => {
            const dateStr = getDayKey(i);
            const dayShifts = shifts.filter(s => s.shift_date === dateStr);
            const isToday = dateStr === new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());

            return (
              <div key={day} className={`border-r border-night/[0.04] last:border-r-0 ${isToday ? "bg-wa/[0.03]" : ""}`}>
                <div className={`px-2 py-2 border-b border-night/[0.04] text-center ${isToday ? "bg-wa/10" : "bg-[#FAFBFC]"}`}>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isToday ? "text-waDark" : "text-night/40"}`}>{day}</p>
                  <p className={`text-lg font-black mt-0.5 ${isToday ? "text-waDark" : "text-night"}`}>
                    {new Date(dateStr + "T12:00:00").getDate()}
                  </p>
                </div>
                <div className="p-1.5 space-y-1.5 min-h-[300px]">
                  {dayShifts.map(shift => {
                    const s = staff.find(x => x.id === shift.staff_id);
                    return (
                      <div
                        key={shift.id}
                        onClick={() => openEdit(shift)}
                        className="rounded-lg p-2 cursor-pointer hover:opacity-80 transition group relative"
                        style={{ backgroundColor: (s?.color || "#25D366") + "20", borderLeft: `3px solid ${s?.color || "#25D366"}` }}
                      >
                        <p className="text-[10px] font-black text-night truncate">{s?.name || "?"}</p>
                        <p className="text-[9px] text-night/60 font-bold">
                          {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(shift.id); }}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 text-red-400 hover:text-red-600 transition"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => openNew(dateStr)}
                    className="w-full text-[9px] font-bold text-night/30 hover:text-night/60 hover:bg-night/[0.02] rounded py-1 transition"
                  >
                    + turno
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALE */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-night">{editingId ? "Modifica turno" : "Nuovo turno"}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-3 py-2 text-xs mb-3">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Operatore *</label>
                  <select
                    value={form.staff_id}
                    onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
                    className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none"
                  >
                    <option value="">Seleziona...</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name} {s.role ? `(${s.role})` : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Data *</label>
                  <input
                    type="date"
                    value={form.shift_date}
                    onChange={(e) => setForm({ ...form, shift_date: e.target.value })}
                    className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Inizio</label>
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                      className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Fine</label>
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                      className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Note</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Opzionale"
                    className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-night py-3 rounded-full font-bold text-sm"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-wa hover:bg-waDark disabled:opacity-50 text-white py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salva
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
