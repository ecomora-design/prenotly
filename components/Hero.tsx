"use client";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-12 md:pt-40 md:pb-28 bg-gradient-to-b from-white via-soft to-white overflow-hidden">
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
            Tre software. Una sola piattaforma.
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
            Scegli il software su misura per la tua attività: <strong className="text-night">Food</strong> per ristoranti, <strong className="text-night">Beauty</strong> per parrucchieri e centri estetici, o <strong className="text-night">Service</strong> per un progetto completamente personalizzato.
            <br className="hidden md:block" />
            <span className="hidden md:inline"><br /></span>
            Tutto su WhatsApp, tutto automatico, tutto sotto controllo dalla tua dashboard.
          </p>

          <div className="mt-7 md:mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start max-w-sm mx-auto md:max-w-none">
            <Link
              href="/prezzi"
              className="bg-wa hover:bg-waDark text-white px-6 md:px-7 py-4 md:py-3.5 rounded-full font-bold text-[15px] md:text-base transition shadow-lg shadow-wa/30 inline-flex items-center justify-center gap-2 active:scale-[0.97]"
            >
              Scopri i prezzi
              <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/393934842118?text=Ciao%20Prenotly!%20Vorrei%20maggiori%20informazioni"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-300 hover:border-night text-night px-6 md:px-7 py-3.5 rounded-full font-semibold text-[15px] md:text-base transition text-center inline-flex items-center justify-center gap-2 active:scale-[0.97]"
            >
              <MessageCircle size={18} />
              Parla con noi
            </a>
          </div>

          <ul className="mt-6 md:mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm text-gray-600 justify-center md:justify-start">
            {["Demo gratuita 48 ore", "Nessuna app da scaricare", "Dashboard inclusa"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="text-wa shrink-0" size={15} />
                {t}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-[380px] mx-auto w-full"
        >
          <div className="space-y-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-wa/10 flex items-center justify-center text-2xl shrink-0">
                🍕
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-night text-sm">Food</p>
                <p className="text-xs text-gray-500">Menu digitale + ordini WhatsApp</p>
              </div>
              <span className="text-xs font-bold text-waDark bg-wa/10 px-2.5 py-1 rounded-full shrink-0">
                €29,99
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-2xl shrink-0">
                💇
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-night text-sm">Beauty</p>
                <p className="text-xs text-gray-500">Appuntamenti + calendario</p>
              </div>
              <span className="text-xs font-bold text-violet-500 bg-violet-50 px-2.5 py-1 rounded-full shrink-0">
                €29,99
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl shrink-0">
                🛠️
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-night text-sm">Service</p>
                <p className="text-xs text-gray-500">Software su misura</p>
              </div>
              <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full shrink-0">
                Su misura
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
