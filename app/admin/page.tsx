"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, Users, ShoppingBag, Calendar, Inbox,
  TrendingUp, Euro, ArrowRight, AlertCircle,
  Clock, CheckCircle2, XCircle
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
      const { count: tenantsCount } = await supabase
        .from("tenants")
        .select("*", { count: "exact", head: true });

      const { count: activeCount } = await supabase
        .from("tenants")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active");

      const { count: trialCount } = await supabase
        .from("tenants")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "trial");

      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      const { count: bookingsCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });

      const { count: requestsCount } = await supabase
        .from("service_requests")
        .select("*", { count: "exact", head: true });

      // Trial in scadenza entro 24h
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
        .select("id, slug, business_name, product_type, subscription_status, created_at")
        .order("created_at", { ascending: false })
        .limit(6);

      const activeC = activeCount || 0;
      const tenantsC = tenantsCount || 0;
      const trialC = trialCount || 0;

      setStats({
        tenants: tenantsC,
        active: activeC,
        trial: trialC,
        expired: Math.max(0, tenantsC - activeC - trialC),
        orders: ordersCount || 0,
        bookings: bookingsCount || 0,
        requests: requestsCount || 0,
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Panoramica</h1>
        <p className="text-white/60 text-sm">
          Tutto quello che succede su Prenotly
        </p>
      </div>

      {/* ALERT TRIAL IN SCADENZA */}
      {stats.trialExpiringSoon > 0 && (
        <Link
          href="/admin/scadenze"
          className="block bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6 hover:bg-yellow-500/20 transition"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-400 shrink-0" size={22} />
            <div className="flex-1">
              <p className="font-bold text-yellow-300">
                {stats.trialExpiringSoon} trial in scadenza entro 24 ore
              </p>
              <p className="text-xs text-white/60 mt-0.5">
                Contattali per convertire l&apos;abbonamento
              </p>
            </div>
            <ArrowRight size={18} className="text-yellow-400" />
          </div>
        </Link>
      )}

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-wa" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Clienti
            </p>
          </div>
          <p className="text-3xl font-bold">{stats.tenants}</p>
          <p className="text-xs text-white/50 mt-1">
            {stats.active} attivi · {stats.trial} demo
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-400" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              MRR
            </p>
          </div>
          <p className="text-3xl font-bold">€{stats.mrr.toFixed(0)}</p>
          <p className="text-xs text-white/50 mt-1">al mese stimato</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Euro size={16} className="text-wa" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              ARR
            </p>
          </div>
          <p className="text-3xl font-bold">€{stats.yearly.toFixed(0)}</p>
          <p className="text-xs text-white/50 mt-1">ricavi annuali</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Inbox size={16} className="text-yellow-400" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Richieste
            </p>
          </div>
          <p className="text-3xl font-bold">{stats.requests}</p>
          <Link href="/admin/richieste" className="text-xs text-wa font-semibold mt-1 inline-block">
            Gestisci →
          </Link>
        </div>
      </div>

      {/* TRAFFICO GLOBALE */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag size={16} className="text-blue-400" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Ordini totali
            </p>
          </div>
          <p className="text-3xl font-bold">{stats.orders}</p>
          <Link href="/admin/ordini" className="text-xs text-wa font-semibold mt-1 inline-block">
            Vedi tutti →
          </Link>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-violet-400" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Prenotazioni totali
            </p>
          </div>
          <p className="text-3xl font-bold">{stats.bookings}</p>
        </div>
      </div>

      {/* STATO ABBONAMENTI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-green-400" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Attivi
            </p>
          </div>
          <p className="text-3xl font-bold text-green-300">{stats.active}</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-yellow-400" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              In demo
            </p>
          </div>
          <p className="text-3xl font-bold text-yellow-300">{stats.trial}</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={16} className="text-red-400" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Scaduti
            </p>
          </div>
          <p className="text-3xl font-bold text-red-300">{stats.expired}</p>
        </div>
      </div>

      {/* CLIENTI RECENTI */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-6">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold">Ultimi clienti registrati</h2>
          <Link href="/admin/clienti" className="text-xs text-wa font-semibold hover:underline">
            Vedi tutti →
          </Link>
        </div>

        {recentTenants.length === 0 ? (
          <div className="p-8 text-center text-white/50 text-sm">
            Nessun cliente ancora
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentTenants.map((t) => {
              const statusColors: Record<string, string> = {
                active: "bg-green-500/20 text-green-300",
                trial: "bg-yellow-500/20 text-yellow-300",
                expired: "bg-red-500/20 text-red-300",
              };
              return (
                <div
                  key={t.id}
                  className="p-4 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-wa/20 flex items-center justify-center text-wa font-bold shrink-0">
                      {t.business_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">
                        {t.business_name}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        {t.slug} · {t.product_type || "—"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
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
      </div>

      {/* TRIAL IN SCADENZA */}
      {expiringTrials.length > 0 && (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              <Clock size={16} className="text-yellow-400" />
              Trial in scadenza (24h)
            </h2>
            <Link href="/admin/scadenze" className="text-xs text-wa font-semibold hover:underline">
              Vedi tutti →
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {expiringTrials.map((t) => {
              const hoursLeft = Math.ceil(
                (new Date(t.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)
              );
              const phone = (t.whatsapp_number || "").replace(/\D/g, "");
              return (
                <div
                  key={t.id}
                  className="p-4 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {t.business_name}
                    </p>
                    <p className="text-xs text-white/50">
                      {hoursLeft} ore rimanenti
                    </p>
                  </div>
                  {phone && (
                    <a
                      href={`https://wa.me/${phone}?text=Ciao!%20Il%20tuo%20periodo%20di%20prova%20Prenotly%20sta%20per%20scadere.%20Vuoi%20attivare%20l'abbonamento%3F`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wa text-xs font-bold hover:underline shrink-0"
                    >
                      Contatta →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
