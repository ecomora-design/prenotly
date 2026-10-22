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
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-[#25D366]/[0.08] to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container-x relative">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#425466] hover:text-[#0A2540] mb-8 transition">
            <ArrowLeft size={16} /> Torna alla home
          </Link>

          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <Sparkles size={12} className="text-[#25D366]" />
                <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Software su misura</span>
              </div>

              <h1 className="text-[40px] leading-[1.05] md:text-6xl md:leading-[1.02] font-bold text-[#0A2540] tracking-[-0.03em] mb-6">
                Hai un&apos;esigenza<br />
                <span className="bg-gradient-to-r from-[#128C7E] via-[#25D366] to-[#0F766E] bg-clip-text text-transparent">
                  particolare?<br />
                  La costruiamo noi.
                </span>
              </h1>

              <p className="text-base md:text-lg text-[#425466] leading-relaxed mb-8">
                Non tutti i business rientrano in uno stampo. Se hai bisogno di un software con funzionalità specifiche, integrazioni particolari o un flusso tutto tuo, possiamo progettarlo da zero.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Analisi gratuita delle tue esigenze",
                  "Preventivo scritto entro 5 giorni",
                  "Nessun costo nascosto, nessun vincolo",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[#425466] text-sm">
                    <div className="w-4 h-4 rounded-full bg-[#25D366]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={10} className="text-[#128C7E]" strokeWidth={3} />
                    </div>
                    {t}
                  </li>
                ))}
              </ul>

              <a
                href="#form"
                className="group bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white px-7 py-4 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#25D366]/30 inline-flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Richiedi preventivo gratis
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* Card riepilogo */}
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-[#E6EBF1]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                  <Sparkles size={22} className="text-[#128C7E]" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A2540] text-sm">Per chi è Service</h3>
                  <p className="text-xs text-[#425466]/60">Quando Food o Pro non bastano</p>
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
                  <li key={t} className="flex items-start gap-2.5 text-[#425466]">
                    <div className="w-4 h-4 rounded-full bg-[#25D366]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={10} className="text-[#128C7E]" strokeWidth={3} />
                    </div>
                    <span className="text-xs">{t}</span>
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
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-5 shadow-sm">
              <Sparkles size={12} className="text-[#25D366]" />
              <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Cosa possiamo fare</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight">
              Dal concept<br />
              <span className="text-[#425466]">al lancio online.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="group bg-white rounded-2xl p-6 border border-[#E6EBF1] hover:border-[#25D366]/30 hover:shadow-lg transition-all">
                <div className="w-11 h-11 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon size={20} className="text-[#128C7E]" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-[#0A2540] mb-1.5 text-sm">{f.title}</h3>
                <p className="text-xs text-[#425466] leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COME LAVORIAMO */}
      <section className="py-16 md:py-24 bg-[#FAFBFC]">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
              Come lavoriamo.
            </h2>
            <p className="text-[#425466] text-base">
              Dal primo contatto al lancio online, passando per ogni step con te.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {timeline.map((t) => (
              <div key={t.n} className="bg-white rounded-2xl p-6 border border-[#E6EBF1] relative hover:shadow-lg transition">
                <div className="absolute top-5 right-5 text-4xl font-bold text-[#FAFBFC]">
                  0{t.n}
                </div>
                <div className="relative">
                  <h3 className="text-sm font-bold text-[#0A2540] mb-2 pr-12">{t.title}</h3>
                  <p className="text-xs text-[#425466] leading-relaxed">{t.text}</p>
                </div>
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
              <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-5 shadow-sm">
                <Sparkles size={12} className="text-[#25D366]" />
                <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Raccontaci il progetto</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
                Richiedi un<br />
                <span className="text-[#425466]">preventivo gratuito.</span>
              </h2>
              <p className="text-[#425466] text-base">
                Compila il form. Ti ricontattiamo entro 24 ore per fissare una call.
              </p>
            </div>

            <ServiceForm />
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x max-w-4xl">
          <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#0A2540] to-[#128C7E] p-10 md:p-16 text-white text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
                Preferisci<br />
                <span className="text-[#25D366]">parlarne prima?</span>
              </h2>
              <p className="text-white/70 text-base md:text-lg mb-8 max-w-lg mx-auto">
                Scrivici su WhatsApp. Ti rispondiamo in giornata.
              </p>
              <a
                href="https://wa.me/message/LLEKTVFCRCPVB1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#FAFBFC] text-[#0A2540] px-8 py-4 rounded-full font-bold text-sm transition shadow-xl active:scale-[0.98]"
              >
                <MessageCircle size={16} />
                Parla con noi
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
