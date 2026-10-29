"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Loader2, ArrowLeft, Eye, Users, ShoppingBag, Calendar,
  MessageCircle, MapPin, Phone, CheckCircle2, Clock, XCircle,
  CreditCard, Crown, Activity, ExternalLink
} from "lucide-react";

export default function ClientePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [stats, setStats] = useState({ orders: 0, bookings: 0, customers: 0, services: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: t } = await supabase.from("tenants").select("*").eq("slug", slug).single();
      if (!t) { router.push("/admin/clienti"); return; }
      setTenant(t);

      const [orders, bookings, customers, services] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("tenant_id", t.id),
      ]);
      setStats({
        orders: orders.count || 0,
        bookings: bookings.count || 0,
        customers: customers.count || 0,
        services: services.count || 0,
      });

      const { data: o } = await supabase.from("orders").select("*").eq("tenant_id", t.id).order("created_at", { ascending: false }).limit(6);
      const { data: b } = await supabase.from("bookings").select("*").eq("tenant_id", t.id).order("created_at", { ascending: false }).limit(6);
      setRecentOrders(o || []);
      setRecentBookings(b || []);
      setLoading(false);
    }
    load();
  }, [slug, supabase, router]);

  if (loading || !tenant) {
    return <div className="flex items-center justify-center h-[70vh] bg-[#050505]"><Loader2 className="animate-spin text-[#25D366]" size={40} /></div>;
  }

  const statusConfig: any = {
    active: { label: "Attivo", color: "text-[#25D366]", bg: "bg-[#25D366]/10", border: "border-[#25D366]/30", icon: CheckCircle2 },
    trial: { label: "Demo", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", icon: Clock },
    expired: { label: "Scaduto", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", icon: XCircle },
    suspended: { label: "Sospeso", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", icon: XCircle },
  };
  const status = statusConfig[tenant.subscription_status] || statusConfig.trial;
  const StatusIcon = status.icon;

  const phone = (tenant.whatsapp_number || "").replace(/\D/g, "");

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-[#25D366] selection:text-black">

      {/* BANNER ANTEPRIMA */}
      <motion.div
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <Eye size={20} className="text-blue-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-blue-300">Modalità Anteprima</p>
            <p className="text-xs text-blue-300/70">Stai vedendo i dati di {tenant.business_name} come li vede il cliente. Nessuna azione modifica il suo account.</p>
          </div>
        </div>
      </motion.div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link href={`/admin/clienti/${slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-white/40 hover:text-[#25D366] transition uppercase tracking-widest mb-2">
            <ArrowLeft size={14} /> Torna al dettaglio admin
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
            {tenant.business_name}
            <span className={`text-[10px] px-3 py-1 rounded-full border ${status.bg} ${status.color} ${status.border} uppercase tracking-widest font-bold flex items-center gap-1.5`}>
              <StatusIcon size={12} /> {status.label}
            </span>
          </h1>
          <p className="text-white/40 font-mono text-sm mt-1">prenotly-italia.it/{tenant.slug}</p>
        </div>
        <a href={`/${tenant.slug}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#20ba5a] text-black px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.3)] w-fit">
          <ExternalLink size={16} /> Apri sito pubblico
        </a>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Ordini", value: stats.orders, icon: ShoppingBag, color: "text-blue-400" },
          { label: "Prenotazioni", value: stats.bookings, icon: Calendar, color: "text-purple-400" },
          { label: "Clienti", value: stats.customers, icon: Users, color: "text-[#25D366]" },
          { label: "Servizi", value: stats.services, icon: CreditCard, color: "text-yellow-400" },
        ].map((kpi, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><kpi.icon size={48} className={kpi.color} /></div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-3xl font-black">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* COLONNA SINISTRA: INFO + LISTE */}
        <div className="lg:col-span-2 space-y-6">

          {/* INFO ANAGRAFICHE */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-5"><Activity size={16} className="text-[#25D366]" /> Informazioni Attività</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Categoria</p>
                <p className="text-sm text-white/90 capitalize">{tenant.category || "Non assegnata"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Piano</p>
                <p className="text-sm text-white/90">{tenant.plan_type || "Nessuno"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Numero WhatsApp</p>
                <p className="text-sm text-white/90 flex items-center gap-1.5"><Phone size={12} /> {tenant.whatsapp_number || "Non impostato"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Prenotazione tavoli</p>
                <p className="text-sm text-white/90">{tenant.enable_table_bookings ? "Attiva" : "Disattiva"}</p>
              </div>
              {tenant.description && (
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Descrizione</p>
                  <p className="text-sm text-white/70 leading-relaxed">{tenant.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* ULTIMI ORDINI */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><ShoppingBag size={16} className="text-blue-400" /> Ultimi Ordini</h3>
            {recentOrders.length === 0 ? (
              <p className="text-xs text-white/40">Nessun ordine ancora ricevuto.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                    <div>
                      <p className="text-xs font-mono text-white/80">{o.order_code}</p>
                      <p className="text-[10px] text-white/40">{new Date(o.created_at).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#25D366]">€{Number(o.total).toFixed(2)}</p>
                      <p className="text-[10px] text-white/40 uppercase">{o.order_type === "delivery" ? "Domicilio" : "Asporto"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ULTIME PRENOTAZIONI */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Calendar size={16} className="text-purple-400" /> Ultime Prenotazioni</h3>
            {recentBookings.length === 0 ? (
              <p className="text-xs text-white/40">Nessuna prenotazione ancora ricevuta.</p>
            ) : (
              <div className="space-y-2">
                {recentBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                    <div>
                      <p className="text-xs font-mono text-white/80">{b.booking_code}</p>
                      <p className="text-[10px] text-white/40">{new Date(b.scheduled_at).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}</p>
                    </div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase bg-purple-400/10 px-2 py-1 rounded">{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLONNA DESTRA: AZIONI E SCADENZE */}
        <div className="space-y-6">

          {/* STATO ABBONAMENTO */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#25D366] to-transparent"></div>
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Crown size={16} className="text-yellow-400" /> Abbonamento</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">Stato</span>
                <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">Scadenza Demo</span>
                <span className="text-xs text-white/70">{tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString("it-IT") : "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">Scadenza Abbonamento</span>
                <span className="text-xs text-white/70">{tenant.subscription_ends_at ? new Date(tenant.subscription_ends_at).toLocaleDateString("it-IT") : "—"}</span>
              </div>
            </div>
          </div>

          {/* CONTATTI */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><MessageCircle size={16} className="text-[#25D366]" /> Contatti</h3>
            <div className="space-y-2">
              {phone && (
                <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/70 hover:text-[#25D366] transition p-2 rounded-lg hover:bg-white/[0.03]">
                  <MessageCircle size={14} /> {tenant.whatsapp_number}
                </a>
              )}
              <div className="flex items-center gap-2 text-xs text-white/70 p-2">
                <MapPin size={14} /> {tenant.address || "Indirizzo non impostato"}
              </div>
            </div>
          </div>

          {/* BOTTONE RITORNO */}
          <Link
            href={`/admin/clienti/${slug}`}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Torna al pannello admin
          </Link>
        </div>
      </div>
    </div>
  );
}
