"use client";
import { useState } from "react";
import { Plus, Minus, MessageCircle } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      q: "I miei clienti devono scaricare un'app o registrarsi?",
      a: "Assolutamente no, ed è proprio questo il punto. Il 90% delle app viene abbandonata al momento del download. I tuoi clienti usano WhatsApp che hanno già aperto sul telefono, e il tuo spazio si apre con un link in un secondo. Zero attrito, zero scuse, zero clienti persi per pigrizia."
    },
    {
      q: "Devo cambiare numero di telefono o gestionale?",
      a: "No. Lavoriamo con il numero che hai già (o ti diamo un numero dedicato se preferisci, così separi vita privata e lavoro). Se usi Google Calendar, si collega a quello. Se non lo usi, lo configuriamo noi per te. In ogni caso, non devi cambiare nulla di ciò che funziona già."
    },
    {
      q: "La segreteria risponde davvero come farei io?",
      a: "Sì, e anche meglio. Viene addestrata con il tuo tono, i tuoi orari, i tuoi servizi, le tue regole. Sa cosa dire e cosa non dire, quando confermare e quando passarti la conversazione. E soprattutto: non si stanca mai, non sbaglia mai, non prende ferie."
    },
    {
      q: "Come gestisce i doppioni e gli slot già occupati?",
      a: "Legge il tuo calendario in tempo reale. Se uno slot è già prenotato, non lo mostra nemmeno al cliente: gli propone automaticamente il primo orario libero. Zero doppioni, zero sovrapposizioni, zero imbarazzi."
    },
    {
      q: "Se un cliente vuole parlare con me, cosa succede?",
      a: "La segreteria ti passa il controllo immediatamente. Tu rispondi dal tuo WhatsApp come hai sempre fatto, lei resta in silenzio finché non ha di nuovo senso riprendere. Nessuna conversazione persa, nessun cliente lasciato a metà."
    },
    {
      q: "Quanto costa e cosa include?",
      a: "Dipende dal volume: quante prenotazioni/ordini ricevi al mese, quanti operatori sei, se vuoi anche la parte di pagamento online. Iniziamo sempre con una prova gratuita di 14 giorni. Poi decidiamo insieme il piano più adatto. Niente contratti lunghi, niente costi nascosti."
    },
    {
      q: "Quanto tempo ci vuole per partire?",
      a: "Dieci minuti. Ti creiamo il tuo spazio, carichiamo menu o servizi, colleghiamo il numero WhatsApp, e sei online. Se hai già i dati pronti, possiamo farlo insieme in una call da 15 minuti."
    },
    {
      q: "E se non funziona o non mi trovo bene?",
      a: "Non ti chiediamo di crederci sulla fiducia. Provalo gratis per 14 giorni, con i tuoi dati reali, i tuoi clienti veri. Se non fa per te, disdici con un click. Nessun vincolo, nessuna penale."
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="container-x max-w-3xl">
        <div className="text-center mb-12 md:mb-14">
          <span className="inline-block bg-wa/10 text-waDark text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Domande frequenti
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-night">
            Le domande che ti stai facendo adesso
          </h2>
          <p className="text-gray-600 mt-4 text-base md:text-lg">
            Risposte dirette, senza giri di parole.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="bg-soft rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left p-5 md:p-6 font-semibold text-night flex justify-between items-center gap-4 active:bg-gray-50"
              >
                <span className="text-sm md:text-base">{f.q}</span>
                <span className="shrink-0 w-8 h-8 rounded-full bg-wa/10 text-waDark flex items-center justify-center">
                  {open === i ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>
              {open === i && (
                <div className="px-5 md:px-6 pb-6 text-sm md:text-base text-gray-600 leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-600 mb-4">Non hai trovato quello che cercavi?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="https://wa.me/393934842118?text=Ciao%20Prenotly!%20Ho%20una%20domanda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-wa hover:bg-waDark text-white px-6 py-3 rounded-full font-semibold transition active:scale-95 w-full sm:w-auto justify-center"
            >
              <MessageCircle size={18} />
              Scrivici su WhatsApp
            </a>
            <a
              href="mailto:info@prenotly-italia.it"
              className="inline-flex items-center gap-2 border border-gray-300 hover:border-wa text-night px-6 py-3 rounded-full font-semibold transition active:scale-95 w-full sm:w-auto justify-center"
            >
              info@prenotly-italia.it
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
