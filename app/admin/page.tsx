"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import { SkeletonCard } from "@/components/dashboard/Skeleton";
import {
  Users, ShoppingBag, Calendar, Inbox, TrendingUp, Euro,
  ArrowRight, AlertCircle, Clock, CheckCircle2, XCircle,
  Activity, UserPlus, Star, Zap, ExternalLink, Lock,
} from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  product_type: string | null;
  business_type: string;
  subscription_status: string;
  created_at: string;
  logo_url: string | null;
  brand_color: string | null;
  whatsapp_number: string | null;
};

type ActivityItem = {
  id: string;
  type: "signup" | "order" | "booking" | "request";
  label: string;
  sublabel: string;
  tenant_name: string;
  tenant_slug: string;
  created_at: string;
};

export default function AdminPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tenants: 0,
    active: 0,
    trial: 0,
    expired: 0,
    orders: 0,
    bookings: 0,
    requests: 0,
    mrr: 0,
    yearly: 0,
    newThisWeek: 0,
    newThisMonth: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [expiringTrials, setExpiringTrials] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      // Conteggi principali
      const [tenants, active, trial, orders, bookings, requests] = await Promise.all([
        supabase.from("tenants").select("*", { count: "exact", head: true }),
        supabase.from("tenants").select("*", { count: "exact", head: true }).eq("subscription_status", "active"),
        supabase.from("tenants").select("*", { count: "exact", head: true }).eq("subscription_status", "trial"),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("service_requests").select("*", { count: "exact", head: true }),
      ]);

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Nuove iscrizioni questa settimana
      const { count: weekCount } = await supabase
        .from("tenants")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      const { count: monthCount } = await supabase
        .from("tenants")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthAgo.toISOString());

      // Trial in scadenza
      const { data: expiring } = await supabase
        .from("tenants")
        .select("id, slug, business_name, whatsapp_number, trial_ends_at, product_type")
        .eq("subscription_status", "trial")
        .gte("trial_ends_at", now.toISOString())
        .lte("trial_ends_at", tomorrow.toISOString())
        .order("trial_ends_at", { ascending: true })
        .limit(5);

      setExpiringTrials(expiring || []);

      // ATTIVITÀ RECENTE — ultimi 15 item combinati
      const activities: ActivityItem[] = [];

      // 1. Nuovi tenant
      const { data: recentTenants } = await supabase
        .from("tenants")
        .select("id, slug, business_name, created_at, product_type, business_type")
        .order("created_at", { ascending: false })
        .limit(10);

      (recentTenants || []).forEach((t: any) => {
        activities.push({
          id: `signup-${t.id}`,
          type: "signup",
          label: t.business_name,
          sublabel: "Nuova iscrizione",
          tenant_name: t.business_name,
          tenant_slug: t.slug,
          created_at: t.created_at,
        });
      });

      // 2. Ultimi ordini
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("id, order_code, total, created_at, tenant_id, tenants(business_name, slug)")
        .order("created_at", { ascending: false })
        .limit(10);

      (recentOrders || []).forEach((o: any) => {
        const t = o.tenants;
        activities.push({
          id: `order-${o.id}`,
          type: "order",
          label: `Ordine ${o.order_code}`,
          sublabel: `€${Number(o.total).toFixed(2)}`,
          tenant_name: t?.business_name || "",
          tenant_slug: t?.slug || "",
          created_at: o.created_at,
        });
      });

      // 3. Ultime prenotazioni
      const { data: recentBookings } = await supabase
        .from("bookings")
        .select("id, booking_code, scheduled_at, created_at, tenant_id, tenants(business_name, slug)")
        .order("created_at", { ascending: false })
        .limit(10);

      (recentBookings || []).forEach((b: any) => {
        const t = b.tenants;
        activities.push({
          id: `booking-${b.id}`,
          type: "booking",
          label: `Prenotazione ${b.booking_code}`,
          sublabel: new Date(b.scheduled_at).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          tenant_name: t?.business_name || "",
          tenant_slug: t?.slug || "",
          created_at: b.created_at,
        });
      });

      // Ordina per data (più recenti prima)
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setActivities(activities.slice(0, 15));

      const activeC = active.count || 0;
      const tenantsC = tenants.count || 0;
      const trialC = trial.count || 0;

      setStats({
        tenants: tenantsC,
        active: activeC,
        trial: trialC,
        expired: Math.max(0, tenantsC - activeC - trialC),
        orders: orders.count || 0,
        bookings: bookings.count || 0,
        requests: requests.count || 0,
        mrr: activeC * 29.99,
        yearly: activeC * 359.88,
        newThisWeek: weekCount || 0,
        newThisMonth: monthCount || 0,
      });

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="h-8 w-64 bg-white/[0.05] rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const activityIcons = {
    signup: { icon: UserPlus, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
    order: { icon: ShoppingBag, color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" },
    booking: { icon: Calendar, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)" },
    request: { icon: Inbox, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Panoramica completa della piattaforma"
        breadcrumb={[{ label: "Admin" }, { label: "Dashboard" }]}
        actions={
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </div>
        }
      />

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Clienti totali"
          value={stats.tenants}
          icon={Users}
          iconBg="rgba(37, 211, 102, 0.15)"
          iconColor="#25D366"
          change={
            stats.newThisWeek > 0
              ? { value: `+${stats.newThisWeek} questa sett.`, trend: "up" }
              : undefined
          }
          href="/admin/clienti"
          delay={0}
        />

        <StatCard
          label="MRR"
          value={`€${stats.mrr.toFixed(0)}`}
          icon={TrendingUp}
          iconBg="rgba(34, 197, 94, 0.15)"
          iconColor="#22C55E"
          change={{ value: "al mese", trend: "neutral" }}
          href="/admin/incassi"
          delay={0.05}
        />

        <StatCard
          label="ARR"
          value={`€${stats.yearly.toFixed(0)}`}
          icon={Euro}
          iconBg="rgba(234, 179, 8, 0.15)"
          iconColor="#EAB308"
          change={{ value: "all'anno", trend: "neutral" }}
          delay={0.1}
        />

        <StatCard
          label="Richieste Service"
          value={stats.requests}
          icon={Inbox}
          iconBg="rgba(249, 115, 22, 0.15)"
          iconColor="#F97316"
          href="/admin/richieste"
          delay={0.15}
        />
      </div>

      {/* ALERT TRIAL IN SCADENZA */}
      {expiringTrials.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/[0.08] border border-amber-500/30 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-amber-300 text-sm">
                {expiringTrials.length} trial in scadenza entro 24 ore
              </p>
              <p className="text-xs text-white/50 mt-0.5 mb-3">
                Contattali su WhatsApp per convertire l&apos;abbonamento
              </p>
              <div className="space-y-2">
                {expiringTrials.map((t) => {
                  const hoursLeft = Math.ceil(
                    (new Date(t.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)
                  );
                  const phone = (t.whatsapp_number || "").replace(/\D/g, "");
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-3 bg-black/20 rounded-xl px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white/90 truncate">
                          {t.business_name}
                        </p>
                        <p className="text-[10px] font-mono text-amber-400/80">
                          ⏱ {hoursLeft} ORE
                        </p>
                      </div>
                      {phone && (
                        <a
                          href={`https://wa.me/${phone}?text=Ciao!%20Il%20tuo%20periodo%20di%20prova%20Prenotly%20sta%20per%20scadere.%20Vuoi%20attivare%20l'abbonamento%3F`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition shrink-0"
                        >
                          CONTATTA
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
              <Link
                href="/admin/scadenze"
                className="text-xs text-amber-400 font-semibold hover:underline inline-flex items-center gap-1 mt-3"
              >
                Vedi tutte le scadenze
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* ROW 2: Attività recente + Stato abbonamenti */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Attività recente */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-white/60" />
              <h2 className="text-sm font-bold">Attività recente</h2>
            </div>
            <span className="text-[10px] font-mono text-white/30">
              ULTIMI EVENTI
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">
              Nessuna attività ancora
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04] max-h-[480px] overflow-y-auto">
              {activities.map((activity) => {
                const config = activityIcons[activity.type];
                const Icon = config.icon;
                const timeAgo = getTimeAgo(activity.created_at);

                return (
                  <Link
                    key={activity.id}
                    href={`/admin/clienti/${activity.tenant_slug}`}
                    className="flex items-center gap-3 p-3.5 hover:bg-white/[0.03] transition group"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: config.bg }}
                    >
                      <Icon size={15} style={{ color: config.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/90 truncate">
                        {activity.tenant_name}
                      </p>
                      <p className="text-[11px] text-white/40 truncate">
                        {activity.sublabel}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-mono text-white/30">
                        {timeAgo}
                      </p>
                    </div>

                    <ArrowRight
                      size={14}
                      className="text-white/10 group-hover:text-white/40 group-hover:translate-x-0.5 transition shrink-0"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Stato abbonamenti */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={14} className="text-yellow-400" />
            <h2 className="text-sm font-bold">Stato abbonamenti</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-green-500/[0.08] border border-green-500/20 rounded-xl p-3">
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50">Attivi</p>
                <p className="text-xl font-bold text-green-300">{stats.active}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-yellow-500/[0.08] border border-yellow-500/20 rounded-xl p-3">
              <Clock size={16} className="text-yellow-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50">In demo</p>
                <p className="text-xl font-bold text-yellow-300">{stats.trial}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl p-3">
              <XCircle size={16} className="text-red-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50">Scaduti</p>
                <p className="text-xl font-bold text-red-300">{stats.expired}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/50">Crescita mensile</p>
              <span className="text-[10px] font-mono font-bold text-green-400">
                +{stats.newThisMonth}
              </span>
            </div>
            <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-wa to-waDark rounded-full transition-all"
                style={{ width: `${Math.min((stats.newThisMonth / 20) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-white/30 mt-2">
              {stats.newThisMonth} nuovi clienti questo mese
            </p>
          </div>
        </div>
      </div>

      {/* AZIONI RAPIDE ADMIN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Gestisci clienti", href: "/admin/clienti" },
          { icon: Clock, label: "Trial in scadenza", href: "/admin/scadenze" },
          { icon: Euro, label: "Incassi", href: "/admin/incassi" },
          { icon: Inbox, label: "Richieste Service", href: "/admin/richieste" },
        ].map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.04 }}
          >
            <Link
              href={action.href}
              className="block bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0 group-hover:bg-white/[0.08] transition">
                  <action.icon size={16} className="text-white/60" />
                </div>
                <p className="text-xs font-semibold text-white/80 leading-tight flex-1">
                  {action.label}
                </p>
                <ArrowRight size={14} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "ora";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}g`;
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
  });
}
