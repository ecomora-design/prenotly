import { Smartphone, MessageCircle, Zap } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: Smartphone,
      title: "Il cliente prenota",
      text: "Apre il tuo link, sceglie servizio o piatto, conferma. Nessuna app da scaricare, nessuna registrazione.",
    },
    {
      n: "02",
      icon: MessageCircle,
      title: "Ricevi su WhatsApp",
      text: "Tutto arriva sul tuo numero WhatsApp con tutti i dettagli. Confermi o gestisci con un tap.",
    },
    {
      n: "03",
      icon: Zap,
      title: "Sincronizza da solo",
      text: "L'agenda si aggiorna, gli slot occupati si bloccano, i clienti ricevono conferma automatica.",
    },
  ];

  const reasons = [
    {
      n: "10 min",
      label: "Per essere online",
      text: "Registri, carichi il menu o i servizi, sei operativo.",
    },
    {
      n: "0 €",
      label: "Di commissioni",
      text: "Non tratteniamo nulla sui tuoi incassi. Paghi solo l'abbonamento.",
    },
    {
      n: "24/7",
      label: "Sempre attivo",
      text: "Anche quando sei chiuso o in cucina, il sistema risponde.",
    },
    {
      n: "1 link",
      label: "Da condividere",
      text: "Il tuo spazio online, pronto da mettere su Instagram o Google.",
    },
  ];

  return (
    <>
      {/* COME FUNZIONA */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-x">
          <div className="max-w-2xl mb-10 md:mb-14">
            <p className="text-xs font-bold text-waDark uppercase tracking-widest mb-3">
              Come funziona
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-night tracking-tight leading-tight">
              Tre passaggi. Zero complicazioni.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((s) => (
              <div
                key={s.n}
                className="bg-white rounded-3xl p-7 md:p-8 border border-night/5"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-night flex items-center justify-center">
                    <s.icon size={20} className="text-wa" />
                  </div>
                  <span className="text-4xl font-bold text-night/10 tracking-tighter">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-night mb-2 leading-tight">
                  {s.title}
                </h3>
                <p className="text-sm text-night/60 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERCHÉ SCEGLIERE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x">
          <div className="max-w-2xl mb-10 md:mb-14">
            <p className="text-xs font-bold text-waDark uppercase tracking-widest mb-3">
              Perché Prenotly
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-night tracking-tight leading-tight">
              Fatto semplice. Fatto bene.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {reasons.map((r) => (
              <div
                key={r.n}
                className="bg-cream rounded-3xl p-5 md:p-6 border border-night/5"
              >
                <p className="text-3xl md:text-4xl font-bold text-waDark tracking-tighter mb-2">
                  {r.n}
                </p>
                <p className="text-xs font-bold text-night uppercase tracking-wider mb-2">
                  {r.label}
                </p>
                <p className="text-xs md:text-sm text-night/60 leading-relaxed">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
