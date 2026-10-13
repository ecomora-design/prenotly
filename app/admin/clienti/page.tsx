"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Search, ExternalLink, MessageCircle, RefreshCw,
  CheckCircle2, Clock, XCircle, AlertCircle, Trash2, X,
  MoreVertical, Calendar, Phone, Mail, Zap, AlertTriangle
} from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  business_type: string;
  product_type: string | null;
  whatsapp_number: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  created_at: string;
  logo_url: string | null;
  brand_color: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: "Attivo", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle2 },
  trial: { label: "Demo", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: Clock },
  expired: { label: "Scaduto", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: XCircle },
  suspended: { label: "Sospeso", color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: AlertCircle },
};

export default function AdminClientiPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tutti");
  const [confirmDelete, setConfirmDelete] = useState<Tenant | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    setTenants(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const activateTenant = async (id: string) => {
    if (!confirm("Attivare questo cliente per 12 mesi?")) return;
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    await supabase
      .from("tenants")
      .update({
        subscription_status: "active",
        subscription_ends_at: oneYearLater.toISOString(),
      })
      .eq("id", id);
    await load();
  };

  const extendTrial = async (id: string, days: number) => {
    if (!confirm(`Estendere la demo di ${days} giorni?`)) return;
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + days);
    await supabase
      .from("tenants")
      .update({ trial_ends_at: newEnd.toISOString() })
      .eq("id", id);
    await load();
  };

  const expireTenant = async (id: string) => {
    if (!confirm("Disattivare questo cliente?")) return;
    await supabase
      .from("tenants")
      .update({ subscription_status: "expired" })
      .eq("id", id);
    await load();
  };

  const deleteTenant = async () => {
    if (!confirmDelete || confirmText !== "ELIMINA") return;
    setDeleting(true);

    // Elimina tutto in cascata manualmente (ordine importante)
    const id = confirmDelete.id;
    await Promise.all([
      supabase.from("orders").delete().eq("tenant_id", id),
      supabase.from("bookings").delete().eq("tenant_id", id),
      supabase.from("customers").delete().eq("tenant_id", id),
      supabase.from("services").delete().eq("tenant_id", id),
    ]);

    await supabase.from("tenant_users").delete().eq("tenant_id", id);
    await supabase.from("tenants").delete().eq("id", id);

    setDeleting(false);
    setConfirmDelete(null);
    setConfirmText("");
    await load();
  };

  const filtered = tenants.filter((t) => {
    if (filter !== "tutti" && t.subscription_status !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.business_name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      (t.whatsapp_number || "").includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 mb-6 flex-wrap"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
            Clienti
          </h1>
          <p className="text-white/40 text-sm font-mono">
            {tenants.length} ATTIVITÀ REGISTRATE
          </p>
        </div>
        <button
          onClick={load}
          className="bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] px-4 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 transition"
        >
          <RefreshCw size={14} />
          Aggiorna
        </button>
      </motion.div>

      {/* Filtri + Search */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {["tutti", "trial", "active", "expired"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0 ${
                filter === f
                  ? "bg-wa text-white shadow-[0_0_20px_rgba(37,211,102,0.4)]"
                  : "bg-white/[0.03] text-white/60 hover:bg-white/[0.06] border border-white/[0.06]"
              }`}
            >
              {f === "tutti" ? "TUTTI" : STATUS_CONFIG[f]?.label.toUpperCase() || f}
              <span className="ml-2 opacity-60">
                {f === "tutti"
                  ? tenants.length
                  : tenants.filter((t) => t.subscription_status === f).length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Cerca per nome, slug o numero..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F0F17] border border-white/[0.06] rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-wa/50 placeholder-white/30 transition"
          />
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-[#0F0F17] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Users size={48} className="text-white/20 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Nessun cliente</h2>
          <p className="text-white/40 text-sm">
            {search ? "Nessun risultato per la ricerca" : "Nessun cliente in questo stato"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t, i) => {
            const config = STATUS_CONFIG[t.subscription_status || "trial"] || STATUS_CONFIG.trial;
            const StatusIcon = config.icon;
            const phone = (t.whatsapp_number || "").replace(/\D/g, "");
            const trialHoursLeft = t.trial_ends_at
              ? Math.max(0, Math.ceil((new Date(t.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
              : 0;

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="group bg-[#0F0F17] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {t.logo_url ? (
                      <img
                        src={t.logo_url}
                        alt={t.business_name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-1 ring-white/[0.06]"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ backgroundColor: t.brand_color || "#25D366" }}
                      >
                        {t.business_name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-base">{t.business_name}</h3>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${config.color}`}
                        >
                          <StatusIcon size={9} />
                          {config.label.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
                        <span className="font-mono">/{t.slug}</span>
                        <span>·</span>
                        <span className="uppercase">{t.product_type || t.business_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`/${t.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-white/40 hover:text-wa transition"
                      title="Apri pagina pubblica"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  <div className="bg-white/[0.03] rounded-xl p-3">
                    <p className="text-[9px] font-mono text-white/30 uppercase tracking-wider mb-1">
                      Registrato
                    </p>
                    <p className="text-xs font-semibold">
                      {new Date(t.created_at).toLocaleDateString("it-IT")}
                    </p>
                  </div>

                  {t.subscription_status === "trial" && t.trial_ends_at && (
                    <div className="bg-yellow-500/[0.08] border border-yellow-500/20 rounded-xl p-3">
                      <p className="text-[9px] font-mono text-yellow-400/70 uppercase tracking-wider mb-1">
                        Demo scade
                      </p>
                      <p className="text-xs font-bold text-yellow-300">
                        {trialHoursLeft}h rimanenti
                      </p>
                    </div>
                  )}

                  {t.subscription_status === "active" && t.subscription_ends_at && (
                    <div className="bg-green-500/[0.08] border border-green-500/20 rounded-xl p-3">
                      <p className="text-[9px] font-mono text-green-400/70 uppercase tracking-wider mb-1">
                        Scadenza
                      </p>
                      <p className="text-xs font-bold text-green-300">
                        {new Date(t.subscription_ends_at).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                  )}

                  {t.whatsapp_number && (
                    <div className="bg-white/[0.03] rounded-xl p-3">
                      <p className="text-[9px] font-mono text-white/30 uppercase tracking-wider mb-1">
                        WhatsApp
                      </p>
                      <p className="text-xs font-semibold truncate">{t.whatsapp_number}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-2 flex-wrap">
                    {t.subscription_status !== "active" && (
                      <button
                        onClick={() => activateTenant(t.id)}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-300 text-[11px] font-bold px-3 py-2 rounded-full transition inline-flex items-center gap-1.5"
                      >
                        <Zap size={12} />
                        ATTIVA 12 MESI
                      </button>
                    )}
                    {t.subscription_status === "trial" && (
                      <button
                        onClick={() => extendTrial(t.id, 7)}
                        className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-[11px] font-bold px-3 py-2 rounded-full transition"
                      >
                        +7 GIORNI
                      </button>
                    )}
                    {t.subscription_status === "active" && (
                      <button
                        onClick={() => expireTenant(t.id)}
                        className="text-red-400/80 hover:text-red-400 hover:bg-red-500/10 text-[11px] font-bold px-3 py-2 rounded-full transition"
                      >
                        DISATTIVA
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {phone && (
                      <a
                        href={`https://wa.me/${phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-wa hover:bg-wa/10 text-[11px] font-bold p-2 rounded-full inline-flex items-center gap-1 transition"
                        title="Contatta WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => setConfirmDelete(t)}
                      className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-full transition"
                      title="Elimina cliente"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MODAL ELIMINAZIONE */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
            onClick={() => !deleting && setConfirmDelete(null)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0F0F17] border border-red-500/30 rounded-3xl max-w-lg w-full p-6 md:p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-red-400" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">Eliminare questo cliente?</h3>
                  <p className="text-sm text-white/50">
                    Stai per eliminare <strong className="text-white">{confirmDelete.business_name}</strong>.
                    Questa azione è <strong className="text-red-400">irreversibile</strong>.
                  </p>
                </div>
              </div>

              <div className="bg-red-500/[0.08] border border-red-500/20 rounded-2xl p-4 mb-5">
                <p className="text-xs text-white/60 leading-relaxed">
                  Verranno eliminati definitivamente:
                </p>
                <ul className="text-xs text-white/60 mt-2 space-y-1">
                  <li>• L&apos;account dell&apos;attività</li>
                  <li>• Tutti gli ordini e le prenotazioni</li>
                  <li>• Il menu e i servizi</li>
                  <li>• I clienti associati</li>
                  <li>• La web app pubblica</li>
                </ul>
              </div>

              <label className="block mb-5">
                <span className="text-xs font-mono text-white/50 mb-2 block">
                  Scrivi <strong className="text-red-400">ELIMINA</strong> per confermare:
                </span>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="ELIMINA"
                  disabled={deleting}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-red-500/50 placeholder-white/20 transition"
                />
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setConfirmDelete(null);
                    setConfirmText("");
                  }}
                  disabled={deleting}
                  className="flex-1 border border-white/[0.06] hover:bg-white/[0.03] py-3 rounded-full font-semibold text-sm transition"
                >
                  Annulla
                </button>
                <button
                  onClick={deleteTenant}
                  disabled={confirmText !== "ELIMINA" || deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed py-3 rounded-full font-bold text-sm transition inline-flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Eliminazione...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Elimina definitivamente
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Users({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
