import { Smartphone, MessageCircle, CalendarCheck, ShoppingBag, BellRing, UserRound, ChartBar, ShieldCheck } from "lucide-react";

export default function Features() {
  const features = [
    { icon: Smartphone, title: "Web app brandizzata", text: "Ogni attività ha la sua web app con logo, colori e nome. Il cliente entra da qualsiasi telefono, senza scaricare nulla." },
    { icon: MessageCircle, title: "Segreteria WhatsApp", text: "Risponde in automatico 24/7, gestisce ordini e appuntamenti come farebbe una persona." },
    { icon: CalendarCheck, title: "Calendario intelligente", text: "Slot liberi in tempo reale. Quando un cliente prenota, l'orario si blocca subito." },
    { icon: ShoppingBag, title: "Menu e ordini", text: "Menu digitale con prezzi, carrello e checkout. L'ordine arriva su WhatsApp già pronto." },
    { icon: BellRing, title: "Conferme e promemoria", text: "Il cliente riceve conferma, promemoria e avviso quando l'ordine è pronto." },
    { icon: UserRound, title: "Passaggio a operatore", text: "Se la chat si complica, la segreteria ti passa il controllo. Tu rispondi, il bot tace." },
    { icon: ChartBar, title: "Statistiche chiare", text: "Quante prenotazioni, ordini, clienti abituali. Tutto in una dashboard semplice." },
    { icon: ShieldCheck, title: "Dati al sicuro", text: "Ogni attività ha il suo spazio isolato. Niente dati condivisi, niente fughe." },
  ];
  return (
    <section id="funzioni" className="py-20 md:py-28 bg-white">
      <div className="container-x">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block bg-wa/10 text-waDark text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Funzioni
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-night">Tutto quello che serve alla tua attività</h2>
          <p className="text-gray-600 mt-4 text-lg">Web app, segreteria WhatsApp, calendario, ordini. Tutto in un unico sistema.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-wa/40 hover:shadow-lg transition bg-white">
              <div className="w-11 h-11 rounded-xl bg-wa/10 flex items-center justify-center mb-4">
                <f.icon className="text-waDark" size={22} />
              </div>
              <h3 className="font-bold text-night mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
