"use client";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-40 md:pb-28 bg-gradient-to-b from-white via-soft to-white overflow-hidden">
      <div className="container-x grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left"
        >
          <span className="inline-block bg-wa/10 text-waDark text-xs md:text-sm font-semibold px-3 md:px-4 py-1.5 rounded-full mb-5 md:mb-6">
            🚀 Il software che lavora al posto tuo
          </span>

          <h1 className="text-3xl md:text-6xl font-bold leading-tight text-night">
            Il software della tua attività che{" "}
            <span className="text-wa">risponde, prenota e ordina al posto tuo.</span>
          </h1>

          <p className="mt-5 md:mt-6 text-base md:text-lg text-gray-600 leading-relaxed">
            Il tuo cliente entra nel tuo spazio personalizzato, sceglie dal menu o prenota uno slot libero in agenda. In pochi secondi riceve conferma su WhatsApp, senza che nessuno debba alzare un dito.
            <br /><br />
            <strong className="text-night">Tu ti occupi del servizio. Al resto pensa Prenotly.</strong>
          </p>

          <div className="mt-7 md:mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <a
              href="#demo"
              className="bg-wa hover:bg-waDark text-white px-6 md:px-7 py-3.5 rounded-full font-semibold transition shadow-lg shadow-wa/30 inline-flex items-center justify-center gap-2 active:scale-95"
            >
              Voglio provarlo gratis
              <ArrowRight size={18} />
            </a>
            <a
              href="#come-funziona"
              className="border border-gray-300 hover:border-night text-night px-6 md:px-7 py-3.5 rounded-full font-semibold transition text-center active:scale-95"
            >
              Scopri come funziona
            </a>
          </div>

          <ul className="mt-7 md:mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs md:text-sm text-gray-600 justify-center md:justify-start">
            {[
              "Zero telefonate perse",
              "Nessuna app da scaricare",
              "Attivo 24/7",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="text-wa shrink-0" size={16} /> {t}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative max-w-md mx-auto">
            {/* Web app (dietro) */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 md:p-5 rotate-[-3deg] mb-[-30px] ml-[-5px] md:ml-[-10px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 md:w-8 h-7 md:h-8 rounded-lg bg-wa flex items-center justify-center text-white font-bold text-xs">
                    DM
                  </div>
                  <div>
                    <p className="text-xs font-bold text-night">Da Marco</p>
                    <p className="text-[10px] text-gray-500">prenotly-italia.it/da-marco</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-md bg-soft" />
              </div>
              <div className="space-y-2">
                <div className="bg-soft rounded-xl p-2.5 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-night">Margherita</p>
                    <p className="text-[10px] text-gray-500">€7,50</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-wa flex items-center justify-center text-white text-sm font-bold">
                    +
                  </div>
                </div>
                <div className="bg-soft rounded-xl p-2.5 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-night">Diavola</p>
                    <p className="text-[10px] text-gray-500">€9,00</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-wa flex items-center justify-center text-white text-sm font-bold">
                    +
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp (davanti) */}
            <div className="bg-night rounded-3xl shadow-2xl p-4 md:p-5 rotate-[2deg] ml-auto max-w-[260px] md:max-w-[280px]">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-white/60 text-[10px]">Segreteria WhatsApp</span>
              </div>
              <div className="space-y-2.5">
                <div className="bg-white rounded-2xl p-2.5 text-xs">
                  🍕 Ciao, vorrei 2 Margherite
                </div>
                <div className="bg-wa text-white rounded-2xl p-2.5 text-xs ml-6">
                  ✅ Aggiunte! Ritiro alle 20:30?
                </div>
                <div className="bg-white rounded-2xl p-2.5 text-xs">Perfetto 👍</div>
                <div className="bg-wa text-white rounded-2xl p-2.5 text-xs ml-6">
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
