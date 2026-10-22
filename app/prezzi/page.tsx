import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, X, MessageCircle, Sparkles,
  Utensils, Scissors, Code2, Shield, Zap, Users, Clock,
  CreditCard, Headphones, TrendingUp, Star
} from "lucide-react";

export const metadata = {
  title: "Prezzi — Prenotly Food, Beauty e Service",
  description:
    "Prenotly Food e Beauty da €29,99/mese. Prenotly Service su preventivo. Demo gratuita di 48 ore, senza carta di credito.",
};

export default function PrezziPage() {
  const plans = [
    {
      id: "food",
      emoji: "🍕",
      name: "Prenotly Food",
      subtitle: "Per ristoranti, pizzerie, bar e asporto",
      price: "29,99",
      period: "/mese",
      color: "wa",
      features: [
        "Menu digitale personalizzabile",
        "Ordini asporto e domicilio",
        "Dashboard completa",
        "Web app brandizzata",
        "Aggiornamenti illimitati",
        "Supporto WhatsApp",
      ],
      upgradeNote: "Prenotazione tavoli opzionale +10 €/mese",
      notIncluded: [
        "Multi-sede",
        "Integrazione con POS",
        "API personalizzate",
      ],
      cta: "Attiva Food",
      highlight: false,
      link: "/signup?plan=food",
    },
    {
      id: "beauty",
      emoji: "💇",
      name: "Prenotly Beauty",
      subtitle: "Per parrucchieri, estetiste e beauty",
      price: "29,99",
      period: "/mese",
      color: "violet",
      features: [
        "Calendario intelligente",
        "Prenotazioni con slot in tempo reale",
        "Scelta del tipo di servizio",
        "Sync con Google Calendar",
        "Promemoria anti no-show",
        "Dashboard completa",
        "Web app brandizzata",
      ],
      notIncluded: [
        "Multi-operatore avanzato",
        "Pagamenti integrati",
        "App native iOS/Android",
      ],
      cta: "Attiva Beauty",
      highlight: true,
      link: "/signup?plan=beauty",
    },
    {
      id: "service",
      emoji: "🛠️",
      name: "Prenotly Service",
      subtitle: "Software su misura per la tua attività",
      price: "Su preventivo",
      period: "gratuito e senza impegno",
      color: "blue",
      features: [
        "Analisi delle esigenze",
        "Progettazione UX/UI",
        "Sviluppo completamente custom",
        "Integrazione WhatsApp",
        "Integrazione gestionale esistente",
        "Multi-sede e multi-operatore",
        "API personalizzate",
        "Supporto e manutenzione dedicati",
      ],
      notIncluded: [],
      cta: "Richiedi preventivo",
      highlight: false,
      link: "https://wa.me/393934842118?text=Ciao%20Prenotly!%20Vorrei%20un%20preventivo%20per%20un%20software%20su%20misura",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; btn: string; ring: string; border: string }> = {
    wa: { bg: "bg-wa/10", text: "text-waDark", btn: "bg-wa hover:bg-waDark", ring: "ring-wa", border: "border-wa/30" },
    violet: { bg: "bg-violet-50", text: "text-violet-500", btn: "bg-violet-500 hover:bg-violet-600", ring: "ring-violet-500", border: "border-violet-300" },
    blue: { bg: "bg-blue-50", text: "text-blue-500", btn: "bg-blue-600 hover:bg-blue-700", ring: "ring-blue-500", border: "border-blue-300" },
  };

  const reasons = [
    { icon: Zap, title: "Attivo in 10 minuti", text: "Registrati, configuri e la tua web app è subito online. Nessun tecnico, nessuna installazione." },
    { icon: Clock, title: "Demo gratuita 48 ore", text: "Provi tutto gratis per 48 ore. Se ti piace attivi, altrimenti non paghi nulla." },
    { icon: Shield, title: "Disdici quando vuoi", text: "Nessun vincolo, nessuna penale. Se non fa per te, un click e sei fuori." },
    { icon: CreditCard, title: "Pagamento automatico", text: "Carta o IBAN dalla dashboard. Fatturazione elettronica inclusa, tutto in regola." },
    { icon: Headphones, title: "Supporto in italiano", text: "Ti aiutiamo via WhatsApp, sempre. Anche quando configuri la prima volta." },
    { icon: TrendingUp, title: "Zero commissioni", text: "Nessuna commissione sulle tue prenotazioni o ordini. Paghi solo l'abbonamento." },
  ];

  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section className="pt-28 pb-12 md:pt-40 md:pb-20 bg-gradient-to-b from-white to-soft">
        <div className="container-x max-w-3xl text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-wa mb-6">
            <ArrowLeft size={16} /> Torna alla home
          </Link>

          <span className="inline-block bg-wa/10 text-waDark text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-5">
            💎 Prezzi chiari, nessuna sorpresa
          </span>

          <h1 className="text-[32px] leading-tight md:text-5xl font-bold text-night mb-4">
            Un prezzo giusto per il software che ti fa guadagnare tempo e clienti.
          </h1>
          <p className="text-gray-600 text-[15px] md:text-lg">
            Inizia con <strong className="text-night">48 ore di demo gratuita</strong>. Poi scegli il piano più adatto a te. Disdici quando vuoi, nessun vincolo.
          </p>
        </div>
      </section>

      {/* PIANI */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container-x">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((p) => {
              const c = colorMap[p.color];
              const isExternal = p.link.startsWith("http");
              return (
                <div
                  key={p.id}
                  className={`rounded-3xl border-2 p-7 md:p-8 flex flex-col relative bg-white ${
                    p.highlight ? `${c.border} shadow-2xl md:scale-[1.03]` : "border-gray-100"
                  }`}
                >
                  {p.highlight && (
                    <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1.5 rounded-full ${c.btn}`}>
                      ⭐ Più scelto
                    </span>
                  )}

                  <div className="text-center pb-6 border-b border-gray-100">
                    <div className="text-5xl mb-3">{p.emoji}</div>
                    <h3 className="text-2xl font-bold text-night mb-1">{p.name}</h3>
                    <p className={`text-sm font-semibold ${c.text}`}>{p.subtitle}</p>

                    <div className="mt-6">
                      {p.id === "service" ? (
                        <>
                          <p className="text-2xl md:text-3xl font-bold text-night">Su preventivo</p>
                          <p className="text-xs text-gray-500 mt-1">Gratuito e senza impegno</p>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-gray-500 align-top">da €</span>
                          <span className="text-4xl md:text-5xl font-bold text-night">{p.price}</span>
                          <span className="text-sm text-gray-500">{p.period}</span>
                          <p className="text-xs text-gray-500 mt-1">IVA esclusa · Fatturazione mensile</p>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 py-6 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-gray-700 text-sm">
                        <Check size={16} className={`${c.text} mt-0.5 shrink-0`} />
                        <span>{f}</span>
                      </li>
                    ))}
                    {p.notIncluded.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-gray-400 text-sm">
                        <X size={16} className="mt-0.5 shrink-0" />
                        <span className="line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isExternal ? (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${c.btn} text-white px-6 py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-95`}
                    >
                      <MessageCircle size={18} />
                      {p.cta}
                    </a>
                  ) : (
                    <Link
                      href={p.link}
                      className={`${c.btn} text-white px-6 py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-95`}
                    >
                      {p.cta}
                      <ArrowRight size={18} />
                    </Link>
                  )}

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Demo gratuita 48 ore inclusa
                  </p>
                </div>
              );
            })}
          </div>

          <p className="text-center text-gray-500 text-sm mt-10 max-w-2xl mx-auto">
            Tutti i piani includono <strong className="text-night">dashboard</strong>, <strong className="text-night">automazioni WhatsApp</strong>, <strong className="text-night">web app brandizzata</strong> e <strong className="text-night">aggiornamenti gratuiti</strong>.
          </p>
        </div>
      </section>

      {/* PERCHÉ SCEGLIERCI */}
      <section className="py-16 md:py-24 bg-soft">
        <div className="container-x">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
            <span className="inline-block bg-wa/10 text-waDark text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-4">
              Perché scegliere Prenotly
            </span>
            <h2 className="text-[28px] md:text-4xl font-bold text-night">
              Sei buone ragioni per iniziare oggi
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {reasons.map((r) => (
              <div key={r.title} className="bg-white p-6 rounded-2xl hover:shadow-lg transition">
                <div className="w-11 h-11 rounded-xl bg-wa/10 flex items-center justify-center mb-4">
                  <r.icon className="text-waDark" size={22} />
                </div>
                <h3 className="font-bold text-night mb-1.5">{r.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFRONTO */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x max-w-4xl">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-[28px] md:text-4xl font-bold text-night">
              Cosa ottieni con Prenotly
            </h2>
            <p className="text-gray-600 mt-4 text-[15px] md:text-lg">
              A confronto con i metodi tradizionali
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 rounded-3xl p-7 border border-red-100">
              <h3 className="text-xl font-bold text-red-600 mb-5 flex items-center gap-2">
                <X size={22} /> Senza Prenotly
              </h3>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>❌ Telefono che squilla mentre lavori</li>
                <li>❌ Prenotazioni scritte su carta</li>
                <li>❌ Clienti che non si presentano (30% no-show)</li>
                <li>❌ Commissioni su ogni prenotazione (TheFork, Treatwell)</li>
                <li>❌ Nessuna visibilità su ordini e agenda</li>
                <li>❌ Zero dati per decidere</li>
              </ul>
            </div>

            <div className="bg-wa/5 rounded-3xl p-7 border border-wa/20">
              <h3 className="text-xl font-bold text-waDark mb-5 flex items-center gap-2">
                <Check size={22} /> Con Prenotly
              </h3>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>✅ Automazioni WhatsApp attiva 24/7</li>
                <li>✅ Agenda digitale sempre aggiornata</li>
                <li>✅ Promemoria anti no-show (fino -80%)</li>
                <li>✅ Zero commissioni sulle prenotazioni</li>
                <li>✅ Dashboard con statistiche in tempo reale</li>
                <li>✅ Dati per far crescere l'attività</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FIDUCIA */}
      <section className="py-16 md:py-24 bg-soft">
        <div className="container-x max-w-3xl text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <h2 className="text-[24px] md:text-3xl font-bold text-night mb-6">
            Provalo 48 ore gratis. Poi decidi.
          </h2>
          <p className="text-gray-600 text-[15px] md:text-lg mb-8">
            Nessuna carta di credito richiesta per iniziare.<br className="hidden md:block" />
            Se in 48 ore capisci che non fa per te, non paghi nulla. Zero rischi, zero trappole.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-wa hover:bg-waDark text-white px-7 py-4 rounded-full font-bold transition shadow-lg shadow-wa/30 inline-flex items-center justify-center gap-2 active:scale-95"
            >
              Inizia la demo gratuita
              <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/393934842118?text=Ciao%20Prenotly!%20Vorrei%20maggiori%20informazioni%20sui%20prezzi"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-300 hover:border-night text-night px-7 py-4 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageCircle size={18} />
              Parla con noi
            </a>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-night via-night to-waDark text-white">
        <div className="container-x max-w-3xl text-center">
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="text-[28px] md:text-4xl font-bold mb-4">
            Pronto a far crescere la tua attività?
          </h2>
          <p className="text-white/80 text-[15px] md:text-lg mb-8">
            Attiva la demo gratuita 48 ore. Nessuna carta, nessun vincolo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-wa hover:bg-waDark px-7 py-4 rounded-full font-bold transition shadow-xl shadow-wa/30 inline-flex items-center justify-center gap-2 active:scale-95"
            >
              Inizia ora
              <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/393934842118?text=Ciao%20Prenotly!%20Vorrei%20maggiori%20informazioni"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/30 hover:bg-white/10 px-7 py-4 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageCircle size={18} />
              Parla con noi
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
