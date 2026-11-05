"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Loader2, Wallet, TrendingUp, Calendar, ShoppingBag,
  ChefHat, ArrowUpRight, Clock, Crown, Star, Utensils
} from "lucide-react";

type Range = "today" | "week" | "month" | "year" | "all";

type DayData = {
  date: string; // YYYY-MM-DD
  ordini: number;
  tavoli: number;
  appuntamenti: number;
  totale: number;
  ordiniCount: number;
  tavoliCount: number;
  appuntamentiCount: number;
};

type TopItem = { name: string; qty: number; total: number };
type TopTable = { number: number; total: number; orders: number };

export default function ReportPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("month");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState("");
  const [isFood, setIsFood] = useState(false);

  const [days, setDays] = useState<DayData[]>([]);
  const [topPiatti, setTopPiatti] = useState<TopItem[]>([]);
  const [topTavoli, setTopTavoli] = useState<TopTable[]>([]);
  const [totals, setTotals] = useState({
    ordini: 0, tavoli: 0, appuntamenti: 0, totale: 0,
    ordiniCount: 0, tavoliCount: 0, appuntamentiCount: 0,
  });

  // Calcola range temporale
  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const now = new Date();
    const end = new Date();
    let start = new Date();
    let label = "";

    if (range === "today") {
      start.setHours(0, 0, 0, 0);
      label = "Oggi";
    } else if (range === "week") {
      start.setDate(now.getDate() - 7);
      label = "Ultimi 7 giorni";
    } else if (range === "month") {
      start.setDate(now.getDate() - 30);
      label = "Ultimi 30 giorni";
    } else if (range === "year") {
      start.setDate(now.getDate() - 365);
      label = "Ultimi 12 mesi";
    } else {
      start = new Date(0);
      label = "Tutti i tempi";
    }

    return { startDate: start, endDate: end, rangeLabel: label };
  }, [range]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(business_name, category, product_type, business_type)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!link || !link.tenants) { router.push("/onboarding"); return; }
      const t = link.tenants as any;
      setTenantId(link.tenant_id);
      setTenantName(t.business_name);
      const food = t.category === "ristoranti" || t.category === "pizzerie" ||
        (!t.category && (t.product_type === "food" || t.business_type === "restaurant"));
      setIsFood(food);

      await loadData(link.tenant_id, startDate, endDate);
      setLoading(false);
    }
    load();
  }, [range]);

  async function loadData(tenantId: string, start: Date, end: Date) {
    const startISO = start.toISOString();
    const endISO = end.toISOString();

    const [ordersRes, tableOrdersRes, bookingsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, total, items, created_at")
        .eq("tenant_id", tenantId)
        .eq("status", "delivered")
        .gte("created_at", startISO)
        .lte("created_at", endISO),
      supabase
        .from("table_orders")
        .select("id, total, paid_amount, items, party_size, paid_at, tables(table_number)")
        .eq("tenant_id", tenantId)
        .eq("status", "paid")
        .gte("paid_at", startISO)
        .lte("paid_at", endISO),
      supabase
        .from("bookings")
        .select("id, service_id, scheduled_at, services(price)")
        .eq("tenant_id", tenantId)
        .eq("booking_type", "appointment")
        .eq("status", "completed")
        .gte("scheduled_at", startISO)
        .lte("scheduled_at", endISO),
    ]);

    const orders = ordersRes.data || [];
    const tableOrders = tableOrdersRes.data || [];
    const bookings = bookingsRes.data || [];

    // Raggruppa per giorno
    const byDay: Record<string, DayData> = {};

    const getDayKey = (iso: string) => {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const ensureDay = (key: string) => {
      if (!byDay[key]) byDay[key] = {
        date: key, ordini: 0, tavoli: 0, appuntamenti: 0, totale: 0,
        ordiniCount: 0, tavoliCount: 0, appuntamentiCount: 0,
      };
      return byDay[key];
    };

    orders.forEach((o: any) => {
      const key = getDayKey(o.created_at);
      const d = ensureDay(key);
      d.ordini += Number(o.total || 0);
      d.ordiniCount += 1;
      d.totale += Number(o.total || 0);
    });

    tableOrders.forEach((o: any) => {
      const key = getDayKey(o.paid_at);
      const d = ensureDay(key);
      const amount = Number(o.paid_amount || o.total || 0);
      d.tavoli += amount;
      d.tavoliCount += 1;
      d.totale += amount;
    });

    bookings.forEach((b: any) => {
      const key = getDayKey(b.scheduled_at);
      const d = ensureDay(key);
      const price = Number(b.services?.price || 0);
      d.appuntamenti += price;
      d.appuntamentiCount += 1;
      d.totale += price;
    });

    const daysArr = Object.values(byDay).sort((a, b) => b.date.localeCompare(a.date));

    // Totali
    const totalsCalc = daysArr.reduce((acc, d) => ({
      ordini: acc.ordini + d.ordini,
      tavoli: acc.tavoli + d.tavoli,
      appuntamenti: acc.appuntamenti + d.appuntamenti,
      totale: acc.totale + d.totale,
      ordiniCount: acc.ordiniCount + d.ordiniCount,
      tavoliCount: acc.tavoliCount + d.tavoliCount,
      appuntamentiCount: acc.appuntamentiCount + d.appuntamentiCount,
    }), { ordini: 0, tavoli: 0, appuntamenti: 0, totale: 0, ordiniCount: 0, tavoliCount: 0, appuntamentiCount: 0 });

    // Top piatti
    const plateCount: Record<string, { qty: number; total: number }> = {};
    const addItems = (items: any[]) => {
      (items || []).forEach((it: any) => {
        if (!it.name) return;
        if (!plateCount[it.name]) plateCount[it.name] = { qty: 0, total: 0 };
        plateCount[it.name].qty += Number(it.qty || 1);
        plateCount[it.name].total += Number(it.qty || 1) * Number(it.price || 0);
      });
    };
    orders.forEach((o: any) => addItems(o.items));
    tableOrders.forEach((o: any) => addItems(o.items));

    const piatti = Object.entries(plateCount)
      .map(([name, v]) => ({ name, qty: v.qty, total: v.total }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Top tavoli
    const tableCount: Record<string, TopTable> = {};
    tableOrders.forEach((o: any) => {
      const num = o.tables?.table_number;
      if (!num) return;
      const key = String(num);
      if (!tableCount[key]) tableCount[key] = { number: Number(num), total: 0, orders: 0 };
      tableCount[key].total += Number(o.paid_amount || o.total || 0);
      tableCount[key].orders += 1;
    });
    const tavoli = Object.values(tableCount)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    setDays(daysArr);
    setTotals(totalsCalc);
    setTopPiatti(piatti);
    setTopTavoli(tavoli);
  }

  const ranges: { key: Range; label: string }[] = [
    { key: "today", label: "Oggi" },
    { key: "week", label: "7 giorni" },
    { key: "month", label: "30 giorni" },
    { key: "year", label: "12 mesi" },
    { key: "all", label: "Tutto" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin text-night" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-night tracking-tight">Report</h1>
          <p className="text-sm text-night/50 mt-1">{tenantName} · {rangeLabel}</p>
        </div>

        {/* RANGE SELECTOR */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {ranges.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
                range === r.key ? "bg-night text-white" : "bg-white text-night/60 border border-night/[0.08] hover:text-night"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 border border-night/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-emerald-600" />
              <span className="text-[10px] font-black text-night/40 uppercase tracking-wider">Totale</span>
            </div>
            <p className="text-2xl font-black text-night">€{totals.totale.toFixed(2)}</p>
          </motion.div>

          {isFood && (
            <>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl p-4 border border-night/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag size={16} className="text-blue-600" />
                  <span className="text-[10px] font-black text-night/40 uppercase tracking-wider">Ordini</span>
                </div>
                <p className="text-2xl font-black text-night">€{totals.ordini.toFixed(2)}</p>
                <p className="text-[10px] text-night/40 mt-1">{totals.ordiniCount} ordini</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-4 border border-night/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <ChefHat size={16} className="text-orange-600" />
                  <span className="text-[10px] font-black text-night/40 uppercase tracking-wider">Tavoli</span>
                </div>
                <p className="text-2xl font-black text-night">€{totals.tavoli.toFixed(2)}</p>
                <p className="text-[10px] text-night/40 mt-1">{totals.tavoliCount} comande</p>
              </motion.div>
            </>
          )}

          {!isFood && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl p-4 border border-night/[0.06] col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-purple-600" />
                <span className="text-[10px] font-black text-night/40 uppercase tracking-wider">Appuntamenti</span>
              </div>
              <p className="text-2xl font-black text-night">€{totals.appuntamenti.toFixed(2)}</p>
              <p className="text-[10px] text-night/40 mt-1">{totals.appuntamentiCount} completati</p>
            </motion.div>
          )}

          {isFood && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-4 border border-night/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-purple-600" />
                <span className="text-[10px] font-black text-night/40 uppercase tracking-wider">Appuntamenti</span>
              </div>
              <p className="text-2xl font-black text-night">€{totals.appuntamenti.toFixed(2)}</p>
              <p className="text-[10px] text-night/40 mt-1">{totals.appuntamentiCount} completati</p>
            </motion.div>
          )}
        </div>

        {/* TABELLA GIORNALIERA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-night/[0.06]">
            <h2 className="font-black text-night text-sm flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600" /> Dettaglio giornaliero
            </h2>
          </div>
          {days.length === 0 ? (
            <div className="p-8 text-center text-sm text-night/40">Nessun dato nel periodo</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FAFBFC] border-b border-night/[0.04]">
                  <tr className="text-left text-[10px] font-black text-night/40 uppercase tracking-wider">
                    <th className="px-4 py-3">Data</th>
                    {isFood && <th className="px-4 py-3 text-right">Ordini</th>}
                    {isFood && <th className="px-4 py-3 text-right">Tavoli</th>}
                    <th className="px-4 py-3 text-right">Appuntamenti</th>
                    <th className="px-4 py-3 text-right">Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {days.slice(0, 60).map(d => (
                    <tr key={d.date} className="border-b border-night/[0.04] last:border-0 hover:bg-cream/30">
                      <td className="px-4 py-3 font-bold text-night">
                        {new Date(d.date + "T12:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                      {isFood && <td className="px-4 py-3 text-right text-blue-600 font-bold">€{d.ordini.toFixed(2)}</td>}
                      {isFood && <td className="px-4 py-3 text-right text-orange-600 font-bold">€{d.tavoli.toFixed(2)}</td>}
                      <td className="px-4 py-3 text-right text-purple-600 font-bold">€{d.appuntamenti.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-black text-night">€{d.totale.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* TOP PIATTI + TOP TAVOLI */}
        {isFood && (
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden">
              <div className="px-5 py-4 border-b border-night/[0.06]">
                <h3 className="font-black text-night text-sm flex items-center gap-2">
                  <Star size={16} className="text-amber-500" /> Top 5 Piatti
                </h3>
              </div>
              {topPiatti.length === 0 ? (
                <div className="p-6 text-center text-xs text-night/40">Nessun piatto venduto</div>
              ) : (
                <div className="divide-y divide-night/[0.04]">
                  {topPiatti.map((p, i) => (
                    <div key={p.name} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-night truncate">{p.name}</p>
                          <p className="text-[10px] text-night/40">{p.qty} venduti</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-600 shrink-0">€{p.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden">
              <div className="px-5 py-4 border-b border-night/[0.06]">
                <h3 className="font-black text-night text-sm flex items-center gap-2">
                  <Utensils size={16} className="text-orange-500" /> Top 5 Tavoli
                </h3>
              </div>
              {topTavoli.length === 0 ? (
                <div className="p-6 text-center text-xs text-night/40">Nessun tavolo pagato</div>
              ) : (
                <div className="divide-y divide-night/[0.04]">
                  {topTavoli.map((t, i) => (
                    <div key={t.number} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                        <div>
                          <p className="text-sm font-bold text-night">Tavolo {t.number}</p>
                          <p className="text-[10px] text-night/40">{t.orders} comande</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-600">€{t.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
