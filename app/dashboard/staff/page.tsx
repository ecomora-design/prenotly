"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { planHasFeature } from "@/lib/planFeatures";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Trash2, X, Save, Pencil, Crown, Lock, UserCircle2, CheckCircle2, Circle } from "lucide-react";

type Staff = { id: string; name: string; role: string | null; color: string; is_active: boolean; sort_order: number; };
const PALETTE = ["#25D366","#3B82F6","#8B5CF6","#EC4899","#F97316","#EAB308","#14B8A6","#EF4444","#6366F1","#10B981"];

export default function StaffPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", color: "#25D366" });
  const hasStaff = planHasFeature(planType, "staff");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data: link } = await supabase.from("tenant_users").select("tenant_id, tenants(plan_type)").eq("user_id", user.id).maybeSingle();
    if (!link) { router.push("/onboarding"); return; }
    setTenantId(link.tenant_id);
    const t: any = link.tenants;
    setPlanType(t?.plan_type || null);
    if (!planHasFeature(t?.plan_type, "staff")) { setLoading(false); return; }
    const { data } = await supabase.from("staff").select("*").eq("tenant_id", link.tenant_id).order("sort_order");
    setStaff((data || []) as Staff[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditingId(null); setForm({ name: "", role: "", color: "#25D366" }); setShowModal(true); }
  function openEdit(s: Staff) { setEditingId(s.id); setForm({ name: s.name, role: s.role || "", color: s.color }); setShowModal(true); }

  async function handleSave() {
    if (!form.name.trim()) { alert("Inserisci un nome"); return; }
    if (!tenantId) return;
    setSaving(true);
    let error;
    if (editingId) {
      ({ error } = await supabase.from("staff").update({ name: form.name.trim(), role: form.role.trim() || null, color: form.color }).eq("id", editingId));
    } else {
      const max = staff.length > 0 ? Math.max(...staff.map(s => s.sort_order)) : 0;
      ({ error } = await supabase.from("staff").insert({ tenant_id: tenantId, name: form.name.trim(), role: form.role.trim() || null, color: form.color, sort_order: max + 1 }));
    }
    setSaving(false);
    if (error) { alert("Errore: " + error.message); return; }
    setShowModal(false);
    load();
  }

  async function toggleActive(s: Staff) {
    const { error } = await supabase.from("staff").update({ is_active: !s.is_active }).eq("id", s.id);
    if (error) alert("Errore: " + error.message);
    else setStaff(staff.map(x => x.id === s.id ? { ...x, is_active: !s.is_active } : x));
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Eliminare "${name}"?`)) return;
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) alert("Errore: " + error.message);
    else setStaff(staff.filter(s => s.id !== id));
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-wa" size={32} /></div>;

  if (!hasStaff) return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm text-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5"><Lock size={36} className="text-amber-500" /></div>
        <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3"><Crown size={11} /> Funzione Premium</div>
        <h1 className="text-2xl md:text-3xl font-bold text-night mb-3">Gestisci il tuo team</h1>
        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Aggiungi operatori, assegna un colore al loro calendario e gestisci gli appuntamenti.</p>
        <Link href="/dashboard/abbonamento" className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-6 py-3 rounded-full text-sm font-bold transition"><Crown size={15} /> Scopri Premium Pro</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl md:text-3xl font-bold text-night mb-1">Staff</h1><p className="text-gray-500 text-sm">Gestisci gli operatori del tuo team</p></div>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-wa hover:bg-waDark text-white px-5 py-2.5 rounded-full text-sm font-bold transition shadow-md"><Plus size={16} /> Nuovo operatore</button>
      </div>

      {staff.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <UserCircle2 size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-night mb-1">Nessun operatore</p>
          <p className="text-sm text-gray-500 mb-5">Aggiungi il primo operatore del tuo team</p>
          <button onClick={openNew} className="inline-flex items-center gap-2 bg-wa hover:bg-waDark text-white px-5 py-2.5 rounded-full text-sm font-bold transition"><Plus size={16} /> Aggiungi</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {staff.map(s => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-2xl p-5 shadow-sm border transition ${s.is_active ? "border-gray-100" : "border-gray-200 opacity-60"}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ backgroundColor: s.color }}>{s.name.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0"><p className="font-bold text-night truncate">{s.name}</p><p className="text-xs text-gray-500">{s.role || "Operatore"}</p></div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(s)} className="p-2 hover:bg-gray-100 rounded-lg"><Pencil size={14} className="text-gray-400" /></button>
                  <button onClick={() => handleDelete(s.id, s.name)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
              <button onClick={() => toggleActive(s)} className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition ${s.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {s.is_active ? <><CheckCircle2 size={12} /> Attivo</> : <><Circle size={12} /> Disattivo</>}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-night">{editingId ? "Modifica" : "Nuovo operatore"}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Nome *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Es. Mario" className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Ruolo</label><input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Es. Parrucchiere" className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Colore</label><div className="flex flex-wrap gap-2">{PALETTE.map(c => (<button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`w-9 h-9 rounded-full ${form.color === c ? "ring-2 ring-offset-2 ring-night" : ""}`} style={{ backgroundColor: c }} />))}</div></div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-night py-3 rounded-full font-bold text-sm">Annulla</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-wa hover:bg-waDark disabled:opacity-50 text-white py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salva</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
