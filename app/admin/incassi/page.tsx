"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, TrendingUp, Euro, Calendar, Users, RefreshCw
} from "lucide-react";

const MONTHLY_PRICE = 29.99;
const YEARLY_PRICE = 359.88;

export default function IncassiPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    activeCount: 0,
    mrr: 0,
    arr: 0,
    newThisMonth: 0,
    newLastMonth: 0,
    monthlyBreakdown: [] as { month: string; count: number }[],
  });

  async function load() {
    const { count: activeCount } = await supabase
      .from("tenants")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "active");

    // Clienti attivati questo mese e lo scorso
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const { count: thisMonth } = await supabase
      .from("tenants")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "active")
      .gte("created_at", thisMonthStart.toISOString());

    const { count: lastMonth } = await supabase
      .from("tenants")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "active")
      .gte("created_at", lastMonthStart.toISOString())
      .lte("created_at", lastMonthEnd.toISOString());

    // Breakdown ultimi 6 mesi
    const { data: all } = await supabase
      .from("tenants")
      .select("created_at, subscription_status")
      .eq("subscription_status", "active");

    const breakdown: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("it-IT", { month: "short", year: "2-digit" });
      breakdown[key] = 0;
    }

    (all || []).forEach((t) => {
      const d = new Date(t.created_at);
      const key = d.toLocaleDateString("it-IT", { month: "short", year: "2-digit" });
      if (key in breakdown) breakdown[key]++;
    });

    const activeC = activeCount || 0;

    setData({
      activeCount: activeC,
      mrr: activeC * MONTHLY_PRICE,
      arr: activeC * YEARLY_PRICE,
      newThisMonth: thisMonth || 0,
      newLastMonth: lastMonth || 0,
      monthlyBreakdown: Object.entries(breakdown).map(([month, count]) => ({
        month,
        count,
      })),
    });
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  const growth = data.newLastMonth > 0
    ? ((data.newThisMonth - data.newLastMonth) / data.newLastMonth) * 100
    : data.newThisMonth > 0 ? 100 : 0;

  const maxCount = Math.max(...data.monthlyBreakdown.map((m) => m.count), 1);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Incassi</h1>
          <p className="text-white/60 text-sm">Panoramica ricavi e crescita</p>
        </div>
        <button
          onClick={load}
          className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 transition"
        >
          <RefreshCw size={16} />
          Aggiorna
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-wa/20 to-waDark/20 border border-wa/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Euro size={16} className="text-wa" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">MRR</p>
          </div>
          <p className="text-3xl font-bold">€{data.mrr.toFixed(0)}</p>
          <p className="text-xs text-white/50 mt-1">al mese</p>
        </div>

        <div className="bg-gradient-to-br from-wa/20 to-waDark/20 border border-wa/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-wa" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">ARR</p>
          </div>
          <p className="text-3xl font-bold">€{data.arr.toFixed(0)}</p>
          <p className="text-xs text-white/50 mt-1">all&apos;anno</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-wa" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">Attivi</p>
          </div>
          <p className="text-3xl font-bold">{data.activeCount}</p>
          <p className="text-xs text-white/50 mt-1">clienti paganti</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-wa" />
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">Questo mese</p>
          </div>
          <p className="text-3xl font-bold">{data.newThisMonth}</p>
          <p className="text-xs text-white/50 mt-1">
            nuovi ·{" "}
            <span className={growth >= 0 ? "text-green-400" : "text-red-400"}>
              {growth >= 0 ? "+" : ""}{growth.toFixed(0)}%
            </span>
          </p>
        </div>
      </div>

      {/* PROIEZIONE */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-5 mb-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-wa" />
          Proiezioni
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-white/50 text-xs mb-1">Se arrivi a 50 clienti</p>
            <p className="font-bold text-lg">€1.500/mese</p>
            <p className="text-xs text-white/50">€18.000/anno</p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">Se arrivi a 100 clienti</p>
            <p className="font-bold text-lg">€3.000/mese</p>
            <p className="text-xs text-white/50">€36.000/anno</p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">Se arrivi a 200 clienti</p>
            <p className="font-bold text-lg">€6.000/mese</p>
            <p className="text-xs text-white/50">€72.000/anno</p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">Se arrivi a 500 clienti</p>
            <p className="font-bold text-lg">€15.000/mese</p>
            <p className="text-xs text-white/50">€180.000/anno</p>
          </div>
        </div>
      </div>

      {/* GRAFICO ATTIVAZIONI */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
        <h2 className="font-bold mb-5">Nuovi clienti (ultimi 6 mesi)</h2>
        <div className="space-y-3">
          {data.monthlyBreakdown.map((m) => {
            const pct = (m.count / maxCount) * 100;
            return (
              <div key={m.month}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/70 font-semibold uppercase">{m.month}</span>
                  <span className="text-white/50">{m.count} clienti</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-wa to-waDark rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
