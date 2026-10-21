"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Loader2, Wallet, TrendingUp, ReceiptText, Users, Calendar,
  ShoppingBag, ArrowUpRight, ArrowDownRight, Download, Filter,
  ChevronLeft, ChevronRight, BarChart3, PieChart, Clock
} from "lucide-react";

type Order = {
  id: string;
  order_code: string;
  total: number;
  created_at: string;
  status: string;
  order_type: string;
  customers: { name: string | null } | null;
};

type Booking = {
  id: string;
  booking_code: string;
  scheduled_at: string;
  status: string;
  party_size: number | null;
  customers: { name: string | null } | null;
};

type Range = "today" | "week" | "month" | "year" | "all";

export default function ReportPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [copertoPrice, setCopertoPrice] = useState(0);
  const [range, setRange] = useState<Range>("month");
  const [tenantName, setTenantName] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(business_name, coperto_price)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!link || !link.tenants) { router.push("/onboarding"); return; }
      const t = link.tenants as any;
      setTenantName(t.business_name);
      setCopertoPrice(Number(t.coperto_price) || 0);

      const [ordersRes, bookingsRes, customersRes] = await Promise.all([
        supabase.from("orders").select("id, order_code, total, created_at, status, order_type, customer_id").eq("tenant_id", link.tenant_id).order("created_at", { ascending: false }),
        supabase.from("bookings").select("id, booking_code, scheduled_at, status, party_size, customer_id").eq("tenant_id", link.tenant_id).order("scheduled_at", { ascending: false }),
        supabase.from("customers").select("id, name").eq("tenant_id", link.tenant_id),
      ]);

      const custMap: Record<string, string | null> = {};
      (customersRes.data || []).forEach((c: any) => { custMap[c.id] = c.name; });

      setOrders((ordersRes.data || []).map((o: any) => ({ ...o, customers: { name: custMap[o.customer_id] || null } })));
      setBookings((bookingsRes.data || []).map((b: any) => ({ ...b, customers: { name: custMap[b.customer_id] || null } })));
      setLoading(false);
    }
    load();
  }, [supabase, router]);

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

  // Filtra
  const filteredOrders = orders.filter(o => {
    const d = new Date(o.created_at);
    return d >= startDate && d <= endDate && o.status === "delivered";
  });

  const filteredBookings = bookings.filter(b => {
    const d = new Date(b.scheduled_at);
    return d >= startDate && d <= endDate && b.status !== "cancelled";
  });

  // Calcola KPI
  const ordersRevenue = filteredOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalCovers = filteredBookings.reduce((s, b) => s + (b.party_size || 0), 0);
  const coversRevenue = totalCovers * copertoPrice;
  const totalRevenue = ordersRevenue + coversRevenue;
  const avgOrder = filteredOrders.length > 0 ? ordersRevenue / filteredOrders.length : 0;

  // Grafico: raggruppa per giorno
  const chartData = useMemo(() => {
    const days: Record<string, { orders: number; bookings: number }> = {};
    const numDays = range === "today" ? 1 : range === "week" ? 7 : range === "month" ? 30 : range === "year" ? 12 : 30;
    
    if (range === "year") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
        days[key] = { orders: 0, bookings: 0 };
      }
      filteredOrders.forEach(o => {
        const d = new Date(o.created_at);
        const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
        if (days[key]) days[key].orders += Number(o.total);
      });
      filteredBookings.forEach(b => {
        const d = new Date(b.scheduled_at);
        const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
        if (days[key]) days[key].bookings += (b.party_size || 0) * copertoPrice;
      });
    } else {
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        days[key] = { orders: 0, bookings: 0 };
      }
      filteredOrders.forEach(o => {
        const key = o.created_at.split("T")[0];
        if (days[key]) days[key].orders += Number(o.total);
      });
      filteredBookings.forEach(b => {
        const key = b.scheduled_at.split("T")[0];
        if (days[key]) days[key].bookings += (b.party_size || 0) * copertoPrice;
      });
    }
    return Object.entries(days).map(([date, v]) => ({ date, ...v }));
  }, [filteredOrders, filteredBookings, range, copertoPrice]);

  const maxValue = Math.max(...chartData.map(d => d.orders + d.bookings), 1);

  // Export CSV
  const handleExportCSV = () => {
    const rows = [["Data", "Tipo", "Codice", "Cliente", "Totale/Coperti", "Importo"]];
    
    filteredOrders.forEach(o => {
      rows.push([
        new Date(o.created_at).toLocaleDateString("it-IT"),
        "Ordine",
        o.order_code,
        o.customers?.name || "-",
        "-",
        Number(o.total).toFixed(2),
      ]);
    });
    filteredBookings.forEach(b => {
      const covers = b.party_size || 0;
      rows.push([
        new Date(b.scheduled_at).toLocaleDateString("it-IT"),
        "Prenotazione",
        b.booking_code,
        b.customers?.name || "-",
        covers.toString(),
        (covers * copertoPrice).toFixed(2),
      ]);
    });

    const csv = rows.map(r => r.map(c => '"' + c + '"').join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report-prenotly-" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[70vh]"><Loader2 className="animate-spin text-night" size={40} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      {/* HEADER */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-3">
              <BarChart3 size={12} /> Business Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-night tracking-tight">Report Incassi</h1>
            <p className="text-night/50 text-sm mt-1">{tenantName} · {rangeLabel}</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-4 py-2.5 rounded-full text-xs font-bold transition shadow-md active:scale-95"
          >
            <Download size={14} /> Esporta CSV
          </button>
        </div>
      </div>

      {/* FILTRI RANGE */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="inline-flex bg-white rounded-full p-1 border border-night/[0.06] shadow-sm overflow-x-auto max-w-full hide-scrollbar">
          {([
            { key: "today", label: "Oggi" },
            { key: "week", label: "Settimana" },
            { key: "month", label: "Mese" },
            { key: "year", label: "Anno" },
            { key: "all", label: "Tutto" },
          ] as { key: Range; label: string }[]).map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={"px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition " + (range === r.key ? "bg-night text-white shadow-md" : "text-night/50 hover:text-night")}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Fatturato Totale", value: "€" + totalRevenue.toFixed(2), icon: Wallet, color: "#10B981", hint: "Ordini + Coperti" },
            { label: "Da Ordini", value: "€" + ordersRevenue.toFixed(2), icon: ShoppingBag, color: "#3B82F6", hint: filteredOrders.length + " ordini" },
            { label: "Da Coperti", value: "€" + coversRevenue.toFixed(2), icon: Users, color: "#F97316", hint: totalCovers + " coperti" },
            { label: "Ticket Medio", value: "€" + avgOrder.toFixed(2), icon: ReceiptText, color: "#8B5CF6", hint: "Per ordine" },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-4 md:p-5 border border-night/[0.06] shadow-sm relative overflow-hidden group hover:shadow-md transition"
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.06] group-hover:opacity-[0.1] transition" style={{ backgroundColor: kpi.color }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.color + "15" }}>
                  <kpi.icon size={16} style={{ color: kpi.color }} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-night/40">{kpi.label}</p>
              </div>
              <p className="text-2xl md:text-3xl font-black text-night tracking-tight leading-none">{kpi.value}</p>
              <p className="text-[11px] text-night/40 mt-2">{kpi.hint}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* GRAFICO ANDAMENTO */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 border border-night/[0.06] shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-night flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" /> Andamento Incassi
              </h2>
              <p className="text-xs text-night/40 mt-1">{rangeLabel}</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-night/60">Ordini</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-night/60">Coperti</span>
              </div>
            </div>
          </div>

          <div className="h-56 flex items-end gap-1 relative">
            {chartData.map((d, i) => {
              const orderH = maxValue > 0 ? (d.orders / maxValue) * 100 : 0;
              const bookingH = maxValue > 0 ? (d.bookings / maxValue) * 100 : 0;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: "100%" }}>
                    {d.bookings > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: bookingH + "%" }}
                        transition={{ duration: 0.6, delay: i * 0.02 }}
                        className="w-full bg-orange-500 rounded-t-md opacity-90"
                        style={{ minHeight: bookingH > 0 ? "3px" : "0" }}
                      />
                    )}
                    {d.orders > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: orderH + "%" }}
                        transition={{ duration: 0.6, delay: i * 0.02 + 0.1 }}
                        className="w-full bg-blue-500 rounded-t-md"
                        style={{ minHeight: orderH > 0 ? "3px" : "0" }}
                      />
                    )}
                  </div>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-night text-white text-[10px] font-black px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                    €{(d.orders + d.bookings).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 text-[9px] font-bold text-night/30 uppercase tracking-widest">
            <span>{chartData[0]?.date.slice(5)}</span>
            <span>{chartData[Math.floor(chartData.length / 2)]?.date.slice(5)}</span>
            <span>{chartData[chartData.length - 1]?.date.slice(5)}</span>
          </div>
        </motion.div>
      </div>

      {/* DETTAGLIO ORDINI E PRENOTAZIONI */}
      <div className="px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-4">
        {/* Ultimi Ordini */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl border border-night/[0.06] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-night/[0.06] flex items-center justify-between">
            <h3 className="font-black text-night text-sm flex items-center gap-2">
              <ShoppingBag size={16} className="text-blue-500" /> Ordini Consegnati
            </h3>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {filteredOrders.length}
            </span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-night/40">Nessun ordine nel periodo</div>
            ) : (
              filteredOrders.slice(0, 20).map(o => (
                <div key={o.id} className="px-5 py-3 border-b border-night/[0.04] last:border-0 hover:bg-cream/30 transition flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[10px] font-black text-night/60 bg-night/5 px-1.5 py-0.5 rounded">{o.order_code}</span>
                      <span className="text-[10px] text-night/40">{new Date(o.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}</span>
                    </div>
                    <p className="text-sm font-bold text-night truncate">{o.customers?.name || "Cliente"}</p>
                  </div>
                  <span className="font-black text-emerald-600 ml-3">€{Number(o.total).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Prenotazioni */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl border border-night/[0.06] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-night/[0.06] flex items-center justify-between">
            <h3 className="font-black text-night text-sm flex items-center gap-2">
              <Calendar size={16} className="text-orange-500" /> Prenotazioni
            </h3>
            <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              {filteredBookings.length}
            </span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-night/40">Nessuna prenotazione nel periodo</div>
            ) : (
              filteredBookings.slice(0, 20).map(b => (
                <div key={b.id} className="px-5 py-3 border-b border-night/[0.04] last:border-0 hover:bg-cream/30 transition flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[10px] font-black text-night/60 bg-night/5 px-1.5 py-0.5 rounded">{b.booking_code}</span>
                      <span className="text-[10px] text-night/40">{new Date(b.scheduled_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })} · {new Date(b.scheduled_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-sm font-bold text-night truncate">{b.customers?.name || "Cliente"}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-[10px] text-night/40 font-bold">{b.party_size || 0} pers.</p>
                    <p className="font-black text-orange-600">€{((b.party_size || 0) * copertoPrice).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {copertoPrice === 0 && (
        <div className="px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center shrink-0">
              <span className="text-white text-base">💡</span>
            </div>
            <div>
              <p className="text-sm font-bold text-night">Imposta il prezzo del coperto</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Vai in <Link href="/dashboard/impostazioni" className="font-bold underline">Impostazioni</Link> per impostare il prezzo del coperto e calcolare anche i ricavi da prenotazioni.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
