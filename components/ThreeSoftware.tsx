import Link from "next/link";
import { ArrowRight, Check, Sparkles, Utensils, Scissors, Code2 } from "lucide-react";

export default function ThreeSoftware() {
  const products = [
    {
      id: "food_standard",
      label: "Food",
      subtitle: "Ristoranti, pizzerie, bar",
      description:
        "Menu digitale e ordini d'asporto o domicilio. Zero commissioni sui tuoi incassi.",
      features: [
        "Menu digitale personalizzabile",
        "Ordini asporto e domicilio",
        "Notifiche realtime in dashboard",
        "Dashboard gestionale completa",
      ],
      note: "Prenotazione tavoli opzionale (+10 €/mese)",
      price: "9,99",
      period: "/mese",
      cta: "Scopri i piani",
      link: "/prezzi",
      icon: Utensils,
      color: "#25D366",
      dark: false,
    },
    {
      id: "pro",
      label: "Pro",
      subtitle: "Studi, professionisti, servizi",
      description:
        "Agenda intelligente per attività su appuntamento. Sincronizzata con Google Calendar.",
      features: [
        "Agenda intelligente",
        "Prenotazioni con slot in tempo reale",
        "Sync con Google Calendar",
        "Promemoria anti no-show",
      ],
      price: "29,99",
      period: "/mese",
      cta: "Scopri Pro",
      link: "/pro",
      icon: Scissors,
      color: "#8B5CF6",
      dark: true,
    },
    {
      id: "service",
      label: "Service",
      subtitle: "Software su misura",
      description:
        "Hai esigenze particolari? Progettiamo un software completamente personalizzato.",
      features: [
        "Analisi delle tue esigenze",
        "Sviluppo custom",
        "Integrazione con i tuoi strumenti",
        "Supporto dedicato",
      ],
      price: "Su preventivo",
      period: "",
      cta: "Richiedi preventivo",
      link: "/service",
      icon: Code2,
      color: "#3B82F6",
      dark: false,
    },
  ];

  return (
    <section id="software" className="py-16 md:py-28 bg-[#FAFAF7]">
      <div className="container-x">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-night/[0.08] text-night/75 text-[10px] font-black uppercase tracking-widest mb-5">
            <Sparkles size={12} /> Tre prodotti, un'unica filosofia
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-display text-night tracking-tight leading-[1.05] mb-4">
            Il software giusto<br />
            <span className="italic">per la tua attività.</span>
          </h2>
          <p className=" text-base md:text-lg leading-relaxed">
            Tre soluzioni distinte, progettate per farti risparmiare tempo e offrire un'esperienza memorabile ai tuoi clienti.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`group relative rounded-[28px] md:rounded-[32px] p-6 md:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  p.dark
                    ? "bg-night text-white shadow-2xl shadow-night/20"
                    : "bg-white text-night border border-night/[0.06] shadow-sm hover:shadow-xl"
                }`}
              >
                {/* Icona */}
                <div className="mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: p.color + (p.dark ? "25" : "15") }}
                  >
                    <Icon size={26} style={{ color: p.color }} strokeWidth={2} />
                  </div>
                  <span
                    className="inline-block text-[10px] font-black uppercase tracking-[0.2em]  mb-2"
                    style={{ color: p.dark ? "#FFFFFF" : (p.color === "#25D366" ? "#0F766E" : p.color === "#8B5CF6" ? "#6D28D9" : p.color === "#3B82F6" ? "#1E40AF" : p.color) }}
                  >
                    Prenotly {p.label}
                  </span>
                  <h3
                    className={`text-xl sm:text-2xl font-display leading-tight ${
                      p.dark ? "text-white" : "text-night"
                    }`}
                  >
                    {p.subtitle}
                  </h3>
                </div>

                <p
                  className={`text-sm leading-relaxed mb-6 ${
                    p.dark ? "text-white/60" : ""
                  }`}
                >
                  {p.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          p.dark ? "bg-white/10" : "bg-night/5"
                        }`}
                      >
                        <Check size={10} style={{ color: p.color }} strokeWidth={3} />
                      </div>
                      <span className={p.dark ? "text-white/85" : ""}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Note upgrade (solo per Food) */}
                {"note" in p && p.note && (
                  <div
                    className={`mb-6 px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${
                      p.dark ? "bg-white/5 text-white/70" : "bg-night/5 text-night/75"
                    }`}
                  >
                    <Sparkles size={11} style={{ color: p.color }} />
                    {p.note}
                  </div>
                )}

                {/* Price */}
                <div
                  className={`pt-6 border-t mb-6 ${
                    p.dark ? "border-white/10" : "border-night/[0.06]"
                  }`}
                >
                  {p.price === "Su preventivo" ? (
                    <span
                      className={`text-2xl font-display ${
                        p.dark ? "text-white" : "text-night"
                      }`}
                    >
                      Su preventivo
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-xs ${
                          p.dark ? "text-white/70" : ""
                        }`}
                      >
                        da
                      </span>
                      <span
                        className={`text-3xl sm:text-4xl font-display tracking-tight ${
                          p.dark ? "text-white" : "text-night"
                        }`}
                      >
                        €{p.price}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          p.dark ? "text-white/70" : ""
                        }`}
                      >
                        {p.period}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={p.link}
                  className={`inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm transition-all active:scale-[0.98] ${
                    p.dark
                      ? "bg-white text-night hover:bg-white/90"
                      : "bg-night hover:bg-night/90 text-white"
                  }`}
                >
                  {p.cta}
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
