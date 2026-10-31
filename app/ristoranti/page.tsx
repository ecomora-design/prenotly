import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AppButton from "@/components/AppButton";
import {
  ArrowLeft, ArrowRight, Check, MessageCircle,
  ShoppingBag, Menu, Truck, Store, Bell, BarChart3,
  Clock, Smartphone
} from "lucide-react";

export const metadata = {
  title: "Prenotly Food — Menu digitale e ordini per ristoranti",
  description:
    "Menu digitale, ordini, prenotazioni tavoli. Da 9,99 €/mese (solo menu) o 29,99 €/mese (completo).",
};

export default function RistorantiPage() {
  const features = [
    {
      icon: Menu,
      title: "Menu digitale",
      text: "Categorie, foto, prezzi, allergeni. Aggiornabile quando vuoi, in un secondo.",
    },
    {
      icon: ShoppingBag,
      title: "Ordini asporto",
      text: "Il cliente ordina in autonomia, sceglie orario di ritiro e paga al banco.",
    },
    {
      icon: Truck,
      title: "Ordini a domicilio",
      text: "Zone di consegna, costi, fasce orarie. Configuri tutto dal pannello.",
    },
    {
      icon: Store,
      title: "Prenotazioni tavoli",
      text: "Turni, capienza, numero persone. Meno telefonate in sala.",
    },
    {
      icon: Bell,
      title: "Automazioni App",
      text: "Ordini e prenotazioni arrivano sul tuo numero App, già pronti.",
    },
    {
      icon: BarChart3,
      title: "Statistiche",
      text: "Piatti più venduti, orari di punta, clienti ricorrenti. Tutto in dashboard.",
    },
  ];

  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-cream">
        <div className="container-x">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-night/60 hover:text-night mb-6 transition"
          >
            <ArrowLeft size={16} /> Torna alla home
          </Link>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-night text-white rounded-full px-3.5 py-1.5 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-wa" />
                <span className="text-[11px] font-bold tracking-wide uppercase">
                  Prenotly Food
                </span>
              </span>

              <h1 className="text-[34px] leading-[1.1] md:text-5xl md:leading-[1.1] font-bold text-night tracking-tight">
                Il tuo menu online.
                <br />
                Gli ordini su App.
              </h1>

              <p className="mt-5 text-base md:text-lg text-night/70 leading-relaxed">
                Menu digitale, asporto, domicilio e prenotazioni tavoli.
                I tuoi clienti ordinano in 30 secondi. Tu ricevi tutto sul
                telefono, senza commissioni.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="bg-night hover:bg-night/90 text-white px-6 py-3.5 rounded-full font-semibold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  Prova 7 giorni gratis
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="https://wa.me/message/LLEKTVFCRCPVB1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-night/15 hover:border-night text-night px-6 py-3.5 rounded-full font-semibold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <MessageCircle size={18} />
                  Parla con noi
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-night/50">
                {["Zero commissioni", "Attivo in 10 minuti", "Disdici quando vuoi"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check size={14} className="text-waDark" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Mockup semplificato */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-5 border border-night/5 max-w-sm mx-auto">
                <div className="flex items-center gap-3 pb-4 border-b border-night/5">
                  <div className="w-12 h-12 rounded-2xl bg-waDark flex items-center justify-center text-white font-bold">
                    DM
                  </div>
                  <div>
                    <p className="font-bold text-night text-sm">Pizzeria Da Marco</p>
                    <p className="text-[11px] text-night/50">prenotly-italia.it/damarco</p>
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between items-center p-3 bg-cream rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-night">Margherita</p>
                      <p className="text-xs text-night/50">€7,50</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-waDark text-white flex items-center justify-center text-sm font-bold">
                      +
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cream rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-night">Diavola</p>
                      <p className="text-xs text-night/50">€9,00</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-waDark text-white flex items-center justify-center text-sm font-bold">
                      +
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-waDark text-white rounded-xl flex justify-between items-center">
                    <span className="text-sm font-semibold">2 articoli</span>
                    <span className="text-sm font-bold">€16,50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x">
          <div className="max-w-2xl mb-10 md:mb-14">
            <p className="text-xs font-bold text-waDark uppercase tracking-widest mb-3">
              Cosa include
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-night tracking-tight">
              Tutto per gestire ordini e sala.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-cream rounded-3xl p-6 border border-night/5"
              >
                <div className="w-11 h-11 rounded-2xl bg-night flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-wa" />
                </div>
                <h3 className="font-bold text-night mb-2">{f.title}</h3>
                <p className="text-sm text-night/60 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREZZO */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-x max-w-2xl">
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-night/5">
            <p className="text-xs font-bold text-waDark uppercase tracking-widest mb-3">
              Prezzo
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-night tracking-tight mb-6">
              Prenotly Food
            </h2>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-sm text-night/50">da €</span>
              <span className="text-5xl font-bold text-night tracking-tighter">9,99</span>
              <span className="text-sm text-night/50">/mese</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Menu digitale illimitato",
                "Ordini asporto e domicilio",
                "Prenotazioni tavoli",
                "Automazioni App",
                "Dashboard completa",
                "Zero commissioni",
                "Supporto in italiano",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-night/80">
                  <Check size={16} className="text-waDark mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="space-y-2.5">
              <Link
                href="/signup"
                className="w-full bg-night hover:bg-night/90 text-white py-4 rounded-full font-semibold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Inizia 7 giorni gratis
                <ArrowRight size={18} />
              </Link>
              <p className="text-xs text-night/50 text-center">
                Pagamento annuale · 359,88 € + IVA · Nessuna carta richiesta
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-16 md:py-24 bg-night text-white">
        <div className="container-x max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Hai domande?
          </h2>
          <p className="text-white/60 mb-8">
            Scrivici su App. Ti rispondiamo in giornata.
          </p>
          <a
            href="https://wa.me/message/LLEKTVFCRCPVB1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-wa hover:bg-wa/90 px-7 py-4 rounded-full font-semibold transition active:scale-[0.98]"
          >
            <MessageCircle size={18} />
            Parla con noi
          </a>
        </div>
      </section>

      <Footer />
      <AppButton />
    </main>
  );
}
