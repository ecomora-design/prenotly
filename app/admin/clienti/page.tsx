"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import PageHeader from "@/components/dashboard/PageHeader";
import { SkeletonTable } from "@/components/dashboard/Skeleton";
import {
  Search, RefreshCw, ExternalLink, MessageCircle,
  CheckCircle2, Clock, XCircle, ChevronRight, Users, Filter,
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  active: { label: "Attivo", color: "text-green-400", bg: "bg-green-500/20", icon: CheckCircle2 },
  trial: { label: "Demo", color: "text-yellow-400", bg: "bg-yellow-500/20", icon: Clock },
  expired: { label: "Scaduto", color: "text-red-400", bg: "bg-red-500/20", icon: XCircle },
  suspended: { label: "Sospeso", color: "text-gray-400", bg: "bg-gray-500/20", icon: XCircle },
};

export default function AdminClientiPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tutti");

  async function load() {
    const { data } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    setTenants(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

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

  const counts = {
    tutti: tenants.length,
    trial: tenants.filter((t) => t.subscription_status === "trial").length,
    active: tenants.filter((t) => t.subscription_status === "active").length,
    expired: tenants.filter((t) => t.subscription_status === "expired").length,
  };

  return (
    <div>
      <PageHeader
        title="Clienti"
        subtitle={`${tenants.length} attività sulla piattaforma`}
        breadcrumb={[{ label: "Admin" }, { label: "Clienti" }]}
        actions={
          <button
            onClick={load}
            className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-white/70 px-3 py-2 rounded-full text-xs font-semibold transition"
          >
            <RefreshCw size={13} />
            Aggiorna
          </button>
        }
      />

      {/* Toolbar */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Cerca per nome, slug o numero..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/[0.06] rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/[0.15] placeholder-white/30"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1">
            {(["tutti", "trial", "active", "expired"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0 ${
                  filter === f
                    ? "bg-white/[0.12] text-white"
                    : "text-white/50 hover:bg-white/[0.05]"
                }`}
              >
                {f === "tutti" ? "Tutti" : STATUS_CONFIG[f]?.label}
                <span className="ml-1.5 opacity-60 font-mono">
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabella */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Users size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40">Nessun cliente trovato</p>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Header desktop */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] font-mono text-white/30 uppercase tracking-widest">
            <div>Attività</div>
            <div>Stato</div>
            <div>Scadenza</div>
            <div>Iscritto</div>
            <div></div>
          </div>

          {/* Righe */}
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((t, i) => {
              const config = STATUS_CONFIG[t.subscription_status || "trial"] || STATUS_CONFIG.trial;
              const StatusIcon = config.icon;
              const trialHoursLeft = t.trial_ends_at
                ? Math.max(0, Math.ceil((new Date(t.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
                : 0;
              const phone = (t.whatsapp_number || "").replace(/\D/g, "");

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <div
                    onClick={() => router.push(`/admin/clienti/${t.slug}`)}
                    className="grid grid-cols-[2fr_auto] md:grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 items-center px-5 py-4 hover:bg-white/[0.03] transition group cursor-pointer"
                  >
                    {/* Attività */}
                    <div className="flex items-center gap-3 min-w-0">
                      {t.logo_url ? (
                        <img
                          src={t.logo_url}
                          alt={t.business_name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ backgroundColor: t.brand_color || "#25D366" }}
                        >
                          {t.business_name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white/90 truncate">
                          {t.business_name}
                        </p>
                        <p className="text-[10px] font-mono text-white/40 truncate">
                          /{t.slug}
                        </p>
                      </div>
                    </div>

                    {/* Stato */}
                    <div className="hidden md:block">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 rounded ${config.bg} ${config.color}`}>
                        <StatusIcon size={10} />
                        {config.label.toUpperCase()}
                      </span>
                    </div>

                    {/* Scadenza */}
                    <div className="hidden md:block text-xs text-white/60">
                      {t.subscription_status === "trial" && trialHoursLeft > 0 && (
                        <span className="text-yellow-400 font-semibold">
                          {trialHoursLeft}h demo
                        </span>
                      )}
                      {t.subscription_status === "active" && t.subscription_ends_at && (
                        <span>
                          {new Date(t.subscription_ends_at).toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>

                    {/* Iscritto */}
                    <div className="hidden md:block text-xs text-white/40 font-mono">
                      {new Date(t.created_at).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-end gap-2">
                      {phone && (
                        <a
                          href={`https://wa.me/${phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hidden md:inline-flex p-1.5 text-wa hover:bg-wa/10 rounded-full transition"
                        >
                          <MessageCircle size={14} />
                        </a>
                      )}
                      <ChevronRight
                        size={16}
                        className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
