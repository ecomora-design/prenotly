"use client";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Check } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-24 pb-14 md:pt-32 md:pb-24 bg-cream relative overflow-hidden">
      {/* Decorazione minimal */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-wa/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      <div className="container-x relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-night text-white rounded-full px-4 py-1.5 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-wa animate-pulse" />
            <span className="text-xs font-semibold tracking-wide">
              Software italiano per attività
            </span>
          </motion.div>

          {/* Titolo */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[34px] leading-[1.1] md:text-6xl md:leading-[1.05] font-bold text-night tracking-tight"
          >
            Prenotazioni e ordini.
            <br />
            <span className="text-waDark">Senza telefonate.</span>
          </motion.h1>

          {/* Sottotitolo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base md:text-lg text-night/70 leading-relaxed max-w-xl mx-auto"
          >
            Un software per la tua attività: i clienti prenotano online,
            tu ricevi tutto su WhatsApp. Niente app, niente registrazioni,
            niente complicazioni.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto sm:max-w-none"
          >
            <Link
              href="/prezzi"
              className="bg-night hover:bg-night/90 text-white px-7 py-4 rounded-full font-semibold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Vedi i piani
              <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/message/LLEKTVFCRCPVB1"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-night/15 hover:border-night text-night px-7 py-4 rounded-full font-semibold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98] bg-white"
            >
              <MessageCircle size={18} />
              Parla con noi
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[13px] text-night/50"
          >
            {[
              "Demo 48 ore gratuita",
              "Nessuna carta di credito",
              "Attivo in 10 minuti",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={14} className="text-waDark" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
