"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Loader2, CheckCircle2, Clock, MessageCircle,
  ArrowRight, Sparkles, Lock, Zap, Calendar, Utensils,
  TrendingUp, BadgeCheck, Crown, CreditCard, X, AlertCircle
} from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  product_type: string | null;
  business_type: string;
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_ends_at: string | null;
  trial_ends_at: string | null;
  has_table_booking: boolean | null;
  has_online_payments: boolean | null;
  plan_type: string | null;
};

const PLANS = {
  food_base: {
    id: "food_base",
    name: "Food",
    subtitle: "Menu + Ordini",
    yearly: 359.88,
    monthly: 29.99,
    color: "#25D366",
    features: [
      "Menu digitale illimitato",
      "Ordini asporto e domicilio",
      "Automazioni WhatsApp",
      "Dashboard completa",
      "QR Code personalizzato",
      "Zero commissioni",
    ],
  },
  food_tables: {
    id: "food_tables",
    name: "Food + Tavoli",
    subtitle: "Tutto di Food + tavoli",
    yearly: 420.00,
    monthly: 35,
    color: "#EAB308",
    badge: "POPOLARE",
    features: [
      "✨ Tutto di Food Base",
      "🍽️ Mappa tavoli interattiva",
      "📅 Prenotazione tavoli online",
      "👥 Gestione capienza e turni",
      "🔔 Promemoria anti no-show",
      "📊 Statistiche occupazione",
    ],
  },
  food_premium: {
    id: "food_premium",
    name: "Food Premium",
    subtitle: "Tutto + pagamenti online",
    yearly: 719.88,
    monthly: 59.99,
    color: "#8B5CF6",
    badge: "TUTTO INCLUSO",
    features: [
      "✨ Tutto di Food + Tavoli",
      "💳 Pagamenti con carta in-app",
      "📱 Apple Pay + Google Pay",
      "🧾 Fatturazione automatica",
      "💰 Fondi direttamente sul conto",
      "🔒 Sicurezza Stripe",
      "🎁 Sconti e coupon",
      "📊 Statistiche incassi",
    ],
  },
};

export default function AbbonamentoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<any>(null);

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

  if (loading || !tenant) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-waDark" size={32} />
      </div>
    );
  }

  const isFood = tenant.product_type === "food" || tenant.business_type === "restaurant";
  const isActive = tenant.subscription_status === "active";
  const hasTables = tenant.has_table_booking === true;
  const hasPayments = tenant.has_online_payments === true;

  const trialHoursLeft = tenant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  const currentPlanId = !isFood
    ? "beauty"
    : hasPayments
    ? "food_premium"
    : hasTables
    ? "food_tables"
    : "food_base";

  const currentPlan = isFood
    ? currentPlanId === "food_premium"
      ? PLANS.food_premium
      : currentPlanId === "food_tables"
      ? PLANS.food_tables
      : PLANS.food_base
    : { name: "Pro", yearly: 359.88, monthly: 29.99, color: "#8B5CF6", features: [] as string[] };

  const whatsappMsg = (planName: string, yearly: number) =>
    encodeURIComponent(
      `Ciao Prenotly! Voglio attivare il piano "${planName}" per la mia attività "${tenant.business_name}".\n\n` +
      `Importo: ${yearly.toFixed(2)} € + IVA\n\nProcediamo?`
    );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 md:mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-night tracking-tight mb-1">
          Il tuo abbonamento
        </h1>
        <p className="text-night/50 text-sm">
          {isActive ? "Gestisci il tuo piano" : "Attiva l'abbonamento"}
        </p>
      </motion.div>

      {/* Banner trial */}
      {tenant.subscription_status === "trial" && trialHoursLeft > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 mb-6 text-white overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} />
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                Demo attiva
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{trialHoursLeft} ore rimanenti</p>
            <p className="text-sm opacity-90 mt-1">
              Attiva l&apos;abbonamento per non perdere l&apos;accesso
            </p>
          </div>
        </motion.div>
      )}

      {/* Stato attivo */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-100 rounded-3xl p-5 mb-6 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
            <BadgeCheck className="text-green-600" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-night">Piano {currentPlan.name} attivo</p>
            <p className="text-xs text-night/60">
              {tenant.subscription_ends_at
                ? `Rinnovo il ${new Date(tenant.subscription_ends_at).toLocaleDateString("it-IT")}`
                : "Tutto regolare"}
            </p>
          </div>
        </motion.div>
      )}

      {/* ═══════ FOOD: 3 PIANI ═══════ */}
      {isFood && (
        <>
          <p className="text-xs font-bold text-night/50 uppercase tracking-widest mb-3">
            Scegli il tuo piano
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[PLANS.food_base, PLANS.food_tables, PLANS.food_premium].map((plan, i) => {
              const isCurrent = isActive && currentPlanId === plan.id;
              const isPremium = plan.id === "food_premium";
              const isTables = plan.id === "food_tables";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative bg-white rounded-3xl overflow-hidden border-2 flex flex-col ${
                    isPremium
                      ? "border-violet-500 shadow-xl"
                      : isTables
                      ? "border-yellow-400"
                      : "border-night/10"
                  } ${isCurrent ? "ring-2 ring-green-500 ring-offset-2" : ""}`}
                >
                  {/* Badge */}
                  {(plan as any).badge && (
                    <div
                      className={`absolute top-0 right-0 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider ${
                        isPremium
                          ? "bg-gradient-to-r from-violet-500 to-violet-700"
                          : "bg-gradient-to-r from-yellow-400 to-yellow-600"
                      }`}
                    >
                      {(plan as any).badge}
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-br-2xl uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      Il tuo piano
                    </div>
                  )}

                  <div className="p-5 md:p-6 pt-10 flex-1 flex flex-col">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${plan.color}15` }}
                    >
                      {isPremium ? (
                        <Crown size={22} style={{ color: plan.color }} />
                      ) : isTables ? (
                        <Calendar size={22} style={{ color: plan.color }} />
                      ) : (
                        <Utensils size={22} style={{ color: plan.color }} />
                      )}
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-night mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-night/50 mb-4">{plan.subtitle}</p>

                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-night/10">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-night/50">da €</span>
                        <span className="text-3xl md:text-4xl font-bold text-night tracking-tighter">
                          {plan.monthly}
                        </span>
                        <span className="text-xs text-night/50">/mese</span>
                      </div>
                      <p className="text-[10px] text-night/50 mt-1.5">
                        Annuale: <strong className="text-night">{plan.yearly.toFixed(2)} €</strong> + IVA
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[13px] text-night/80">
                          <CheckCircle2
                            size={14}
                            className="shrink-0 mt-0.5"
                            style={{ color: plan.color }}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full bg-green-50 text-green-700 py-3.5 rounded-2xl font-bold text-sm inline-flex items-center justify-center gap-2 cursor-default"
                      >
                        <CheckCircle2 size={16} />
                        Piano attivo
                      </button>
                    ) : isActive ? (
                      <button
                        onClick={() => setUpgradeModal(plan)}
                        className="w-full text-white py-3.5 rounded-2xl font-bold text-sm inline-flex items-center justify-center gap-2 transition active:scale-[0.98]"
                        style={{ backgroundColor: plan.color }}
                      >
                        <TrendingUp size={16} />
                        Passa a questo
                      </button>
                    ) : (
                      <a
                        href={`https://wa.me/message/LLEKTVFCRCPVB1?text=${whatsappMsg(plan.name, plan.yearly)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-white py-3.5 rounded-2xl font-bold text-sm inline-flex items-center justify-center gap-2 transition active:scale-[0.98]"
                        style={{ backgroundColor: plan.color }}
                      >
                        <MessageCircle size={16} />
                        Attiva
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Suggerimento upgrade */}
          {isActive && currentPlanId !== "food_premium" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-3xl p-6 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center shrink-0 shadow-lg">
                  <Crown size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-night mb-1">
                    Passa a Food Premium
                  </h3>
                  <p className="text-sm text-night/70 mb-3 leading-relaxed">
                    Attiva <strong>pagamenti con carta direttamente nell&apos;app</strong>.
                    I clienti pagano online, i soldi arrivano sul tuo conto in 2 giorni.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Pagamenti carta", "Apple Pay", "Google Pay", "Fatturazione auto"].map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold bg-white text-violet-700 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setUpgradeModal(PLANS.food_premium)}
                    className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white px-5 py-3 rounded-full font-bold text-sm transition active:scale-[0.98]"
                  >
                    <Sparkles size={16} />
                    Scopri Premium
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Status attuale */}
          {isActive && (
            <div className="bg-white rounded-3xl p-6 border border-night/5">
              <h3 className="text-sm font-bold text-night mb-4">Stato del tuo abbonamento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-night/50 mb-1">Piano attuale</p>
                  <p className="font-bold text-night text-sm">{currentPlan.name}</p>
                </div>
                <div>
                  <p className="text-xs text-night/50 mb-1">Prezzo</p>
                  <p className="font-bold text-night text-sm">
                    €{currentPlan.monthly.toFixed(2)}/mese
                  </p>
                </div>
                {tenant.subscription_ends_at && (
                  <div className="col-span-2 pt-4 border-t border-night/10">
                    <p className="text-xs text-night/50 mb-1">Scadenza</p>
                    <p className="font-bold text-night text-sm">
                      {new Date(tenant.subscription_ends_at).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════ BEAUTY ═══════ */}
      {!isFood && (
        <div className="bg-white rounded-3xl overflow-hidden border-2 border-violet-500 mb-6">
          <div className="p-6 md:p-8">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-5">
              <Calendar size={26} className="text-violet-500" />
            </div>
            <h3 className="text-2xl font-bold text-night mb-1">Prenotly Pro</h3>
            <p className="text-sm text-night/50 mb-5">
              Agenda intelligente + prenotazioni automatiche
            </p>

            <div className="mb-5 pb-5 border-b border-night/10">
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-night/50">da €</span>
                <span className="text-5xl font-bold text-night tracking-tighter">29,99</span>
                <span className="text-sm text-night/50">/mese</span>
              </div>
              <p className="text-xs text-night/50 mt-2">
                Pagamento annuale: <strong className="text-night">359,88 €</strong> + IVA
              </p>
            </div>

            <ul className="space-y-2.5 mb-6">
              {[
                "Agenda intelligente",
                "Servizi con durata",
                "Prenotazioni in tempo reale",
                "Sync Google Calendar",
                "Promemoria anti no-show",
                "Multi-operatore",
                "Zero commissioni",
                "Supporto in italiano",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-night/80">
                  <CheckCircle2 size={16} className="text-violet-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {!isActive && (
              <a
                href={`https://wa.me/message/LLEKTVFCRCPVB1?text=${whatsappMsg("Pro", 359.88)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-violet-500 hover:bg-violet-600 text-white py-4 rounded-2xl font-bold text-sm inline-flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <MessageCircle size={18} />
                Attiva abbonamento
              </a>
            )}
          </div>
        </div>
      )}

      {/* Info pagamento */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
        <Lock className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div className="text-sm">
          <p className="font-bold text-night mb-1">Pagamento sicuro</p>
          <p className="text-night/60 text-xs leading-relaxed">
            Pagamento tramite bonifico o carta. Fattura elettronica emessa automaticamente.
          </p>
        </div>
      </div>

      {/* MODAL UPGRADE */}
      {upgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto"
          >
            <div className="pt-3 pb-4 px-6 border-b border-gray-100">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-night">Passa a {upgradeModal.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Upgrade piano
                  </p>
                </div>
                <button
                  onClick={() => setUpgradeModal(null)}
                  className="text-gray-500 p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div
                className="text-center rounded-2xl p-6 text-white"
                style={{ backgroundColor: upgradeModal.color }}
              >
                <p className="text-xs uppercase tracking-widest opacity-80 mb-2">
                  Nuovo piano
                </p>
                <p className="text-3xl font-bold mb-1">{upgradeModal.name}</p>
                <p className="text-sm opacity-90">{upgradeModal.subtitle}</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{upgradeModal.monthly}</span>
                    <span className="text-sm opacity-80">€/mese</span>
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    Annuale: {upgradeModal.yearly.toFixed(2)} € + IVA
                  </p>
                </div>
              </div>

              <div className="bg-cream rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-night/60 shrink-0 mt-0.5" />
                <p className="text-xs text-night/70 leading-relaxed">
                  Per attivare <strong>{upgradeModal.name}</strong> ti contattiamo su WhatsApp.
                  Ti confermiamo il pagamento in giornata e attiviamo subito il piano.
                </p>
              </div>

              <a
                href={`https://wa.me/message/LLEKTVFCRCPVB1?text=${whatsappMsg(upgradeModal.name, upgradeModal.yearly)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-white py-4 rounded-2xl font-bold transition active:scale-[0.98] flex items-center justify-center gap-2"
                style={{ backgroundColor: upgradeModal.color }}
              >
                <MessageCircle size={20} />
                Attiva su WhatsApp
              </a>

              <button
                onClick={() => setUpgradeModal(null)}
                className="w-full border border-gray-200 hover:border-night text-night py-3.5 rounded-2xl font-semibold text-sm transition"
              >
                Chiudi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
