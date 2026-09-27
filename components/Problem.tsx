import { PhoneOff, Clock, TrendingDown } from "lucide-react";

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
    <section className="py-16 md:py-28 bg-white">
      <div className="container-x">
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
          <span className="inline-block bg-red-50 text-red-500 text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-4">
            Il problema
          </span>
          <h2 className="text-[28px] leading-tight md:text-4xl font-bold text-night">
            Ogni giorno perdi clienti<br className="md:hidden" /> senza accorgertene
          </h2>
          <p className="text-gray-600 mt-4 text-[15px] md:text-lg">
            Non è colpa tua. È che gestire ordini e appuntamenti con il telefono è un lavoro a tempo pieno. E tu ne hai già uno.
          </p>
        </div>

        {/* Mobile: scroll orizzontale */}
        <div className="md:hidden -mx-5 px-5">
          <div className="scroll-x flex gap-4 pb-4">
            {items.map((item) => (
              <div
                key={item.title}
                className="w-[85vw] max-w-[320px] p-6 rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  <item.icon className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-night mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-1">← scorri per vedere →</p>
        </div>

        {/* Desktop: griglia */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
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

        <div className="mt-10 md:mt-14 max-w-3xl mx-auto bg-wa/5 border border-wa/20 rounded-2xl p-5 md:p-8 text-center">
          <p className="text-[15px] md:text-lg text-night leading-relaxed">
            <strong>Il vero problema non è il lavoro. È il tempo.</strong> Ogni minuto passato al telefono è un minuto in meno per i tuoi clienti, per migliorare il tuo servizio, per far crescere la tua attività.
          </p>
        </div>
      </div>
    </section>
  );
}
