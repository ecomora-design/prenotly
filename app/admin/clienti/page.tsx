"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, Search, ExternalLink, MessageCircle, RefreshCw,
  CheckCircle2, Clock, XCircle, AlertCircle, Calendar
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

  async function load() {
    const { data } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    setTenants(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

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
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Clienti</h1>
          <p className="text-white/60 text-sm">
            {tenants.length} attività registrate
          </p>
        </div>
        <button
          onClick={load}
          className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 transition"
        >
          <RefreshCw size={16} />
          Aggiorna
        </button>
      </div>

      {/* Filtri */}
      <div className="scroll-x flex gap-2 mb-4 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {["tutti", "trial", "active", "expired"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
              filter === f ? "bg-wa text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {f === "tutti" ? "Tutti" : STATUS_CONFIG[f]?.label || f}
            <span className="ml-1.5 opacity-70">
              ({f === "tutti" ? tenants.length : tenants.filter((t) => t.subscription_status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Cerca per nome, slug o numero..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-wa placeholder-white/40"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-lg font-bold mb-2">Nessun cliente</h2>
          <p className="text-white/50 text-sm">
            {search ? "Nessun risultato" : "Nessun cliente in questo stato"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const config = STATUS_CONFIG[t.subscription_status || "trial"] || STATUS_CONFIG.trial;
            const StatusIcon = config.icon;
            const phone = (t.whatsapp_number || "").replace(/\D/g, "");
            const trialHoursLeft = t.trial_ends_at
              ? Math.max(0, Math.ceil((new Date(t.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
              : 0;

            return (
              <div
                key={t.id}
                className="bg-white/5 rounded-2xl p-5 border border-white/10"
              >
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-wa/20 flex items-center justify-center text-wa font-bold text-lg shrink-0">
                      {t.business_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="font-bold">{t.business_name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${config.color}`}
                        >
                          <StatusIcon size={10} />
                          {config.label.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-white/50">
                        {t.product_type || t.business_type} · {t.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/${t.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wa hover:text-wa/80 text-xs font-semibold inline-flex items-center gap-1.5 p-2"
                    >
                      <ExternalLink size={12} />
                      Apri
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/40 mb-0.5">Registrato</p>
                    <p className="font-semibold">
                      {new Date(t.created_at).toLocaleDateString("it-IT")}
                    </p>
                  </div>

                  {t.subscription_status === "trial" && t.trial_ends_at && (
                    <div className="bg-yellow-500/10 rounded-xl p-3">
                      <p className="text-yellow-300/70 mb-0.5">Demo scade</p>
                      <p className="font-semibold text-yellow-300">
                        {trialHoursLeft}h rimanenti
                      </p>
                    </div>
                  )}

                  {t.subscription_status === "active" && t.subscription_ends_at && (
                    <div className="bg-green-500/10 rounded-xl p-3">
                      <p className="text-green-300/70 mb-0.5">Scadenza</p>
                      <p className="font-semibold text-green-300">
                        {new Date(t.subscription_ends_at).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                  )}

                  {t.whatsapp_number && (
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-white/40 mb-0.5">WhatsApp</p>
                      <p className="font-semibold truncate">{t.whatsapp_number}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-2 flex-wrap">
                    {t.subscription_status !== "active" && (
                      <button
                        onClick={() => activateTenant(t.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-full transition"
                      >
                        ✓ Attiva 12 mesi
                      </button>
                    )}
                    {t.subscription_status === "trial" && (
                      <button
                        onClick={() => extendTrial(t.id, 7)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold px-4 py-2 rounded-full transition"
                      >
                        +7 gg demo
                      </button>
                    )}
                    {t.subscription_status === "active" && (
                      <button
                        onClick={() => expireTenant(t.id)}
                        className="text-red-400 hover:bg-red-500/10 text-xs font-semibold px-4 py-2 rounded-full transition"
                      >
                        Disattiva
                      </button>
                    )}
                  </div>

                  {phone && (
                    <a
                      href={`https://wa.me/${phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wa hover:text-wa/80 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                    >
                      <MessageCircle size={14} />
                      Contatta
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
