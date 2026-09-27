import { Utensils, Scissors, ArrowRight } from "lucide-react";

export default function TwoSouls() {
  const cards = [
    {
      id: "ristoranti",
      icon: Utensils,
      emoji: "🍕",
      title: "Ristoranti & Asporto",
      text: "Menu digitale con foto, prezzi e descrizioni. Il cliente sceglie, riempie il carrello, seleziona orario e tipo (asporto o domicilio). La segreteria conferma e ti avvisa quando l'ordine è pronto.",
      features: [
        "Menu digitale con foto e categorie",
        "Carrello e checkout dal telefono",
        "Gestione asporto o domicilio con zone",
        "Slot di ritiro aggiornati in tempo reale",
        "Conferma + avviso quando è pronto",
      ],
      color: "wa",
      linkColor: "text-waDark",
    },
    {
      id: "servizi",
      icon: Scissors,
      emoji: "💇",
      title: "Parrucchieri & Servizi",
      text: "Calendario intelligente che mostra solo gli orari davvero liberi. Il cliente prenota in 3 tap, la segreteria WhatsApp conferma e sincronizza l'appuntamento con Google Calendar.",
      features: [
        "Calendario con slot liberi in tempo reale",
        "Prenotazione in 3 tap dal telefono",
        "Sync automatico con Google Calendar",
        "Promemoria anti no-show automatici",
        "Multi-operatore e multi-servizio",
      ],
      color: "violet",
      linkColor: "text-violet-500",
    },
  ];

  return (
    <section className="py-16 md:py-28 bg-soft">
      <div className="container-x">
        <div className="max-w-2xl mx-auto text-center mb-10 md:mb-16">
          <span className="inline-block bg-wa/10 text-waDark text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-4">
            Due modalità
          </span>
          <h2 className="text-[28px] leading-tight md:text-4xl font-bold text-night">
            Che tu venda cibo o tempo, funziona.
          </h2>
          <p className="text-gray-600 mt-4 text-[15px] md:text-lg">
            Il software si adatta al tuo business. Attiva solo quello che ti serve.
          </p>
        </div>

        <div className="md:grid md:grid-cols-2 md:gap-8">
          {cards.map((c) => (
            <div
              key={c.id}
              id={c.id}
              className="rounded-3xl bg-white border border-gray-100 p-6 md:p-10 hover:shadow-xl transition mb-6 md:mb-0"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${c.color === "wa" ? "bg-wa/10" : "bg-violet-50"}`}>
                <c.icon className={c.color === "wa" ? "text-waDark" : "text-violet-500"} size={28} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-night mb-3">
                {c.emoji} {c.title}
              </h3>
              <p className="text-gray-600 mb-6 text-[15px] md:text-base leading-relaxed">
                {c.text}
              </p>
              <ul className="space-y-3 mb-6">
                {c.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                    <span className={`font-bold mt-0.5 ${c.color === "wa" ? "text-wa" : "text-violet-500"}`}>
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#demo" className={`inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all ${c.linkColor}`}>
                Scopri di più <ArrowRight size={18} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
