import { Smartphone, CalendarCheck, ShoppingBag, BellRing, ChartBar, ShieldCheck } from "lucide-react";

export default function Features() {
  const features = [
    { icon: Smartphone, title: "Web app brandizzata", text: "Il tuo spazio online con logo e colori. Il cliente prenota da qualsiasi telefono, senza scaricare nulla." },
    { icon: CalendarCheck, title: "Agenda intelligente", text: "Slot liberi in tempo reale. Quando un cliente prenota, l'orario si blocca subito. Zero doppie prenotazioni." },
    { icon: ShoppingBag, title: "Menu e ordini", text: "Menu digitale con carrello e checkout. L'ordine arriva in dashboard già pronto, senza telefonate." },
    { icon: BellRing, title: "Promemoria anti no-show", text: "Il cliente riceve conferma e promemoria automatico. I no-show scendono fino all'80%." },
    { icon: ChartBar, title: "Statistiche chiare", text: "Quante prenotazioni, ordini, incassi, clienti abituali. Tutto in una dashboard semplice." },
    { icon: ShieldCheck, title: "Dati al sicuro", text: "Ogni attività ha il suo spazio isolato. Backup giornaliero, GDPR compliant, server in Europa." },
  ];
  return (
    <section id="funzioni" className="py-14 md:py-28 bg-white">
      <div className="container-x">
        <div className="max-w-2xl mx-auto text-center mb-10 md:mb-16">
          <span className="inline-block bg-wa/10 text-waDark text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-4">
            Funzioni
          </span>
          <h2 className="text-[26px] leading-tight sm:text-3xl md:text-4xl font-bold text-night">
            Tutto quello che serve alla tua attività
          </h2>
          <p className="text-gray-600 mt-3 md:mt-4 text-[15px] md:text-lg">
            Web app, agenda, ordini, statistiche. Tutto in un unico sistema.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-4 md:p-6 rounded-2xl border border-gray-100 hover:border-wa/40 hover:shadow-lg transition bg-white">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-wa/10 flex items-center justify-center mb-3 md:mb-4">
                <f.icon className="text-waDark" size={20} />
              </div>
              <h3 className="font-bold text-night text-sm md:text-base mb-1.5 md:mb-2">{f.title}</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
