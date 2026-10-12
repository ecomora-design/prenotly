import Link from "next/link";
import { ArrowRight, Check, MessageCircle, Palette, Code2, Utensils, Scissors } from "lucide-react";

export default function ThreeSoftware() {
  const products = [
    {
      id: "food",
      emoji: "🍕",
      name: "Prenotly Food",
      tagline: "Per ristoranti, pizzerie, bar e asporto",
      description:
        "Il software che trasforma il tuo locale in un sistema di ordini automatici. Menu digitale personalizzabile, prenotazioni tavoli, ordini da asporto o domicilio. Tutto arriva su WhatsApp, già confermato.",
      features: [
        "Menu digitale con foto, prezzi e categorie",
        "Aggiungi tutti i servizi che vuoi (asporto, domicilio, tavoli, catering...)",
        "Prenotazioni tavoli con slot orari",
        "Ordini da asporto e domicilio con zone",
        "Segreteria WhatsApp che conferma in automatico",
        "Dashboard per gestire tutto",
      ],
      price: "€29,99",
      priceLabel: "/mese",
      color: "wa",
      cta: "Scopri Food",
      link: "/ristoranti",
    },
    {
      id: "beauty",
      emoji: "💇",
      name: "Prenotly Beauty",
      tagline: "Per parrucchieri, estetiste, beauty e benessere",
      description:
        "Il software che riempie la tua agenda in automatico. I clienti scelgono il tipo di servizio, vedono solo gli slot liberi nel tuo calendario, e prenotano in 3 tap. Tu ricevi tutto su WhatsApp e in agenda.",
      features: [
        "Calendario intelligente con slot in tempo reale",
        "I clienti scelgono il tipo di servizio",
        "Prenotazione appuntamento in 3 tap",
        "Sync automatico con Google Calendar",
        "Promemoria anti no-show su WhatsApp",
        "Dashboard con statistiche e clienti",
      ],
      price: "€29,99",
      priceLabel: "/mese",
      color: "violet",
      cta: "Scopri Beauty",
      link: "/parrucchieri",
    },
    {
      id: "service",
      emoji: "🛠️",
      name: "Prenotly Service",
      tagline: "Software su misura per la tua attività",
      description:
        "Hai esigenze particolari che nessun software standard copre? Progettiamo e sviluppiamo insieme un software completamente personalizzato: dal flusso di prenotazione al gestionale, alle integrazioni con i tuoi strumenti.",
      features: [
        "Analisi delle tue esigenze reali",
        "Progettazione UX/UI su misura",
        "Sviluppo custom con le tue funzionalità",
        "Integrazione con WhatsApp, calendario, pagamenti",
        "Integrazione con i tuoi gestionali esistenti",
        "Supporto e manutenzione dedicati",
      ],
      price: "Su preventivo",
      priceLabel: "gratuito e senza impegno",
      color: "blue",
      cta: "Richiedi preventivo",
      link: "https://wa.me/393934842118?text=Ciao%20Prenotly!%20Vorrei%20un%20preventivo%20per%20un%20software%20su%20misura",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; ring: string; btn: string }> = {
    wa: {
      bg: "bg-wa/10",
      text: "text-waDark",
      ring: "hover:ring-wa/30",
      btn: "bg-wa hover:bg-waDark",
    },
    violet: {
      bg: "bg-violet-50",
      text: "text-violet-500",
      ring: "hover:ring-violet-200",
      btn: "bg-violet-500 hover:bg-violet-600",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-500",
      ring: "hover:ring-blue-200",
      btn: "bg-blue-600 hover:bg-blue-700",
    },
  };

  return (
    <section id="software" className="py-16 md:py-28 bg-white">
      <div className="container-x">
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
          <span className="inline-block bg-wa/10 text-waDark text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-4">
            I tre software
          </span>
          <h2 className="text-[28px] leading-tight md:text-5xl font-bold text-night">
            Scegli il software giusto per la tua attività
          </h2>
          <p className="text-gray-600 mt-4 text-[15px] md:text-lg">
            Ogni business ha esigenze diverse. Per questo abbiamo creato tre software specializzati, ognuno pensato per un tipo di attività.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {products.map((p) => {
            const c = colorMap[p.color];
            const isExternal = p.link.startsWith("http");
            return (
              <div
                key={p.id}
                className={`rounded-3xl border border-gray-100 p-7 md:p-8 hover:shadow-xl transition ring-2 ring-transparent ${c.ring} flex flex-col`}
              >
                <div className={`w-14 h-14 rounded-2xl ${c.bg} flex items-center justify-center text-3xl mb-5`}>
                  {p.emoji}
                </div>

                <h3 className="text-2xl font-bold text-night mb-1">{p.name}</h3>
                <p className={`text-sm font-semibold ${c.text} mb-5`}>{p.tagline}</p>

                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {p.description}
                </p>

                <ul className="space-y-3 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-gray-700 text-sm">
                      <Check size={16} className={`${c.text} mt-0.5 shrink-0`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-gray-100 pt-5 mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-bold text-night">
                      {p.price}
                    </span>
                    <span className="text-sm text-gray-500">{p.priceLabel}</span>
                  </div>
                </div>

                {isExternal ? (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${c.btn} text-white px-6 py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-95`}
                  >
                    <MessageCircle size={18} />
                    {p.cta}
                  </a>
                ) : (
                  <Link
                    href={p.link}
                    className={`${c.btn} text-white px-6 py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-95`}
                  >
                    {p.cta}
                    <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          Tutti i piani includono <strong className="text-night">dashboard</strong>, <strong className="text-night">integrazione WhatsApp</strong> e <strong className="text-night">web app brandizzata</strong>.
        </p>
      </div>
    </section>
  );
}
