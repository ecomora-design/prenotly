"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { planHasFeature } from "@/lib/planFeatures";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Trash2, X, Save, Pencil, Crown, Lock, UserCircle2, CheckCircle2, Circle, Calendar, Copy, Link2, ExternalLink } from "lucide-react";
import TimeOffApproval from "@/components/TimeOffApproval";

type Staff = { id: string; name: string; role: string | null; color: string; is_active: boolean; sort_order: number; email: string | null; user_id: string | null; reparto: string | null; };
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
  const [form, setForm] = useState({ name: "", role: "", color: "#25D366", email: "", password: "", reparto: "floor" });
  const [approvalStaff, setApprovalStaff] = useState<Staff | null>(null);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);
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

    // Conta richieste ferie pending per ogni operatore
    const { data: pendingData } = await supabase
      .from("staff_time_off")
      .select("staff_id")
      .eq("tenant_id", link.tenant_id)
      .eq("status", "pending");
    const counts: Record<string, number> = {};
    (pendingData || []).forEach((r: any) => {
      counts[r.staff_id] = (counts[r.staff_id] || 0) + 1;
    });
    setPendingCounts(counts);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditingId(null); setForm({ name: "", role: "", color: "#25D366", email: "", password: "", reparto: "floor" }); setShowModal(true); }
  function openEdit(s: Staff) { setEditingId(s.id); setForm({ name: s.name, role: s.role || "", color: s.color, email: s.email || "", password: "", reparto: s.reparto || "floor" }); setShowModal(true); }

  async function handleSave() {
    if (!form.name.trim()) { alert("Inserisci un nome"); return; }
    if (!tenantId) return;
    setSaving(true);

    if (editingId) {
      const { error } = await supabase.from("staff").update({ name: form.name.trim(), role: form.role.trim() || null, color: form.color, reparto: form.reparto }).eq("id", editingId);
      setSaving(false);
      if (error) { alert("Errore: " + error.message); return; }
      setShowModal(false);
      load();
      return;
    }

    if (!form.email?.trim() || !form.password?.trim()) {
      alert("Email e password obbligatorie per un nuovo operatore");
      setSaving(false);
      return;
    }
    if (form.password.length < 6) {
      alert("Password almeno 6 caratteri");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/dashboard/staff/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        role: form.role.trim() || null,
        color: form.color,
        email: form.email.trim(),
        password: form.password,
        reparto: form.reparto,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { alert("Errore: " + (data.error || "Sconosciuto")); return; }
    setShowModal(false);
    load();
  }

  async function copyStaffLink() {
    const url = window.location.origin + "/staff/login";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      alert("Link: " + url);
    }
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

      {/* Card accesso staff */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Link2 size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-night mb-1">Link di accesso per i tuoi operatori</p>
            <p className="text-xs text-blue-800/80 mb-3">
              Condividi questo link con il tuo team. Ogni operatore accede con la propria email e password.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={copyStaffLink}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition active:scale-95"
              >
                {copied ? <><CheckCircle2 size={13} /> Copiato!</> : <><Copy size={13} /> Copia link</>}
              </button>
              <a
                href="/staff/login"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs font-bold transition"
              >
                <ExternalLink size={13} /> Apri
              </a>
            </div>
          </div>
        </div>
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
                  <div className="min-w-0"><p className="font-bold text-night truncate">{s.name}</p><p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                        {s.role || "Operatore"}
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                          s.reparto === "kitchen" ? "bg-orange-100 text-orange-700" :
                          s.reparto === "both" ? "bg-purple-100 text-purple-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {s.reparto === "kitchen" ? "Cucina" : s.reparto === "both" ? "Sala+Cucina" : "Sala"}
                        </span>
                      </p></div>
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

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Reparto</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setForm({ ...form, reparto: "floor" })} className={`py-2.5 rounded-xl text-xs font-bold transition ${form.reparto === "floor" ? "bg-blue-600 text-white" : "bg-soft text-gray-600"}`}>Sala</button>
                    <button type="button" onClick={() => setForm({ ...form, reparto: "kitchen" })} className={`py-2.5 rounded-xl text-xs font-bold transition ${form.reparto === "kitchen" ? "bg-orange-500 text-white" : "bg-soft text-gray-600"}`}>Cucina</button>
                    <button type="button" onClick={() => setForm({ ...form, reparto: "both" })} className={`py-2.5 rounded-xl text-xs font-bold transition ${form.reparto === "both" ? "bg-purple-600 text-white" : "bg-soft text-gray-600"}`}>Entrambi</button>
                  </div>
                </div>

                {!editingId && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Email *</label>
                      <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="operatore@email.com" className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Password *</label>
                      <input type="text" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 caratteri" className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none" />
                      <p className="text-[10px] text-amber-600 mt-1">Comunica questa password all&apos;operatore. Non sarà visibile dopo la creazione.</p>
                    </div>
                  </>
                )}
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

      {approvalStaff && (
        <TimeOffApproval
          isOpen={!!approvalStaff}
          onClose={() => { setApprovalStaff(null); load(); }}
          staffId={approvalStaff.id}
          staffName={approvalStaff.name}
          staffColor={approvalStaff.color}
        />
      )}
    </div>
  );
}
