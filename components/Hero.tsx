"use client";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-12 md:pt-40 md:pb-28 bg-gradient-to-b from-white via-soft to-white overflow-hidden">
      {/* Sfondo decorativo mobile */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-wa/10 rounded-full blur-3xl -z-0 md:hidden" />
      <div className="absolute top-40 left-0 w-64 h-64 bg-violet-200/30 rounded-full blur-3xl -z-0 md:hidden" />

      <div className="container-x relative grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left"
        >
          <span className="inline-flex items-center gap-2 bg-wa/10 text-waDark text-xs md:text-sm font-semibold px-3.5 md:px-4 py-1.5 rounded-full mb-5">
            <Sparkles size={14} className="animate-pulse-soft" />
            Il software che lavora al posto tuo
          </span>

          <h1 className="text-[34px] leading-[1.1] md:text-6xl md:leading-tight font-bold text-night">
            Il software che{" "}
            <span className="text-wa relative">
              risponde e prenota
              <svg className="absolute -bottom-1 left-0 w-full h-2 md:h-3" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M2 8 Q 50 2, 100 6 T 198 4" stroke="#25D366" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
              </svg>
            </span>{" "}
            al posto tuo.
          </h1>

          <p className="mt-5 md:mt-6 text-[15px] md:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto md:mx-0">
            Il tuo cliente entra nel tuo spazio, sceglie dal menu o prenota uno slot libero. In pochi secondi riceve conferma su <strong className="text-night">WhatsApp</strong>.
            <br className="hidden md:block" />
            <span className="hidden md:inline"><br /></span>
            <strong className="text-night">Tu ti occupi del servizio. Al resto pensa Prenotly.</strong>
          </p>

          <div className="mt-7 md:mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start max-w-sm mx-auto md:max-w-none">
            <a
              href="#demo"
              className="bg-wa hover:bg-waDark text-white px-6 md:px-7 py-4 md:py-3.5 rounded-full font-bold text-[15px] md:text-base transition shadow-lg shadow-wa/30 inline-flex items-center justify-center gap-2 active:scale-[0.97]"
            >
              Voglio provarlo gratis
              <ArrowRight size={18} />
            </a>
            <a
              href="#come-funziona"
              className="border border-gray-300 hover:border-night text-night px-6 md:px-7 py-3.5 rounded-full font-semibold text-[15px] md:text-base transition text-center active:scale-[0.97]"
            >
              Come funziona
            </a>
          </div>

          <ul className="mt-6 md:mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm text-gray-600 justify-center md:justify-start">
            {["Zero telefonate perse", "Nessuna app da scaricare", "Attivo 24/7"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="text-wa shrink-0" size={15} />
                {t}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Mockup mobile ottimizzato */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-[340px] md:max-w-md mx-auto w-full"
        >
          <div className="relative">
            {/* Web app dietro */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 md:p-5 animate-float-slow mb-[-24px] ml-[-4px] md:ml-[-10px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-wa flex items-center justify-center text-white font-bold text-[10px] md:text-xs">
                    DM
                  </div>
                  <div>
                    <p className="text-[11px] md:text-xs font-bold text-night">Da Marco</p>
                    <p className="text-[9px] md:text-[10px] text-gray-500">prenotly-italia.it/da-marco</p>
                  </div>
                </div>
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-soft" />
              </div>
              <div className="space-y-2">
                <div className="bg-soft rounded-xl p-2.5 flex justify-between items-center">
                  <div>
                    <p className="text-[11px] md:text-xs font-semibold text-night">Margherita</p>
                    <p className="text-[9px] md:text-[10px] text-gray-500">€7,50</p>
                  </div>
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-wa flex items-center justify-center text-white text-sm font-bold">
                    +
                  </div>
                </div>
                <div className="bg-soft rounded-xl p-2.5 flex justify-between items-center">
                  <div>
                    <p className="text-[11px] md:text-xs font-semibold text-night">Diavola</p>
                    <p className="text-[9px] md:text-[10px] text-gray-500">€9,00</p>
                  </div>
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-wa flex items-center justify-center text-white text-sm font-bold">
                    +
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp davanti */}
            <div className="bg-night rounded-3xl shadow-2xl p-4 md:p-5 animate-float ml-auto max-w-[260px] md:max-w-[280px]">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-white/60 text-[9px] md:text-[10px]">Segreteria WhatsApp</span>
              </div>
              <div className="space-y-2">
                <div className="bg-white rounded-2xl p-2.5 text-[11px] md:text-xs">
                  🍕 Ciao, vorrei 2 Margherite
                </div>
                <div className="bg-wa text-white rounded-2xl p-2.5 text-[11px] md:text-xs ml-6">
                  ✅ Aggiunte! Ritiro alle 20:30?
                </div>
                <div className="bg-white rounded-2xl p-2.5 text-[11px] md:text-xs">
                  Perfetto 👍
                </div>
                <div className="bg-wa text-white rounded-2xl p-2.5 text-[11px] md:text-xs ml-6">
                  📅 Slot confermato. A dopo!
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
