"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ShoppingBag, Calendar, ExternalLink, Plus, ArrowRight,
  TrendingUp, Clock, Loader2, CheckCircle2
} from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  business_type: string;
  product_type: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [counts, setCounts] = useState({ bookings: 0, orders: 0, services: 0 });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(id, slug, business_name, business_type, product_type, subscription_status, trial_ends_at)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!link || !link.tenants) {
        router.push("/onboarding");
        return;
      }

      const t = link.tenants as unknown as Tenant;
      setTenant(t);

      const { count: bCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", t.id);

      const { count: oCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", t.id);

      const { count: sCount } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", t.id);

      setCounts({
        bookings: bCount || 0,
        orders: oCount || 0,
        services: sCount || 0,
      });

      setLoading(false);
    }
    load();
  }, []);

  if (loading || !tenant) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  const isFood = tenant.product_type === "food" || tenant.business_type === "restaurant";

  const trialHoursLeft = tenant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">
          Ciao! 👋
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Ecco cosa sta succedendo su <strong className="text-night">{tenant.business_name}</strong>
        </p>
      </div>

      {/* Card stato trial */}
      {tenant.subscription_status === "trial" && trialHoursLeft > 0 && (
        <div className="bg-gradient-to-r from-wa to-waDark rounded-2xl p-5 md:p-6 text-white mb-6 shadow-lg">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock size={18} />
                <p className="font-bold">Demo attiva</p>
              </div>
              <p className="text-white/90 text-sm">
                Ti restano <strong>{trialHoursLeft} ore</strong> di prova gratuita.
              </p>
            </div>
            <Link
              href="/dashboard/abbonamento"
              className="bg-white text-waDark px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition inline-flex items-center gap-2 shrink-0"
            >
              Attiva ora
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {tenant.subscription_status === "active" && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6 flex items-center gap-3">
          <CheckCircle2 className="text-green-600 shrink-0" size={24} />
          <div>
            <p className="font-bold text-night text-sm">Abbonamento attivo</p>
            <p className="text-gray-600 text-xs">Tutto regolare. Grazie per averci scelto!</p>
          </div>
        </div>
      )}

      {/* Link pubblico */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">
          Il tuo link pubblico
        </p>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-mono text-night break-all">
            prenotly-italia.it/{tenant.slug}
          </p>
          <Link
            href={`/${tenant.slug}`}
            target="_blank"
            className="bg-wa hover:bg-waDark text-white px-4 py-2 rounded-full font-semibold text-xs inline-flex items-center gap-2 active:scale-95 transition shrink-0"
          >
            <ExternalLink size={14} />
            Apri
          </Link>
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-wa/10 flex items-center justify-center">
              <Utensils2 className="text-waDark" size={16} />
            </div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              {isFood ? "Menu" : "Servizi"}
            </p>
          </div>
          <p className="text-3xl font-bold text-night">{counts.services}</p>
          <Link href="/dashboard/servizi" className="text-xs text-waDark font-semibold mt-2 inline-block">
            Gestisci →
          </Link>
        </div>

        {isFood ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShoppingBag className="text-blue-600" size={16} />
              </div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Ordini
              </p>
            </div>
            <p className="text-3xl font-bold text-night">{counts.orders}</p>
            <Link href="/dashboard/ordini" className="text-xs text-blue-600 font-semibold mt-2 inline-block">
              Vedi tutti →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <Calendar className="text-violet-500" size={16} />
              </div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Prenotazioni
              </p>
            </div>
            <p className="text-3xl font-bold text-night">{counts.bookings}</p>
            <Link href="/dashboard/prenotazioni" className="text-xs text-violet-500 font-semibold mt-2 inline-block">
              Vedi tutte →
            </Link>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="text-green-600" size={16} />
            </div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Stato
            </p>
          </div>
          <p className="text-sm font-semibold text-waDark">
            {tenant.subscription_status === "active" ? "✅ Attivo" : "⏰ Demo"}
          </p>
        </div>
      </div>

      {/* Azioni rapide */}
      <h2 className="text-lg font-bold text-night mb-4">Azioni rapide</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/servizi"
          className="bg-white rounded-2xl p-5 hover:shadow-lg transition flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-wa/10 flex items-center justify-center shrink-0">
            <Plus className="text-waDark" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-night">
              {isFood ? "Aggiungi un piatto" : "Aggiungi un servizio"}
            </p>
            <p className="text-xs text-gray-500">
              {isFood ? "Crea il tuo menu" : "Crea il tuo listino"}
            </p>
          </div>
          <ArrowRight size={18} className="text-gray-400 shrink-0" />
        </Link>

        <Link
          href="/dashboard/impostazioni"
          className="bg-white rounded-2xl p-5 hover:shadow-lg transition flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <Settings2 className="text-violet-500" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-night">Personalizza la tua web app</p>
            <p className="text-xs text-gray-500">Colori, logo, orari</p>
          </div>
          <ArrowRight size={18} className="text-gray-400 shrink-0" />
        </Link>
      </div>
    </div>
  );
}

// Icone import inline per non appesantire gli import sopra
function Utensils2({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function Settings2({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 7h-9" />
      <path d="M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </svg>
  );
}
