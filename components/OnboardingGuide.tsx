"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MessageCircle, Settings, Calendar, Menu,
  ArrowRight, Sparkles, ExternalLink
} from "lucide-react";
import Link from "next/link";

type Props = {
  isFood: boolean;
  businessSlug: string;
  onComplete: () => void;
};

function getStepsFood(businessSlug: string) {
  return [
    {
      icon: Menu,
      title: "Aggiungi il tuo menu",
      text: "Vai su Menu e aggiungi i tuoi piatti con nome, prezzo e descrizione. Puoi anche caricare una foto per renderli più appetitosi.",
      cta: "Vai al Menu",
      link: "/dashboard/servizi",
      external: false,
    },
    {
      icon: Settings,
      title: "Personalizza la web app",
      text: "Vai su Impostazioni: aggiungi logo, immagine di copertina, orari di apertura e scegli il colore della tua attività.",
      cta: "Vai a Impostazioni",
      link: "/dashboard/impostazioni",
      external: false,
    },
    {
      icon: MessageCircle,
      title: "Configura WhatsApp",
      text: "Nel campo 'Numero WhatsApp' inserisci il numero con prefisso +39 dove vuoi ricevere gli ordini (es. +393331234567).",
      cta: "Configura ora",
      link: "/dashboard/impostazioni",
      external: false,
    },
    {
      icon: ExternalLink,
      title: "Condividi il tuo link",
      text: `Il tuo spazio è pronto su prenotly-italia.it/${businessSlug}. Mettilo in bio di Instagram, su Google Maps, sul menu fisico.`,
      cta: "Vedi la tua pagina",
      link: `/${businessSlug}`,
      external: true,
    },
    {
      icon: Sparkles,
      title: "Fai il primo test",
      text: "Ordina dal tuo stesso link come se fossi un cliente. Così vedi esattamente cosa vedono i tuoi clienti e come arriva l'ordine su WhatsApp.",
      cta: "Ho capito",
      link: null,
      external: false,
    },
  ];
}

function getStepsPro(businessSlug: string) {
  return [
    {
      icon: Calendar,
      title: "Aggiungi i tuoi servizi",
      text: "Vai su Servizi e aggiungi i trattamenti che offri con prezzo e durata. Ogni servizio può avere durata diversa (es. taglio 30 min, colore 90 min).",
      cta: "Vai ai Servizi",
      link: "/dashboard/servizi",
      external: false,
    },
    {
      icon: Settings,
      title: "Personalizza la web app",
      text: "Vai su Impostazioni: aggiungi logo, immagine di copertina, orari di apertura e scegli il colore della tua attività.",
      cta: "Vai a Impostazioni",
      link: "/dashboard/impostazioni",
      external: false,
    },
    {
      icon: Calendar,
      title: "Collega Google Calendar",
      text: "Nel campo Google Calendar, clicca 'Collega' e autorizza l'accesso. Da ora gli appuntamenti finiscono automaticamente nella tua agenda.",
      cta: "Collega ora",
      link: "/dashboard/impostazioni",
      external: false,
    },
    {
      icon: MessageCircle,
      title: "Configura WhatsApp",
      text: "Nel campo 'Numero WhatsApp' inserisci il numero con prefisso +39 dove vuoi ricevere le prenotazioni (es. +393331234567).",
      cta: "Configura ora",
      link: "/dashboard/impostazioni",
      external: false,
    },
    {
      icon: ExternalLink,
      title: "Condividi il tuo link",
      text: `Il tuo spazio è pronto su prenotly-italia.it/${businessSlug}. Mettilo in bio di Instagram, su Google Maps, sui tuoi biglietti da visita.`,
      cta: "Vedi la tua pagina",
      link: `/${businessSlug}`,
      external: true,
    },
    {
      icon: Sparkles,
      title: "Fai il primo test",
      text: "Prenota dal tuo stesso link come se fossi un cliente. Così vedi esattamente cosa vedono i tuoi clienti e come arriva l'appuntamento.",
      cta: "Ho capito",
      link: null,
      external: false,
    },
  ];
}

export default function OnboardingGuide({ isFood, businessSlug, onComplete }: Props) {
  const steps = isFood ? getStepsFood(businessSlug) : getStepsPro(businessSlug);
  const [current, setCurrent] = useState(0);

  const step = steps[current];
  const isLast = current === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrent(current + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white pt-5 pb-4 px-6 md:px-8 border-b border-night/5 z-10">
            <div className="w-12 h-1.5 bg-night/10 rounded-full mx-auto mb-5 md:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-waDark" />
                <span className="text-[11px] font-bold text-waDark uppercase tracking-widest">
                  Guida iniziale
                </span>
              </div>
              <button
                onClick={handleSkip}
                className="text-night/40 hover:text-night/80 p-1.5 -mr-1.5 transition"
                aria-label="Chiudi"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-night/60">
                  Passo {current + 1} di {steps.length}
                </span>
                <span className="text-xs font-semibold text-night/40">
                  {Math.round(((current + 1) / steps.length) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-waDark rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((current + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center mb-5">
                <step.icon size={26} className="text-waDark" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-night tracking-tight mb-3 leading-tight">
                {step.title}
              </h2>

              <p className="text-[15px] text-night/70 leading-relaxed mb-8">
                {step.text}
              </p>

              <div className="flex items-center gap-1.5 mb-6">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === current
                        ? "w-6 bg-waDark"
                        : i < current
                        ? "w-1.5 bg-waDark/40"
                        : "w-1.5 bg-night/10"
                    }`}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-2.5">
                {step.link &&
                  (step.external ? (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-night hover:bg-night/90 text-white py-4 rounded-full font-semibold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {step.cta}
                      <ArrowRight size={18} />
                    </a>
                  ) : (
                    <Link
                      href={step.link}
                      className="w-full bg-night hover:bg-night/90 text-white py-4 rounded-full font-semibold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {step.cta}
                      <ArrowRight size={18} />
                    </Link>
                  ))}

                <button
                  onClick={handleNext}
                  className={`w-full py-4 rounded-full font-semibold text-[15px] transition active:scale-[0.98] ${
                    step.link
                      ? "text-night/60 hover:bg-cream"
                      : "bg-waDark hover:bg-waDark/90 text-white"
                  }`}
                >
                  {isLast ? "Inizia a usare Prenotly" : "Avanti"}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
