import { PhoneOff, Clock, Frown, TrendingDown } from "lucide-react";

export default function Problem() {
  const items = [
    {
      icon: Clock,
      title: "Il cliente scrive, nessuno risponde",
      text: "Sono le 22:30, o è domenica pomeriggio. Il tuo potenziale cliente ti scrive ma non riceve risposta. Dieci minuti dopo ha già ordinato da qualcun altro."
    },
    {
      icon: PhoneOff,
      title: "Il telefono squilla mentre lavori",
      text: "Hai le mani in pasta, la sala è piena, il salone è pieno di clienti. Il telefono continua a squillare ma non puoi rispondere. Ogni chiamata persa è un cliente perso."
    },
    {
      icon: TrendingDown,
      title: "Il 30% delle prenotazioni non si presenta",
      text: "Chi prenota al telefono dimentica. Chi prenota senza promemoria non si presenta. Ogni tavolo vuoto o slot saltato sono soldi che non entrano."
    },
  ];
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container-x">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="inline-block bg-red-50 text-red-500 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Il problema
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-night">
            Ogni giorno perdi clienti senza nemmeno accorgertene
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Non è colpa tua. È che gestire ordini e appuntamenti con il telefono è un lavoro a tempo pieno. E tu ne hai già uno.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.title} className="p-8 rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-lg transition bg-white">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-5">
                <item.icon className="text-red-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-night mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 max-w-3xl mx-auto bg-wa/5 border border-wa/20 rounded-2xl p-8 text-center">
          <p className="text-lg text-night leading-relaxed">
            <strong>Il vero problema non è il lavoro. È il tempo.</strong> Ogni minuto passato al telefono è un minuto in meno per i tuoi clienti in sala, per migliorare il tuo servizio, per far crescere la tua attività.
          </p>
        </div>
      </div>
    </section>
  );
}
