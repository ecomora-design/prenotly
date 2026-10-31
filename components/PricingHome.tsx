import Link from "next/link";
import { Check, ArrowRight, Utensils, Calendar, Crown, Sparkles } from "lucide-react";

export default function PricingHome() {
  const plans = [
    {
      id: "food_menu",
      icon: Utensils,
      name: "Menu Digitale",
      subtitle: "Solo visualizzazione",
      price: "9,99",
      color: "#64748B",
      microcopy: "Meno di un caffè al giorno",
      features: [
        "Menu digitale personalizzabile",
        "Categorie, foto e allergeni",
        "QR Code per il tavolo",
        "Web app brandizzata",
      ],
      highlight: false,
      badge: null,
    },
    {
      id: "food_standard",
      icon: Calendar,
      name: "Food + Ordini",
      subtitle: "Menu, ordini e tavoli",
      price: "29,99",
      color: "#25D366",
      microcopy: null,
      features: [
        "✨ Tutto del Menu Digitale",
        "🛍️ Ordini asporto e domicilio",
        "📅 Prenotazione tavoli",
        "🔔 Notifiche realtime",
        "📊 Statistiche di base",
      ],
      highlight: true,
      badge: "PIÙ POPOLARE",
    },
    {
      id: "food_premium",
      icon: Crown,
      name: "Premium Pro",
      subtitle: "Tutto incluso + staff",
      price: "99,99",
      color: "#8B5CF6",
      microcopy: null,
      features: [
        "✨ Tutto di Food + Ordini",
        "💳 Pagamenti in-app (Stripe)",
        "👥 Staff illimitato",
        "🧾 Fatturazione automatica",
        "🔒 Sicurezza avanzata",
      ],
      highlight: false,
      badge: null,
    },
  ];

  return (
    <section className="py-14 md:py-28 bg-[#FAFBFC]">
      <div className="container-x">
        <div className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-3.5 py-1.5 mb-4 shadow-sm">
            <Sparkles size={12} className="text-[#25D366]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0A2540]/70">Prezzi chiari</span>
          </div>
          <h2 className="text-[26px] leading-tight sm:text-3xl md:text-5xl font-bold text-night mb-4">
            Scegli il piano giusto<br />
            <span className="text-[#128C7E]">per la tua attività</span>
          </h2>
          <p className="text-gray-600 text-[15px] md:text-lg">
            Inizia da <strong>9,99 €/mese</strong>. Prova gratis 7 giorni, senza carta.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl p-6 md:p-7 bg-white transition-all ${
                  plan.highlight
                    ? "border-2 border-[#25D366]/40 shadow-2xl shadow-[#25D366]/10 md:scale-[1.02]"
                    : "border border-[#E6EBF1] hover:border-[#0A2540]/20 hover:shadow-lg"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: plan.color + "15" }}>
                    <Icon size={20} style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-night leading-tight">{plan.name}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">{plan.subtitle}</p>
                  </div>
                </div>

                <div className="pb-5 mb-5 border-b border-gray-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-gray-500">€</span>
                    <span className="text-4xl md:text-5xl font-bold text-night tracking-tight">{plan.price}</span>
                    <span className="text-sm text-gray-500 font-semibold">/mese</span>
                  </div>
                  {plan.microcopy && (
                    <p className="text-[11px] text-[#128C7E] font-semibold mt-2">☕ {plan.microcopy}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">+ IVA · disdici quando vuoi</p>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: plan.color + "15" }}>
                        <Check size={9} style={{ color: plan.color }} strokeWidth={3} />
                      </div>
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/signup?plan=${plan.id}`}
                  className={`group inline-flex items-center justify-center gap-2 py-3 rounded-full font-bold text-sm transition-all active:scale-[0.98] ${
                    plan.highlight
                      ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white shadow-lg shadow-[#25D366]/30"
                      : "bg-night hover:bg-night/90 text-white"
                  }`}
                >
                  Prova gratis 7 giorni
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Link ai dettagli */}
        <div className="text-center mt-8 md:mt-10">
          <Link href="/prezzi" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#128C7E] hover:text-[#0F766E] transition">
            Vedi tutti i piani e i dettagli
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
