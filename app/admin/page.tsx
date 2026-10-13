"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Loader2, Users, ShoppingBag, Calendar, Inbox,
  TrendingUp, Euro, ArrowRight, AlertCircle,
  Clock, CheckCircle2, XCircle, Activity, Zap, ArrowUpRight
} from "lucide-react";

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
    trialExpiringSoon: 0,
  });
  const [recentTenants, setRecentTenants] = useState<any[]>([]);
  const [expiringTrials, setExpiringTrials] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [tenants, active, trial, orders, bookings, requests] = await Promise.all([
        supabase.from("tenants").select("*", { count: "exact", head: true }),
        supabase.from("tenants").select("*", { count: "exact", head: true }).eq("subscription_status", "active"),
        supabase.from("tenants").select("*", { count: "exact", head: true }).eq("subscription_status", "trial"),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("service_requests").select("*", { count: "exact", head: true }),
      ]);

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const { data: expiring } = await supabase
        .from("tenants")
        .select("id, slug, business_name, whatsapp_number, trial_ends_at, product_type")
        .eq("subscription_status", "trial")
        .gte("trial_ends_at", now.toISOString())
        .lte("trial_ends_at", tomorrow.toISOString())
        .order("trial_ends_at", { ascending: true });

      const { data: recent } = await supabase
        .from("tenants")
        .select("id, slug, business_name, product_type, subscription_status, created_at, logo_url")
        .order("created_at", { ascending: false })
        .limit(6);

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
        trialExpiringSoon: (expiring || []).length,
      });

      setRecentTenants(recent || []);
      setExpiringTrials(expiring || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  const kpis = [
    {
      label: "Clienti totali",
      value: stats.tenants,
      sub: `${stats.active} attivi · ${stats.trial} demo`,
      icon: Users,
      color: "#25D366",
      href: "/admin/clienti",
    },
    {
      label: "MRR",
      value: `€${stats.mrr.toFixed(0)}`,
      sub: "ricavi ricorrenti",
      icon: TrendingUp,
      color: "#22C55E",
      href: "/admin/incassi",
    },
    {
      label: "ARR",
      value: `€${stats.yearly.toFixed(0)}`,
      sub: "ricavi annuali",
      icon: Euro,
      color: "#EAB308",
      href: "/admin/incassi",
    },
    {
      label: "Richieste",
      value: stats.requests,
      sub: "service da gestire",
      icon: Inbox,
      color: "#F97316",
      href: "/admin/richieste",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-green-400 tracking-widest uppercase">
            Live
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
          Centro di controllo
        </h1>
        <p className="text-white/40 text-sm">
          Panoramica completa di Prenotly
        </p>
      </motion.div>

      {/* Alert trial */}
      {stats.trialExpiringSoon > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Link
            href="/admin/scadenze"
            className="block relative overflow-hidden bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-500/30 rounded-2xl p-5 mb-6 hover:border-yellow-500/50 transition group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/0 to-yellow-500/5 group-hover:to-yellow-500/10 transition" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="text-yellow-400" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-yellow-300">
                  {stats.trialExpiringSoon} trial in scadenza entro 24 ore
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  Contattali per convertire l&apos;abbonamento
                </p>
              </div>
              <ArrowRight size={20} className="text-yellow-400 group-hover:translate-x-1 transition shrink-0" />
            </div>
          </Link>
        </motion.div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Link
              href={kpi.href}
              className="group relative bg-[#0F0F17] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition overflow-hidden block"
            >
              {/* Glow */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition"
                style={{ backgroundColor: kpi.color }}
              />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${kpi.color}20` }}
                  >
                    <kpi.icon size={18} style={{ color: kpi.color }} />
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
                  />
                </div>

                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
                  {kpi.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold tracking-tight">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-white/40 mt-1">{kpi.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Traffico + Stato */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Traffico */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[#0F0F17] border border-white/[0.06] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-wa" />
              <h2 className="font-bold text-sm">Traffico totale</h2>
            </div>
            <span className="text-[10px] font-mono text-white/30">
              TUTTI I CLIENTI
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/ordini"
              className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] rounded-2xl p-5 transition group"
            >
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag size={14} className="text-blue-400" />
                <span className="text-xs font-semibold text-white/60">Ordini</span>
              </div>
              <p className="text-3xl font-bold tracking-tight">{stats.orders}</p>
              <p className="text-[11px] text-white/40 mt-1 group-hover:text-wa transition flex items-center gap-1">
                Vedi tutti <ArrowRight size={10} />
              </p>
            </Link>

            <Link
              href="/admin/clienti"
              className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] rounded-2xl p-5 transition group"
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-violet-400" />
                <span className="text-xs font-semibold text-white/60">Prenotazioni</span>
              </div>
              <p className="text-3xl font-bold tracking-tight">{stats.bookings}</p>
              <p className="text-[11px] text-white/40 mt-1 group-hover:text-wa transition flex items-center gap-1">
                Totale appuntamenti
              </p>
            </Link>
          </div>
        </motion.div>

        {/* Stato abbonamenti */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[#0F0F17] border border-white/[0.06] rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Zap size={16} className="text-yellow-400" />
            <h2 className="font-bold text-sm">Stato abbonamenti</h2>
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
        </motion.div>
      </div>

      {/* Clienti recenti + Trial in scadenza */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recenti */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0F0F17] border border-white/[0.06] rounded-2xl overflow-hidden"
        >
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="font-bold text-sm">Ultimi clienti</h2>
            <Link
              href="/admin/clienti"
              className="text-[11px] text-wa font-semibold hover:underline"
            >
              Vedi tutti →
            </Link>
          </div>

          {recentTenants.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">
              Nessun cliente
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentTenants.map((t) => {
                const statusColors: Record<string, string> = {
                  active: "bg-green-500/20 text-green-300",
                  trial: "bg-yellow-500/20 text-yellow-300",
                  expired: "bg-red-500/20 text-red-300",
                };
                return (
                  <div
                    key={t.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {t.logo_url ? (
                        <img
                          src={t.logo_url}
                          alt={t.business_name}
                          className="w-9 h-9 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/50 font-bold text-xs shrink-0">
                          {t.business_name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">
                          {t.business_name}
                        </p>
                        <p className="text-[10px] font-mono text-white/30 truncate">
                          /{t.slug}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        statusColors[t.subscription_status] || "bg-white/10"
                      }`}
                    >
                      {t.subscription_status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Trial in scadenza */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-[#0F0F17] border border-white/[0.06] rounded-2xl overflow-hidden"
        >
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-yellow-400" />
              <h2 className="font-bold text-sm">Trial in scadenza</h2>
            </div>
            <Link
              href="/admin/scadenze"
              className="text-[11px] text-wa font-semibold hover:underline"
            >
              Vedi tutti →
            </Link>
          </div>

          {expiringTrials.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">
              <CheckCircle2 className="mx-auto mb-2 text-green-400/50" size={24} />
              Nessuna scadenza nelle prossime 24h
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {expiringTrials.map((t) => {
                const hoursLeft = Math.ceil(
                  (new Date(t.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)
                );
                const phone = (t.whatsapp_number || "").replace(/\D/g, "");
                return (
                  <div
                    key={t.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">
                        {t.business_name}
                      </p>
                      <p className="text-[10px] font-mono text-yellow-400 mt-0.5">
                        ⏱ {hoursLeft} ORE RIMANENTI
                      </p>
                    </div>
                    {phone && (
                      <a
                        href={`https://wa.me/${phone}?text=Ciao!%20Il%20tuo%20periodo%20di%20prova%20Prenotly%20sta%20per%20scadere`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-wa/20 hover:bg-wa/30 text-wa text-[10px] font-mono font-bold px-3 py-1.5 rounded-full transition shrink-0"
                      >
                        CONTATTA
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
