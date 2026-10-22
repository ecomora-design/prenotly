import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
  ArrowLeft, ArrowRight, Check, MessageCircle,
  Calendar, Clock, Bell, Users, BarChart3,
  Scissors, Sparkles, TrendingUp, Shield
} from "lucide-react";

export const metadata = {
  title: "Prenotly Pro — Prenotazioni per beauty, studi e professionisti",
  description:
    "Agenda intelligente con prenotazioni automatiche. Sincronizzata con Google Calendar. Da 29,99 €/mese.",
};

export default function ProPage() {
  const features = [
    { icon: Calendar, title: "Agenda intelligente", text: "Gli slot liberi si aggiornano in tempo reale. Niente doppioni, niente errori." },
    { icon: Clock, title: "Servizi con durata", text: "Taglio 30 min, colore 90 min. Ogni servizio ha il suo tempo, il sistema lo rispetta." },
    { icon: Bell, title: "Promemoria anti no-show", text: "Il cliente riceve un messaggio prima dell'appuntamento. Riduci le assenze." },
    { icon: Users, title: "Multi-operatore", text: "Ogni membro del team ha il suo calendario. Nessuna sovrapposizione." },
    { icon: TrendingUp, title: "Sync Google Calendar", text: "Gli appuntamenti finiscono direttamente nella tua agenda Google, in automatico." },
    { icon: BarChart3, title: "Dashboard completa", text: "Vedi chi prenota, quando, e quanto incassi. Tutto in un unico posto." },
  ];

  const whoItsFor = [
    "Studi medici e dentistici",
    "Consulenti e avvocati",
    "Psicologi e terapeuti",
    "Fisioterapisti e osteopati",
    "Beauty e parrucchieri",
    "Nutrizionisti e coach",
    "Personal trainer",
    "Palestre e wellness",
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

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Prenotly Pro</span>
              </div>

              <h1 className="text-[40px] leading-[1.05] md:text-6xl md:leading-[1.02] font-bold text-[#0A2540] tracking-[-0.03em] mb-6">
                Agenda piena.<br />
                <span className="bg-gradient-to-r from-[#128C7E] via-[#25D366] to-[#0F766E] bg-clip-text text-transparent">
                  Telefono muto.
                </span>
              </h1>

              <p className="text-base md:text-lg text-[#425466] leading-relaxed mb-8">
                Per qualsiasi attività che lavora su appuntamento: studi, professionisti, beauty, palestre, consulenti. I clienti prenotano online, tu ricevi tutto in agenda.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  href="/signup"
                  className="group bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white px-7 py-4 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#25D366]/30 inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  Prova 48 ore gratis
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="https://wa.me/message/LLEKTVFCRCPVB1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-[#E6EBF1] hover:border-[#0A2540]/30 text-[#0A2540] px-7 py-4 rounded-full font-bold text-sm transition inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Parla con noi
                </a>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#425466]/70">
                {["Zero commissioni", "Sync Google Calendar", "Disdici quando vuoi"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 font-medium">
                    <Check size={14} className="text-[#22C55E]" strokeWidth={3} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Mockup agenda */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#25D366]/10 blur-3xl rounded-full" />
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-[#0A2540]/20 p-5 border border-[#E6EBF1] max-w-sm mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-[#E6EBF1]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-white font-bold">
                      SP
                    </div>
                    <div>
                      <p className="font-bold text-[#0A2540] text-sm">Studio Professionale</p>
                      <p className="text-[11px] text-[#425466]/60">Oggi, 3 appuntamenti</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  {[
                    { time: "09:00", dur: "45m", name: "Mario - Consulenza", active: true },
                    { time: "11:00", dur: "90m", name: "Giulia - Seduta", active: false },
                    { time: "15:00", dur: "45m", name: "Luca - Incontro", active: false },
                  ].map((apt) => (
                    <div key={apt.time} className="flex items-center gap-3 p-3 bg-[#FAFBFC] rounded-xl border border-[#E6EBF1]">
                      <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${apt.active ? "bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white" : "bg-[#0A2540]/10 text-[#0A2540]"}`}>
                        <span className="text-[9px] font-bold">{apt.time}</span>
                        <span className="text-[10px]">{apt.dur}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0A2540]">{apt.name}</p>
                        <p className="text-xs text-[#425466]/60">Confermato</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-5 shadow-sm">
              <Sparkles size={12} className="text-[#25D366]" />
              <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Cosa include</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight">
              Tutto per gestire<br />
              <span className="text-[#425466]">la tua agenda.</span>
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

      {/* PER CHI È */}
      <section className="py-16 md:py-24 bg-[#FAFBFC]">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight">
              Chiunque lavori<br />
              <span className="text-[#425466]">su appuntamento.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {whoItsFor.map((w) => (
              <div key={w} className="bg-white rounded-xl p-4 border border-[#E6EBF1] flex items-center gap-3 hover:border-[#25D366]/30 transition">
                <div className="w-2 h-2 rounded-full bg-[#25D366] shrink-0" />
                <span className="text-xs text-[#0A2540] font-semibold">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREZZO */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-8 border border-[#E6EBF1] shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                <Scissors size={22} className="text-[#128C7E]" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0A2540]">Prenotly Pro</h2>
                <p className="text-xs text-[#425466]/60">Beauty, studi, professionisti</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#E6EBF1]">
              <span className="text-xs font-semibold text-[#425466]">€</span>
              <span className="text-5xl font-bold text-[#0A2540] tracking-tight">29,99</span>
              <span className="text-sm text-[#425466]/60 font-semibold">/mese</span>
            </div>

            <ul className="space-y-2.5 mb-6">
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
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <div className="w-4 h-4 rounded-full bg-[#25D366]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={10} className="text-[#128C7E]" strokeWidth={3} />
                  </div>
                  <span className="text-[#425466]">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white py-3.5 rounded-full font-bold text-sm transition inline-flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 active:scale-[0.98]"
            >
              Inizia 48 ore gratis
              <ArrowRight size={15} />
            </Link>
            <p className="text-[10px] text-[#425466]/50 text-center mt-3">
              Pagamento annuale · 359,88 € + IVA · Nessuna carta richiesta
            </p>
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
                Hai domande?<br />
                <span className="text-[#25D366]">Parliamone.</span>
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
