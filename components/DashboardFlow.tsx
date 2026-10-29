import { UserPlus, LayoutDashboard, Settings, CreditCard, Globe, MessageCircle } from "lucide-react";

export default function DashboardFlow() {
  const steps = [
    {
      icon: UserPlus,
      title: "Registrati in 30 secondi",
      text: "Crei il tuo account, scegli il software (Food, Servizi o Service) e accedi subito alla tua area riservata.",
    },
    {
      icon: LayoutDashboard,
      title: "Accedi alla dashboard",
      text: "Da qui vedi tutto: ordini, prenotazioni, clienti, statistiche. Un unico pannello per gestire la tua attività.",
    },
    {
      icon: Settings,
      title: "Configuri la tua web app",
      text: "Scegli cosa mostrare ai tuoi clienti: menu, servizi, orari, colori, logo. La tua web app si aggiorna in tempo reale.",
    },
    {
      icon: Globe,
      title: "Il tuo indirizzo è online",
      text: "prenotly-italia.it/tua-attività è subito attivo. I clienti possono prenotare e ordinare dal link che condividi.",
    },
    {
      icon: MessageCircle,
      title: "Ricevi tutto su App",
      text: "Ogni ordine o appuntamento arriva sul tuo numero App, già confermato dalil sistema automatica.",
    },
    {
      icon: CreditCard,
      title: "Paghi comodamente online",
      text: "Dal tuo pannello gestisci l'abbonamento in totale autonomia: carta, IBAN, fatturazione automatica. Nessuna chiamata.",
    },
  ];

  return (
    <section className="py-16 md:py-28 bg-soft">
      <div className="container-x">
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
          <span className="inline-block bg-wa/10 text-waDark text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-4">
            La dashboard
          </span>
          <h2 className="text-[28px] leading-tight md:text-5xl font-bold text-night">
            Tutto sotto controllo, dalla tua dashboard
          </h2>
          <p className="text-gray-600 mt-4 text-[15px] md:text-lg">
            Ti registri, paghi, configuri. Il resto lo fa il software.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="bg-white rounded-2xl p-6 md:p-7 hover:shadow-lg transition relative">
              <div className="absolute top-5 right-5 text-3xl font-bold text-soft">
                0{i + 1}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-wa/10 flex items-center justify-center mb-4">
                <s.icon className="text-waDark" size={22} />
              </div>
              <h3 className="text-lg font-bold text-night mb-2 pr-10">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
