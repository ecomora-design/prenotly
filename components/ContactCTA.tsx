"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export default function ContactCTA() {
  return (
    <section className="py-16 md:py-32 bg-gradient-to-br from-night via-night to-[#0F766E] relative overflow-hidden">
      {/* SFERE VERDI ANIMATE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#25D366]/30 rounded-full blur-2xl md:blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-[#25D366]/20 rounded-full blur-2xl md:blur-3xl"
        />
        {/* Grana */}
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }} />
      </div>
      
      <div className="container-x relative">
        <div className="text-center max-w-5xl mx-auto">
          
          <p className="text-[10px] font-black text-[#25D366] uppercase tracking-[0.3em] mb-6">
            Prova gratuita · 7 giorni
          </p>
          
          <h2 
            className="font-display text-white tracking-[-0.03em] leading-[0.95] mb-8"
            style={{ fontSize: 'clamp(38px, 8vw, 110px)' }}
          >
            Pronto a<br />
            <span className="italic text-[#25D366]">trasformare</span><br />
            il tuo locale?
          </h2>

          <p className="text-white/70 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Attiva il tuo spazio, testa il menu o l&apos;agenda con i tuoi dati reali. Se non fa per te, disdici con un click.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 md:mb-10 w-full max-w-sm sm:max-w-none mx-auto">
            <Link
              href="/signup"
              className="group relative overflow-hidden bg-white hover:bg-white text-[#0F1B2D] px-6 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-sm sm:text-base transition-all inline-flex items-center justify-center gap-2 shadow-2xl shadow-[#25D366]/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Inizia ora
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/message/LLEKTVFCRCPVB1"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white/30 hover:border-white/60 hover:bg-white/10 text-white px-10 py-5 rounded-full font-bold text-base transition inline-flex items-center justify-center gap-2 backdrop-blur active:scale-[0.98]"
            >
              Parla con noi
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-[#0F1B2D]/70">
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
