import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export default function ContactCTA() {
  return (
    <section className="py-16 md:py-32 bg-[#F7F5EF] relative overflow-hidden">
      {/* GRANA */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }} />
      
      <div className="container-x relative">
        <div className="text-center max-w-5xl mx-auto">
          
          <p className="text-[10px] font-black text-waDark uppercase tracking-[0.3em] mb-6">
            Prova gratuita · 48 ore
          </p>
          
          <h2 
            className="font-display text-[#0F1B2D] tracking-[-0.03em] leading-[0.95] mb-8"
            style={{ fontSize: 'clamp(38px, 8vw, 110px)' }}
          >
            Pronto a<br />
            <span className="italic">trasformare</span><br />
            il tuo locale?
          </h2>

          <p className="text-[#0F1B2D]/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Attiva il tuo spazio, testa il menu o l&apos;agenda con i tuoi dati reali. Se non fa per te, disdici con un click.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 md:mb-10 w-full max-w-sm sm:max-w-none mx-auto">
            <Link
              href="/signup"
              className="group bg-[#0F1B2D] hover:bg-wa text-white hover:text-[#0F1B2D] px-6 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-sm sm:text-base transition-all inline-flex items-center justify-center gap-2 shadow-2xl shadow-[#0F1B2D]/20 active:scale-[0.98]"
            >
              Inizia ora
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/message/LLEKTVFCRCPVB1"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-[#0F1B2D]/20 hover:border-[#0F1B2D]/40 text-[#0F1B2D] px-10 py-5 rounded-full font-bold text-base transition inline-flex items-center justify-center gap-2 bg-white/60 backdrop-blur active:scale-[0.98]"
            >
              Parla con noi
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-[#0F1B2D]/50">
            {[
              "Nessuna carta richiesta",
              "Setup in 10 minuti",
              "Disdici quando vuoi",
            ].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-wa/20 flex items-center justify-center">
                  <Check size={10} className="text-waDark" strokeWidth={3} />
                </div>
                <span className="font-semibold">{t}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
