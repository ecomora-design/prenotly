import { Monitor, MousePointerClick, MessageCircle, ArrowDown } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      n: 1,
      icon: Monitor,
      title: "Il cliente entra nel tuo spazio",
      text: "Ogni attività ha il suo indirizzo personalizzato (es. prenotly-italia.it/da-marco) con il tuo nome, logo e colori. Si apre dal telefono in un secondo, senza scaricare niente, senza registrarsi.",
    },
    {
      n: 2,
      icon: MousePointerClick,
      title: "Sceglie, ordina, prenota",
      text: "Per i ristoranti: sfoglia il menu, riempie il carrello, invia l'ordine. Per i servizi: vede solo gli orari liberi in agenda, tocca quello che gli va, e prenota in 3 secondi.",
    },
    {
      n: 3,
      icon: MessageCircle,
      title: "La segreteria conferma tutto",
      text: "Una segreteria intelligente su WhatsApp risponde in automatico, conferma il ritiro o l'appuntamento, blocca lo slot in calendario e avvisa te solo quando serve. Tu non muovi un dito.",
    },
  ];

  return (
    <section id="come-funziona" className="py-16 md:py-28 bg-soft">
      <div className="container-x">
        <div className="max-w-2xl mx-auto text-center mb-10 md:mb-16">
          <span className="inline-block bg-wa/10 text-waDark text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-4">
            Come funziona
          </span>
          <h2 className="text-[28px] leading-tight md:text-4xl font-bold text-night">
            Tre passaggi.<br className="md:hidden" /> Zero complicazioni.
          </h2>
          <p className="text-gray-600 mt-4 text-[15px] md:text-lg">
            3 secondi per il tuo cliente. Meno di un minuto per te, la prima volta.
          </p>
        </div>

        {/* Mobile: step verticali con connettore */}
        <div className="md:hidden max-w-md mx-auto">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-wa flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-wa/30">
                    {s.n}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-wa/40 to-transparent my-2" style={{ minHeight: "40px" }} />
                  )}
                </div>
                <div className="pb-8 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-wa/10 flex items-center justify-center mb-3">
                    <s.icon className="text-waDark" size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-night mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: griglia */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition relative">
              <div className="w-14 h-14 rounded-2xl bg-wa/10 flex items-center justify-center mb-5">
                <s.icon className="text-waDark" size={26} />
              </div>
              <div className="absolute top-6 right-6 text-5xl font-bold text-soft">
                0{s.n}
              </div>
              <h3 className="text-xl font-bold text-night mb-3 pr-12">{s.title}</h3>
              <p className="text-gray-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-[15px] md:text-lg mt-8 md:mt-12">
          Nessun corso da seguire. Nessun tecnico da chiamare. <strong className="text-night">Si parte in 10 minuti.</strong>
        </p>
      </div>
    </section>
  );
}
