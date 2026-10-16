"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import { SkeletonCard } from "@/components/dashboard/Skeleton";
import {
  Loader2, ShoppingBag, Calendar, Users, QrCode, Plus, AlertCircle,
  ArrowRight, TrendingUp, Clock, ExternalLink,
  CheckCircle2, Utensils, Settings, Eye, Zap, Sparkles,
  ArrowUpRight, BarChart3, CreditCard,
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
  has_table_booking: boolean | null;
  has_online_payments: boolean | null;
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
    weekOrders: 0,
    weekBookings: 0,
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

      const [b, o, s, c] = await Promise.all([
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
      ]);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const [todayO, todayB, weekO, weekB] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true })
          .eq("tenant_id", t.id)
          .gte("created_at", todayStart.toISOString())
          .lte("created_at", todayEnd.toISOString()),
        supabase.from("bookings").select("*", { count: "exact", head: true })
          .eq("tenant_id", t.id)
          .gte("scheduled_at", todayStart.toISOString())
          .lte("scheduled_at", todayEnd.toISOString()),
        supabase.from("orders").select("*", { count: "exact", head: true })
          .eq("tenant_id", t.id)
          .gte("created_at", weekStart.toISOString()),
        supabase.from("bookings").select("*", { count: "exact", head: true })
          .eq("tenant_id", t.id)
          .gte("scheduled_at", weekStart.toISOString()),
      ]);

      setCounts({
        bookings: b.count || 0,
        orders: o.count || 0,
        services: s.count || 0,
        customers: c.count || 0,
        todayOrders: todayO.count || 0,
        todayBookings: todayB.count || 0,
        weekOrders: weekO.count || 0,
        weekBookings: weekB.count || 0,
      });

      setLoading(false);
    }
    load();
  }, []);

  if (loading || !tenant) {
    return (
      <div>
        <div className="h-8 w-48 bg-night/[0.05] rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
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
  const greeting = hour < 12 ? "Buongiorno" : hour < 18 ? "Buon pomeriggio" : "Buonasera";

  const totalMain = isFood ? counts.orders : counts.bookings;
  const todayMain = isFood ? counts.todayOrders : counts.todayBookings;
  const weekMain = isFood ? counts.weekOrders : counts.weekBookings;

  return (
    <div>
      {/* Header */}
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle={
          totalMain === 0
            ? "Inizia a ricevere il tuo primo ordine"
            : `Hai ricevuto ${totalMain} ${isFood ? (totalMain === 1 ? "ordine" : "ordini") : totalMain === 1 ? "prenotazione" : "prenotazioni"} in totale`
        }
        actions={
          <Link
            href={`/${tenant.slug}`}
            target="_blank"
            className="hidden md:inline-flex items-center gap-2 border border-night/[0.08] hover:border-night/20 bg-white text-night px-4 py-2.5 rounded-full font-semibold text-sm transition"
          >
            <Eye size={15} />
            Vedi pagina
          </Link>
        }
      />

      {/* Trial warning */}
      {tenant.subscription_status === "trial" && trialHoursLeft > 0 && trialHoursLeft < 48 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-night text-sm">
              Demo in scadenza
            </p>
            <p className="text-xs text-night/60 mt-0.5">
              Ti restano {trialHoursLeft} ore. Attiva l&apos;abbonamento per non perdere l&apos;accesso.
            </p>
          </div>
          <Link
            href="/dashboard/abbonamento"
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full font-semibold text-xs transition shrink-0 active:scale-[0.98]"
          >
            Attiva
          </Link>
        </motion.div>
      )}

      {/* Upgrade banner tavoli */}
      {isFood && tenant.has_table_booking === false && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-200 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
              <Calendar size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-night text-sm">
                  Sblocca la prenotazione tavoli
                </h3>
                <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase">
                  +5 €/mese
                </span>
              </div>
              <p className="text-xs text-night/60 leading-relaxed mb-3">
                I tuoi clienti prenotano il tavolo dalla mappa interattiva.
                Tu gestisci tutto in dashboard.
              </p>
              <Link
                href="/dashboard/abbonamento"
                className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-4 py-2 rounded-full font-semibold text-xs transition active:scale-[0.98]"
              >
                Scopri di più
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={isFood ? "Ordini totali" : "Prenotazioni totali"}
          value={totalMain}
          icon={isFood ? ShoppingBag : Calendar}
          iconBg={`${brandColor}15`}
          iconColor={brandColor}
          href={isFood ? "/dashboard/ordini" : "/dashboard/prenotazioni"}
          change={
            todayMain > 0
              ? { value: `${todayMain} oggi`, trend: "up" }
              : undefined
          }
          delay={0}
        />

        <StatCard
          label={isFood ? "Piatti nel menu" : "Servizi attivi"}
          value={counts.services}
          icon={Utensils}
          iconBg="#F1F5F9"
          iconColor="#0F172A"
          href="/dashboard/servizi"
          delay={0.05}
        />

        <StatCard
          label="Clienti"
          value={counts.customers}
          icon={Users}
          iconBg="#EFF6FF"
          iconColor="#3B82F6"
          href="/dashboard/clienti"
          delay={0.1}
        />

        <StatCard
          label="Ultimi 7 giorni"
          value={weekMain}
          icon={TrendingUp}
          iconBg="#F0FDF4"
          iconColor="#16A34A"
          delay={0.15}
        />
      </div>

      {/* LINK PUBBLICO + AZIONI */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Public link card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-night/[0.06] overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <span className="text-[11px] font-bold text-night/40 uppercase tracking-wider">
                La tua pagina pubblica
              </span>
            </div>

            <p className="text-lg md:text-2xl font-bold text-night tracking-tight truncate mb-1">
              prenotly-italia.it/{tenant.slug}
            </p>
            <p className="text-xs text-night/50 mb-5">
              Condividi questo link con i tuoi clienti
            </p>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${tenant.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-4 py-2.5 rounded-full font-semibold text-xs transition active:scale-[0.98]"
              >
                <ExternalLink size={14} />
                Apri pagina
              </Link>
              <Link
                href="/dashboard/qr"
                className="inline-flex items-center gap-2 border border-night/[0.08] hover:border-night/20 text-night px-4 py-2.5 rounded-full font-semibold text-xs transition active:scale-[0.98]"
              >
                <QrCode size={14} />
                QR Code
              </Link>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-night/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={14} className="text-night/40" />
            <span className="text-[11px] font-bold text-night/40 uppercase tracking-wider">
              Il tuo abbonamento
            </span>
          </div>

          <p className="text-base font-bold text-night mb-1">
            {tenant.subscription_status === "trial"
              ? "Demo attiva"
              : tenant.subscription_status === "active"
              ? `Piano ${tenant.has_online_payments ? "Premium" : tenant.has_table_booking ? "Food + Tavoli" : isFood ? "Food" : "Pro"}`
              : "Scaduto"}
          </p>

          {tenant.subscription_status === "active" && (
            <p className="text-xs text-night/50 mb-4">
              Rinnovo automatico annuale
            </p>
          )}
          {tenant.subscription_status === "trial" && (
            <p className="text-xs text-amber-600 font-semibold mb-4">
              {trialHoursLeft} ore rimanenti
            </p>
          )}

          <Link
            href="/dashboard/abbonamento"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-night hover:text-night/60 transition"
          >
            Gestisci
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* AZIONI RAPIDE */}
      <div className="mb-2">
        <h2 className="text-sm font-bold text-night mb-3">Azioni rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: Plus,
              label: isFood ? "Aggiungi piatto" : "Aggiungi servizio",
              href: "/dashboard/servizi",
            },
            {
              icon: isFood ? ShoppingBag : Calendar,
              label: isFood ? "Vedi ordini" : "Vedi agenda",
              href: isFood ? "/dashboard/ordini" : "/dashboard/prenotazioni",
            },
            {
              icon: QrCode,
              label: "Scarica QR",
              href: "/dashboard/qr",
            },
            {
              icon: Settings,
              label: "Personalizza",
              href: "/dashboard/impostazioni",
            },
          ].map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.04 }}
            >
              <Link
                href={action.href}
                className="block bg-white rounded-2xl border border-night/[0.06] hover:border-night/[0.12] hover:shadow-sm transition p-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-night/[0.03] flex items-center justify-center shrink-0 group-hover:bg-night/[0.06] transition">
                    <action.icon size={16} className="text-night/60" />
                  </div>
                  <p className="text-[13px] font-semibold text-night leading-tight flex-1">
                    {action.label}
                  </p>
                  <ArrowUpRight size={14} className="text-night/20 group-hover:text-night/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
