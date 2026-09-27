import { Utensils, Pizza, Coffee, Scissors, Sparkles, Stethoscope, Dumbbell, UserRound } from "lucide-react";

export default function TargetAudience() {
  const food = [
    { icon: Utensils, title: "Ristoranti", text: "Prenotazioni tavoli e ordini da asporto, con turni e sale." },
    { icon: Pizza, title: "Pizzerie", text: "Gestione gruppi, turni veloci e weekend affollati." },
    { icon: Coffee, title: "Bar & Bistrot", text: "Ordini rapidi e prenotazioni per colazioni e pranzi." },
  ];
  const services = [
    { icon: Scissors, title: "Parrucchieri & Barbieri", text: "Agenda sempre piena, zero telefonate. Slot in tempo reale." },
    { icon: Sparkles, title: "Estetiste & Nail", text: "Prenotazioni con durata, promemoria automatici anti no-show." },
    { icon: Stethoscope, title: "Studi medici", text: "Appuntamenti gestiti in automatico, senza segretaria." },
    { icon: Dumbbell, title: "Palestre & Personal", text: "Lezioni, sessioni e prove gratuite prenotabili online." },
    { icon: UserRound, title: "Consulenti & Liberi prof.", text: "Agenda sempre ordinata, sync con Google Calendar." },
  ];

  return (
    <section id="settori" className="py-20 md:py-28 bg-soft">
      <div className="container-x">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-night">Per chi è Prenotly</h2>
          <p className="text-gray-600 mt-4 text-lg">Un'unica piattaforma per chi vende cibo o serve clienti su appuntamento.</p>
        </div>

        <div className="mb-14">
          <h3 className="text-xl font-bold text-night mb-6 flex items-center gap-3">
            <span className="text-2xl">🍕</span> Cibo & Ristorazione
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {food.map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-2xl hover:shadow-lg transition">
                <div className="w-11 h-11 rounded-xl bg-wa/10 flex items-center justify-center mb-4">
                  <f.icon className="text-waDark" size={22} />
                </div>
                <h4 className="font-bold text-night mb-2">{f.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-night mb-6 flex items-center gap-3">
            <span className="text-2xl">💇</span> Servizi & Beauty
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-white p-6 rounded-2xl hover:shadow-lg transition">
                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mb-4">
                  <s.icon className="text-violet-500" size={22} />
                </div>
                <h4 className="font-bold text-night mb-2">{s.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
