import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function ThreeSoftware() {
  const products = [
    {
      id: "food",
      label: "Food",
      subtitle: "Ristoranti, pizzerie, bar",
      description:
        "Menu digitale, ordini d'asporto e domicilio. Tutto su WhatsApp, zero commissioni.",
      features: [
        "Menu digitale personalizzabile",
        "Ordini asporto e domicilio",
        "Prenotazioni tavoli",
        "Dashboard per gestire tutto",
      ],
      price: "29,99",
      period: "/mese",
      cta: "Scopri Food",
      link: "/ristoranti",
      dark: false,
    },
    {
      id: "pro",
      label: "Pro",
      subtitle: "Studi, professionisti, servizi",
      description:
        "Agenda intelligente per qualsiasi attività su appuntamento. Sincronizzata con Google Calendar.",
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
      dark: false,
    },
  ];

  return (
    <section id="software" className="py-16 md:py-24 bg-white">
      <div className="container-x">
        {/* Header */}
        <div className="max-w-2xl mb-10 md:mb-14">
          <p className="text-xs font-bold text-waDark uppercase tracking-widest mb-3">
            I tre software
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-night tracking-tight leading-tight">
            Scegli quello giusto per te.
          </h2>
          <p className="text-night/60 mt-4 text-base md:text-lg">
            Tre prodotti distinti, un unico obiettivo: farti risparmiare tempo.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {products.map((p) => (
            <div
              key={p.id}
              className={`rounded-3xl p-7 md:p-8 flex flex-col ${
                p.dark
                  ? "bg-night text-white"
                  : "bg-cream text-night border border-night/5"
              }`}
            >
              {/* Label */}
              <div className="mb-6">
                <span
                  className={`inline-block text-[11px] font-bold uppercase tracking-widest mb-3 ${
                    p.dark ? "text-wa" : "text-waDark"
                  }`}
                >
                  Prenotly {p.label}
                </span>
                <h3
                  className={`text-xl md:text-2xl font-bold leading-tight ${
                    p.dark ? "text-white" : "text-night"
                  }`}
                >
                  {p.subtitle}
                </h3>
              </div>

              <p
                className={`text-sm leading-relaxed mb-6 ${
                  p.dark ? "text-white/70" : "text-night/60"
                }`}
              >
                {p.description}
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={16}
                      className={`shrink-0 mt-0.5 ${
                        p.dark ? "text-wa" : "text-waDark"
                      }`}
                    />
                    <span className={p.dark ? "text-white/85" : "text-night/80"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div
                className={`pt-6 border-t mb-6 ${
                  p.dark ? "border-white/10" : "border-night/10"
                }`}
              >
                <div className="flex items-baseline gap-1">
                  {p.price === "Su preventivo" ? (
                    <span
                      className={`text-2xl md:text-3xl font-bold ${
                        p.dark ? "text-white" : "text-night"
                      }`}
                    >
                      Su preventivo
                    </span>
                  ) : (
                    <>
                      <span
                        className={`text-sm mb-1 ${
                          p.dark ? "text-white/50" : "text-night/50"
                        }`}
                      >
                        da €
                      </span>
                      <span
                        className={`text-3xl md:text-4xl font-bold ${
                          p.dark ? "text-white" : "text-night"
                        }`}
                      >
                        {p.price}
                      </span>
                      <span
                        className={`text-sm ${
                          p.dark ? "text-white/50" : "text-night/50"
                        }`}
                      >
                        {p.period}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* CTA */}
              <Link
                href={p.link}
                className={`inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition active:scale-[0.98] ${
                  p.dark
                    ? "bg-wa hover:bg-wa/90 text-white"
                    : "bg-night hover:bg-night/90 text-white"
                }`}
              >
                {p.cta}
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
