"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      q: "I miei clienti devono scaricare un'app?",
      a: "No. Prenotano dal browser, ricevono conferma su App. Nessuna app, nessuna registrazione.",
    },
    {
      q: "Serve un numero App dedicato?",
      a: "Puoi usare il tuo numero esistente oppure attivare un numero dedicato. Ti aiutiamo noi nella configurazione.",
    },
    {
      q: "Funziona con la mia agenda attuale?",
      a: "Prenotly Pro si sincronizza con Google Calendar in tempo reale. Se non lo usi, puoi gestire tutto dalla nostra dashboard.",
    },
    {
      q: "Quanto costa davvero?",
      a: "I piani partono da 9,99 €/mese per il solo menu. Il piano completo con ordini e tavoli costa 29,99 €/mese. Nessuna commissione sui tuoi incassi.",
    },
    {
      q: "Se non mi trovo bene?",
      a: "Provi 7 giorni gratis. Se attivi e poi cambi idea, puoi disdire quando vuoi senza penali.",
    },
    {
      q: "Ci sono costi nascosti?",
      a: "No. Zero commissioni, zero costi di attivazione. Paghi solo l'abbonamento annuale.",
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 md:py-28 bg-[#FAFAF7]">
      <div className="container-x max-w-3xl">
        <div className="text-center mb-14 md:mb-16">
          <p className="text-[10px] font-black text-[#0F766E] uppercase tracking-[0.25em] mb-4">
            Domande frequenti
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display text-night tracking-tight leading-tight">
            Le risposte<br />
            <span className="italic">che cerchi.</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                open === i ? "border-night/15 shadow-lg" : "border-night/[0.06] hover:border-night/10"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left p-4 sm:p-5 md:p-6 font-display text-base sm:text-lg text-night flex justify-between items-center gap-3"
              >
                <span>{f.q}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${open === i ? "bg-night text-wa" : "bg-[#FAFAF7] text-night/70"}`}>
                  {open === i ? <Minus size={14} /> : <Plus size={14} />}
                </div>
              </button>
              {open === i && (
                <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 text-sm text-night/80 leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
