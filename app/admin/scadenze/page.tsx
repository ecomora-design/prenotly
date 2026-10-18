"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, Clock, MessageCircle, AlertCircle, Calendar, RefreshCw
} from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  whatsapp_number: string | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  subscription_status: string;
  product_type: string | null;
};

export default function ScadenzePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  async function load() {
    const { data } = await supabase
      .from("tenants")
      .select("*")
      .in("subscription_status", ["trial", "active"])
      .order("trial_ends_at", { ascending: true });
    setTenants(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const extendTrial = async (id: string, days: number) => {
    const tenant = tenants.find((t) => t.id === id);
    if (!tenant) return;

    const baseDate = tenant.trial_ends_at
      ? new Date(tenant.trial_ends_at)
      : new Date();
    baseDate.setDate(baseDate.getDate() + days);

    await supabase
      .from("tenants")
      .update({ trial_ends_at: baseDate.toISOString() })
      .eq("id", id);
    await load();
  };

  const activateTenant = async (id: string) => {
    if (!confirm("Attivare per 12 mesi con il piano Food + Tavoli (39,99€/mese)?")) return;
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    await supabase
      .from("tenants")
      .update({
        subscription_status: "active",
        subscription_ends_at: oneYearLater.toISOString(),
        plan_type: "food_tables",
        enable_table_bookings: true,
      })
      .eq("id", id);
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  const now = Date.now();
  const trials = tenants.filter((t) => t.subscription_status === "trial");
  const subs = tenants.filter((t) => t.subscription_status === "active");

  const trialSoon = trials.filter((t) => {
    if (!t.trial_ends_at) return false;
    const diff = new Date(t.trial_ends_at).getTime() - now;
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  });

  const trialThisWeek = trials.filter((t) => {
    if (!t.trial_ends_at) return false;
    const diff = new Date(t.trial_ends_at).getTime() - now;
    return diff >= 24 * 60 * 60 * 1000 && diff < 7 * 24 * 60 * 60 * 1000;
  });

  const subsSoon = subs.filter((t) => {
    if (!t.subscription_ends_at) return false;
    const diff = new Date(t.subscription_ends_at).getTime() - now;
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Scadenze</h1>
          <p className="text-white/60 text-sm">
            Trial e abbonamenti in scadenza
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

      {/* TRIAL SCADONO OGGI/DOMANI */}
      {trialSoon.length > 0 && (
        <Section
          title="🚨 Trial in scadenza (entro 24 ore)"
          color="bg-red-500/10 border-red-500/30"
          items={trialSoon}
          onExtend={extendTrial}
          onActivate={activateTenant}
          highlight
        />
      )}

      {/* TRIAL QUESTA SETTIMANA */}
      {trialThisWeek.length > 0 && (
        <Section
          title="⏰ Trial in scadenza (entro 7 giorni)"
          color="bg-yellow-500/10 border-yellow-500/30"
          items={trialThisWeek}
          onExtend={extendTrial}
          onActivate={activateTenant}
        />
      )}

      {/* ABBONAMENTI IN SCADENZA */}
      {subsSoon.length > 0 && (
        <Section
          title="📅 Abbonamenti in scadenza (entro 30 giorni)"
          color="bg-blue-500/10 border-blue-500/30"
          items={subsSoon}
          onActivate={activateTenant}
          isSub
        />
      )}

      {trialSoon.length === 0 && trialThisWeek.length === 0 && subsSoon.length === 0 && (
        <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-lg font-bold mb-2">Nessuna scadenza in vista</h2>
          <p className="text-white/50 text-sm">
            Tutto sotto controllo!
          </p>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  color,
  items,
  onExtend,
  onActivate,
  highlight,
  isSub,
}: {
  title: string;
  color: string;
  items: any[];
  onExtend?: (id: string, days: number) => void;
  onActivate: (id: string) => void;
  highlight?: boolean;
  isSub?: boolean;
}) {
  const now = Date.now();

  return (
    <div className={`rounded-2xl border ${color} p-5 mb-6`}>
      <h2 className="font-bold mb-4 flex items-center gap-2">
        {title}
        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </h2>

      <div className="space-y-2">
        {items.map((t) => {
          const endDate = isSub ? t.subscription_ends_at : t.trial_ends_at;
          const hoursLeft = Math.ceil(
            (new Date(endDate).getTime() - now) / (1000 * 60 * 60)
          );
          const daysLeft = Math.ceil(hoursLeft / 24);
          const phone = (t.whatsapp_number || "").replace(/\D/g, "");

          return (
            <div
              key={t.id}
              className="bg-white/5 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">{t.business_name}</p>
                <p className="text-xs text-white/50">
                  {isSub ? "Scade" : "Demo scade"} in{" "}
                  <strong className={highlight ? "text-red-300" : "text-yellow-300"}>
                    {daysLeft <= 1 ? `${hoursLeft} ore` : `${daysLeft} giorni`}
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!isSub && onExtend && (
                  <>
                    <button
                      onClick={() => onExtend(t.id, 3)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold px-3 py-1.5 rounded-full transition"
                    >
                      +3 gg
                    </button>
                    <button
                      onClick={() => onExtend(t.id, 7)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold px-3 py-1.5 rounded-full transition"
                    >
                      +7 gg
                    </button>
                  </>
                )}

                <button
                  onClick={() => onActivate(t.id)}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-full transition"
                >
                  ✓ Attiva
                </button>

                {phone && (
                  <a
                    href={`https://wa.me/${phone}?text=Ciao!%20Il%20tuo%20periodo%20Prenotly%20sta%20per%20scadere`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-wa hover:bg-wa/10 text-xs font-semibold p-1.5 rounded-full inline-flex items-center gap-1 transition"
                  >
                    <MessageCircle size={14} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
