import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Accordo sul Trattamento dei Dati (DPA) — Prenotly",
  description: "Accordo ai sensi dell'art. 28 GDPR tra Prenotly (Responsabile) e il Cliente (Titolare).",
};

export default function DPAPage() {
  return (
    <main>
      <Navbar />
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-to-b from-white to-soft">
        <div className="container-x max-w-3xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-wa mb-6">
            <ArrowLeft size={16} /> Torna alla home
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-night mb-4">Accordo sul Trattamento dei Dati (DPA)</h1>
          <p className="text-gray-600 text-sm md:text-base">Ai sensi dell'articolo 28 del Regolamento UE 2016/679 (GDPR)</p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container-x max-w-3xl space-y-8 text-gray-700 leading-relaxed">

          <div className="bg-soft rounded-2xl p-6">
            <h2 className="text-lg font-bold text-night mb-3">📌 Le Parti</h2>
            <p className="text-sm"><strong>Titolare del Trattamento (Cliente):</strong> L'attività commerciale (ristorante, parrucchiere, studio, ecc.) che ha sottoscritto l'abbonamento a Prenotly e che determina le finalità e i mezzi del trattamento dei dati personali dei propri clienti finali.</p>
            <p className="text-sm mt-3"><strong>Responsabile del Trattamento (Prenotly):</strong> Prenotly, P.IVA 01800600882, che tratta i dati personali per conto del Titolare al fine di erogare il Servizio, come descritto nell'accordo principale.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">1. Oggetto e durata</h2>
            <p>Il presente DPA disciplina il trattamento dei dati personali effettuato dal Responsabile per conto del Titolare nell'ambito dell'erogazione del Servizio Prenotly. La durata del trattamento coincide con la durata dell'abbonamento attivo.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">2. Natura e finalità del trattamento</h2>
            <p>Il Responsabile tratta i dati personali dei clienti finali del Titolare (nome, numero di telefono, dettagli dell'ordine o della prenotazione) per le seguenti finalità:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Consentire al Titolare di ricevere e gestire ordini e prenotazioni</li>
              <li>Inviare notifiche automatiche relative a ordini e prenotazioni</li>
              <li>Gestire l'agenda e il calendario del Titolare</li>
              <li>Fornire al Titolare statistiche aggregate sui propri clienti</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">3. Obblighi del Titolare</h2>
            <p>Il Titolare garantisce di:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Aver raccolto lecitamente i dati personali dei propri clienti finali, fornendo idonea informativa privacy</li>
              <li>Aver individuato una base giuridica valida per il trattamento (esecuzione del contratto, consenso, ecc.)</li>
              <li>Fornire al Responsabile istruzioni documentate relative al trattamento</li>
              <li>Assicurare la correttezza e l'aggiornamento dei dati forniti</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">4. Obblighi del Responsabile (Prenotly)</h2>
            <p>Prenotly si impegna a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Trattare i dati personali solo su istruzione documentata del Titolare e per le finalità indicate nel presente DPA</li>
              <li>Garantire che le persone autorizzate al trattamento si siano impegnate alla riservatezza</li>
              <li>Adottare tutte le misure di sicurezza tecniche e organizzative richieste dall'art. 32 GDPR</li>
              <li>Assistere il Titolare nel rispondere alle richieste di esercizio dei diritti degli interessati</li>
              <li>Notificare al Titolare, senza ingiustificato ritardo, qualsiasi violazione dei dati personali (data breach) di cui venga a conoscenza</li>
              <li>Cancellare o restituire i dati personali al termine della prestazione dei servizi, su scelta del Titolare</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">5. Sub-responsabili del trattamento</h2>
            <p>Il Titolare autorizza il Responsabile a ricorrere ai seguenti sub-responsabili per l'erogazione del Servizio:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Supabase Inc.</strong> — Hosting database e autenticazione (USA, con garanzie SCC)</li>
              <li><strong>Vercel Inc.</strong> — Hosting applicazione (USA, con garanzie SCC)</li>
              <li><strong>Meta Platforms Ireland Ltd.</strong> — WhatsApp Business API (Irlanda/UE)</li>
            </ul>
            <p className="mt-2">Il Responsabile si impegna a notificare al Titolare qualsiasi modifica prevista all'elenco dei sub-responsabili almeno 30 giorni prima, dando la possibilità di opporsi.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">6. Misure di sicurezza</h2>
            <p>Prenotly adotta le seguenti misure tecniche e organizzative:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Isolamento dei dati tramite Row Level Security (RLS) a livello di database</li>
              <li>Crittografia dei dati in transito (HTTPS) e a riposo</li>
              <li>Autenticazione a più fattori per l'accesso agli account amministrativi</li>
              <li>Backup giornalieri del database</li>
              <li>Monitoraggio degli accessi e dei log di sistema</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">7. Trasferimento dei dati all'estero</h2>
            <p>I dati possono essere trasferiti al di fuori dell'UE verso i sub-responsabili indicati. Tali trasferimenti avvengono nel rispetto delle Clausole Contrattuali Standard (SCC) approvate dalla Commissione Europea.</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">8. Cancellazione e restituzione dei dati</h2>
            <p>Al termine del rapporto contrattuale, il Responsabile, su scelta del Titolare, cancellerà o restituirà tutti i dati personali trattati, salvo che la legge imponga la conservazione per periodi più lunghi (es. obblighi fiscali).</p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-night mb-3">9. Responsabilità</h2>
            <p>Il Titolare è responsabile della liceità del trattamento e del rispetto degli obblighi informativi verso gli interessati. Il Responsabile è responsabile del trattamento dei dati in conformità alle istruzioni ricevute e al presente DPA.</p>
          </div>

          <div className="bg-wa/5 border border-wa/20 rounded-2xl p-5 mt-8">
            <p className="text-sm text-night"><strong>Questo documento è accettato automaticamente al momento della sottoscrizione dell'abbonamento a Prenotly.</strong> Per qualsiasi chiarimento, scrivici a <a href="mailto:info@prenotly-italia.it" className="text-wa font-semibold hover:underline">info@prenotly-italia.it</a>.</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
