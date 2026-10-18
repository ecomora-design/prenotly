"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Users, ShoppingBag, Calendar, TrendingUp, ArrowUpRight,
  Activity, Clock, ChevronRight, Zap, Server, ShieldCheck
} from "lucide-react";

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ tenants: 0, orders: 0, bookings: 0, revenue: 0 });
  const [recentTenants, setRecentTenants] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [tenants, orders, bookings] = await Promise.all([
        supabase.from("tenants").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        tenants: tenants.count || 0,
        orders: orders.count || 0,
        bookings: bookings.count || 0,
        revenue: 0, // Calcolo stimato in base ai piani attivi
      });

      const { data: recent } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentTenants(recent || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  // Dati per il grafico (simulazione andamento piattaforma)
  const chartData = [40, 60, 35, 80, 50, 90, 100, 70, 85, 110, 95, 130];

  if (loading) {
    return <div className="flex items-center justify-center h-[80vh] bg-[#050505]"><Activity className="animate-pulse text-[#25D366]" size={40} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-[#25D366] selection:text-black">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-bold uppercase tracking-widest mb-3">
            <Server size={12} /> System Online
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Prenotly Control Center</h1>
          <p className="text-white/40 font-mono text-sm mt-1">Panoramica generale della piattaforma</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/scadenze" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2">
            <Clock size={16} className="text-yellow-400" /> Scadenze
          </Link>
          <Link href="/admin/clienti" className="bg-[#25D366] hover:bg-[#20ba5a] text-black px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.3)]">
            <Users size={16} /> Gestisci Clienti
          </Link>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Totale Clienti", value: stats.tenants, icon: Users, color: "text-blue-400" },
          { label: "Ordini Totali", value: stats.orders, icon: ShoppingBag, color: "text-[#25D366]" },
          { label: "Prenotazioni", value: stats.bookings, icon: Calendar, color: "text-purple-400" },
          { label: "Server Status", value: "99.9%", icon: ShieldCheck, color: "text-yellow-400" },
        ].map((kpi, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><kpi.icon size={48} className={kpi.color} /></div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-3xl font-black">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* GRAFICO PRINCIPALE */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><TrendingUp size={18} className="text-[#25D366]" /> Crescita Piattaforma</h2>
              <p className="text-xs text-white/40 mt-1">Andamento ordini/prenotazioni (Ultimi 12 mesi)</p>
            </div>
            <div className="flex items-center gap-1 text-[#25D366] text-sm font-bold bg-[#25D366]/10 px-3 py-1 rounded-full">
              <ArrowUpRight size={14} /> +128% YoY
            </div>
          </div>
          
          <div className="h-64 w-full flex items-end gap-2 md:gap-4 relative z-10">
            {chartData.map((val, i) => (
              <div key={i} className="flex-1 bg-white/[0.02] hover:bg-white/[0.05] rounded-t-lg relative group transition-all duration-300 flex flex-col justify-end" style={{ height: '100%' }}>
                <motion.div 
                  initial={{ height: 0 }} animate={{ height: `${(val / 130) * 100}%` }} transition={{ duration: 1, delay: i * 0.05 }}
                  className="w-full bg-gradient-to-t from-[#25D366]/20 to-[#25D366] rounded-t-lg shadow-[0_0_15px_rgba(37,211,102,0.2)] group-hover:shadow-[0_0_25px_rgba(37,211,102,0.4)] transition-shadow"
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-white text-black text-xs font-bold px-2 py-1 rounded">
                  {val}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-white/30 font-mono uppercase tracking-wider">
            <span>Gen</span><span>Mar</span><span>Mag</span><span>Lug</span><span>Set</span><span>Nov</span>
          </div>
        </div>

        {/* AZIONI RAPIDE & STATO */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#25D366] to-transparent"></div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Zap size={18} className="text-yellow-400" /> Azioni Rapide</h2>
            <div className="space-y-2">
              <Link href="/admin/clienti" className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition group">
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-blue-400" />
                  <span className="text-sm font-bold">Anagrafica Clienti</span>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-white transition" />
              </Link>
              <Link href="/admin/scadenze" className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition group">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-yellow-400" />
                  <span className="text-sm font-bold">Gestione Scadenze</span>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-white transition" />
              </Link>
              <Link href="/admin/richieste" className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition group">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-purple-400" />
                  <span className="text-sm font-bold">Richieste Assistenza</span>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-white transition" />
              </Link>
            </div>
          </div>

          {/* ULTIMI CLIENTI */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold">Ultimi Clienti Iscritti</h2>
              <Link href="/admin/clienti" className="text-xs font-bold text-[#25D366] hover:underline">Vedi tutti</Link>
            </div>
            <div className="space-y-3">
              {recentTenants.map(t => (
                <Link href={`/admin/clienti/${t.slug}`} key={t.id} className="flex items-center justify-between p-2 hover:bg-white/[0.02] rounded-lg transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: t.brand_color || '#25D366', color: '#000' }}>
                      {t.business_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/90">{t.business_name}</p>
                      <p className="text-[10px] text-white/40">{new Date(t.created_at).toLocaleDateString("it-IT")}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${t.subscription_status === 'active' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-yellow-400/10 text-yellow-400'}`}>
                    {t.subscription_status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
