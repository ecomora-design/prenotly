"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import UploadImage from "@/components/UploadImage";
import MenuUploader from "@/components/MenuUploader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, X, Loader2, Save, Clock, Sparkles,
  Search, Star, Flame, Eye, EyeOff, Utensils,
  ChevronDown, Filter, Image as ImageIcon,
  Globe, TrendingUp, LayoutGrid, CheckCircle2
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    duration_minutes: "",
    image_url: "",
    is_featured: false,
    is_popular: false,
    name_en: "",
    description_en: "",
    name_de: "",
    description_de: "",
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
    setForm({
      name: "", description: "", category: "", price: "", duration_minutes: "",
      image_url: "", is_featured: false, is_popular: false,
      name_en: "", description_en: "", name_de: "", description_de: "",
    });
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
      is_popular: s.is_popular || false,
      name_en: s.name_en || "",
      description_en: s.description_en || "",
      name_de: s.name_de || "",
      description_de: s.description_de || "",
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
      name_en: form.name_en || null,
      description_en: form.description_en || null,
      name_de: form.name_de || null,
      description_de: form.description_de || null,
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

  const existingCategories = useMemo(
    () => Array.from(new Set(services.map((s) => s.category).filter(Boolean) as string[])).sort(),
    [services]
  );

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "all" || (s.category || "Altro") === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [services, searchQuery, categoryFilter]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc: Record<string, Service[]>, s) => {
      const cat = s.category || "Altro";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    }, {});
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin text-night" size={40} />
      </div>
    );
  }

  if (showUploader) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
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

  // KPI
  const totalCount = services.length;
  const availableCount = services.filter(s => s.is_available).length;
  const popularCount = services.filter(s => s.is_popular).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">

      {/* HEADER */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest mb-3">
              <Utensils size={12} /> {isFood ? "Menu Digitale" : "Listino Servizi"}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-night tracking-tight">
              {isFood ? "Il tuo Menu" : "I tuoi Servizi"}
            </h1>
            <p className="text-night/50 text-sm mt-1">
              {isFood ? "Gestisci piatti, prezzi e categorie" : "Gestisci i servizi che offri"}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowUploader(true)}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-full font-bold text-xs inline-flex items-center gap-2 transition active:scale-95 shadow-lg shadow-violet-500/30"
            >
              <Sparkles size={14} />
              Carica con AI
            </button>
            <button
              onClick={openNew}
              className="bg-night hover:bg-night/90 text-white px-4 py-2.5 rounded-full font-bold text-xs inline-flex items-center gap-2 transition active:scale-95 shadow-md"
            >
              <Plus size={14} />
              {isFood ? "Aggiungi Piatto" : "Aggiungi Servizio"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      {services.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[
              { label: "Totale", value: totalCount, icon: LayoutGrid, color: "#8B5CF6" },
              { label: "Disponibili", value: availableCount, icon: CheckCircle2, color: "#10B981" },
              { label: "Popolari", value: popularCount, icon: Flame, color: "#F97316" },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-4 md:p-5 border border-night/[0.06] shadow-sm relative overflow-hidden group hover:shadow-md transition"
              >
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.06] group-hover:opacity-[0.1] transition" style={{ backgroundColor: kpi.color }} />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.color + "15" }}>
                    <kpi.icon size={16} style={{ color: kpi.color }} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-night/40">{kpi.label}</p>
                </div>
                <p className="text-2xl md:text-3xl font-black text-night tracking-tight leading-none">{kpi.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH E FILTRI */}
      {services.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-white rounded-2xl p-3 md:p-4 border border-night/[0.06] shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-night/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cerca ${isFood ? "piatto" : "servizio"}...`}
                className="w-full bg-[#FAFAFA] border border-night/[0.06] rounded-xl pl-11 pr-4 py-3 text-sm font-semibold focus:border-night/20 focus:outline-none transition"
              />
            </div>
            {existingCategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={"px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 " +
                    (categoryFilter === "all" ? "bg-night text-white" : "bg-[#FAFAFA] text-night/60 hover:bg-[#F0F0F3]")
                  }
                >
                  Tutti
                </button>
                {existingCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={"px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 " +
                      (categoryFilter === cat ? "bg-night text-white" : "bg-[#FAFAFA] text-night/60 hover:bg-[#F0F0F3]")
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LISTA SERVIZI */}
      <div className="px-4 sm:px-6 lg:px-8">
        {services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-16 text-center shadow-sm border border-night/[0.04]"
          >
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils size={36} className="text-night/20" />
            </div>
            <h2 className="text-xl font-bold text-night mb-2">
              {isFood ? "Il tuo menu è vuoto" : "Nessun servizio ancora"}
            </h2>
            <p className="text-sm text-night/50 mb-6 max-w-md mx-auto">
              {isFood ? "Aggiungi il tuo primo piatto oppure carica tutto il menu con l'AI." : "Aggiungi i servizi che offri ai tuoi clienti."}
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={() => setShowUploader(true)}
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-3 rounded-full font-bold text-sm inline-flex items-center gap-2 transition active:scale-95 shadow-lg"
              >
                <Sparkles size={16} /> Carica con AI
              </button>
              <button
                onClick={openNew}
                className="bg-night hover:bg-night/90 text-white px-5 py-3 rounded-full font-bold text-sm inline-flex items-center gap-2 transition active:scale-95"
              >
                <Plus size={16} /> {isFood ? "Aggiungi piatto" : "Aggiungi servizio"}
              </button>
            </div>
          </motion.div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-night/[0.04]">
            <Search size={40} className="mx-auto text-night/20 mb-3" />
            <p className="text-base font-bold text-night/60">Nessun risultato</p>
            <p className="text-sm text-night/40 mt-1">Prova a cambiare la ricerca o il filtro</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items], catIdx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIdx * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-black text-night">{category}</h2>
                  <span className="text-[10px] font-bold text-night/40 bg-white px-2 py-1 rounded-full border border-night/[0.06]">
                    {items.length} {items.length === 1 ? "elemento" : "elementi"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {items.map((s) => (
                      <motion.div
                        key={s.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={"group bg-white rounded-3xl border border-night/[0.06] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col " + (!s.is_available ? "opacity-60" : "")}
                      >
                        {/* Immagine */}
                        <div className="relative aspect-[4/3] bg-cream overflow-hidden">
                          {s.image_url ? (
                            <img
                              src={s.image_url}
                              alt={s.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-[#EFEFF3]">
                              <Utensils className="text-night/10" size={48} />
                            </div>
                          )}

                          {/* Badge sovrapposti */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            {s.is_featured && (
                              <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
                                <Star size={10} /> Chef
                              </span>
                            )}
                            {s.is_popular && (
                              <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
                                <Flame size={10} /> Top
                              </span>
                            )}
                          </div>

                          {/* Badge non disponibile */}
                          {!s.is_available && (
                            <div className="absolute top-3 right-3">
                              <span className="inline-flex items-center gap-1 bg-black/70 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                                <EyeOff size={10} /> Nascosto
                              </span>
                            </div>
                          )}

                          {/* Prezzo sovrapposto */}
                          <div className="absolute bottom-3 right-3">
                            <span className="bg-white/95 backdrop-blur-sm text-night font-black text-base px-3 py-1.5 rounded-full shadow-lg">
                              €{Number(s.price).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Contenuto */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-black text-night text-base leading-tight mb-1 line-clamp-1">{s.name}</h3>
                          {s.description && (
                            <p className="text-xs text-night/50 leading-relaxed line-clamp-2 mb-3">{s.description}</p>
                          )}

                          <div className="flex items-center gap-3 text-[10px] font-bold text-night/40 mt-auto pt-2 border-t border-night/[0.04]">
                            {s.duration_minutes && (
                              <span className="inline-flex items-center gap-1">
                                <Clock size={11} /> {s.duration_minutes} min
                              </span>
                            )}
                            {(s.name_en || s.name_de) && (
                              <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                <Globe size={11} /> Tradotto
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Azioni */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-t border-night/[0.04]">
                          <button
                            onClick={() => handleToggle(s)}
                            className={"inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition " +
                              (s.is_available
                                ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                : "text-night/40 bg-white border border-night/[0.06] hover:bg-white/60")
                            }
                          >
                            {s.is_available ? <><Eye size={13} /> Visibile</> : <><EyeOff size={13} /> Nascosto</>}
                          </button>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEdit(s)}
                              className="p-2 text-night/50 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Modifica"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-2 text-night/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Elimina"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white pt-3 pb-4 px-6 border-b border-night/[0.06] z-10">
                <div className="w-12 h-1.5 bg-night/10 rounded-full mx-auto mb-4 md:hidden" />
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-night">
                      {editing ? "Modifica" : "Nuovo"} {isFood ? "piatto" : "servizio"}
                    </h2>
                    <p className="text-xs text-night/50 mt-0.5">
                      {editing ? "Aggiorna le informazioni" : "Aggiungi al tuo menu"}
                    </p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="text-night/40 hover:text-night p-2 rounded-full hover:bg-night/5 transition">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

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
                  <span className="text-xs font-black text-night/60 uppercase tracking-widest mb-2 block">Nome *</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={isFood ? "Es. Margherita" : "Es. Taglio + piega"}
                    required
                    className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-semibold focus:border-night/30 focus:outline-none transition"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black text-night/60 uppercase tracking-widest mb-2 block">Descrizione</span>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={isFood ? "Pomodoro, mozzarella, basilico" : "Taglio personalizzato con piega finale"}
                    rows={2}
                    className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm focus:border-night/30 focus:outline-none transition resize-none"
                  />
                </label>

                <div>
                  <span className="text-xs font-black text-night/60 uppercase tracking-widest mb-2 block">Categoria</span>
                  {!showNewCategory ? (
                    <div className="flex gap-2">
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="flex-1 bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-semibold focus:border-night/30 focus:outline-none transition"
                      >
                        <option value="">Seleziona...</option>
                        {existingCategories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => { setShowNewCategory(true); setForm({ ...form, category: "" }); }}
                        className="bg-night hover:bg-night/90 text-white px-4 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition"
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
                        className="flex-1 bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm focus:border-night/30 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => { setShowNewCategory(false); setForm({ ...form, category: "" }); }}
                        className="bg-night/5 hover:bg-night/10 text-night px-4 py-3 rounded-xl font-bold text-xs transition"
                      >
                        Annulla
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-black text-night/60 uppercase tracking-widest mb-2 block">Prezzo (€) *</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="7.50"
                      required
                      className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-bold focus:border-night/30 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-night/60 uppercase tracking-widest mb-2 block">Durata (min)</span>
                    <input
                      type="number"
                      min="0"
                      value={form.duration_minutes}
                      onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                      placeholder="30"
                      className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-bold focus:border-night/30 focus:outline-none"
                    />
                  </label>
                </div>

                {/* Toggle Chef/Popolare */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-cream rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-night flex items-center gap-1">⭐ Chef</p>
                      <p className="text-[10px] text-night/50">In evidenza</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                      className={"w-10 h-5 rounded-full transition relative " + (form.is_featured ? "bg-yellow-500" : "bg-gray-300")}
                    >
                      <span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all " + (form.is_featured ? "left-5" : "left-1")} />
                    </button>
                  </div>
                  <div className="bg-cream rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-night flex items-center gap-1">🔥 Popolare</p>
                      <p className="text-[10px] text-night/50">Il più ordinato</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_popular: !form.is_popular })}
                      className={"w-10 h-5 rounded-full transition relative " + (form.is_popular ? "bg-orange-500" : "bg-gray-300")}
                    >
                      <span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all " + (form.is_popular ? "left-5" : "left-1")} />
                    </button>
                  </div>
                </div>

                {/* Traduzioni */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Globe size={14} /> Traduzioni (opzionale)
                  </p>

                  <details className="group">
                    <summary className="cursor-pointer text-xs font-bold text-blue-700 hover:text-blue-900 py-1 flex items-center gap-1">
                      🇬🇧 Inglese <ChevronDown size={12} className="group-open:rotate-180 transition" />
                    </summary>
                    <div className="mt-3 space-y-2">
                      <input
                        type="text"
                        value={form.name_en}
                        onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                        placeholder="Nome in inglese"
                        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <textarea
                        value={form.description_en}
                        onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                        placeholder="Descrizione in inglese"
                        rows={2}
                        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </details>

                  <details className="group mt-2">
                    <summary className="cursor-pointer text-xs font-bold text-blue-700 hover:text-blue-900 py-1 flex items-center gap-1">
                      🇩🇪 Tedesco <ChevronDown size={12} className="group-open:rotate-180 transition" />
                    </summary>
                    <div className="mt-3 space-y-2">
                      <input
                        type="text"
                        value={form.name_de}
                        onChange={(e) => setForm({ ...form, name_de: e.target.value })}
                        placeholder="Nome in tedesco"
                        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <textarea
                        value={form.description_de}
                        onChange={(e) => setForm({ ...form, description_de: e.target.value })}
                        placeholder="Descrizione in tedesco"
                        rows={2}
                        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </details>
                </div>

                <div className="flex gap-3 pt-2 sticky bottom-0 bg-white py-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="border border-night/10 hover:border-night/30 text-night px-5 py-3.5 rounded-full font-bold text-sm transition"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-night hover:bg-night/90 disabled:bg-gray-300 text-white py-3.5 rounded-full font-black text-sm transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {saving ? (
                      <><Loader2 className="animate-spin" size={16} /> Salvataggio...</>
                    ) : (
                      <><Save size={16} /> {editing ? "Salva modifiche" : "Aggiungi"}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
