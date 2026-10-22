"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SuccessPaymentModal from "@/components/SuccessPaymentModal";
import {
  Loader2, CheckCircle2, Clock, MessageCircle,
  Sparkles, Lock, Calendar, Utensils, Crown, CreditCard, Scissors, Star
} from "lucide-react";

type Tenant = {
  id: string;
  subscription_status: string | null;
  subscription_ends_at: string | null;
  subscription_interval: string | null;
  trial_ends_at: string | null;
  plan_type: string | null;
  product_type: string | null;
  business_type: string;
};

type Interval = "yearly" | "monthly";

const PLANS = {
  food_base: {
    id: "food_base",
    name: "Prenotly Food",
    subtitle: "Menu + Ordini",
    icon: Utensils,
    color: "#25D366",
    isFood: true,
    yearly: { price: "29,99", total: "359,88" },
    monthly: { price: "49,99", total: "49,99" },
    features: [
      "Menu digitale personalizzabile",
      "Ordini asporto e domicilio",
      "Notifiche realtime",
      "Dashboard completa",
      "Zero commissioni",
    ],
    upgradeNote: "Prenotazione tavoli opzionale +10 €/mese",
  },
  food_tables: {
    id: "food_tables",
    name: "Prenotly Food + Tavoli",
    subtitle: "Food + prenotazione tavoli",
    icon: Calendar,
    color: "#EAB308",
    badge: "POPOLARE",
    isFood: true,
    yearly: { price: "39,99", total: "479,88" },
    monthly: { price: "59,99", total: "59,99" },
    features: [
      "✨ Tutto di Food",
      "🍽️ Mappa tavoli interattiva",
      "📅 Prenotazione tavoli online",
      "👥 Gestione capienza",
      "🔔 Promemoria anti no-show",
    ],
    upgradeNote: null,
  },
  food_premium: {
    id: "food_premium",
    name: "Prenotly Food Premium",
    subtitle: "Tutto + pagamenti online",
    icon: Crown,
    color: "#8B5CF6",
    badge: "TUTTO INCLUSO",
    isFood: true,
    yearly: { price: "59,99", total: "719,88" },
    monthly: { price: "79,99", total: "79,99" },
    features: [
      "✨ Tutto di Food + Tavoli",
      "💳 Pagamenti carta in-app",
      "📱 Apple Pay + Google Pay",
      "🧾 Fatturazione automatica",
      "🔒 Sicurezza Stripe",
    ],
    upgradeNote: null,
  },
  beauty: {
    id: "beauty",
    name: "Prenotly Pro",
    subtitle: "Agenda intelligente",
    icon: Scissors,
    color: "#8B5CF6",
    isFood: false,
    yearly: { price: "29,99", total: "359,88" },
    monthly: { price: "49,99", total: "49,99" },
    features: [
      "Agenda intelligente",
      "Servizi illimitati con durata",
      "Prenotazioni con slot in tempo reale",
      "Sync con Google Calendar",
      "Promemoria anti no-show",
      "Multi-operatore",
      "Zero commissioni",
      "Supporto in italiano",
    ],
    upgradeNote: null,
  },
};

export default function AbbonamentoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [interval, setInterval] = useState<Interval>("yearly");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

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
      setTenant(link.tenants as unknown as Tenant);
      setLoading(false);
    }
    load();
  }, []);

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: planId, interval }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Errore");
    } catch {
      alert("Errore di connessione");
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading || !tenant) {
    return <div className="flex items-center justify-center h-[70vh]"><Loader2 className="animate-spin text-[#25D366]" size={32} /></div>;
  }

  const isFood = tenant.product_type === "food" || tenant.business_type === "restaurant";

  const isActive = tenant.subscription_status === "active";
  const trialHoursLeft = tenant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-20">
      <SuccessPaymentModal />
      <div className="px-4 sm:px-6 lg:px-8 pt-8 mb-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-5 shadow-sm">
            <Sparkles size={12} className="text-[#25D366]" />
            <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Il tuo abbonamento</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
            {isActive ? "Gestisci il tuo piano." : "Scegli il tuo piano."}
          </h1>
          <p className="text-[#425466] text-base md:text-lg max-w-xl mx-auto">
            {isActive ? "Il tuo abbonamento è attivo." : "Demo gratuita 48 ore. Nessuna carta richiesta."}
          </p>
        </div>
      </div>

      {tenant.subscription_status === "trial" && trialHoursLeft > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Clock size={20} /></div>
                <div><p className="font-bold text-sm">Demo attiva</p><p className="text-xs text-white/80">{trialHoursLeft} ore rimanenti</p></div>
              </div>
              <a href="https://wa.me/message/LLEKTVFCRCPVB1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-xs transition">
                <MessageCircle size={14} /> Richiedi estensione
              </a>
            </div>
          </div>
        </div>
      )}

      {isActive && (
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0"><CheckCircle2 className="text-emerald-600" size={24} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0A2540] text-sm">Piano attivo ({tenant.subscription_interval === "yearly" ? "annuale" : "mensile"})</p>
                {tenant.subscription_ends_at && <p className="text-xs text-[#425466]">Rinnovo il {new Date(tenant.subscription_ends_at).toLocaleDateString("it-IT")}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-5xl mx-auto flex justify-center">
          <div className="inline-flex bg-white rounded-full p-1.5 border border-[#E6EBF1] shadow-sm">
            <button onClick={() => setInterval("yearly")} className={"px-5 py-2.5 rounded-full text-sm font-bold transition flex items-center gap-2 " + (interval === "yearly" ? "bg-[#0A2540] text-white shadow-md" : "text-[#425466] hover:text-[#0A2540]")}>
              Annuale <span className={"text-[10px] font-black px-2 py-0.5 rounded-full " + (interval === "yearly" ? "bg-[#25D366] text-white" : "bg-[#25D366]/15 text-[#128C7E]")}>-40%</span>
            </button>
            <button onClick={() => setInterval("monthly")} className={"px-5 py-2.5 rounded-full text-sm font-bold transition " + (interval === "monthly" ? "bg-[#0A2540] text-white shadow-md" : "text-[#425466] hover:text-[#0A2540]")}>
              Mensile
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className={`mx-auto grid gap-5 ${isFood ? "max-w-6xl md:grid-cols-3" : "max-w-md"}`}>
          {(Object.values(PLANS) as any[]).filter((p: any) => p.isFood === isFood).map((plan) => {
            const Icon = plan.icon;
            const pricing = interval === "yearly" ? plan.yearly : plan.monthly;
            const isCurrent = isActive && tenant.plan_type === plan.id;
            const isHighlight = plan.badge === "POPOLARE";

            return (
              <div key={plan.id} className={"relative bg-white rounded-3xl p-7 md:p-8 transition-all flex flex-col " + (isHighlight ? "border-2 border-[#25D366]/30 shadow-2xl shadow-[#25D366]/10 md:scale-[1.02]" : "border border-[#E6EBF1] hover:border-[#0A2540]/20 hover:shadow-lg")}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                      <Star size={10} fill="white" /> {plan.badge}
                    </span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={10} /> Il tuo piano
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: plan.color + "15" }}>
                    <Icon size={22} style={{ color: plan.color }} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0A2540] leading-tight">{plan.name}</h3>
                    <p className="text-xs text-[#425466]/70 mt-0.5">{plan.subtitle}</p>
                  </div>
                </div>
                <div className="pb-6 mb-6 border-b border-[#E6EBF1]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-[#425466]">€</span>
                    <span className="text-5xl font-bold text-[#0A2540] tracking-tight">{pricing.price}</span>
                    <span className="text-sm text-[#425466]/60 font-semibold">/mese</span>
                  </div>
                  <p className="text-[11px] text-[#425466]/60 mt-2">
                    {interval === "yearly" ? "Fatturazione annuale: €" + pricing.total + " + IVA" : "Fatturazione mensile: €" + pricing.total + " + IVA"}
                  </p>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: plan.color + "15" }}>
                        <CheckCircle2 size={10} style={{ color: plan.color }} strokeWidth={3} />
                      </div>
                      <span className="text-[#425466]">{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.upgradeNote && (
                  <div className="mb-5 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 text-[11px] font-bold text-amber-800 flex items-start gap-1.5">
                    <Sparkles size={11} className="shrink-0 mt-0.5" /><span>{plan.upgradeNote}</span>
                  </div>
                )}
                {isCurrent ? (
                  <button disabled className="w-full bg-emerald-50 text-emerald-700 py-3.5 rounded-full font-bold text-sm cursor-default inline-flex items-center justify-center gap-2">
                    <CheckCircle2 size={15} /> Piano attivo
                  </button>
                ) : (
                  <button onClick={() => handleCheckout(plan.id)} disabled={checkoutLoading === plan.id} className={"w-full py-3.5 rounded-full font-bold text-sm transition-all inline-flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 " + (isHighlight ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white shadow-lg shadow-[#25D366]/30" : "bg-[#0A2540] hover:bg-[#0A2540]/90 text-white")}>
                    {checkoutLoading === plan.id ? <><Loader2 className="animate-spin" size={15} /> Caricamento...</> : <><CreditCard size={15} /> Attiva ora</>}
                  </button>
                )}
                <p className="text-[10px] text-[#425466]/50 text-center mt-3">✓ Demo gratuita 48 ore inclusa</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-10">
        <div className="max-w-3xl mx-auto bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
          <Lock className="text-blue-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-bold text-[#0A2540] mb-1">Pagamento sicuro</p>
            <p className="text-[#425466] text-xs leading-relaxed">Pagamento con carta tramite Stripe. Fattura elettronica emessa automaticamente. Puoi disdire in qualsiasi momento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
