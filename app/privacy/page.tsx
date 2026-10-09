import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Prenotly",
  description:
    "Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR).",
};

export default function PrivacyPage() {
  return (
    <main>
      <Navbar />

      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-to-b from-white to-soft">
        <div className="container-x max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-wa mb-6"
          >
            <ArrowLeft size={16} /> Torna alla home
          </Link>

          <h1 className="text-3xl md:text-5xl font-bold text-night mb-4">
            Informativa Privacy
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Ai sensi degli articoli 13 e 14 del Regolamento UE 2016/679 (GDPR)
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container-x max-w-3xl prose prose-slate">
          <div className="space-y-8 text-gray-700 leading-relaxed">

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                1. Titolare del trattamento
              </h2>
              <p>
                Il Titolare del trattamento dei dati personali è:
              </p>
              <div className="bg-soft rounded-xl p-4 mt-3 text-sm">
                <p className="font-semibold text-night">Prenotly</p>
                <p>Partita IVA: 01800600882</p>
                <p>Email: info@prenotly-italia.it</p>
                <p>WhatsApp: +39 393 484 2118</p>
                <p>Sito web: prenotly-italia.it</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                2. Tipologie di dati raccolti
              </h2>
              <p>
                Durante l'utilizzo del servizio Prenotly, possiamo raccogliere le seguenti categorie di dati personali:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Dati identificativi</strong>: nome, cognome, ragione sociale dell'attività</li>
                <li><strong>Dati di contatto</strong>: indirizzo email, numero di telefono, numero WhatsApp</li>
                <li><strong>Dati fiscali</strong>: Partita IVA, codice fiscale (per la fatturazione)</li>
                <li><strong>Dati di utilizzo</strong>: prenotazioni, ordini, interazioni con il servizio</li>
                <li><strong>Dati tecnici</strong>: indirizzo IP, tipo di browser, dispositivo utilizzato</li>
                <li><strong>Cookie e tecnologie simili</strong>: per il funzionamento del sito</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                3. Finalità del trattamento
              </h2>
              <p>I dati personali sono trattati per le seguenti finalità:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Erogazione del servizio</strong>: gestione di prenotazioni, ordini e appuntamenti</li>
                <li><strong>Gestione del rapporto contrattuale</strong>: fatturazione, assistenza, comunicazioni di servizio</li>
                <li><strong>Comunicazioni commerciali</strong>: invio di informazioni su aggiornamenti e novità (previo consenso)</li>
                <li><strong>Adempimenti legali</strong>: obblighi fiscali, contabili e normativi</li>
                <li><strong>Sicurezza</strong>: prevenzione di frodi e abusi del servizio</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                4. Base giuridica del trattamento
              </h2>
              <p>Il trattamento si fonda su:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Esecuzione del contratto</strong>: per erogare il servizio richiesto</li>
                <li><strong>Consenso dell'interessato</strong>: per comunicazioni di marketing e cookie non necessari</li>
                <li><strong>Obbligo legale</strong>: per adempimenti fiscali e contabili</li>
                <li><strong>Legittimo interesse</strong>: per migliorare il servizio e garantire la sicurezza</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                5. Modalità del trattamento
              </h2>
              <p>
                Il trattamento dei dati avviene con strumenti informatici e telematici, adottando misure di sicurezza tecniche e organizzative adeguate a proteggere i dati da accessi non autorizzati, perdita, distruzione o diffusione illecita.
              </p>
              <p className="mt-3">
                I dati sono trattati in conformità al GDPR e alla normativa italiana vigente in materia di protezione dei dati personali.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                6. Comunicazione e diffusione dei dati
              </h2>
              <p>I dati personali possono essere comunicati a:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Fornitori di servizi tecnici</strong>: hosting, database, servizi cloud (es. Vercel, Supabase)</li>
                <li><strong>Servizi di comunicazione</strong>: WhatsApp Business API (Meta) per l'invio di notifiche</li>
                <li><strong>Consulenti fiscali e contabili</strong>: per adempimenti di legge</li>
                <li><strong>Autorità pubbliche</strong>: quando richiesto dalla legge</li>
              </ul>
              <p className="mt-3">
                I dati <strong>non vengono mai venduti</strong> a terze parti.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                7. Trasferimento dei dati all'estero
              </h2>
              <p>
                Alcuni fornitori di servizi (es. Vercel, Supabase, Meta) possono trattare i dati al di fuori dell'Unione Europea. In questi casi, il trasferimento avviene nel rispetto delle garanzie previste dal GDPR (Clausole Contrattuali Standard, decisioni di adeguatezza).
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                8. Periodo di conservazione
              </h2>
              <p>I dati sono conservati per:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Dati contrattuali</strong>: per la durata del contratto e 10 anni successivi (obblighi fiscali)</li>
                <li><strong>Dati di marketing</strong>: fino a revoca del consenso</li>
                <li><strong>Dati di navigazione</strong>: massimo 24 mesi</li>
                <li><strong>Dati di prenotazioni/ordini</strong>: 24 mesi dalla data di utilizzo, salvo diversi obblighi di legge</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                9. Diritti dell'interessato
              </h2>
              <p>
                In qualità di interessato, hai il diritto di:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Accesso</strong>: ottenere conferma dell'esistenza dei tuoi dati e copia degli stessi</li>
                <li><strong>Rettifica</strong>: correggere dati inesatti o incompleti</li>
                <li><strong>Cancellazione</strong>: richiedere la rimozione dei tuoi dati ("diritto all'oblio")</li>
                <li><strong>Limitazione</strong>: limitare il trattamento in determinati casi</li>
                <li><strong>Portabilità</strong>: ricevere i tuoi dati in formato strutturato</li>
                <li><strong>Opposizione</strong>: opporti al trattamento per motivi legittimi</li>
                <li><strong>Revoca del consenso</strong>: in qualsiasi momento, senza pregiudicare la liceità del trattamento precedente</li>
              </ul>
              <p className="mt-3">
                Per esercitare questi diritti, scrivi a{" "}
                <a href="mailto:info@prenotly-italia.it" className="text-wa font-semibold hover:underline">
                  info@prenotly-italia.it
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                10. Reclamo all'autorità di controllo
              </h2>
              <p>
                Se ritieni che il trattamento dei tuoi dati violi il GDPR, puoi presentare reclamo al{" "}
                <strong>Garante per la protezione dei dati personali</strong>{" "}
                (www.garanteprivacy.it) o all'autorità di controllo del tuo Stato di residenza.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                11. Cookie
              </h2>
              <p>
                Il sito utilizza cookie tecnici necessari al funzionamento (es. sessione di login) e, previo consenso, cookie analitici per migliorare il servizio. Puoi gestire le preferenze dal banner cookie o dalle impostazioni del browser.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-night mb-3">
                12. Modifiche alla presente informativa
              </h2>
              <p>
                Il Titolare si riserva il diritto di modificare questa informativa in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina con la data di aggiornamento.
              </p>
            </div>

            <div className="bg-wa/5 border border-wa/20 rounded-2xl p-5 md:p-6 mt-8">
              <p className="text-sm text-night">
                <strong>Hai domande sulla privacy?</strong> Scrivici a{" "}
                <a href="mailto:info@prenotly-italia.it" className="text-wa font-semibold hover:underline">
                  info@prenotly-italia.it
                </a>{" "}
                oppure su WhatsApp al{" "}
                <a href="https://wa.me/393934842118" target="_blank" rel="noopener noreferrer" className="text-wa font-semibold hover:underline">
                  +39 393 484 2118
                </a>
                .
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
