import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  FileText, Shield, Cookie, Lock, AlertTriangle, ArrowRight
} from "lucide-react";

export const metadata = {
  title: "Documenti Legali — Prenotly",
  description: "Tutti i documenti legali di Prenotly: termini, privacy, cookie, DPA e disclaimer.",
};

export default function LegalPage() {
  const docs = [
    {
      icon: FileText,
      title: "Termini e Condizioni di Servizio",
      desc: "Regole generali di utilizzo della piattaforma, piani, pagamenti e responsabilità.",
      href: "/termini",
    },
    {
      icon: Shield,
      title: "Informativa Privacy",
      desc: "Come trattiamo i dati personali ai sensi del GDPR. Include il ruolo di Titolare e Responsabile.",
      href: "/privacy",
    },
    {
      icon: Cookie,
      title: "Cookie Policy",
      desc: "Quali cookie utilizziamo, perché, e come gestire le tue preferenze.",
      href: "/cookie",
    },
    {
      icon: Lock,
      title: "Accordo sul Trattamento dei Dati (DPA)",
      desc: "Accordo ai sensi dell'art. 28 GDPR tra Prenotly (Responsabile) e il Cliente (Titolare).",
      href: "/dpa",
    },
    {
      icon: AlertTriangle,
      title: "Disclaimer",
      desc: "Esclusione di responsabilità relativa all'uso del sito e dei contenuti.",
      href: "/disclaimer",
    },
  ];

  return (
    <main>
      <Navbar />
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-cream">
        <div className="container-x max-w-3xl">
          <p className="text-xs font-bold text-waDark uppercase tracking-widest mb-3">
            Informazioni legali
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-night tracking-tight mb-4">
            Documenti Legali
          </h1>
          <p className="text-night/60 text-base md:text-lg">
            Tutti i documenti che regolano l'uso di Prenotly, in conformità alla normativa italiana ed europea (GDPR, Codice del Consumo, D.Lgs. 70/2003).
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container-x max-w-3xl space-y-4">
          {docs.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="block bg-cream rounded-3xl p-6 border border-night/5 hover:border-night/20 transition group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-night flex items-center justify-center shrink-0">
                  <d.icon size={22} className="text-wa" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h2 className="text-lg font-bold text-night">{d.title}</h2>
                    <ArrowRight size={18} className="text-night/30 group-hover:text-waDark group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                  <p className="text-sm text-night/60 leading-relaxed">{d.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
