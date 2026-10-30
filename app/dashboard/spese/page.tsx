"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { planHasFeature } from "@/lib/planFeatures";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, X, Save, Euro, TrendingDown, TrendingUp,
  Home, Zap, Users, ShoppingCart, Wrench, Megaphone, Car, FileText,
  Crown, Lock, Filter
} from "lucide-react";

type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  supplier: string | null;
  expense_date: string;
  created_at: string;
};

const CATEGORIES = [
  { key: "affitto", label: "Affitto", icon: Home, color: "#3B82F6" },
  { key: "bollette", label: "Bollette", icon: Zap, color: "#F59E0B" },
  { key: "stipendi", label: "Stipendi", icon: Users, color: "#8B5CF6" },
  { key: "fornitori", label: "Fornitori", icon: ShoppingCart, color: "#EF4444" },
  { key: "manutenzione", label: "Manutenzione", icon: Wrench, color: "#6366F1" },
  { key: "marketing", label: "Marketing", icon: Megaphone, color: "#EC4899" },
  { key: "trasporti", label: "Trasporti", icon: Car, color: "#14B8A6" },
  { key: "altro", label: "Altro", icon: FileText, color: "#6B7280" },
];

const getCategory = (key: string) => CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1];

export default function SpesePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));

  const [form, setForm] = useState({
    amount: "",
    category: "altro",
    description: "",
    supplier: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  const hasExpenses = planHasFeature(planType, "expenses");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: link } = await supabase
      .from("tenant_users")
      .select("tenant_id, tenants(plan_type)")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!link) { router.push("/onboarding"); return; }

    setTenantId(link.tenant_id);
    const t: any = link.tenants;
    setPlanType(t?.plan_type || null);

    if (!planHasFeature(t?.plan_type, "expenses")) {
      setLoading(false);
      return;
    }

    const { data: exp } = await supabase
      .from("expenses")
      .select("*")
      .eq("tenant_id", link.tenant_id)
      .order("expense_date", { ascending: false });
    setExpenses((exp || []) as Expense[]);

    const { data: orders } = await supabase
      .from("orders")
      .select("total, status")
      .eq("tenant_id", link.tenant_id)
      .in("status", ["delivered", "completed"]);

    setRevenue((orders || []).reduce((sum, o) => sum + Number(o.total), 0));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) { alert("Inserisci un importo valido"); return; }
    if (!tenantId) return;

    setSaving(true);
    const { error } = await supabase.from("expenses").insert({
      tenant_id: tenantId,
      amount,
      category: form.category,
      description: form.description.trim() || null,
      supplier: form.supplier.trim() || null,
      expense_date: form.expense_date,
    });
    setSaving(false);

    if (error) { alert("Errore: " + error.message); return; }
    setShowModal(false);
    setForm({ amount: "", category: "altro", description: "", supplier: "", expense_date: new Date().toISOString().split("T")[0] });
    load();
  }

  async function handleDelete(id: string, amount: number) {
    if (!confirm(`Eliminare questa spesa di €${amount.toFixed(2)}?`)) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) alert("Errore: " + error.message);
    else setExpenses(expenses.filter(e => e.id !== id));
  }

  const filtered = monthFilter ? expenses.filter(e => e.expense_date.startsWith(monthFilter)) : expenses;
  const monthTotal = filtered.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const profit = revenue - totalExpenses;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-wa" size={32} /></div>;
  }

  if (!hasExpenses) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <Lock size={36} className="text-amber-500" />
          </div>
          <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
            <Crown size={11} /> Funzione Premium
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-night mb-3">Gestisci le spese del tuo locale</h1>
          <p className="text-gray-500 text-sm md:text-base mb-6 max-w-md mx-auto">
            Affitto, bollette, stipendi, fornitori: registra tutte le spese e scopri il <strong>vero profitto</strong> della tua attività.
          </p>
          <ul className="text-left max-w-sm mx-auto mb-8 space-y-2.5 text-sm">
            <li className="flex items-center gap-2 text-night/70">✅ Registro spese illimitato</li>
            <li className="flex items-center gap-2 text-night/70">✅ Categorie personalizzabili</li>
            <li className="flex items-center gap-2 text-night/70">✅ Dashboard entrate vs uscite</li>
            <li className="flex items-center gap-2 text-night/70">✅ Calcolo profitto reale</li>
          </ul>
          <Link href="/dashboard/abbonamento" className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-6 py-3 rounded-full text-sm font-bold transition">
            <Crown size={15} /> Scopri Premium Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">Spese</h1>
          <p className="text-gray-500 text-sm">Registra e monitora le spese della tua attività</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-wa hover:bg-waDark text-white px-5 py-2.5 rounded-full text-sm font-bold transition shadow-md active:scale-95">
          <Plus size={16} /> Nuova spesa
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><TrendingDown size={16} className="text-red-500" /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Spese mese</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-night">€{monthTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Euro size={16} className="text-blue-500" /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Incassi</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-night">€{revenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${profit >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
              {profit >= 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-500" />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profitto</p>
          </div>
          <p className={`text-2xl md:text-3xl font-black ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>€{profit.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-sm border border-gray-100">
        <Filter size={16} className="text-gray-400" />
        <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="bg-soft border border-gray-100 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-wa transition" />
        <span className="text-xs text-gray-500">{filtered.length} {filtered.length === 1 ? "spesa" : "spese"} · €{monthTotal.toFixed(2)}</span>
        <button onClick={() => setMonthFilter("")} className="ml-auto text-xs font-bold text-gray-400 hover:text-night transition">Mostra tutte</button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <TrendingDown size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-night mb-1">Nessuna spesa registrata</p>
          <p className="text-sm text-gray-500">Clicca "Nuova spesa" per iniziare</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((exp) => {
              const cat = getCategory(exp.category);
              const CatIcon = cat.icon;
              return (
                <div key={exp.id} className="flex items-center gap-3 p-4 hover:bg-gray-50/50 transition">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + "15" }}>
                    <CatIcon size={18} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-night text-sm truncate">{exp.description || cat.label}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(exp.expense_date).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
                      {exp.supplier && ` · ${exp.supplier}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-red-500">-€{Number(exp.amount).toFixed(2)}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{cat.label}</span>
                  </div>
                  <button onClick={() => handleDelete(exp.id, Number(exp.amount))} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl max-w-md w-full p-6 my-8 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-night">Nuova spesa</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Importo (€) *</label>
                  <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-lg font-black focus:border-wa focus:outline-none focus:bg-white transition" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Categoria</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:border-wa focus:outline-none focus:bg-white transition">
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Descrizione</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Es. Affitto novembre" className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none focus:bg-white transition" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Fornitore</label>
                  <input type="text" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Es. Enel Energia" className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none focus:bg-white transition" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Data</label>
                  <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none focus:bg-white transition" />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-night py-3 rounded-full font-bold text-sm transition">Annulla</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-wa hover:bg-waDark disabled:opacity-50 text-white py-3 rounded-full font-bold text-sm transition flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salva
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
