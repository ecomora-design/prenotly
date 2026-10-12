import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ServiceForm from "./ServiceForm";
import {
  ArrowLeft, ArrowRight, Code2, Layers, Zap, Brain,
  Shield, Globe, Sparkles, Check, MessageCircle
} from "lucide-react";

export const metadata = {
  title: "Prenotly Service — Software su misura per la tua attività",
  description:
    "Hai esigenze particolari? Progettiamo e sviluppiamo un software completamente personalizzato. Preventivo gratuito.",
};

export default function ServicePage() {
  const features = [
    { icon: Brain, title: "Analisi esigenze", text: "Ascoltiamo come lavori oggi e cosa ti serve davvero. Niente soluzioni preconfezionate." },
    { icon: Layers, title: "Progettazione UX/UI", text: "Disegniamo l'interfaccia su misura per te e per i tuoi clienti." },
    { icon: Code2, title: "Sviluppo custom", text: "Costruiamo solo le funzionalità che ti servono, senza fronzoli." },
    { icon: Zap, title: "Integrazione WhatsApp", text: "Il tuo software parla con i clienti via WhatsApp automaticamente." },
    { icon: Globe, title: "Integrazione gestionale", text: "Colleghiamo il tuo software ai sistemi che già usi (CRM, magazzino, contabilità)." },
    { icon: Shield, title: "Supporto dedicato", text: "Un referente unico per te. Niente call center, niente ticket." },
  ];

  const timeline = [
    { n: 1, title: "Call di scoperta", text: "30 minuti per capire il tuo progetto, le tue priorità e il budget." },
    { n: 2, title: "Preventivo dettagliato", text: "Ricevi per iscritto cosa faremo, in quanto tempo e a quale prezzo. Entro 5 giorni." },
    { n: 3, title: "Prototipo", text: "Vedi un'anteprima cliccabile prima di iniziare. Approvi o modifichiamo." },
    { n: 4, title: "Sviluppo e test", text: "Costruiamo, testiamo, raffiniamo. Ti aggiorniamo ogni settimana." },
    { n: 5, title: "Lancio online", text: "Mettiamo online il tuo software. Formazione del team e assistenza inclusa." },
    { n: 6, title: "Supporto continuo", text: "Manutenzione, aggiornamenti e nuove funzionalità quando servono." },
  ];

  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-white to-soft">
        <div className="container-x">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 mb-6">
            <ArrowLeft size={16} /> Torna alla home
          </Link>

          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
            <div>
              <span className="inline-block bg-blue-50 text-blue-500 text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-5">
                🛠️ Software su misura
              </span>
              <h1 className="text-[32px] leading-tight md:text-5xl font-bold text-night">
                Hai un'esigenza particolare?
                <span className="text-blue-600"> La costruiamo noi.</span>
              </h1>
              <p className="mt-5 text-[15px] md:text-lg text-gray-600 leading-relaxed">
                Non tutti i business rientrano in uno stampo. Se hai bisogno di un software
                con funzionalità specifiche, integrazioni particolari o un flusso tutto tuo,
                possiamo progettarlo e svilupparlo da zero.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Analisi gratuita delle tue esigenze",
                  "Preventivo scritto entro 5 giorni",
                  "Nessun costo nascosto, nessun vincolo",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                    <Check size={18} className="text-blue-600 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>

              <a
                href="#form"
                className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-full font-bold transition shadow-lg shadow-blue-600/30 active:scale-95"
              >
                Richiedi preventivo gratis
                <ArrowRight size={18} />
              </a>
            </div>

            {/* Card riepilogo */}
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Sparkles className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-night">Per chi è Service</h3>
                  <p className="text-xs text-gray-500">Quando Food o Beauty non bastano</p>
                </div>
              </div>

              <ul className="space-y-3 text-sm">
                {[
                  "Studi medici con gestione cartelle cliniche",
                  "Palestre con gestione abbonamenti e corsi",
                  "Consulenti con agende e CRM personalizzati",
                  "Catene multi-sede con gestione centralizzata",
                  "Aziende con integrazioni a gestionali esistenti",
                  "Chiunque abbia un flusso di lavoro unico",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-gray-700">
                    <Check size={16} className="text-blue-600 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COSA FACCIAMO */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x">
          <div className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
            <h2 className="text-[28px] md:text-4xl font-bold text-night">
              Cosa possiamo fare per te
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <f.icon className="text-blue-600" size={22} />
                </div>
                <h3 className="font-bold text-night mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COME LAVORIAMO */}
      <section className="py-16 md:py-24 bg-soft">
        <div className="container-x">
          <div className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
            <h2 className="text-[28px] md:text-4xl font-bold text-night">
              Come lavoriamo
            </h2>
            <p className="text-gray-600 mt-4 text-[15px] md:text-lg">
              Dal primo contatto al lancio online, passando per ogni step con te.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {timeline.map((t) => (
              <div key={t.n} className="bg-white rounded-2xl p-6 shadow-sm relative">
                <div className="absolute top-5 right-5 text-4xl font-bold text-soft">
                  0{t.n}
                </div>
                <h3 className="text-lg font-bold text-night mb-2 pr-12">{t.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="form" className="py-16 md:py-24 bg-white">
        <div className="container-x">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block bg-blue-50 text-blue-500 text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-4">
                Raccontaci il tuo progetto
              </span>
              <h2 className="text-[28px] md:text-4xl font-bold text-night mb-4">
                Richiedi un preventivo gratuito
              </h2>
              <p className="text-gray-600 text-[15px] md:text-lg">
                Compila il form. Ti ricontattiamo entro 24 ore per fissare una call.
              </p>
            </div>

            <ServiceForm />
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-night via-night to-blue-900 text-white">
        <div className="container-x max-w-3xl text-center">
          <div className="text-5xl mb-6">🛠️</div>
          <h2 className="text-[28px] md:text-4xl font-bold mb-4">
            Preferisci parlarne prima?
          </h2>
          <p className="text-white/80 text-[15px] md:text-lg mb-8">
            Scrivici su WhatsApp. Ti rispondiamo in giornata.
          </p>
          <a
            href="https://wa.me/message/LLEKTVFCRCPVB1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-wa hover:bg-waDark px-7 py-4 rounded-full font-bold transition shadow-xl shadow-wa/30 active:scale-95"
          >
            <MessageCircle size={18} />
            Parla con noi su WhatsApp
          </a>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
