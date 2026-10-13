"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Loader2, ShoppingBag, Calendar, Users, QrCode, Plus,
  ArrowRight, TrendingUp, Clock, ExternalLink, Sparkles,
  CheckCircle2, Utensils, Settings, Eye, BarChart3, Zap
} from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  business_type: string;
  product_type: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  logo_url: string | null;
  brand_color: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [counts, setCounts] = useState({
    bookings: 0,
    orders: 0,
    services: 0,
    customers: 0,
    todayOrders: 0,
    todayBookings: 0,
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

      // Statistiche
      const [b, o, s, c] = await Promise.all([
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
      ]);

      // Oggi
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [todayO, todayB] = await Promise.all([
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", t.id)
          .gte("created_at", todayStart.toISOString())
          .lte("created_at", todayEnd.toISOString()),
        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", t.id)
          .gte("scheduled_at", todayStart.toISOString())
          .lte("scheduled_at", todayEnd.toISOString()),
      ]);

      setCounts({
        bookings: b.count || 0,
        orders: o.count || 0,
        services: s.count || 0,
        customers: c.count || 0,
        todayOrders: todayO.count || 0,
        todayBookings: todayB.count || 0,
      });

      setLoading(false);
    }
    load();
  }, []);

  if (loading || !tenant) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-waDark" size={32} />
      </div>
    );
  }

  const isFood = tenant.product_type === "food" || tenant.business_type === "restaurant";
  const brandColor = tenant.brand_color || (isFood ? "#25D366" : "#8B5CF6");
  const trialHoursLeft = tenant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  const firstName = tenant.business_name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buongiorno" : hour < 18 ? "Buon pomeriggio" : "Buonasera";

  const mainStats = isFood
    ? [
        {
          icon: ShoppingBag,
          label: "Ordini totali",
          value: counts.orders,
          today: counts.todayOrders,
          href: "/dashboard/ordini",
          color: brandColor,
        },
        {
          icon: Utensils,
          label: "Piatti nel menu",
          value: counts.services,
          href: "/dashboard/servizi",
          color: brandColor,
        },
      ]
    : [
        {
          icon: Calendar,
          label: "Prenotazioni totali",
          value: counts.bookings,
          today: counts.todayBookings,
          href: "/dashboard/prenotazioni",
          color: brandColor,
        },
        {
          icon: Utensils,
          label: "Servizi attivi",
          value: counts.services,
          href: "/dashboard/servizi",
          color: brandColor,
        },
      ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* WELCOME */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 md:mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-night tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-night/50 text-sm md:text-base mt-1">
          {showWelcomeMsg(counts, isFood)}
        </p>
      </motion.div>

      {/* CARD TRIAL */}
      {tenant.subscription_status === "trial" && trialHoursLeft > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl p-6 md:p-7 mb-6 text-white shadow-xl overflow-hidden relative"
          style={{ backgroundColor: brandColor }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                  Demo attiva
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-bold tracking-tight">
                {trialHoursLeft} ore rimanenti
              </p>
              <p className="text-sm opacity-90 mt-1">
                Attiva l&apos;abbonamento per non perdere l&apos;accesso
              </p>
            </div>
            <Link
              href="/dashboard/abbonamento"
              className="bg-white text-night px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-white/90 transition inline-flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]"
            >
              Attiva ora
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* BANNER ATTIVO */}
      {tenant.subscription_status === "active" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-3 border border-green-100"
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-night text-sm">Abbonamento attivo</p>
            <p className="text-xs text-night/50">
              Tutto regolare. Grazie per averci scelto!
            </p>
          </div>
          <Link
            href="/dashboard/abbonamento"
            className="text-xs font-semibold text-night/60 hover:text-night shrink-0 transition"
          >
            Gestisci →
          </Link>
        </motion.div>
      )}

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {mainStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Link
              href={stat.href}
              className="block bg-white rounded-3xl p-6 border border-night/5 hover:border-night/15 hover:shadow-lg transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon size={22} style={{ color: stat.color }} />
                </div>
                <ArrowRight
                  size={18}
                  className="text-night/20 group-hover:text-night group-hover:translate-x-1 transition-all"
                />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-night tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs font-semibold text-night/50 uppercase tracking-wider mt-1">
                {stat.label}
              </p>
              {stat.today !== undefined && stat.today > 0 && (
                <div
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <TrendingUp size={12} />
                  {stat.today} oggi
                </div>
              )}
            </Link>
          </motion.div>
        ))}

        {/* Clienti */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/dashboard/clienti"
            className="block bg-white rounded-3xl p-6 border border-night/5 hover:border-night/15 hover:shadow-lg transition group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Users size={22} className="text-blue-600" />
              </div>
              <ArrowRight
                size={18}
                className="text-night/20 group-hover:text-night group-hover:translate-x-1 transition-all"
              />
            </div>
            <p className="text-3xl md:text-4xl font-bold text-night tracking-tight">
              {counts.customers}
            </p>
            <p className="text-xs font-semibold text-night/50 uppercase tracking-wider mt-1">
              Clienti nel database
            </p>
          </Link>
        </motion.div>
      </div>

      {/* LINK PUBBLICO — CARD GRANDE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-night rounded-3xl p-6 md:p-8 mb-6 text-white overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-wa/20 rounded-full blur-3xl -mr-20 -mt-20" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={14} className="text-wa" />
              <span className="text-xs font-bold text-wa uppercase tracking-wider">
                La tua pagina pubblica
              </span>
            </div>
            <p className="text-lg md:text-2xl font-bold truncate mb-1">
              prenotly-italia.it/{tenant.slug}
            </p>
            <p className="text-sm text-white/60">
              Condividila con i clienti: la useranno per ordinare o prenotare
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link
              href={`/${tenant.slug}`}
              target="_blank"
              className="bg-white text-night px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-white/90 transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ExternalLink size={16} />
              Vedi pagina
            </Link>
            <Link
              href="/dashboard/qr"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition inline-flex items-center justify-center gap-2 active:scale-[0.98] border border-white/10"
            >
              <QrCode size={16} />
              QR Code
            </Link>
          </div>
        </div>
      </motion.div>

      {/* AZIONI RAPIDE */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-night mb-4">Azioni rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: Plus,
              label: isFood ? "Aggiungi piatto" : "Aggiungi servizio",
              href: "/dashboard/servizi",
            },
            {
              icon: QrCode,
              label: "Scarica QR Code",
              href: "/dashboard/qr",
            },
            {
              icon: Settings,
              label: "Personalizza",
              href: "/dashboard/impostazioni",
            },
            {
              icon: isFood ? ShoppingBag : Calendar,
              label: isFood ? "Vedi ordini" : "Vedi agenda",
              href: isFood ? "/dashboard/ordini" : "/dashboard/prenotazioni",
            },
          ].map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.03 }}
            >
              <Link
                href={action.href}
                className="bg-white rounded-2xl p-5 border border-night/5 hover:border-night/15 hover:shadow-md transition flex flex-col items-start gap-3 group"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${brandColor}15` }}
                >
                  <action.icon size={20} style={{ color: brandColor }} />
                </div>
                <p className="text-sm font-semibold text-night leading-tight">
                  {action.label}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SUGGERIMENTI */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white rounded-3xl p-6 border border-night/5 mt-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-yellow-50 flex items-center justify-center">
            <Zap size={18} className="text-yellow-600" />
          </div>
          <div>
            <h2 className="font-bold text-night text-sm">Come far decollare la tua attività</h2>
            <p className="text-xs text-night/50">3 cose che funzionano subito</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              n: "1",
              text: "Metti il link in bio su Instagram o nella descrizione Google Maps",
            },
            {
              n: "2",
              text: "Scarica il QR Code e mettilo sui tavoli o sul bancone",
            },
            {
              n: "3",
              text: "Fai un ordine di test dal tuo stesso link per vedere come funziona",
            },
          ].map((tip) => (
            <div key={tip.n} className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                {tip.n}
              </div>
              <p className="text-sm text-night/70 leading-relaxed pt-1">{tip.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function showWelcomeMsg(counts: any, isFood: boolean) {
  const total = isFood ? counts.orders : counts.bookings;
  if (total === 0) {
    return "Inizia a ricevere prenotazioni e ordini: è tutto pronto.";
  }
  if (total < 5) {
    return `Hai già ricevuto ${total} ${isFood ? (total === 1 ? "ordine" : "ordini") : (total === 1 ? "prenotazione" : "prenotazioni")}! 🎉`;
  }
  return `Stai andando forte: ${total} ${isFood ? "ordini" : "prenotazioni"} totali.`;
}
