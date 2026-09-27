import { Monitor, MousePointerClick, MessageCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      n: 1,
      icon: Monitor,
      title: "Il cliente entra nel tuo spazio",
      text: "Ogni attività ha il suo indirizzo personalizzato (es. prenotly.it/da-marco) con il tuo nome, il tuo logo, i tuoi colori. Si apre dal telefono in un secondo, senza scaricare niente, senza registrarsi.",
    },
    {
      n: 2,
      icon: MousePointerClick,
      title: "Sceglie, ordina, prenota",
      text: "Per i ristoranti: sfoglia il menu con foto e prezzi, riempie il carrello, invia l'ordine. Per i servizi: vede solo gli orari liberi in agenda, tocca quello che gli va, e prenota in 3 secondi.",
    },
    {
      n: 3,
      icon: MessageCircle,
      title: "La segreteria conferma tutto",
      text: "Una segreteria intelligente su WhatsApp risponde in automatico, conferma il ritiro o l'appuntamento, blocca lo slot in calendario e avvisa te solo quando serve. Tu non muovi un dito.",
    },
  ];

  return (
    <section id="come-funziona" className="py-20 md:py-28 bg-soft">
      <div className="container-x">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block bg-wa/10 text-waDark text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Come funziona
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-night">
            Tre passaggi. Zero complicazioni.
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Ci vogliono 3 secondi per il tuo cliente. Meno di un minuto per te, la prima volta.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
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

        <div className="mt-12 max-w-2xl mx-auto text-center">
          <p className="text-gray-600 text-lg">
            Nessun corso da seguire. Nessun tecnico da chiamare. <strong className="text-night">Si parte in 10 minuti.</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
