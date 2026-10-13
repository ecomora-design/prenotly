import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Disclaimer — Prenotly",
  description: "Esclusione di responsabilità relativa all'uso del sito e dei contenuti.",
};

export default function DisclaimerPage() {
  return (
    <main>
      <Navbar />
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-to-b from-white to-soft">
        <div className="container-x max-w-3xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-wa mb-6">
            <ArrowLeft size={16} /> Torna alla home
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-night mb-4">Disclaimer</h1>
          <p className="text-gray-500 text-sm mt-2">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container-x max-w-3xl space-y-8 text-gray-700 leading-relaxed">

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">1. Uso del sito</h2>
            <p>Il sito <strong>prenotly-italia.it</strong> e tutti i suoi contenuti sono forniti "così come sono" ("as-is") e "come disponibili" ("as-available"). Prenotly non fornisce alcuna garanzia, esplicita o implicita, sulla completezza, accuratezza, affidabilità o disponibilità del sito.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">2. Limitazione di responsabilità</h2>
            <p>Nei limiti massimi consentiti dalla legge applicabile, Prenotly non sarà responsabile per:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Danni diretti, indiretti, incidentali, consequenziali o punitivi</li>
              <li>Perdita di profitti, dati, opportunità commerciali o avviamento</li>
              <li>Danni derivanti dall'uso o dall'impossibilità di usare il sito o il servizio</li>
              <li>Errori, omissioni o imprecisioni nei contenuti del sito</li>
              <li>Contenuti o danni causati da link a siti di terze parti</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">3. Contenuti pubblicati dai clienti</h2>
            <p>Prenotly è una piattaforma che consente alle attività commerciali di pubblicare i propri contenuti (menu, servizi, foto, prezzi). Il Cliente è l'unico responsabile della veridicità, completezza e liceità di tali contenuti. Prenotly non esercita alcun controllo preventivo sui contenuti caricati e non è responsabile per eventuali violazioni di diritti di terzi o informative ingannevoli.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">4. Servizi di terze parti</h2>
            <p>Il sito può integrare servizi di terze parti (WhatsApp, Google Calendar, Supabase, Vercel). Prenotly non è responsabile per il funzionamento, la disponibilità o le pratiche di tali servizi. L'uso di tali servizi è regolato dai termini e dalle informative dei rispettivi fornitori.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">5. Nessuna consulenza professionale</h2>
            <p>I contenuti del sito e del blog di Prenotly hanno scopo puramente informativo e non costituiscono consulenza legale, fiscale, commerciale o professionale. Per decisioni importanti, si raccomanda di consultare un professionista qualificato.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">6. Modifiche al disclaimer</h2>
            <p>Prenotly si riserva il diritto di modificare questo disclaimer in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina con la data di aggiornamento.</p>
          </div>

          <div className="bg-wa/5 border border-wa/20 rounded-2xl p-5 mt-8">
            <p className="text-sm text-night"><strong>Domande?</strong> Scrivici a <a href="mailto:info@prenotly-italia.it" className="text-wa font-semibold hover:underline">info@prenotly-italia.it</a>.</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
