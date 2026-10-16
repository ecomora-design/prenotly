"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  Loader2, ArrowLeft, ExternalLink, MessageCircle, Users,
  ShoppingBag, Calendar, Mail, Phone, MapPin, Calendar as CalIcon,
  Trash2, CheckCircle2, Clock, XCircle, AlertCircle, Zap,
  Copy, Check, TrendingUp, CreditCard, Globe, Lock, Crown,
} from "lucide-react";

export default function ClienteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [stats, setStats] = useState({
    orders: 0,
    bookings: 0,
    customers: 0,
    services: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: t } = await supabase
        .from("tenants")
        .select("*")
        .eq("slug", slug)
        .single();

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
        revenue: 0,
      });

      // Ultimi ordini
      const { data: o } = await supabase
        .from("orders")
        .select("*")
        .eq("tenant_id", t.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Ultime prenotazioni
      const { data: b } = await supabase
        .from("bookings")
        .select("*")
        .eq("tenant_id", t.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentOrders(o || []);
      setRecentBookings(b || []);
      setLoading(false);
    }
    load();
  }, [slug]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`https://prenotly-italia.it/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivate = async () => {
    if (!confirm("Attivare questo cliente per 12 mesi?")) return;
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    await supabase
      .from("tenants")
      .update({
        subscription_status: "active",
        subscription_ends_at: oneYearLater.toISOString(),
      })
      .eq("id", tenant.id);
    window.location.reload();
  };

  const handleExtendTrial = async (days: number) => {
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + days);
    await supabase
      .from("tenants")
      .update({ trial_ends_at: newEnd.toISOString() })
      .eq("id", tenant.id);
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
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  const phone = (tenant.whatsapp_number || "").replace(/\D/g, "");
  const trialHoursLeft = tenant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    active: { label: "Attivo", color: "text-green-400", bg: "bg-green-500/20", icon: CheckCircle2 },
    trial: { label: "Demo", color: "text-yellow-400", bg: "bg-yellow-500/20", icon: Clock },
    expired: { label: "Scaduto", color: "text-red-400", bg: "bg-red-500/20", icon: XCircle },
  };
  const status = statusConfig[tenant.subscription_status] || statusConfig.trial;
  const StatusIcon = status.icon;

  return (
    <div>
      <Link
        href="/admin/clienti"
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-4 transition"
      >
        <ArrowLeft size={14} />
        Torna ai clienti
      </Link>

      <PageHeader
        title={tenant.business_name}
        subtitle={`prenotly-italia.it/${tenant.slug}`}
        breadcrumb={[
          { label: "Admin" },
          { label: "Clienti", href: "/admin/clienti" },
          { label: tenant.business_name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-white/70 px-3 py-2 rounded-full text-xs font-semibold transition"
            >
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              {copied ? "Copiato" : "Copia link"}
            </button>
            <a
              href={`/${tenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-white/70 px-3 py-2 rounded-full text-xs font-semibold transition"
            >
              <ExternalLink size={13} />
              Apri
            </a>
          </div>
        }
      />

      {/* STATUS + AZIONI */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Status card */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div className="flex items-center gap-4">
              {tenant.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={tenant.business_name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: tenant.brand_color || "#25D25" }}
                >
                  {tenant.business_name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${status.bg} ${status.color}`}>
                    <StatusIcon size={10} />
                    {status.label.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-white/30 uppercase">
                    {tenant.product_type || tenant.business_type}
                  </span>
                </div>
                {tenant.subscription_status === "trial" && trialHoursLeft > 0 && (
                  <p className="text-xs text-yellow-400 font-semibold">
                    Demo: {trialHoursLeft} ore rimanenti
                  </p>
                )}
                {tenant.subscription_status === "active" && tenant.subscription_ends_at && (
                  <p className="text-xs text-green-400 font-semibold">
                    Attivo fino al {new Date(tenant.subscription_ends_at).toLocaleDateString("it-IT")}
                  </p>
                )}
                <p className="text-[11px] text-white/40 mt-1">
                  Iscritto il {new Date(tenant.created_at).toLocaleDateString("it-IT")}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-4">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
              Azioni rapide
            </p>
            <div className="flex flex-wrap gap-2">
              {tenant.subscription_status !== "active" && (
                <button
                  onClick={handleActivate}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-bold px-4 py-2 rounded-full transition inline-flex items-center gap-1.5"
                >
                  <Zap size={12} />
                  ATTIVA 12 MESI
                </button>
              )}
              {tenant.subscription_status === "trial" && (
                <>
                  <button
                    onClick={() => handleExtendTrial(3)}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs font-bold px-3 py-2 rounded-full transition"
                  >
                    +3 GIORNI
                  </button>
                  <button
                    onClick={() => handleExtendTrial(7)}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs font-bold px-3 py-2 rounded-full transition"
                  >
                    +7 GIORNI
                  </button>
                </>
              )}
              {phone && (
                <a
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-wa/20 hover:bg-wa/30 text-wa text-xs font-bold px-4 py-2 rounded-full transition inline-flex items-center gap-1.5"
                >
                  <MessageCircle size={12} />
                  WHATSAPP
                </a>
              )}
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold px-4 py-2 rounded-full transition inline-flex items-center gap-1.5"
              >
                <Trash2 size={12} />
                ELIMINA
              </button>
            </div>
          </div>
        </div>

        {/* Contatti */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
            Contatti
          </p>
          <div className="space-y-3">
            {tenant.address && (
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-white/40 shrink-0 mt-0.5" />
                <p className="text-xs text-white/70 leading-relaxed">{tenant.address}</p>
              </div>
            )}
            {tenant.phone && (
              <div className="flex items-start gap-3">
                <Phone size={14} className="text-white/40 shrink-0 mt-0.5" />
                <p className="text-xs text-white/70">{tenant.phone}</p>
              </div>
            )}
            {tenant.whatsapp_number && (
              <div className="flex items-start gap-3">
                <MessageCircle size={14} className="text-wa shrink-0 mt-0.5" />
                <p className="text-xs text-white/70">{tenant.whatsapp_number}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATISTICHE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag size={14} className="text-blue-400" />
            <span className="text-[10px] font-mono text-white/40 uppercase">Ordini</span>
          </div>
          <p className="text-2xl font-bold">{stats.orders}</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-violet-400" />
            <span className="text-[10px] font-mono text-white/40 uppercase">Prenotazioni</span>
          </div>
          <p className="text-2xl font-bold">{stats.bookings}</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-wa" />
            <span className="text-[10px] font-mono text-white/40 uppercase">Clienti</span>
          </div>
          <p className="text-2xl font-bold">{stats.customers}</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={14} className="text-yellow-400" />
            <span className="text-[10px] font-mono text-white/40 uppercase">Servizi</span>
          </div>
          <p className="text-2xl font-bold">{stats.services}</p>
        </div>
      </div>

      {/* ATTIVITÀ RECENTE */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Ordini */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-blue-400" />
              <h3 className="text-sm font-bold">Ultimi ordini</h3>
            </div>
            <span className="text-[10px] font-mono text-white/30">
              {stats.orders} TOTALI
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <p className="p-6 text-center text-white/30 text-xs">Nessun ordine</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentOrders.map((o) => (
                <div key={o.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono font-semibold text-white/80">
                      {o.order_code}
                    </p>
                    <p className="text-[10px] text-white/40">
                      {new Date(o.created_at).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-white/80">
                    €{Number(o.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prenotazioni */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-violet-400" />
              <h3 className="text-sm font-bold">Ultime prenotazioni</h3>
            </div>
            <span className="text-[10px] font-mono text-white/30">
              {stats.bookings} TOTALI
            </span>
          </div>

          {recentBookings.length === 0 ? (
            <p className="p-6 text-center text-white/30 text-xs">Nessuna prenotazione</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentBookings.map((b) => (
                <div key={b.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono font-semibold text-white/80">
                      {b.booking_code}
                    </p>
                    <p className="text-[10px] text-white/40">
                      {new Date(b.scheduled_at).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0F0F17] border border-red-500/30 rounded-3xl max-w-md w-full p-6"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1">Eliminare questo cliente?</h3>
                <p className="text-xs text-white/50">
                  Verranno eliminati tutti i dati: ordini, prenotazioni, clienti, servizi.
                  Azione <strong className="text-red-400">irreversibile</strong>.
                </p>
              </div>
            </div>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Scrivi ELIMINA per confermare"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-red-500/50 mb-4 placeholder-white/20"
            />

            <div className="flex gap-2">
              <button
                onClick={() => { setConfirmDelete(false); setConfirmText(""); }}
                className="flex-1 border border-white/[0.06] hover:bg-white/[0.03] py-3 rounded-full font-semibold text-sm transition"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== "ELIMINA" || deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed py-3 rounded-full font-bold text-sm transition inline-flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <><Loader2 className="animate-spin" size={14} />Eliminazione...</>
                ) : (
                  <><Trash2 size={14} />Elimina</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
