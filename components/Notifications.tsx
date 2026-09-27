import { MessageCircle, Mail, CalendarDays, ListChecks } from "lucide-react";

export default function Notifications() {
  const channels = [
    { icon: MessageCircle, color: "text-wa", bg: "bg-wa/10", title: "WhatsApp", text: "Nuovo ordine · Marco · 1 Margherita + 1 Diavola · €15,50 · Asporto 20:30" },
    { icon: Mail, color: "text-blue-500", bg: "bg-blue-50", title: "Email", text: "Riepilogo giornaliero di ordini e appuntamenti, con dettagli e contatti." },
    { icon: CalendarDays, color: "text-violet-500", bg: "bg-violet-50", title: "Google Calendar", text: "15:00–16:00 · Taglio + piega – Giulia · confermato automaticamente." },
    { icon: ListChecks, color: "text-orange-500", bg: "bg-orange-50", title: "Dashboard", text: "Tutti gli ordini e le prenotazioni in un'unica schermata, sempre aggiornata." },
  ];
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container-x">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-night">Ogni evento arriva dove ti serve</h2>
          <p className="text-gray-600 mt-4 text-lg">Su WhatsApp, in agenda, via email. Come preferisci tu.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.map((c) => (
            <div key={c.title} className="bg-soft rounded-2xl p-6 hover:shadow-md transition">
              <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                <c.icon className={c.color} size={24} />
              </div>
              <h3 className="font-bold text-night mb-2">{c.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
