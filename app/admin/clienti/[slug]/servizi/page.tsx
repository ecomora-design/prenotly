"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, ArrowLeft, Plus, Pencil, Trash2, X, Check,
  ShoppingBag, AlertCircle, Save, Clock, Euro, Image as ImageIcon
} from "lucide-react";

type Service = {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  duration_minutes: number | null;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  is_featured: boolean;
  is_popular: boolean;
};

export default function ServiziAdminPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    duration_minutes: 0,
    image_url: "",
    is_available: true,
    is_featured: false,
    is_popular: false,
  });

  async function load() {
    setLoading(true);
    const { data: t } = await supabase.from("tenants").select("id, business_name, slug").eq("slug", slug).single();
    if (!t) { router.push("/admin/clienti"); return; }
    setTenant(t);

    const { data: s } = await supabase
      .from("services")
      .select("*")
      .eq("tenant_id", t.id)
      .order("sort_order", { ascending: true });
    setServices(s || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [slug]);

  function openNew() {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      category: "",
      price: 0,
      duration_minutes: 0,
      image_url: "",
      is_available: true,
      is_featured: false,
      is_popular: false,
    });
    setShowModal(true);
  }

  function openEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description || "",
      category: s.category || "",
      price: s.price,
      duration_minutes: s.duration_minutes || 0,
      image_url: s.image_url || "",
      is_available: s.is_available,
      is_featured: s.is_featured,
      is_popular: s.is_popular,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { alert("Il nome è obbligatorio"); return; }
    setSaving(true);

    const payload: any = {
      tenant_id: tenant.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      price: Number(form.price) || 0,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      image_url: form.image_url.trim() || null,
      is_available: form.is_available,
      is_featured: form.is_featured,
      is_popular: form.is_popular,
    };

    if (editingId) {
      const { error } = await supabase.from("services").update(payload).eq("id", editingId);
      if (error) { alert("Errore: " + error.message); setSaving(false); return; }
    } else {
      payload.sort_order = services.length + 1;
      const { error } = await supabase.from("services").insert(payload);
      if (error) { alert("Errore: " + error.message); setSaving(false); return; }
    }

    setSaving(false);
    setShowModal(false);
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Eliminare il servizio "${name}"? Azione irreversibile.`)) return;
    setDeleting(id);
    const { error } = await supabase.from("services").delete().eq("id", id);
    setDeleting(null);
    if (error) alert("Errore: " + error.message);
    else setServices(services.filter(s => s.id !== id));
  }

  async function toggleAvailability(s: Service) {
    const { error } = await supabase.from("services").update({ is_available: !s.is_available }).eq("id", s.id);
    if (error) alert("Errore: " + error.message);
    else setServices(services.map(x => x.id === s.id ? { ...x, is_available: !s.is_available } : x));
  }

  if (loading || !tenant) {
    return <div className="flex items-center justify-center h-[70vh] bg-[#050505]"><Loader2 className="animate-spin text-[#25D366]" size={40} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-[#25D366] selection:text-black">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link href={`/admin/clienti/${slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-white/40 hover:text-[#25D366] transition uppercase tracking-widest mb-2">
            <ArrowLeft size={14} /> Torna al cliente
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
            Servizi · {tenant.business_name}
          </h1>
          <p className="text-white/40 font-mono text-sm mt-1">Gestisci il catalogo servizi del cliente</p>
        </div>
        <button onClick={openNew} className="bg-[#25D366] hover:bg-[#20ba5a] text-black px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.3)] w-fit">
          <Plus size={16} /> Nuovo servizio
        </button>
      </div>

      {/* TABELLA SERVIZI */}
      <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl overflow-hidden">
        {services.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingBag size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/60">Nessun servizio ancora. Aggiungine uno per iniziare.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/[0.02] border-b border-white/[0.06]">
              <tr>
                <th className="text-left text-[10px] font-bold text-white/40 uppercase tracking-widest px-5 py-3">Nome</th>
                <th className="text-left text-[10px] font-bold text-white/40 uppercase tracking-widest px-5 py-3">Categoria</th>
                <th className="text-left text-[10px] font-bold text-white/40 uppercase tracking-widest px-5 py-3">Prezzo</th>
                <th className="text-left text-[10px] font-bold text-white/40 uppercase tracking-widest px-5 py-3">Durata</th>
                <th className="text-left text-[10px] font-bold text-white/40 uppercase tracking-widest px-5 py-3">Stato</th>
                <th className="text-right text-[10px] font-bold text-white/40 uppercase tracking-widest px-5 py-3">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-white">{s.name}</p>
                    {s.description && <p className="text-[11px] text-white/40 truncate max-w-[280px] mt-0.5">{s.description}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-white/70">{s.category || "—"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-[#25D366]">€{Number(s.price).toFixed(2)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-white/70">{s.duration_minutes ? `${s.duration_minutes} min` : "—"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleAvailability(s)} className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider transition ${s.is_available ? "bg-[#25D366]/15 text-[#25D366]" : "bg-white/10 text-white/50"}`}>
                      {s.is_available ? "Attivo" : "Disattivo"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-2 hover:bg-white/10 rounded-lg transition" title="Modifica">
                        <Pencil size={14} className="text-white/60" />
                      </button>
                      <button onClick={() => handleDelete(s.id, s.name)} disabled={deleting === s.id} className="p-2 hover:bg-red-500/10 rounded-lg transition" title="Elimina">
                        {deleting === s.id ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} className="text-red-400" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/[0.08] rounded-3xl max-w-lg w-full p-6 my-8"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {editingId ? <><Pencil size={18} className="text-[#25D366]" /> Modifica servizio</> : <><Plus size={18} className="text-[#25D366]" /> Nuovo servizio</>}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X size={18} className="text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Nome *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#25D366] outline-none transition" placeholder="Es. Margherita" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Descrizione</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#25D366] outline-none transition resize-none" placeholder="Ingredienti, dettagli..." />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Prezzo (€) *</label>
                    <div className="relative">
                      <Euro size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                        className="w-full bg-[#111] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm focus:border-[#25D366] outline-none transition" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Durata (min)</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input type="number" min="0" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                        className="w-full bg-[#111] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm focus:border-[#25D366] outline-none transition" placeholder="0 = non applicabile" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Categoria</label>
                  <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#25D366] outline-none transition" placeholder="Es. Antipasti, Pizze Classiche, Taglio..." />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">URL Immagine</label>
                  <div className="relative">
                    <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm focus:border-[#25D366] outline-none transition" placeholder="https://..." />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_available} onChange={e => setForm({ ...form, is_available: e.target.checked })} className="accent-[#25D366]" />
                    <span className="text-xs text-white/70">Attivo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="accent-[#25D366]" />
                    <span className="text-xs text-white/70">In evidenza</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_popular} onChange={e => setForm({ ...form, is_popular: e.target.checked })} className="accent-[#25D366]" />
                    <span className="text-xs text-white/70">Popolare</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] py-3 rounded-xl font-semibold text-sm transition">
                  Annulla
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-black py-3 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Salvataggio..." : "Salva"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
