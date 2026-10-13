import { MessageCircle, Check } from "lucide-react";
import Link from "next/link";

export default function ContactCTA() {
  return (
    <section className="py-20 md:py-28 bg-night text-white">
      <div className="container-x max-w-2xl text-center">
        <p className="text-xs font-bold text-wa uppercase tracking-widest mb-4">
          Prova gratuita
        </p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
          48 ore gratis.
          <br />
          Poi decidi tu.
        </h2>
        <p className="text-white/60 text-base md:text-lg mb-8 max-w-lg mx-auto">
          Attiva il tuo spazio, testa il menu o l&apos;agenda con i tuoi dati reali.
          Se non fa per te, disdici con un click.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto sm:max-w-none">
          <Link
            href="/signup"
            className="bg-wa hover:bg-wa/90 text-white px-7 py-4 rounded-full font-semibold transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Inizia ora
          </Link>
          <a
            href="https://wa.me/message/LLEKTVFCRCPVB1"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/20 hover:border-white text-white px-7 py-4 rounded-full font-semibold transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <MessageCircle size={18} />
            Scrivici
          </a>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-white/40">
          {[
            "Nessuna carta richiesta",
            "Setup in 10 minuti",
            "Disdici quando vuoi",
          ].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <Check size={14} className="text-wa" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
