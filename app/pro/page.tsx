import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
  ArrowLeft, ArrowRight, Check, MessageCircle,
  Calendar, Clock, Bell, Users, BarChart3,
  Smartphone, Scissors
} from "lucide-react";

export const metadata = {
  title: "Prenotly Pro — Prenotazioni per beauty, studi e professionisti",
  description:
    "Agenda intelligente con prenotazioni automatiche. Sincronizzata con Google Calendar. Da 29,99 €/mese.",
};

export default function ProPage() {
  const features = [
    {
      icon: Calendar,
      title: "Agenda intelligente",
      text: "Gli slot liberi si aggiornano in tempo reale. Niente doppioni, niente errori.",
    },
    {
      icon: Clock,
      title: "Servizi con durata",
      text: "Taglio 30 min, colore 90 min. Ogni servizio ha il suo tempo, il sistema lo rispetta.",
    },
    {
      icon: Bell,
      title: "Promemoria anti no-show",
      text: "Il cliente riceve un messaggio prima dell'appuntamento. Riduci le assenze.",
    },
    {
      icon: Users,
      title: "Multi-operatore",
      text: "Ogni membro del team ha il suo calendario. Nessuna sovrapposizione.",
    },
    {
      icon: MessageCircle,
      title: "Sync Google Calendar",
      text: "Gli appuntamenti finiscono direttamente nella tua agenda Google, in automatico.",
    },
    {
      icon: BarChart3,
      title: "Dashboard completa",
      text: "Vedi chi prenota, quando, e quanto incassi. Tutto in un unico posto.",
    },
  ];

  const whoItsFor = [
    "Parrucchieri e barbieri",
    "Centri estetici",
    "Nail & make-up artist",
    "Studi medici e dentistici",
    "Fisioterapisti e osteopati",
    "Psicologi e terapeuti",
    "Consulenti e liberi professionisti",
    "Palestre e personal trainer",
  ];

  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-cream">
        <div className="container-x">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-night/60 hover:text-night mb-6 transition"
          >
            <ArrowLeft size={16} /> Torna alla home
          </Link>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-night text-white rounded-full px-3.5 py-1.5 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-wa" />
                <span className="text-[11px] font-bold tracking-wide uppercase">
                  Prenotly Pro
                </span>
              </span>

              <h1 className="text-[34px] leading-[1.1] md:text-5xl md:leading-[1.1] font-bold text-night tracking-tight">
                Agenda piena.
                <br />
                Telefono muto.
              </h1>

              <p className="mt-5 text-base md:text-lg text-night/70 leading-relaxed">
                Per beauty, studi e professionisti. I clienti prenotano
                online, tu ricevi tutto in agenda e su WhatsApp. Sincronizzato
                con Google Calendar.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="bg-night hover:bg-night/90 text-white px-6 py-3.5 rounded-full font-semibold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  Prova 48 ore gratis
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="https://wa.me/message/LLEKTVFCRCPVB1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-night/15 hover:border-night text-night px-6 py-3.5 rounded-full font-semibold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <MessageCircle size={18} />
                  Parla con noi
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-night/50">
                {["Zero commissioni", "Sync Google Calendar", "Disdici quando vuoi"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check size={14} className="text-waDark" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Mockup agenda */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-5 border border-night/5 max-w-sm mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-night/5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-waDark flex items-center justify-center text-white font-bold">
                      SB
                    </div>
                    <div>
                      <p className="font-bold text-night text-sm">Salone Bellissima</p>
                      <p className="text-[11px] text-night/50">Oggi, 3 appuntamenti</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-waDark text-white flex flex-col items-center justify-center">
                      <span className="text-[9px] font-bold">09:00</span>
                      <span className="text-[10px]">45m</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-night">Giulia - Taglio</p>
                      <p className="text-xs text-night/50">Confermato</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-night/10 text-night flex flex-col items-center justify-center">
                      <span className="text-[9px] font-bold">11:00</span>
                      <span className="text-[10px]">90m</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-night">Marco - Colore</p>
                      <p className="text-xs text-night/50">Confermato</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-night/10 text-night flex flex-col items-center justify-center">
                      <span className="text-[9px] font-bold">15:00</span>
                      <span className="text-[10px]">45m</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-night">Sara - Piega</p>
                      <p className="text-xs text-night/50">Confermato</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x">
          <div className="max-w-2xl mb-10 md:mb-14">
            <p className="text-xs font-bold text-waDark uppercase tracking-widest mb-3">
              Cosa include
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-night tracking-tight">
              Tutto per gestire la tua agenda.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-cream rounded-3xl p-6 border border-night/5"
              >
                <div className="w-11 h-11 rounded-2xl bg-night flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-wa" />
                </div>
                <h3 className="font-bold text-night mb-2">{f.title}</h3>
                <p className="text-sm text-night/60 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PER CHI È */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-x">
          <div className="max-w-2xl mb-10 md:mb-14">
            <p className="text-xs font-bold text-waDark uppercase tracking-widest mb-3">
              Per chi è
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-night tracking-tight">
              Chiunque lavori su appuntamento.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {whoItsFor.map((w) => (
              <div
                key={w}
                className="bg-white rounded-2xl p-4 border border-night/5 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-waDark shrink-0" />
                <span className="text-sm text-night/80 font-medium">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREZZO */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x max-w-2xl">
          <div className="bg-cream rounded-3xl p-8 md:p-10 border border-night/5">
            <p className="text-xs font-bold text-waDark uppercase tracking-widest mb-3">
              Prezzo
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-night tracking-tight mb-6">
              Prenotly Pro
            </h2>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-sm text-night/50">da €</span>
              <span className="text-5xl font-bold text-night tracking-tighter">29,99</span>
              <span className="text-sm text-night/50">/mese</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Agenda intelligente",
                "Servizi illimitati",
                "Prenotazioni in tempo reale",
                "Sync Google Calendar",
                "Promemoria anti no-show",
                "Multi-operatore",
                "Zero commissioni",
                "Supporto in italiano",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-night/80">
                  <Check size={16} className="text-waDark mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="space-y-2.5">
              <Link
                href="/signup"
                className="w-full bg-night hover:bg-night/90 text-white py-4 rounded-full font-semibold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Inizia 48 ore gratis
                <ArrowRight size={18} />
              </Link>
              <p className="text-xs text-night/50 text-center">
                Pagamento annuale · 359,88 € + IVA · Nessuna carta richiesta
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-16 md:py-24 bg-night text-white">
        <div className="container-x max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Hai domande?
          </h2>
          <p className="text-white/60 mb-8">
            Scrivici su WhatsApp. Ti rispondiamo in giornata.
          </p>
          <a
            href="https://wa.me/message/LLEKTVFCRCPVB1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-wa hover:bg-wa/90 px-7 py-4 rounded-full font-semibold transition active:scale-[0.98]"
          >
            <MessageCircle size={18} />
            Parla con noi
          </a>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
