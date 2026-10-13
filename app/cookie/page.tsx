import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Cookie Policy — Prenotly",
  description: "Informativa sull'uso dei cookie e delle tecnologie di tracciamento.",
};

export default function CookiePage() {
  return (
    <main>
      <Navbar />
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-to-b from-white to-soft">
        <div className="container-x max-w-3xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-wa mb-6">
            <ArrowLeft size={16} /> Torna alla home
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-night mb-4">Cookie Policy</h1>
          <p className="text-gray-500 text-sm mt-2">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container-x max-w-3xl space-y-8 text-gray-700 leading-relaxed">

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">1. Cosa sono i cookie</h2>
            <p>I cookie sono piccoli file di testo che i siti visitati dall'utente inviano al suo terminale, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla successiva visita. I cookie possono essere utilizzati per diverse finalità, tra cui il funzionamento tecnico del sito, la raccolta di informazioni statistiche, la personalizzazione dell'esperienza di navigazione.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">2. Tipologie di cookie utilizzati</h2>
            <p>Il sito <strong>prenotly-italia.it</strong> utilizza le seguenti categorie di cookie:</p>

            <div className="mt-4 space-y-4">
              <div className="bg-soft rounded-xl p-4">
                <h3 className="font-bold text-night mb-1">🍪 Cookie tecnici e necessari</h3>
                <p className="text-sm">Sono indispensabili per il corretto funzionamento del sito e non possono essere disattivati. Consentono, ad esempio, di gestire la sessione di login, ricordare le preferenze di visualizzazione e garantire la sicurezza del sito.</p>
              </div>

              <div className="bg-soft rounded-xl p-4">
                <h3 className="font-bold text-night mb-1">📊 Cookie analitici e di performance</h3>
                <p className="text-sm">Ci aiutano a capire come gli utenti interagiscono con il sito (pagine più visitate, tempo di permanenza, eventuali errori). Questi cookie sono utilizzati in forma aggregata e anonima. Vengono attivati solo previo consenso dell'utente.</p>
              </div>

              <div className="bg-soft rounded-xl p-4">
                <h3 className="font-bold text-night mb-1">🎯 Cookie di profilazione e marketing</h3>
                <p className="text-sm">Sono utilizzati per mostrare annunci pubblicitari personalizzati in base agli interessi dell'utente. Attualmente Prenotly <strong>non utilizza</strong> cookie di questa categoria.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">3. Cookie di terze parti</h2>
            <p>Il sito può utilizzare servizi di terze parti che installano propri cookie, tra cui:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Supabase</strong>: per l'autenticazione e la gestione dei dati (cookie tecnici)</li>
              <li><strong>Vercel</strong>: per l'hosting e l'analisi delle performance (cookie tecnici e analitici)</li>
            </ul>
            <p className="mt-2">Per informazioni sui cookie di questi servizi, si rimanda alle rispettive informative privacy.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">4. Gestione delle preferenze</h2>
            <p>Al primo accesso al sito, l'utente visualizza un banner cookie che consente di:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Accettare tutti i cookie</strong> (tecnici, analitici)</li>
              <li><strong>Rifiutare i cookie non necessari</strong> (mantenendo solo i tecnici)</li>
              <li><strong>Personalizzare le preferenze</strong> per categoria</li>
            </ul>
            <p className="mt-2">L'utente può modificare le proprie scelte in qualsiasi momento accedendo alla funzione "Gestisci preferenze cookie" disponibile nel footer del sito o tramite le impostazioni del proprio browser.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">5. Disabilitazione dei cookie dal browser</h2>
            <p>L'utente può gestire, limitare o disabilitare i cookie anche attraverso le impostazioni del proprio browser. Di seguito i link alle guide dei browser più comuni:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-wa font-semibold hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener noreferrer" className="text-wa font-semibold hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-wa font-semibold hover:underline">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/it-it/windows/eliminare-e-gestire-i-cookie-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-wa font-semibold hover:underline">Microsoft Edge</a></li>
            </ul>
            <p className="mt-3">La disabilitazione dei cookie tecnici potrebbe compromettere il corretto funzionamento del sito.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">6. Modifiche alla Cookie Policy</h2>
            <p>Il Titolare si riserva il diritto di modificare questa Cookie Policy in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina con la data di aggiornamento.</p>
          </div>

          <div className="bg-wa/5 border border-wa/20 rounded-2xl p-5 mt-8">
            <p className="text-sm text-night"><strong>Domande sui cookie?</strong> Scrivici a <a href="mailto:info@prenotly-italia.it" className="text-wa font-semibold hover:underline">info@prenotly-italia.it</a>.</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
