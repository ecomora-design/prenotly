import { MessageCircle, Clock, CalendarCheck, UserRound, Bell, Sparkles } from "lucide-react";

export default function Secretary() {
  const points = [
    {
      icon: Clock,
      title: "Risponde mentre dormi",
      text: "Sono le 23:47, o è Ferragosto. Il cliente scrive. La segreteria risponde come se fossi tu, con il tuo tono, i tuoi orari, le tue regole. Il cliente non aspetta mai, non si stanca mai, non va mai dalla concorrenza."
    },
    {
      icon: CalendarCheck,
      title: "Blocca gli slot davvero",
      text: "Non è un semplice 'riceviamo e confermiamo'. La segreteria legge il calendario in tempo reale, verifica la disponibilità e prenota solo se lo slot è libero. Niente doppioni, niente errori, niente caos."
    },
    {
      icon: Bell,
      title: "Ci pensa da sola, anche dopo",
      text: "Manda la conferma al cliente, il promemoria il giorno prima, l'avviso quando l'ordine è pronto. Riduce i no-show fino all'80%, senza che tu debba ricordarti di niente."
    },
    {
      icon: UserRound,
      title: "Ti passa la palla quando serve",
      text: "Se il cliente fa una domanda fuori copione o vuole parlare con una persona, la segreteria ti passa la conversazione in un secondo. Tu rispondi dal tuo WhatsApp. Lei tace."
    },
    {
      icon: MessageCircle,
      title: "Sempre WhatsApp. Sempre.",
      text: "I tuoi clienti non scaricano app, non creano account, non imparano nuovi strumenti. Usano WhatsApp, che hanno già aperto sul telefono adesso. Zero attrito, massima conversione."
    },
    {
      icon: Sparkles,
      title: "Si adatta al tuo business",
      text: "Impostata con il tuo menu, i tuoi servizi, i tuoi orari, il tuo linguaggio. Non è un chatbot generico: è la tua segreteria personale, cucita su misura per la tua attività."
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container-x">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block bg-wa/10 text-waDark text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            La segreteria WhatsApp
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-night">
            La segreteria che non prende mai ferie.
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Immagina di avere una persona che risponde al telefono 24 ore su 24, non si stanca mai, non sbaglia mai un appuntamento, e costa meno di una cena fuori al mese. Ecco, quella persona esiste.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((p) => (
            <div key={p.title} className="p-6 rounded-2xl border border-gray-100 hover:border-wa/40 hover:shadow-lg transition">
              <div className="w-11 h-11 rounded-xl bg-wa/10 flex items-center justify-center mb-4">
                <p.icon className="text-waDark" size={22} />
              </div>
              <h3 className="font-bold text-night mb-2">{p.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
