import { Smartphone, MessageCircle, Zap, Clock, Percent, Activity, Link2 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: Smartphone,
      title: "Il cliente prenota",
      text: "Apre il tuo link, sceglie servizio o piatto, conferma. Nessuna app da scaricare, nessuna registrazione.",
    },
    {
      n: "02",
      icon: MessageCircle,
      title: "Ricevi la notifica",
      text: "Dashboard in tempo reale, suono di avviso, riepilogo su App. Gestisci tutto con un tap.",
    },
    {
      n: "03",
      icon: Zap,
      title: "Sincronizza da solo",
      text: "L'agenda si aggiorna, gli slot occupati si bloccano, i clienti ricevono conferma automatica.",
    },
  ];

  const reasons = [
    { n: "10 min", label: "Per essere online", text: "Registri, carichi menu o servizi, sei operativo.", icon: Clock },
    { n: "0 €", label: "Di commissioni", text: "Non tratteniamo nulla sui tuoi incassi.", icon: Percent },
    { n: "24/7", label: "Sempre attivo", text: "Anche quando sei chiuso, il sistema risponde.", icon: Activity },
    { n: "1 link", label: "Da condividere", text: "Il tuo spazio online, pronto per Instagram.", icon: Link2 },
  ];

  return (
    <>
      {/* COME FUNZIONA */}
      <section className="py-16 md:py-28 bg-[#FAFAF7]">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <p className="text-[10px] font-black text-waDark uppercase brightness-90 tracking-[0.25em] mb-4">
              Come funziona
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-display text-night tracking-tight leading-[1.05]">
              Tre passaggi.<br />
              <span className="italic">Zero complicazioni.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div
                key={s.n}
                className="group relative bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 border border-night/[0.06] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-night flex items-center justify-center transition-transform group-hover:scale-110">
                    <s.icon size={24} className="text-wa" strokeWidth={2} />
                  </div>
                  <span className="text-4xl sm:text-5xl font-display text-night/20">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-display text-night mb-3 leading-tight">
                  {s.title}
                </h3>
                <p className="text-sm text-night/80 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERCHÉ SCEGLIERE */}
      <section className="py-16 md:py-28 bg-white">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <p className="text-[10px] font-black text-waDark uppercase brightness-90 tracking-[0.25em] mb-4">
              Perché Prenotly
            </p>
            <h2 className="text-4xl md:text-6xl font-display text-night tracking-tight leading-[1.05]">
              Fatto semplice.<br />
              <span className="italic">Fatto bene.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {reasons.map((r) => (
              <div
                key={r.n}
                className="group bg-[#FAFAF7] rounded-[24px] md:rounded-[28px] p-5 md:p-7 border border-night/[0.04] hover:border-night/[0.08] hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-night/[0.06] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <r.icon size={18} className="text-waDark" />
                </div>
                <p className="text-3xl md:text-4xl font-display text-night tracking-tight mb-2">
                  {r.n}
                </p>
                <p className="text-[11px] font-black text-night/75 uppercase tracking-widest mb-2">
                  {r.label}
                </p>
                <p className="text-xs text-night/80 leading-relaxed">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
