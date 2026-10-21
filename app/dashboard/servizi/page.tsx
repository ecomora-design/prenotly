"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import UploadImage from "@/components/UploadImage";
import MenuUploader from "@/components/MenuUploader";
import { Plus, Pencil, Trash2, X, Loader2, Save, Clock, Sparkles, Upload } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  duration_minutes: number | null;
  is_available: boolean;
  is_featured: boolean;
  is_popular: boolean;
  sort_order: number;
  image_url: string | null;
  name_en: string | null;
  description_en: string | null;
  name_de: string | null;
  description_de: string | null;
};

export default function ServiziPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isFood, setIsFood] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    duration_minutes: "",
    image_url: "",
    is_featured: false,
    is_popular: false
  });

  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: link } = await supabase
      .from("tenant_users")
      .select("tenant_id, tenants(id, product_type, business_type)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link || !link.tenants) { router.push("/onboarding"); return; }

    const t = link.tenants as any;
    setTenantId(t.id);
    setIsFood(t.product_type === "food" || t.business_type === "restaurant");

    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("tenant_id", t.id)
      .order("sort_order", { ascending: true });

    setServices(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", category: "", price: "", duration_minutes: "", image_url: "", is_featured: false, is_popular: false });
    setError(null);
    setShowNewCategory(false);
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || "",
      category: s.category || "",
      price: String(s.price),
      duration_minutes: s.duration_minutes ? String(s.duration_minutes) : "",
      image_url: s.image_url || "",
      is_featured: s.is_featured || false,
      is_popular: s.is_popular || false
    });
    setError(null);
    setShowNewCategory(false);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setError(null);
    setSaving(true);

    const payload = {
      tenant_id: tenantId,
      name: form.name,
      description: form.description || null,
      category: form.category || null,
      price: parseFloat(form.price) || 0,
      duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
      image_url: form.image_url || null,
      is_featured: form.is_featured,
      is_popular: form.is_popular,
    };

    if (editing) {
      const { error } = await supabase.from("services").update(payload).eq("id", editing.id);
      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("services").insert({
        ...payload, sort_order: services.length + 1, is_available: true,
      });
      if (error) { setError(error.message); setSaving(false); return; }
    }

    setSaving(false);
    setModalOpen(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questo elemento?")) return;
    await supabase.from("services").delete().eq("id", id);
    await load();
  };

  const handleToggle = async (s: Service) => {
    await supabase.from("services").update({ is_available: !s.is_available }).eq("id", s.id);
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  const existingCategories = Array.from(
    new Set(services.map((s) => s.category).filter(Boolean) as string[])
  ).sort();

  const grouped = services.reduce((acc: Record<string, Service[]>, s) => {
    const cat = s.category || "Altro";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  if (showUploader) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => { setShowUploader(false); load(); }}
          className="inline-flex items-center gap-2 text-sm text-night/50 hover:text-night mb-5 transition"
        >
          <X size={14} /> Chiudi
        </button>
        <MenuUploader
          tenantId={tenantId!}
          businessType={isFood ? "food" : "services"}
          onComplete={() => { setShowUploader(false); load(); }}
          onCancel={() => setShowUploader(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">
            {isFood ? "Il tuo menu" : "I tuoi servizi"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isFood ? "Aggiungi piatti e bevande con foto" : "Aggiungi i servizi che offri"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowUploader(true)}
            className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white px-5 py-3 rounded-full font-bold text-sm inline-flex items-center gap-2 transition active:scale-95 shrink-0 shadow-lg shadow-violet-500/30"
          >
            <Sparkles size={18} />
            Carica {isFood ? "menu" : "listino"} con AI
          </button>
          <button
            onClick={openNew}
            className="bg-night hover:bg-night/90 text-white px-5 py-3 rounded-full font-bold text-sm inline-flex items-center gap-2 transition active:scale-95 shrink-0"
          >
            <Plus size={18} />
            {isFood ? "Aggiungi piatto" : "Aggiungi servizio"}
          </button>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-bold text-night mb-2">
            {isFood ? "Nessun piatto ancora" : "Nessun servizio ancora"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isFood ? "Inizia ad aggiungere i tuoi piatti" : "Inizia ad aggiungere i tuoi servizi"}
          </p>
          <button onClick={openNew} className="bg-wa hover:bg-waDark text-white px-6 py-3 rounded-full font-bold text-sm inline-flex items-center gap-2 transition">
            <Plus size={18} />
            {isFood ? "Aggiungi il primo piatto" : "Aggiungi il primo servizio"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{category}</h2>
              <div className="space-y-2">
                {items.map((s) => (
                  <div key={s.id} className={`bg-white rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 shadow-sm ${!s.is_available ? "opacity-50" : ""}`}>
                    {s.image_url ? (
                      <img
                        src={s.image_url}
                        alt={s.name}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-soft flex items-center justify-center text-2xl shrink-0">
                        {isFood ? "🍽️" : "✨"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-night text-sm">{s.name}</h3>
                        {s.is_featured && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">⭐ CHEF</span>
                        )}
                        {s.is_popular && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">🔥 POPOLARE</span>
                        )}
                        {!s.is_available && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                            NON DISPONIBILE
                          </span>
                        )}
                      </div>
                      {s.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="font-bold text-night">€{Number(s.price).toFixed(2)}</span>
                        {s.duration_minutes && (
                          <span className="text-gray-500 inline-flex items-center gap-1">
                            <Clock size={11} /> {s.duration_minutes} min
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleToggle(s)} className="p-2 text-gray-400 hover:text-wa transition" title={s.is_available ? "Disattiva" : "Attiva"}>
                        {s.is_available ? "✓" : "○"}
                      </button>
                      <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-blue-600 transition" title="Modifica">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-600 transition" title="Elimina">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 md:p-8">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-night">
                {editing ? "Modifica" : "Aggiungi"} {isFood ? "piatto" : "servizio"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {tenantId && (
                <UploadImage
                  tenantId={tenantId}
                  folder="services"
                  currentUrl={form.image_url || null}
                  onUpload={(url) => setForm({ ...form, image_url: url })}
                  label={isFood ? "Foto del piatto" : "Foto del servizio"}
                  hint="Quadrata, JPG/PNG · Max 5MB"
                  aspect="square"
                />
              )}

              <label className="block">
                <span className="text-sm font-semibold text-night mb-2 block">Nome *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={isFood ? "Es. Margherita" : "Es. Taglio + piega"}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-night mb-2 block">Descrizione</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={isFood ? "Pomodoro, mozzarella, basilico" : "Taglio personalizzato con piega finale"}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none resize-none"
                />
              </label>

              <div>
                <span className="text-sm font-semibold text-night mb-2 block">Categoria</span>
                {!showNewCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none bg-white"
                    >
                      <option value="">Seleziona...</option>
                      {existingCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => { setShowNewCategory(true); setForm({ ...form, category: "" }); }}
                      className="bg-soft hover:bg-gray-100 text-night px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition"
                    >
                      + Nuova
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder={isFood ? "Es. Pizze classiche" : "Es. Capelli"}
                      autoFocus
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => { setShowNewCategory(false); setForm({ ...form, category: "" }); }}
                      className="bg-soft hover:bg-gray-100 text-night px-4 py-3 rounded-xl font-semibold text-sm transition"
                    >
                      Annulla
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold text-night mb-2 block">Prezzo (€) *</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="7.50"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-night mb-2 block">Durata (min)</span>
                  <input
                    type="number"
                    min="0"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                    placeholder="30"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-cream rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-night">⭐ Consiglio Chef</p>
                    <p className="text-[10px] text-gray-500">In evidenza in alto</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                    className={`w-10 h-5 rounded-full transition relative ${form.is_featured ? "bg-yellow-500" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form.is_featured ? "left-5" : "left-1"}`} />
                  </button>
                </div>
                <div className="bg-cream rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-night">🔥 Il Più Ordinato</p>
                    <p className="text-[10px] text-gray-500">Mostra badge popolare</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_popular: !form.is_popular })}
                    className={`w-10 h-5 rounded-full transition relative ${form.is_popular ? "bg-orange-500" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form.is_popular ? "left-5" : "left-1"}`} />
                  </button>
                </div>
              </div>

              
<div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
  <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-3 flex items-center gap-2">
    <span className="text-base">🌍</span> Traduzioni (opzionale)
  </p>
  
  <details className="group">
    <summary className="cursor-pointer text-xs font-bold text-blue-700 hover:text-blue-900 py-1">
      🇬🇧 Inglese
    </summary>
    <div className="mt-3 space-y-2">
      <input
        type="text"
        value={(form as any).name_en || ""}
        onChange={(e) => setForm({ ...form, name_en: e.target.value } as any)}
        placeholder="Nome in inglese"
        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <textarea
        value={(form as any).description_en || ""}
        onChange={(e) => setForm({ ...form, description_en: e.target.value } as any)}
        placeholder="Descrizione in inglese"
        rows={2}
        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
      />
    </div>
  </details>

  <details className="group mt-2">
    <summary className="cursor-pointer text-xs font-bold text-blue-700 hover:text-blue-900 py-1">
      🇩🇪 Tedesco
    </summary>
    <div className="mt-3 space-y-2">
      <input
        type="text"
        value={(form as any).name_de || ""}
        onChange={(e) => setForm({ ...form, name_de: e.target.value } as any)}
        placeholder="Nome in tedesco"
        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <textarea
        value={(form as any).description_de || ""}
        onChange={(e) => setForm({ ...form, description_de: e.target.value } as any)}
        placeholder="Descrizione in tedesco"
        rows={2}
        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
      />
    </div>
  </details>
</div>

<div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-gray-200 hover:border-night text-night px-6 py-3.5 rounded-full font-semibold transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-wa hover:bg-waDark disabled:bg-gray-300 text-white py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editing ? "Salva modifiche" : "Aggiungi"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
