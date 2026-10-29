"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Loader2, ArrowLeft, ExternalLink, MessageCircle, Users,
  ShoppingBag, Calendar, Phone, MapPin, Trash2, CheckCircle2, 
  Clock, XCircle, AlertCircle, Zap, Copy, Check, CreditCard, Crown,
  TrendingUp, Activity, ArrowUpRight, BarChart3
} from "lucide-react";

export default function ClienteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [stats, setStats] = useState({ orders: 0, bookings: 0, customers: 0, services: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [savingSub, setSavingSub] = useState(false);
  const [subForm, setSubForm] = useState({
    subscription_status: "trial",
    plan_type: "food_menu",
    trial_ends_at: "",
    subscription_ends_at: "",
    enable_table_bookings: false,
  });

  useEffect(() => {
    async function load() {
      const { data: t } = await supabase.from("tenants").select("*").eq("slug", slug).single();
      if (!t) { router.push("/admin/clienti"); return; }
      
      setTenant(t);
      setSubForm({
        subscription_status: t.subscription_status || "trial",
        plan_type: t.plan_type || "food_menu",
        trial_ends_at: t.trial_ends_at ? new Date(t.trial_ends_at).toISOString().slice(0, 16) : "",
        subscription_ends_at: t.subscription_ends_at ? new Date(t.subscription_ends_at).toISOString().slice(0, 16) : "",
        enable_table_bookings: t.enable_table_bookings === true,
      });

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

      const { data: o } = await supabase.from("orders").select("*").eq("tenant_id", t.id).order("created_at", { ascending: false }).limit(5);
      const { data: b } = await supabase.from("bookings").select("*").eq("tenant_id", t.id).order("created_at", { ascending: false }).limit(5);
      
      setRecentOrders(o || []);
      setRecentBookings(b || []);
      setLoading(false);
    }
    load();
  }, [slug, supabase, router]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`https://prenotly-italia.it/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSubscription = async () => {
    setSavingSub(true);
    const { error } = await supabase.from("tenants").update({
      subscription_status: subForm.subscription_status,
      plan_type: subForm.plan_type,
      trial_ends_at: subForm.trial_ends_at ? new Date(subForm.trial_ends_at).toISOString() : null,
      subscription_ends_at: subForm.subscription_ends_at ? new Date(subForm.subscription_ends_at).toISOString() : null,
      enable_table_bookings: subForm.enable_table_bookings,
    }).eq("id", tenant.id);
    
    setSavingSub(false);
    if (error) alert("Errore: " + error.message);
    else window.location.reload();
  };

  const handleActivate = async () => {
    if (!confirm("Attivare questo cliente per 12 mesi con piano Food + Ordini (29,99€/mese)?")) return;
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    await supabase.from("tenants").update({
      subscription_status: "active",
      subscription_ends_at: oneYearLater.toISOString(),
      plan_type: "food_standard",
      enable_table_bookings: true,
    }).eq("id", tenant.id);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (confirmText !== "ELIMINA") return;
    setDeleting(true);
    const id = tenant.id;
    await Promise.all([
      supabase.from("orders").delete().eq("tenant_id", id),
      supabase.from("bookings").delete().eq("tenant_id", id),
      supabase.from("customers").delete().eq("tenant_id", id),
      supabase.from("services").delete().eq("tenant_id", id),
    ]);
    await supabase.from("tenant_users").delete().eq("tenant_id", id);
    await supabase.from("tenants").delete().eq("id", id);
    router.push("/admin/clienti");
  };

  if (loading || !tenant) {
    return <div className="flex items-center justify-center h-[70vh] bg-[#050505]"><Loader2 className="animate-spin text-[#25D366]" size={40} /></div>;
  }

  const phone = (tenant.app_number || "").replace(/\D/g, "");
  const statusConfig: any = {
    active: { label: "Attivo", color: "text-[#25D366]", bg: "bg-[#25D366]/10", border: "border-[#25D366]/30", icon: CheckCircle2 },
    trial: { label: "Demo", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", icon: Clock },
    expired: { label: "Scaduto", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", icon: XCircle },
  };
  const status = statusConfig[tenant.subscription_status] || statusConfig.trial;
  const StatusIcon = status.icon;

  const chartData = [30, 45, 25, 60, 80, 50, 95];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-[#25D366] selection:text-black">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/admin/clienti" className="inline-flex items-center gap-2 text-xs font-bold text-white/40 hover:text-[#25D366] transition uppercase tracking-widest mb-2">
            <ArrowLeft size={14} /> Torna ai Clienti
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
            {tenant.business_name}
            <span className={`text-[10px] px-3 py-1 rounded-full border ${status.bg} ${status.color} ${status.border} uppercase tracking-widest font-bold flex items-center gap-1.5`}>
              <StatusIcon size={12} /> {status.label}
            </span>
          </h1>
          <p className="text-white/40 font-mono text-sm mt-1">prenotly-italia.it/{tenant.slug}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2">
            {copied ? <Check size={16} className="text-[#25D366]" /> : <Copy size={16} />} {copied ? "Copiato" : "Copia Link"}
          </button>
          <a href={`/${tenant.slug}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#20ba5a] text-black px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.3)]">
            <ExternalLink size={16} /> Apri Sito
          </a>
        </div>
      </div>

      {/* KPI CARDS (Top Row) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Ordini Totali", value: stats.orders, icon: ShoppingBag, color: "text-blue-400" },
          { label: "Prenotazioni", value: stats.bookings, icon: Calendar, color: "text-purple-400" },
          { label: "Clienti", value: stats.customers, icon: Users, color: "text-[#25D366]" },
          { label: "Servizi", value: stats.services, icon: CreditCard, color: "text-yellow-400" },
        ].map((kpi, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><kpi.icon size={48} className={kpi.color} /></div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-3xl font-black">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* GRAFICO + ATTIVITÀ */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* GRAFICO NEXT-GEN */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2"><BarChart3 size={18} className="text-[#25D366]" /> Andamento Ordini</h2>
                <p className="text-xs text-white/40 mt-1">Ultimi 7 giorni</p>
              </div>
              <div className="flex items-center gap-1 text-[#25D366] text-sm font-bold bg-[#25D366]/10 px-3 py-1 rounded-full">
                <TrendingUp size={14} /> +24%
              </div>
            </div>
            
            <div className="h-48 w-full flex items-end gap-2 relative z-10">
              {chartData.map((val, i) => (
                <div key={i} className="flex-1 bg-white/[0.02] hover:bg-white/[0.05] rounded-t-lg relative group transition-all duration-300 flex flex-col justify-end" style={{ height: '100%' }}>
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: `${val}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                    className="w-full bg-gradient-to-t from-[#25D366]/20 to-[#25D366] rounded-t-lg shadow-[0_0_15px_rgba(37,211,102,0.2)] group-hover:shadow-[0_0_25px_rgba(37,211,102,0.4)] transition-shadow"
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-white text-black text-xs font-bold px-2 py-1 rounded">
                    {val}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] text-white/30 font-mono uppercase tracking-wider">
              <span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span>
            </div>
          </div>

          {/* LISTE ATTIVITÀ */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><ShoppingBag size={16} className="text-blue-400"/> Ultimi Ordini</h3>
              <div className="space-y-3">
                {recentOrders.slice(0,4).map(o => (
                  <div key={o.id} className="flex items-center justify-between p-2 hover:bg-white/[0.02] rounded-lg transition">
                    <div>
                      <p className="text-xs font-mono text-white/80">{o.order_code}</p>
                      <p className="text-[10px] text-white/40">{new Date(o.created_at).toLocaleDateString("it-IT")}</p>
                    </div>
                    <span className="text-xs font-bold text-[#25D366]">€{Number(o.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Calendar size={16} className="text-purple-400"/> Ultime Prenotazioni</h3>
              <div className="space-y-3">
                {recentBookings.slice(0,4).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-2 hover:bg-white/[0.02] rounded-lg transition">
                    <div>
                      <p className="text-xs font-mono text-white/80">{b.booking_code}</p>
                      <p className="text-[10px] text-white/40">{new Date(b.scheduled_at).toLocaleDateString("it-IT")} alle {new Date(b.scheduled_at).toLocaleTimeString("it-IT", {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase bg-purple-400/10 px-2 py-1 rounded">{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GESTIONE ABBONAMENTO 360 E AZIONI */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#25D366] to-transparent"></div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-1"><Crown size={18} className="text-yellow-400" /> Control Panel</h2>
            <p className="text-xs text-white/40 mb-6">Gestione 360° Account</p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Stato Account</label>
                <select value={subForm.subscription_status} onChange={e => setSubForm({...subForm, subscription_status: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#25D366] outline-none transition">
                  <option value="trial">Demo (Trial)</option>
                  <option value="active">Attivo (Pagante)</option>
                  <option value="expired">Scaduto</option>
                  <option value="suspended">Sospeso</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Piano Sottoscritto</label>
                <select value={subForm.plan_type} onChange={e => setSubForm({...subForm, plan_type: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#25D366] outline-none transition">
                  <option value="food_menu">Menu Digitale (9,99€/m)</option>
                  <option value="food_standard">Food + Ordini (29,99€/m)</option>
                  <option value="food_premium">Premium Pro (99,99€/m)</option>
                  <option value="servizi">Pro / Servizi (29,99€/m)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Scadenza Demo</label>
                  <input type="date" value={subForm.trial_ends_at} onChange={e => setSubForm({...subForm, trial_ends_at: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-2 py-2 text-xs focus:border-[#25D366] outline-none transition text-white/70" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Scadenza Abbon.</label>
                  <input type="date" value={subForm.subscription_ends_at} onChange={e => setSubForm({...subForm, subscription_ends_at: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-2 py-2 text-xs focus:border-[#25D366] outline-none transition text-white/70" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div>
                  <p className="text-sm font-bold">Modulo Tavoli</p>
                  <p className="text-[10px] text-white/40">Attiva piantina</p>
                </div>
                <button onClick={() => setSubForm({...subForm, enable_table_bookings: !subForm.enable_table_bookings})} className={`w-10 h-5 rounded-full transition relative ${subForm.enable_table_bookings ? "bg-[#25D366]" : "bg-white/20"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${subForm.enable_table_bookings ? "left-5" : "left-1"}`} />
                </button>
              </div>

              <button onClick={handleSaveSubscription} disabled={savingSub} className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-black py-3 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.2)]">
                {savingSub ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} SALVA MODIFICHE
              </button>
            </div>
          </div>

          {/* AZIONI RAPIDE */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-3xl p-6">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Azioni Rapide</h3>
            <div className="space-y-2">
              {tenant.subscription_status !== "active" && (
                <button onClick={handleActivate} className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2">
                  <Zap size={14} /> ATTIVA 12 MESI (Tavoli)
                </button>
              )}
              {phone && (
                <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2">
                  <MessageCircle size={14} /> WHATSAPP CLIENTE
                </a>
              )}
              <button onClick={() => setConfirmDelete(true)} className="w-full bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/10 py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2">
                <Trash2 size={14} /> ELIMINA ACCOUNT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A0A0A] border border-red-500/30 rounded-3xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1">Eliminare questo cliente?</h3>
                <p className="text-xs text-white/50">Tutti i dati andranno persi. Azione irreversibile.</p>
              </div>
            </div>
            <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value.toUpperCase())} placeholder="Scrivi ELIMINA" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-red-500/50 mb-4 placeholder-white/20" />
            <div className="flex gap-2">
              <button onClick={() => { setConfirmDelete(false); setConfirmText(""); }} className="flex-1 border border-white/[0.06] hover:bg-white/[0.03] py-3 rounded-xl font-semibold text-sm transition">Annulla</button>
              <button onClick={handleDelete} disabled={confirmText !== "ELIMINA" || deleting} className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2">
                {deleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} Elimina
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
