import Link from "next/link";
import { Check, X, ArrowRight, Sparkles, TrendingDown } from "lucide-react";

export default function Comparison() {
  const rows = [
    { feature: "Commissioni su ogni prenotazione", competitor: "20-30%", prenotly: "0%", highlight: true },
    { feature: "Costo fisso mensile", competitor: "Nascosto", prenotly: "da 9,99 €", highlight: true },
    { feature: "Gestione staff (turni, ruoli)", competitor: "A pagamento extra", prenotly: "Incluso*", highlight: false },
    { feature: "Sync Google Calendar", competitor: "A pagamento extra", prenotly: "Incluso", highlight: false },
    { feature: "Menu digitale + QR", competitor: null, prenotly: "Incluso", highlight: false },
    { feature: "Ordini asporto / domicilio", competitor: null, prenotly: "Incluso", highlight: false },
    { feature: "Promemoria anti no-show", competitor: "A pagamento extra", prenotly: "Incluso", highlight: false },
    { feature: "Statistiche e report", competitor: "A pagamento extra", prenotly: "Incluso", highlight: false },
    { feature: "Dati tuoi, al 100%", competitor: "Condivisi", prenotly: "Solo tuoi", highlight: true },
    { feature: "Disdetta", competitor: "Vincoli contrattuali", prenotly: "1 click", highlight: false },
  ];

  return (
    <section className="py-14 md:py-28 bg-white">
      <div className="container-x">
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-4">
            <TrendingDown size={14} />
            La differenza è netta
          </div>
          <h2 className="text-[26px] leading-tight sm:text-3xl md:text-5xl font-bold text-night mb-4">
            Perché pagare commissioni<br />
            <span className="text-[#128C7E]">quando puoi avere tutto?</span>
          </h2>
          <p className="text-gray-600 text-[15px] md:text-lg max-w-xl mx-auto">
            TheFork e Treatwell ti prendono il <strong>20-30% su ogni prenotazione</strong>.
            Prenotly parte da <strong>9,99 € al mese</strong>. Punto.
          </p>
        </div>

        {/* TABELLA DESKTOP */}
        <div className="hidden md:block max-w-4xl mx-auto">
          <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-3 bg-[#FAFBFC] border-b border-gray-200">
              <div className="p-4 md:p-5 text-xs font-black uppercase tracking-wider text-gray-500">Caratteristica</div>
              <div className="p-4 md:p-5 text-xs font-black uppercase tracking-wider text-gray-500 text-center border-l border-gray-200">TheFork / Treatwell</div>
              <div className="p-4 md:p-5 text-xs font-black uppercase tracking-wider text-[#128C7E] text-center border-l border-gray-200 bg-[#25D366]/5">Prenotly</div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 border-b border-gray-100 last:border-b-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]/50"}`}>
                <div className="p-4 md:p-5 text-sm font-medium text-night">{row.feature}</div>
                <div className="p-4 md:p-5 text-sm text-center border-l border-gray-100 flex items-center justify-center gap-2 text-gray-500">
                  {row.competitor ? (
                    <>
                      <X size={14} className="text-red-400 shrink-0" />
                      <span>{row.competitor}</span>
                    </>
                  ) : (
                    <>
                      <X size={14} className="text-red-400 shrink-0" />
                      <span className="text-gray-400">Non disponibile</span>
                    </>
                  )}
                </div>
                <div className={`p-4 md:p-5 text-sm text-center border-l border-gray-100 flex items-center justify-center gap-2 bg-[#25D366]/5 ${row.highlight ? "font-bold text-[#128C7E]" : "font-medium text-night"}`}>
                  <Check size={14} className="text-[#25D366] shrink-0" strokeWidth={3} />
                  <span>{row.prenotly}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-500 text-center mt-4">
            * Staff illimitato incluso nel piano Servizi Premium / Premium Pro (99,99 €/mese). Sugli altri piani è disponibile come upgrade.
          </p>
        </div>

        {/* CARDS MOBILE */}
        <div className="md:hidden space-y-3 max-w-lg mx-auto">
          {rows.map((row) => (
            <div key={row.feature} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">{row.feature}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                    <X size={11} className="text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Loro</p>
                    <p className="text-xs text-gray-500 leading-tight">
                      {row.competitor || "Non disponibile"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#25D366]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} className="text-[#128C7E]" strokeWidth={3} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-[#128C7E] uppercase tracking-wider mb-0.5">Prenotly</p>
                    <p className={`text-xs leading-tight ${row.highlight ? "font-bold text-night" : "text-night/80"}`}>
                      {row.prenotly}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-gray-500 text-center pt-2 px-2">
            * Staff illimitato incluso nel piano Servizi Premium / Premium Pro (99,99 €/mese).
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-10 md:mt-14">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white px-7 md:px-9 py-4 rounded-full font-bold text-sm md:text-base transition-all shadow-lg shadow-[#25D366]/30 active:scale-[0.98]"
          >
            <Sparkles size={16} />
            Prova gratis 7 giorni
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-xs text-gray-500 mt-3">Nessuna carta richiesta. Disdici quando vuoi.</p>
        </div>
      </div>
    </section>
  );
}
