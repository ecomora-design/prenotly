"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      q: "I miei clienti devono scaricare un'app?",
      a: "No. Prenotano dal browser, ricevono conferma su WhatsApp. Nessuna app, nessuna registrazione.",
    },
    {
      q: "Serve un numero WhatsApp dedicato?",
      a: "Puoi usare il tuo numero esistente oppure attivare un numero dedicato. Ti aiutiamo noi nella configurazione.",
    },
    {
      q: "Funziona con la mia agenda attuale?",
      a: "Prenotly Pro si sincronizza con Google Calendar in tempo reale. Se non lo usi, puoi gestire tutto dalla nostra dashboard.",
    },
    {
      q: "Quanto costa davvero?",
      a: "29,99 €/mese, IVA esclusa. Pagamento annuale di 359,88 €. Nessuna commissione sui tuoi incassi.",
    },
    {
      q: "Se non mi trovo bene?",
      a: "Provi 48 ore gratis. Se attivi e poi cambi idea, puoi disdire quando vuoi senza penali.",
    },
    {
      q: "Ci sono costi nascosti?",
      a: "No. Zero commissioni, zero costi di attivazione. Paghi solo l'abbonamento annuale.",
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container-x max-w-3xl">
        <div className="mb-10 md:mb-14">
          <p className="text-xs font-bold text-waDark uppercase tracking-widest mb-3">
            Domande frequenti
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-night tracking-tight">
            Le risposte che cerchi.
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className="bg-white rounded-2xl border border-night/5 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left p-5 font-semibold text-night flex justify-between items-center gap-4"
              >
                <span className="text-[15px]">{f.q}</span>
                <span className="shrink-0 w-7 h-7 rounded-full bg-cream flex items-center justify-center">
                  {open === i ? (
                    <Minus size={16} className="text-waDark" />
                  ) : (
                    <Plus size={16} className="text-night/60" />
                  )}
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-night/60 leading-relaxed">
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
