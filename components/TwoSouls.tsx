import { Utensils, Scissors, ArrowRight } from "lucide-react";

export default function TwoSouls() {
  return (
    <section className="py-20 md:py-28 bg-soft">
      <div className="container-x">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block bg-wa/10 text-waDark text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Due modalità
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-night">
            Che tu venda cibo o tempo, funziona.
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Il software si adatta al tuo business. Scegli la modalità che ti serve e attiva solo quello che ti serve.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div id="ristoranti" className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 hover:shadow-xl transition">
            <div className="w-14 h-14 rounded-2xl bg-wa/10 flex items-center justify-center mb-6">
              <Utensils className="text-waDark" size={28} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-night mb-3">
              🍕 Ristoranti & Asporto
            </h3>
            <p className="text-gray-600 mb-6">
              Menu digitale con foto, prezzi e descrizioni. Il cliente sceglie, riempie il carrello, sceglie orario e tipo (asporto o domicilio). La segreteria conferma e ti avvisa quando l&apos;ordine è pronto.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Menu digitale con foto e categorie",
                "Carrello e checkout dal telefono",
                "Gestione asporto o domicilio con zone",
                "Slot di ritiro/consegna aggiornati in tempo reale",
                "Conferma + avviso quando è pronto",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-gray-700">
                  <span className="text-wa font-bold mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a href="#demo" className="inline-flex items-center gap-2 text-waDark font-semibold hover:gap-3 transition-all">
              Scopri la modalità ristoranti <ArrowRight size={18} />
            </a>
          </div>

          <div id="servizi" className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 hover:shadow-xl transition">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-6">
              <Scissors className="text-violet-500" size={28} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-night mb-3">
              💇 Parrucchieri & Servizi
            </h3>
            <p className="text-gray-600 mb-6">
              Calendario intelligente che mostra solo gli orari davvero liberi. Il cliente prenota in 3 tap, la segreteria WhatsApp conferma e sincronizza l&apos;appuntamento con Google Calendar.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Calendario con slot liberi in tempo reale",
                "Prenotazione in 3 tap dal telefono",
                "Sync automatico con Google Calendar",
                "Promemoria anti no-show automatici",
                "Multi-operatore e multi-servizio",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-gray-700">
                  <span className="text-violet-500 font-bold mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a href="#demo" className="inline-flex items-center gap-2 text-violet-500 font-semibold hover:gap-3 transition-all">
              Scopri la modalità servizi <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
