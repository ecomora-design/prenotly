"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import UploadImage from "@/components/UploadImage";
import GoogleCalendarConnect from "@/components/GoogleCalendarConnect";
import { motion } from "framer-motion";
import {
  Loader2, Save, CheckCircle2, Clock, MapPin, Phone, Truck, CalendarClock, X,
  Store, Image as ImageIcon, Palette, Globe, FileText,
  MessageCircle, AlertCircle, Sparkles, ExternalLink
} from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  product_type: string | null;
  business_type: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  opening_hours: Record<string, string> | null;
  brand_color: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  booking_slots: string[] | null;
  has_delivery: boolean | null;
  has_takeaway: boolean | null;
  delivery_fee: number | null;
  min_order_delivery: number | null;
  slot_duration_minutes: number | null;
  enable_table_bookings: boolean | null;
  plan_type: string | null;
  subscription_ends_at: string | null;
  trial_ends_at: string | null;
  subscription_status: string | null;
};

const DAYS = [
  { key: "mon", label: "Lunedì" },
  { key: "tue", label: "Martedì" },
  { key: "wed", label: "Mercoledì" },
  { key: "thu", label: "Giovedì" },
  { key: "fri", label: "Venerdì" },
  { key: "sat", label: "Sabato" },
  { key: "sun", label: "Domenica" },
];

const PRESET_COLORS = [
  { name: "Verde", value: "#25D366" },
  { name: "Viola", value: "#8B5CF6" },
  { name: "Blu", value: "#3B82F6" },
  { name: "Rosso", value: "#EF4444" },
  { name: "Arancione", value: "#F97316" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Nero", value: "#0F172A" },
  { name: "Oro", value: "#D4AF37" },
];

export default function ImpostazioniPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  // Slug check
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");

  const [form, setForm] = useState({
    business_name: "",
    slug: "",
    description: "",
    address: "",
    phone: "",
    whatsapp_number: "",
    brand_color: "#25D366",
    logo_url: "",
    cover_image_url: "",
    opening_hours: {} as Record<string, string>,
    booking_slots: ["19:30", "20:00", "20:30", "21:00", "21:30"] as string[],
    has_delivery: true,
    has_takeaway: true,
    delivery_fee: 0,
    min_order_delivery: 0,
    slot_duration_minutes: 120,
    enable_table_bookings: true,
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(*)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!link || !link.tenants) { router.push("/onboarding"); return; }

      const t = link.tenants as unknown as Tenant;
      setTenant(t);
      setForm({
        business_name: t.business_name || "",
        slug: t.slug || "",
        description: t.description || "",
        address: t.address || "",
        phone: t.phone || "",
        whatsapp_number: t.whatsapp_number || "",
        brand_color: t.brand_color || "#25D366",
        logo_url: t.logo_url || "",
        cover_image_url: t.cover_image_url || "",
        booking_slots: t.booking_slots || ["19:30", "20:00", "20:30", "21:00", "21:30"],
        has_delivery: t.has_delivery ?? true,
        has_takeaway: t.has_takeaway ?? true,
        delivery_fee: t.delivery_fee || 0,
        min_order_delivery: t.min_order_delivery || 0,
        slot_duration_minutes: t.slot_duration_minutes || 120,
        enable_table_bookings: t.enable_table_bookings ?? true,
        opening_hours: t.opening_hours || {
          mon: "09:00-19:00",
          tue: "09:00-19:00",
          wed: "09:00-19:00",
          thu: "09:00-19:00",
          fri: "09:00-19:00",
          sat: "09:00-19:00",
          sun: "chiuso",
        },
      });
      setLoading(false);
    }
    load();
  }, []);

  // Check slug disponibilità (debounced)
  useEffect(() => {
    if (!tenant || form.slug === tenant.slug) {
      setSlugStatus("idle");
      return;
    }

    if (!form.slug || form.slug.length < 3) {
      setSlugStatus("invalid");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      setSlugStatus("invalid");
      return;
    }

    setSlugStatus("checking");
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", form.slug)
        .maybeSingle();

      setSlugStatus(data ? "taken" : "available");
    }, 500);

    return () => clearTimeout(timer);
  }, [form.slug, tenant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setError(null);

    if (slugStatus === "taken") {
      setError("L'URL scelto è già in uso. Scegline un altro.");
      return;
    }
    if (slugStatus === "invalid") {
      setError("L'URL deve avere almeno 3 caratteri (lettere minuscole, numeri, trattini).");
      return;
    }

    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("tenants")
      .update({
        business_name: form.business_name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp_number: form.whatsapp_number.trim(),
        brand_color: form.brand_color,
        logo_url: form.logo_url || null,
        cover_image_url: form.cover_image_url || null,
        booking_slots: form.booking_slots,
        has_delivery: form.has_delivery,
        has_takeaway: form.has_takeaway,
        delivery_fee: Number(form.delivery_fee) || 0,
        min_order_delivery: Number(form.min_order_delivery) || 0,
        slot_duration_minutes: Number(form.slot_duration_minutes) || 120,
        enable_table_bookings: form.enable_table_bookings,
        opening_hours: form.opening_hours,
      })
      .eq("id", tenant.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Ricarica tenant per aggiornare lo slug di riferimento
    setTenant({ ...tenant, slug: form.slug.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  };

  if (loading || !tenant) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-waDark" size={32} />
      </div>
    );
  }

  const brandColor = form.brand_color || "#25D366";

    const isTrial = tenant?.subscription_status === 'trial';
  const canUseTables = isTrial || tenant?.plan_type === 'food_tables' || tenant?.plan_type === 'food_premium';

  return (
    <div className="max-w-3xl mx-auto pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 md:mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-night tracking-tight mb-1">
          Impostazioni
        </h1>
        <p className="text-night/50 text-sm">
          Modifica le informazioni della tua attività
        </p>
      </motion.div>

      {/* Anteprima */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-3xl p-5 mb-6 border border-night/5 flex items-center gap-4"
      >
        {form.logo_url ? (
          <img
            src={form.logo_url}
            alt={form.business_name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cream shrink-0"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {form.business_name.charAt(0) || "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-night truncate">
            {form.business_name || "Nome attività"}
          </p>
          <a
            href={`/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-night/50 hover:text-waDark truncate flex items-center gap-1 transition"
          >
            prenotly-italia.it/{form.slug}
            <ExternalLink size={10} />
          </a>
        </div>
      </motion.div>

      {/* Banner salvataggio */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-100 text-green-700 rounded-2xl px-4 py-3 text-sm mb-5 flex items-center gap-2"
        >
          <CheckCircle2 size={16} /> Modifiche salvate con successo
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm mb-5 flex items-start gap-2"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* SEZIONE: IDENTITÀ */}
        <Section
          icon={Store}
          title="La tua attività"
          subtitle="Nome, descrizione e URL pubblico"
        >
          <label className="block">
            <span className="text-sm font-semibold text-night mb-2 block">
              Nome attività *
            </span>
            <input
              type="text"
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              placeholder="Es. Pizzeria Da Marco"
              required
              className="w-full bg-cream border border-transparent rounded-2xl px-4 py-3.5 text-[15px] focus:bg-white focus:border-night/20 focus:outline-none transition"
            />
          </label>

          <label className="block mt-4">
            <span className="text-sm font-semibold text-night mb-2 block">
              Descrizione
            </span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Pizzeria tradizionale napoletana nel cuore della città..."
              rows={3}
              maxLength={300}
              className="w-full bg-cream border border-transparent rounded-2xl px-4 py-3.5 text-[15px] focus:bg-white focus:border-night/20 focus:outline-none transition resize-none"
            />
            <p className="text-xs text-night/40 mt-1 text-right">
              {form.description.length}/300
            </p>
          </label>

          <div className="mt-4">
            <span className="text-sm font-semibold text-night mb-2 block">
              URL pubblico *
            </span>
            <div className="flex items-center bg-cream rounded-2xl overflow-hidden">
              <span className="px-3.5 py-3.5 text-xs md:text-sm text-night/50 whitespace-nowrap bg-night/5 font-medium">
                prenotly-italia.it/
              </span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, ""),
                  })
                }
                placeholder="da-marco"
                required
                className="flex-1 bg-transparent border-0 px-3 py-3.5 text-[15px] font-semibold focus:outline-none min-w-0"
              />
              <div className="pr-3.5 shrink-0">
                {slugStatus === "checking" && (
                  <Loader2 className="animate-spin text-night/40" size={16} />
                )}
                {slugStatus === "available" && (
                  <CheckCircle2 className="text-green-500" size={18} />
                )}
                {slugStatus === "taken" && (
                  <X className="text-red-500" size={18} />
                )}
                {slugStatus === "invalid" && (
                  <AlertCircle className="text-yellow-500" size={18} />
                )}
              </div>
            </div>
            {slugStatus === "available" && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <CheckCircle2 size={12} /> Disponibile!
              </p>
            )}
            {slugStatus === "taken" && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <X size={12} /> Già in uso, scegline un altro
              </p>
            )}
            {slugStatus === "invalid" && (
              <p className="text-xs text-yellow-600 mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} /> Minimo 3 caratteri (minuscole, numeri, trattini)
              </p>
            )}
            <p className="text-xs text-night/40 mt-1.5">
              ⚠️ Se cambi URL, i vecchi link non funzioneranno più
            </p>
          </div>
        </Section>

        {/* SEZIONE: IMMAGINI */}
        <Section
          icon={ImageIcon}
          title="Immagini"
          subtitle="Logo e copertina della tua web app"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <UploadImage
              tenantId={tenant.id}
              folder="logo"
              currentUrl={form.logo_url || null}
              onUpload={(url) => setForm({ ...form, logo_url: url })}
              label="Logo attività"
              hint="Quadrato, JPG/PNG · Max 5MB"
              aspect="square"
              brandColor={brandColor}
            />
            <UploadImage
              tenantId={tenant.id}
              folder="cover"
              currentUrl={form.cover_image_url || null}
              onUpload={(url) => setForm({ ...form, cover_image_url: url })}
              label="Copertina"
              hint="Orizzontale, JPG/PNG · Max 5MB"
              aspect="wide"
              brandColor={brandColor}
            />
          </div>
        </Section>

        {/* SEZIONE: CONTATTI */}
        <Section
          icon={Phone}
          title="Contatti"
          subtitle="Come i clienti ti trovano e ti contattano"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-night mb-2 flex items-center gap-2">
                <MapPin size={14} /> Indirizzo
              </span>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Via Roma 10, Milano"
                className="w-full bg-cream border border-transparent rounded-2xl px-4 py-3.5 text-[15px] focus:bg-white focus:border-night/20 focus:outline-none transition"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-night mb-2 flex items-center gap-2">
                <Phone size={14} /> Telefono
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+39 02 1234567"
                className="w-full bg-cream border border-transparent rounded-2xl px-4 py-3.5 text-[15px] focus:bg-white focus:border-night/20 focus:outline-none transition"
              />
            </label>
          </div>

          <label className="block mt-4">
            <span className="text-sm font-semibold text-night mb-2 flex items-center gap-2">
              <MessageCircle size={14} /> Numero WhatsApp *
            </span>
            <input
              type="tel"
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
              placeholder="+39 333 1234567"
              required
              className="w-full bg-cream border border-transparent rounded-2xl px-4 py-3.5 text-[15px] focus:bg-white focus:border-night/20 focus:outline-none transition"
            />
            <p className="text-xs text-night/40 mt-1.5">
              Gli ordini e le prenotazioni arriveranno qui. Includi il prefisso +39.
            </p>
          </label>
        </Section>

        {/* OPZIONI ORDINI */}
        {tenant.business_type === "restaurant" && (
          <Section
            icon={Truck}
            title="Opzioni ordini"
            subtitle="Come i tuoi clienti ricevono gli ordini"
          >
            <div className="flex items-center justify-between p-4 rounded-2xl bg-cream mb-3">
              <div>
                <p className="font-semibold text-night text-sm">Asporto</p>
                <p className="text-xs text-night/50">I clienti vengono a ritirare</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, has_takeaway: !form.has_takeaway })}
                className={`w-12 h-6 rounded-full transition relative ${form.has_takeaway ? "bg-wa" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${form.has_takeaway ? "left-6" : "left-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-cream mb-4">
              <div>
                <p className="font-semibold text-night text-sm">Domicilio</p>
                <p className="text-xs text-night/50">Consegni a casa del cliente</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, has_delivery: !form.has_delivery })}
                className={`w-12 h-6 rounded-full transition relative ${form.has_delivery ? "bg-wa" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${form.has_delivery ? "left-6" : "left-0.5"}`} />
              </button>
            </div>

            {form.has_delivery && (
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-night/[0.06]">
                <label className="block">
                  <span className="text-sm font-semibold text-night mb-2 block">Costo consegna (€)</span>
                  <input
                    type="number" step="0.01" min="0"
                    value={form.delivery_fee}
                    onChange={(e) => setForm({ ...form, delivery_fee: parseFloat(e.target.value) || 0 })}
                    placeholder="2.50"
                    className="w-full bg-cream border border-transparent rounded-2xl px-4 py-3 focus:bg-white focus:border-night/20 focus:outline-none transition"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-night mb-2 block">Ordine minimo (€)</span>
                  <input
                    type="number" step="0.01" min="0"
                    value={form.min_order_delivery}
                    onChange={(e) => setForm({ ...form, min_order_delivery: parseFloat(e.target.value) || 0 })}
                    placeholder="10.00"
                    className="w-full bg-cream border border-transparent rounded-2xl px-4 py-3 focus:bg-white focus:border-night/20 focus:outline-none transition"
                  />
                </label>
              </div>
            )}
          </Section>
        )}

        {/* TURNI PRENOTAZIONE */}
        {tenant.business_type === "restaurant" && (
          <Section
            icon={CalendarClock}
            title="Prenotazione Tavoli"
            subtitle="Gestisci se e come i clienti possono prenotare"
          >
            <div className="flex items-center justify-between p-4 rounded-2xl bg-cream mb-6">
              <div>
                <p className="font-semibold text-night text-sm">Abilita prenotazione tavoli</p>
                <p className="text-xs text-night/50">Permetti ai clienti di prenotare un tavolo dal sito</p>
                {!canUseTables && (
                  <p className="text-[11px] text-orange-600 font-bold mt-1">
                    ⚠️ Richiede il piano Food + Tavoli. <a href="/dashboard/abbonamento" className="underline">Fai l'upgrade</a>
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={!canUseTables}
                onClick={() => setForm({ ...form, enable_table_bookings: !form.enable_table_bookings })}
                className={`w-12 h-6 rounded-full transition relative ${form.enable_table_bookings ? "bg-wa" : "bg-gray-300"} ${!canUseTables ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${form.enable_table_bookings ? "left-6" : "left-0.5"}`} />
              </button>
            </div>

            {form.enable_table_bookings && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex flex-wrap gap-2 mb-4">
              {(form.booking_slots || []).map((slot, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-white border border-night/[0.06] rounded-full pl-3 pr-1 py-1.5">
                  <span className="text-sm font-semibold text-night">{slot}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, booking_slots: (form.booking_slots || []).filter((_, i) => i !== idx) })}
                    className="w-6 h-6 rounded-full text-red-400 hover:bg-red-50 flex items-center justify-center transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="time" id="new-slot-input"
                className="flex-1 bg-cream border border-transparent rounded-2xl px-4 py-3 focus:bg-white focus:border-night/20 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById("new-slot-input") as HTMLInputElement;
                  const val = input.value;
                  if (val && !(form.booking_slots || []).includes(val)) {
                    setForm({ ...form, booking_slots: [...(form.booking_slots || []), val].sort() });
                    input.value = "";
                  }
                }}
                className="bg-night hover:bg-night/90 text-white px-5 py-3 rounded-2xl font-semibold text-sm transition"
              >
                Aggiungi
              </button>
            </div>

                <label className="block pt-4 border-t border-night/[0.06]">
                  <span className="text-sm font-semibold text-night mb-2 block">Durata slot (minuti)</span>
                  <input
                    type="number" min="30" step="15"
                    value={form.slot_duration_minutes}
                    onChange={(e) => setForm({ ...form, slot_duration_minutes: parseInt(e.target.value) || 120 })}
                    className="w-full bg-cream border border-transparent rounded-2xl px-4 py-3 focus:bg-white focus:border-night/20 focus:outline-none transition"
                  />
                </label>
              </div>
            )}
          </Section>
        )}

        {/* SEZIONE: BRAND */}
        <Section
          icon={Palette}
          title="Colore principale"
          subtitle="Il colore della tua web app"
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="color"
              value={form.brand_color}
              onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
              className="w-14 h-14 rounded-2xl border border-night/10 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={form.brand_color}
              onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
              className="flex-1 bg-cream border border-transparent rounded-2xl px-4 py-3.5 text-sm font-mono focus:bg-white focus:border-night/20 focus:outline-none transition"
            />
          </div>

          <p className="text-xs font-semibold text-night/50 uppercase tracking-wider mb-2">
            Colori consigliati
          </p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm({ ...form, brand_color: c.value })}
                className={`aspect-square rounded-2xl border-2 transition ${
                  form.brand_color === c.value
                    ? "border-night scale-110 shadow-lg"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </Section>

        {/* SEZIONE: ORARI */}
        <Section
          icon={Clock}
          title="Orari di apertura"
          subtitle="Quando sei aperto"
        >
          <div className="space-y-2">
            {DAYS.map((d) => {
              const dayValue = form.opening_hours[d.key] || "chiuso";
              const isClosed = dayValue === "chiuso";
              
              // Estrai orari apertura/chiusura (default 09:00-19:00 se formato non valido)
              let openTime = "09:00";
              let closeTime = "19:00";
              if (!isClosed && dayValue.includes("-")) {
                const parts = dayValue.split("-");
                if (parts.length === 2) {
                  openTime = parts[0].trim();
                  closeTime = parts[1].trim();
                }
              }

              const handleTimeChange = (newOpen: string, newClose: string) => {
                setForm({
                  ...form,
                  opening_hours: {
                    ...form.opening_hours,
                    [d.key]: `${newOpen}-${newClose}`
                  }
                });
              };

              return (
                <div key={d.key} className="flex items-center gap-3 bg-cream rounded-2xl px-4 py-2.5">
                  <span className="w-20 text-sm font-semibold text-night shrink-0">{d.label}</span>
                  
                  {isClosed ? (
                    <span className="flex-1 text-sm text-night/40 italic">Chiuso</span>
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="time"
                        value={openTime}
                        onChange={(e) => handleTimeChange(e.target.value, closeTime)}
                        className="bg-white border border-night/[0.06] rounded-lg px-2 py-1.5 text-sm focus:border-night/20 focus:outline-none"
                      />
                      <span className="text-night/30">—</span>
                      <input
                        type="time"
                        value={closeTime}
                        onChange={(e) => handleTimeChange(openTime, e.target.value)}
                        className="bg-white border border-night/[0.06] rounded-lg px-2 py-1.5 text-sm focus:border-night/20 focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        ...form,
                        opening_hours: {
                          ...form.opening_hours,
                          [d.key]: isClosed ? "09:00-19:00" : "chiuso"
                        }
                      });
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition ${
                      isClosed
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-red-50 text-red-500 hover:bg-red-100"
                    }`}
                  >
                    {isClosed ? "Apri" : "Chiudi"}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-night/40 mt-3">
            Formato: <code className="bg-cream px-1.5 py-0.5 rounded">09:00-19:00</code> per più fasce:{" "}
            <code className="bg-cream px-1.5 py-0.5 rounded">12:00-15:00,19:00-23:00</code>
          </p>
        </Section>

        {/* SEZIONE: GOOGLE CALENDAR (solo beauty) */}
        {!(
          tenant.product_type === "food" ||
          tenant.business_type === "restaurant"
        ) && (
          <Section
            icon={Globe}
            title="Google Calendar"
            subtitle="Sincronizza gli appuntamenti con il tuo calendario"
          >
            <GoogleCalendarConnect />
          </Section>
        )}
      </form>

      {/* BARRA SALVA STICKY */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-night/5 p-4 lg:pl-72 z-30">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-night hover:bg-night/90 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Salvataggio...
              </>
            ) : (
              <>
                <Save size={18} />
                Salva modifiche
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 md:p-7 border border-night/5"
    >
      <div className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-cream flex items-center justify-center shrink-0">
          <Icon size={20} className="text-waDark" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base md:text-lg font-bold text-night leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs md:text-sm text-night/50 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );
}
