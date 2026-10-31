"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function NumbersSection() {
  const stats = [
    { value: "130+", label: "Attività italiane", sublabel: "già lo usano" },
    { value: "0%", label: "Commissioni", sublabel: "sulle prenotazioni" },
    { value: "7 giorni", label: "Prova gratuita", sublabel: "senza carta" },
    { value: "4.9/5", label: "Valutazione media", sublabel: "degli utenti" },
  ];

  return (
    <section className="py-14 md:py-24 bg-night relative overflow-hidden">
      {/* Sfondo: gradiente verde tenue in alto */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#25D366]/[0.12] to-transparent rounded-full blur-3xl" />

      </div>

      <div className="container-x relative">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 mb-4 backdrop-blur-sm">
            <Sparkles size={12} className="text-[#25D366]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white/80">Numeri che parlano chiaro</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Non promesse.<br />
            <span className="text-[#25D366]">Dati reali.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <p className="text-4xl md:text-6xl font-black text-[#25D366] tracking-tight leading-none mb-2">
                {s.value}
              </p>
              <p className="text-sm md:text-base font-bold text-white mb-0.5">{s.label}</p>
              <p className="text-[11px] md:text-xs text-white/60">{s.sublabel}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bordo inferiore verde sottile */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#25D366]/50 to-transparent" />
    </section>
  );
}
