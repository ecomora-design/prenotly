"use client";

import { useState, useEffect, useMemo } from "react";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Store, ArrowRight, Loader2, Utensils, Scissors, CheckCircle2, AlertCircle } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [businessType, setBusinessType] = useState<"restaurant" | "services">("restaurant");
  const [app, setWhatsapp] = useState("");
const appValid = useMemo(() => {
  const clean = app.replace(/\s/g, "");
  return /^\+\d{10,15}$/.test(clean);
}, [app]);
  const [description, setDescription] = useState("");

  // Controlla se l'utente ha già un'azienda
  useEffect(() => {
    async function checkExisting() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: existing } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(slug)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        router.push("/dashboard");
        return;
      }
      setChecking(false);
    }
    checkExisting();
  }, []);

  // Genera slug automatico dal nome
  useEffect(() => {
    if (businessName && !slug) {
      const generated = businessName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 30);
      setSlug(generated);
    }
  }, [businessName]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // 1. Controlla slug disponibile
    const { data: existingSlug } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      setError("Questo indirizzo è già in uso. Scegline un altro.");
      setLoading(false);
      return;
    }

    // 2. Crea il tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        slug,
        business_name: businessName,
        business_type: businessType,
        description: description || null,
        app_number: app.replace(/\s/g, ""),
        is_active: true,
        plan_type: businessType === "restaurant" ? "food_menu" : "beauty",
      })
      .select()
      .single();

    if (tenantError || !tenant) {
      setError(tenantError?.message || "Errore nella creazione");
      setLoading(false);
      return;
    }

    // 3. Collega utente al tenant
    const { error: linkError } = await supabase
      .from("tenant_users")
      .insert({
        tenant_id: tenant.id,
        user_id: user.id,
        role: "owner",
      });

    if (linkError) {
      setError(linkError.message);
      setLoading(false);
      return;
    }

    // 4. Vai alla dashboard
    router.push("/dashboard");
    router.refresh();
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-soft">
        <Loader2 className="animate-spin text-wa" size={32} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-soft to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-wa/10 mb-4">
            <Store className="text-waDark" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-night mb-2">
            Crea la tua attività
          </h1>
          <p className="text-sm text-gray-500">
            Ci vogliono 2 minuti. Potrai modificare tutto dopo.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-5">
          {/* Nome attività */}
          <label className="block">
            <span className="text-sm font-semibold text-night mb-2 block">
              Nome dell&apos;attività *
            </span>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Es. Pizzeria Da Marco"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
            />
          </label>

          {/* Slug / URL */}
          <label className="block">
            <span className="text-sm font-semibold text-night mb-2 block">
              Il tuo indirizzo web *
            </span>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-wa">
              <span className="px-3 py-3 text-sm text-gray-500 bg-soft border-r border-gray-200 whitespace-nowrap">
                prenotly-italia.it/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="da-marco"
                required
                className="flex-1 px-3 py-3 focus:outline-none text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Solo lettere minuscole, numeri e trattini
            </p>
          </label>

          {/* Tipo attività */}
          <div>
            <span className="text-sm font-semibold text-night mb-2 block">
              Che tipo di attività è? *
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBusinessType("restaurant")}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  businessType === "restaurant"
                    ? "border-wa bg-wa/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Utensils size={22} className={businessType === "restaurant" ? "text-waDark" : "text-gray-400"} />
                <p className="font-semibold text-night text-sm mt-2">Ristorante</p>
                <p className="text-xs text-gray-500">Menu, ordini, asporto</p>
              </button>
              <button
                type="button"
                onClick={() => setBusinessType("services")}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  businessType === "services"
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Scissors size={22} className={businessType === "services" ? "text-violet-500" : "text-gray-400"} />
                <p className="font-semibold text-night text-sm mt-2">Servizi</p>
                <p className="text-xs text-gray-500">Appuntamenti, agenda</p>
              </button>
            </div>
          </div>

          {/* App */}       
<label className="block">
  <span className="text-sm font-semibold text-night mb-2 block">
    Numero App *
  </span>
  <div className="relative">
    <input
      type="tel"
      value={app}
      onChange={(e) => {
        let val = e.target.value.replace(/[^\d+ ]/g, "");
        if (val && !val.startsWith("+")) val = "+39 " + val;
        setWhatsapp(val);
      }}
      placeholder="+39 333 1234567"
      required
      className={`w-full border-2 rounded-xl px-4 py-3 pr-12 focus:outline-none transition ${
        appValid
          ? "border-green-300 focus:border-green-500"
          : app && app.length > 5
          ? "border-red-300 focus:border-red-500"
          : "border-gray-200 focus:border-wa"
      }`}
    />
    {appValid && (
      <CheckCircle2
        className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500"
        size={20}
      />
    )}
  </div>
  {app && !appValid && (
    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
      <AlertCircle size={12} />
      Formato non valido. Usa: +39 333 1234567
    </p>
  )}
  {appValid && (
    <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
      <CheckCircle2 size={12} />
      Numero valido
    </p>
  )}
  <p className="text-xs text-gray-500 mt-1.5">
    È il numero dove riceverai <strong>tutti</strong> gli ordini e le prenotazioni.
    Assicurati che sia attivo su App.
  </p>
</label>

          {/* Descrizione */}
          <label className="block">
            <span className="text-sm font-semibold text-night mb-2 block">
              Descrizione (opzionale)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Una breve presentazione della tua attività"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none resize-none"
            />
          </label>

          <button
            type="submit"
            disabled={loading || !businessName || !slug || !app}
            className="w-full bg-wa hover:bg-waDark disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Creazione...
              </>
            ) : (
              <>
                Crea attività
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
