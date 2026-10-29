import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Termini e Condizioni di Servizio — Prenotly",
  description: "Condizioni generali di utilizzo della piattaforma Prenotly.",
};

export default function TerminiPage() {
  return (
    <main>
      <Navbar />
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-to-b from-white to-soft">
        <div className="container-x max-w-3xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-wa mb-6">
            <ArrowLeft size={16} /> Torna alla home
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-night mb-4">Termini e Condizioni di Servizio</h1>
          <p className="text-gray-500 text-sm mt-2">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</p>
        </div>
      </section>
      <section className="py-12 md:py-16 bg-white">
        <div className="container-x max-w-3xl space-y-8 text-gray-700 leading-relaxed">

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">1. Informazioni generali</h2>
            <p>I presenti Termini e Condizioni regolano l'utilizzo della piattaforma <strong>Prenotly</strong> (di seguito "Piattaforma" o "Servizio"), accessibile tramite il sito <strong>prenotly-italia.it</strong>.</p>
            <p className="mt-2">La Piattaforma è di proprietà di <strong>Prenotly</strong>, con sede legale in Italia, P.IVA <strong>01800600882</strong>, email <strong>info@prenotly-italia.it</strong> (di seguito "Fornitore").</p>
            <p className="mt-2">L'utilizzo del Servizio implica l'accettazione integrale dei presenti Termini. Se non si accettano queste condizioni, si invita a non utilizzare la Piattaforma.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">2. Descrizione del Servizio</h2>
            <p>Prenotly è una piattaforma Software-as-a-Service (SaaS) multi-tenant che consente alle attività commerciali (ristoranti, parrucchieri, studi professionali, ecc.) di:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Creare e gestire un menu o un listino servizi digitale</li>
              <li>Ricevere ordini e prenotazioni online</li>
              <li>Gestire ordini e prenotazioni tramite un'automazione integrata con App</li>
              <li>Sincronizzare gli appuntamenti con Google Calendar</li>
              <li>Monitorare statistiche e dati della propria attività</li>
            </ul>
            <p className="mt-2">Il Servizio è offerto in modalità multi-tenant: una singola istanza applicativa serve più clienti, i cui dati sono isolati tramite politiche di Row Level Security (RLS) implementate a livello di database.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">3. Registrazione e Account</h2>
            <p>Per utilizzare il Servizio, il Cliente deve creare un account fornendo informazioni veritiere, complete e aggiornate. Il Cliente è responsabile della custodia delle proprie credenziali di accesso e di tutte le attività effettuate tramite il proprio account.</p>
            <p className="mt-2">La registrazione è riservata a soggetti maggiorenni e, per le attività commerciali, a soggetti aventi i poteri di rappresentanza necessari.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">4. Piani e Pagamenti</h2>
            <p>Il Servizio è offerto tramite un periodo di prova gratuita di 48 ore. Al termine del periodo di prova, l'accesso alle funzionalità della Piattaforma e la pubblicazione della web app dell'attività sono subordinati al pagamento di un abbonamento annuale di <strong>€359,88 + IVA</strong>.</p>
            <p className="mt-2">Il pagamento è annuale e anticipato. In caso di mancato pagamento, l'account e la web app pubblica verranno sospesi fino alla regolarizzazione.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">5. Obblighi del Cliente</h2>
            <p>Il Cliente si impegna a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Utilizzare il Servizio in conformità alla legge e ai presenti Termini</li>
              <li>Non effettuare test di penetrazione o valutazioni di vulnerabilità sull'infrastruttura condivisa multi-tenant senza autorizzazione scritta</li>
              <li>Non tentare di estrarre massivamente dati, né di accedere ai dati di altri tenant</li>
              <li>Non rivendere o sublicenziare l'accesso al Servizio senza autorizzazione</li>
              <li>Garantire che i dati dei propri clienti finali siano trattati in conformità al GDPR, fornendo idonea informativa</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">6. Proprietà Intellettuale</h2>
            <p>Il software, il codice sorgente, il design, i marchi e tutti i contenuti della Piattaforma sono di proprietà esclusiva del Fornitore. È vietata qualsiasi riproduzione, modifica o distribuzione non autorizzata.</p>
            <p className="mt-2">I contenuti caricati dal Cliente (menu, servizi, logo, foto) rimangono di proprietà del Cliente, che concede al Fornitore una licenza limitata per l'erogazione del Servizio.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">7. Protezione dei Dati Personali</h2>
            <p>Il trattamento dei dati personali è disciplinato dall'Informativa Privacy e, per i dati dei clienti finali trattati per conto del Cliente, dall'Accordo sul Trattamento dei Dati (DPA).</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">8. Limitazione di Responsabilità</h2>
            <p>Il Servizio è fornito "così com'è" ("as-is"). Il Fornitore non garantisce che il Servizio sia privo di errori o interruzioni. Nei limiti consentiti dalla legge, il Fornitore non è responsabile per danni indiretti, perdita di profitti, o danni derivanti dall'uso del Servizio.</p>
            <p className="mt-2">Il Cliente è l'unico responsabile della veridicità dei contenuti pubblicati e della liceità del trattamento dei dati dei propri clienti finali.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">9. Modifiche ai Termini</h2>
            <p>Il Fornitore si riserva il diritto di modificare i presenti Termini in qualsiasi momento. Le modifiche saranno comunicate tramite email o pubblicate sulla Piattaforma e decorreranno dal momento della pubblicazione.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">10. Legge Applicabile e Foro Competente</h2>
            <p>I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia sarà competente il Foro di <strong>Milano</strong>, salvo diversa disposizione di legge a tutela dei consumatori.</p>
          </div>

          <div className="bg-wa/5 border border-wa/20 rounded-2xl p-5 mt-8">
            <p className="text-sm text-night">
              <strong>Domande?</strong> Scrivici a <a href="mailto:info@prenotly-italia.it" className="text-wa font-semibold hover:underline">info@prenotly-italia.it</a> o su App al <a href="https://wa.me/message/LLEKTVFCRCPVB1" target="_blank" rel="noopener noreferrer" className="text-wa font-semibold hover:underline">+39 393 484 2118</a>.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
