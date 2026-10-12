"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import UploadImage from "@/components/UploadImage";
import GoogleCalendarConnect from "@/components/GoogleCalendarConnect";
import { Loader2, Save, CheckCircle2, Clock, MapPin, Phone } from "lucide-react";

type Tenant = {
  id: string;
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
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const [form, setForm] = useState({
    business_name: "",
    description: "",
    address: "",
    phone: "",
    whatsapp_number: "",
    brand_color: "#25D366",
    logo_url: "",
    cover_image_url: "",
    opening_hours: {} as Record<string, string>,
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
        description: t.description || "",
        address: t.address || "",
        phone: t.phone || "",
        whatsapp_number: t.whatsapp_number || "",
        brand_color: t.brand_color || "#25D366",
        logo_url: t.logo_url || "",
        cover_image_url: t.cover_image_url || "",
        opening_hours: t.opening_hours || {
          mon: "09:00-19:00", tue: "09:00-19:00", wed: "09:00-19:00",
          thu: "09:00-19:00", fri: "09:00-19:00", sat: "09:00-19:00", sun: "chiuso",
        },
      });
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("tenants")
      .update({
        business_name: form.business_name,
        description: form.description || null,
        address: form.address || null,
        phone: form.phone || null,
        whatsapp_number: form.whatsapp_number,
        brand_color: form.brand_color,
        logo_url: form.logo_url || null,
        cover_image_url: form.cover_image_url || null,
        opening_hours: form.opening_hours,
      })
      .eq("id", tenant.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading || !tenant) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">Impostazioni</h1>
        <p className="text-gray-500 text-sm">
          Personalizza la tua web app con logo, copertina e colori
        </p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
          <CheckCircle2 size={16} /> Modifiche salvate
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* GOOGLE CALENDAR */}
        <div id="google-calendar-section">
          <GoogleCalendarConnect />
        </div>


        {/* IMMAGINI */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-night mb-5">Immagini</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <UploadImage
              tenantId={tenant.id}
              folder="logo"
              currentUrl={form.logo_url || null}
              onUpload={(url) => setForm({ ...form, logo_url: url })}
              label="Logo attività"
              hint="Quadrato, JPG/PNG · Max 5MB"
              aspect="square"
              brandColor={form.brand_color}
            />

            <UploadImage
              tenantId={tenant.id}
              folder="cover"
              currentUrl={form.cover_image_url || null}
              onUpload={(url) => setForm({ ...form, cover_image_url: url })}
              label="Immagine di copertina"
              hint="Orizzontale, JPG/PNG · Max 5MB"
              aspect="wide"
              brandColor={form.brand_color}
            />
          </div>
        </div>

        {/* INFO ATTIVITÀ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-night mb-5">Informazioni attività</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-night mb-2 block">Nome attività</span>
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-night mb-2 block">Descrizione</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none resize-none"
              />
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-night mb-2 flex items-center gap-2">
                  <MapPin size={14} /> Indirizzo
                </span>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-night mb-2 block">
                Numero WhatsApp
              </span>
              <input
                type="tel"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
              />
            </label>
          </div>
        </div>

        {/* COLORE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-night mb-5">Colore principale</h2>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="color"
              value={form.brand_color}
              onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
              className="w-14 h-14 rounded-xl border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={form.brand_color}
              onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm({ ...form, brand_color: c.value })}
                className={`aspect-square rounded-xl border-2 transition ${
                  form.brand_color === c.value ? "border-night scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* ORARI */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-night mb-5 flex items-center gap-2">
            <Clock size={20} /> Orari di apertura
          </h2>
          <div className="space-y-2">
            {DAYS.map((d) => (
              <div key={d.key} className="flex items-center gap-3">
                <span className="w-24 text-sm font-semibold text-night shrink-0">{d.label}</span>
                <input
                  type="text"
                  value={form.opening_hours[d.key] || ""}
                  onChange={(e) => setForm({
                    ...form,
                    opening_hours: { ...form.opening_hours, [d.key]: e.target.value },
                  })}
                  placeholder="09:00-19:00 oppure chiuso"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 focus:border-wa focus:outline-none text-sm"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Formato: <code className="bg-soft px-1.5 py-0.5 rounded">09:00-19:00</code> oppure{" "}
            <code className="bg-soft px-1.5 py-0.5 rounded">chiuso</code>
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-wa hover:bg-waDark disabled:bg-gray-300 text-white py-4 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98] sticky bottom-4 shadow-lg shadow-wa/30"
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
      </form>
    </div>
  );
}
