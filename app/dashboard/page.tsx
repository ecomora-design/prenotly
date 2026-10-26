"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Loader2, ShoppingBag, Calendar, Users, QrCode, Plus, AlertCircle,
  ArrowRight, TrendingUp, Clock, ExternalLink,
  CheckCircle2, Utensils, Settings, Eye, Zap, Sparkles,
  ArrowUpRight, BarChart3, CreditCard, Activity, Wallet,
  ArrowDownRight, MoreHorizontal, ChefHat, Star
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
  plan_type: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [counts, setCounts] = useState({
    bookings: 0, orders: 0, services: 0, customers: 0,
    todayOrders: 0, todayBookings: 0, weekOrders: 0, weekBookings: 0,
    todayRevenue: 0, totalRevenue: 0,
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

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const [b, o, s, c, todayO, todayB, weekO, weekB, ordersData] = await Promise.all([
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", t.id).gte("created_at", todayStart.toISOString()).lte("created_at", todayEnd.toISOString()),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("tenant_id", t.id).gte("scheduled_at", todayStart.toISOString()).lte("scheduled_at", todayEnd.toISOString()),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", t.id).gte("created_at", weekStart.toISOString()),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("tenant_id", t.id).gte("scheduled_at", weekStart.toISOString()),
        supabase.from("orders").select("total, created_at").eq("tenant_id", t.id).eq("status", "delivered"),
      ]);

      const orders = ordersData.data || [];
      const todayRevenue = orders.filter((od: any) => od.created_at >= todayStart.toISOString()).reduce((sum, od: any) => sum + Number(od.total), 0);
      const totalRevenue = orders.reduce((sum, od: any) => sum + Number(od.total), 0);

      setCounts({
        bookings: b.count || 0, orders: o.count || 0, services: s.count || 0, customers: c.count || 0,
        todayOrders: todayO.count || 0, todayBookings: todayB.count || 0, weekOrders: weekO.count || 0, weekBookings: weekB.count || 0,
        todayRevenue, totalRevenue,
      });

      setLoading(false);
    }
    load();
  }, []);

  if (loading || !tenant) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin text-night" size={40} />
      </div>
    );
  }

  const isFood = tenant.product_type === "food" || tenant.business_type === "restaurant";
  const isTrial = tenant.subscription_status === "trial";
  const isMenuOnly = !isTrial && tenant.plan_type === "food_menu";
  const brandColor = tenant.brand_color || (isFood ? "#25D366" : "#8B5CF6");
  const trialHoursLeft = tenant.trial_ends_at ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60))) : 0;
  const firstName = tenant.business_name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buongiorno" : hour < 18 ? "Buon pomeriggio" : "Buonasera";

  const totalMain = isFood ? counts.orders : counts.bookings;
  const todayMain = isFood ? counts.todayOrders : counts.todayBookings;
  const weekMain = isFood ? counts.weekOrders : counts.weekBookings;

  // Dati grafico simulati
  const chartData = [30, 45, 25, 60, 80, 50, 95];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
          <span className="text-[10px] font-black uppercase tracking-widest text-night/40">
            {greeting}
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-night leading-tight">
              {firstName},
            </h1>
            <p className="text-xl md:text-3xl text-night/40 font-bold mt-1">
              ecco come sta andando.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/${tenant.slug}`} target="_blank" className="inline-flex items-center gap-2 bg-white border border-night/[0.08] hover:border-night/20 text-night px-4 py-2.5 rounded-full font-semibold text-xs transition shadow-sm">
              <Eye size={14} /> Vedi Sito
            </Link>
            <Link href="/dashboard/abbonamento" className="inline-flex items-center gap-2 text-white px-4 py-2.5 rounded-full font-bold text-xs transition shadow-md" style={{ backgroundColor: brandColor }}>
              <Sparkles size={14} /> {tenant.subscription_status === "trial" ? "Attiva Ora" : "Il Tuo Piano"}
            </Link>
          </div>
        </div>
      </div>

      {/* BANNER TRIAL IN SCADENZA */}
      {tenant.subscription_status === "trial" && trialHoursLeft > 0 && trialHoursLeft < 48 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-night text-sm">Demo in scadenza</p>
            <p className="text-xs text-amber-800 mt-0.5">Ti restano <strong>{trialHoursLeft} ore</strong>. Attiva l'abbonamento per non perdere l'accesso.</p>
          </div>
          <Link href="/dashboard/abbonamento" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full font-bold text-xs transition shrink-0 active:scale-[0.98]">
            Attiva
          </Link>
        </motion.div>
      )}

      {/* KPI CARDS - Design Premium */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: isFood ? "Ordini Oggi" : "Prenotazioni Oggi", 
            value: todayMain, 
            icon: isFood ? ShoppingBag : Calendar,
            color: brandColor,
            hint: `${totalMain} totali`,
            href: isFood ? "/dashboard/ordini" : "/dashboard/prenotazioni"
          },
          { 
            label: isFood ? "Incasso Oggi" : "Prenotazioni Settimana", 
            value: isFood ? `€${counts.todayRevenue.toFixed(0)}` : weekMain, 
            icon: isFood ? Wallet : TrendingUp,
            color: "#10B981",
            hint: isFood ? `€${counts.totalRevenue.toFixed(0)} totali` : `${totalMain} totali`,
            href: isFood ? "/dashboard/ordini" : "/dashboard/prenotazioni"
          },
          { 
            label: "Clienti Attivi", 
            value: counts.customers, 
            icon: Users,
            color: "#3B82F6",
            hint: "Nel tuo database",
            href: "/dashboard/clienti"
          },
          { 
            label: isFood ? "Piatti nel Menu" : "Servizi Attivi", 
            value: counts.services, 
            icon: Utensils,
            color: "#8B5CF6",
            hint: "Sul tuo sito",
            href: "/dashboard/servizi"
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={kpi.href}
              className="group block bg-white rounded-3xl p-5 border border-night/[0.06] hover:border-night/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition" style={{ backgroundColor: kpi.color }} />
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <kpi.icon size={20} style={{ color: kpi.color }} />
                </div>
                <ArrowUpRight size={14} className="text-night/20 group-hover:text-night/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-night/40 mb-1">{kpi.label}</p>
              <p className="text-3xl font-black text-night tracking-tight leading-none">{kpi.value}</p>
              <p className="text-[11px] text-night/40 mt-2">{kpi.hint}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* GRAFICO + PAGINA PUBBLICA */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* GRAFICO SETTIMANA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 border border-night/[0.06] relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-night tracking-tight flex items-center gap-2">
                <BarChart3 size={18} style={{ color: brandColor }} /> Andamento {isFood ? "Ordini" : "Prenotazioni"}
              </h2>
              <p className="text-xs text-night/40 mt-1">Ultimi 7 giorni · {weekMain} {isFood ? "ordini" : "prenotazioni"}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp size={12} /> +18%
            </div>
          </div>

          <div className="h-40 flex items-end gap-2 relative z-10">
            {chartData.map((val, i) => (
              <div key={i} className="flex-1 relative group" style={{ height: '100%' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                  className="absolute bottom-0 w-full rounded-t-lg transition-all group-hover:opacity-80"
                  style={{ 
                    background: `linear-gradient(180deg, ${brandColor} 0%, ${brandColor}80 100%)`,
                    boxShadow: `0 4px 12px ${brandColor}40`
                  }}
                />
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-night text-white text-[10px] font-black px-2 py-1 rounded pointer-events-none">
                  {val}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-night/30 uppercase tracking-widest">
            <span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span>
          </div>
        </motion.div>

        {/* PAGINA PUBBLICA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-night to-night/90 rounded-3xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: brandColor }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Pagina Pubblica</span>
            </div>
            
            <p className="text-xl font-black leading-tight mb-1">Il tuo menu è</p>
            <p className="text-xl font-black leading-tight mb-4 flex items-center gap-2">
              <span className="relative">
                online
                <span className="absolute -bottom-1 left-0 right-0 h-1 rounded" style={{ backgroundColor: brandColor }} />
              </span>
              <CheckCircle2 size={20} style={{ color: brandColor }} />
            </p>
            
            <p className="text-xs text-white/60 mb-5 break-all font-mono">
              prenotly-italia.it/{tenant.slug}
            </p>

            <div className="flex flex-col gap-2">
              <Link href={`/${tenant.slug}`} target="_blank" className="inline-flex items-center justify-center gap-2 bg-white text-night px-4 py-2.5 rounded-full font-bold text-xs transition active:scale-95">
                <ExternalLink size={14} /> Apri Sito
              </Link>
              <Link href="/dashboard/qr" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-full font-bold text-xs transition active:scale-95 border border-white/10">
                <QrCode size={14} /> QR Code
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AZIONI RAPIDE */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-sm font-black uppercase tracking-widest text-night/40 mb-3">Azioni Rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Plus, label: isFood ? "Aggiungi Piatto" : "Aggiungi Servizio", href: "/dashboard/servizi", color: brandColor },
            { icon: isFood ? ShoppingBag : Calendar, label: isFood ? "Vedi Ordini" : "Vedi Agenda", href: isFood ? "/dashboard/ordini" : "/dashboard/prenotazioni", color: "#3B82F6" },
            { icon: QrCode, label: "Scarica QR", href: "/dashboard/qr", color: "#8B5CF6" },
            { icon: Settings, label: "Personalizza", href: "/dashboard/impostazioni", color: "#F97316" },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="group bg-white rounded-2xl p-4 border border-night/[0.06] hover:border-night/20 hover:shadow-lg transition-all duration-300 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${action.color}15` }}>
                <action.icon size={18} style={{ color: action.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-night leading-tight">{action.label}</p>
              </div>
              <ArrowRight size={14} className="text-night/20 group-hover:text-night/60 group-hover:translate-x-0.5 transition shrink-0" />
            </Link>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
