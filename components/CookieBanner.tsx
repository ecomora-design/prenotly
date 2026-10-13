"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check } from "lucide-react";
import Link from "next/link";

const CONSENT_KEY = "prenotly_cookie_consent";

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setTimeout(() => setShow(true), 1500);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(CONSENT_KEY, "all");
    setShow(false);
  };

  const rejectAll = () => {
    localStorage.setItem(CONSENT_KEY, "necessary");
    setShow(false);
  };

  const savePreferences = () => {
    localStorage.setItem(CONSENT_KEY, analytics ? "all" : "necessary");
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[90]"
      >
        <div className="bg-night text-white rounded-2xl shadow-2xl p-5 border border-white/10">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-wa/20 flex items-center justify-center shrink-0">
              <Cookie size={20} className="text-wa" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1">Informativa sui Cookie</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Utilizziamo cookie tecnici per il funzionamento del sito e, previo consenso,
                cookie analitici per migliorare l&apos;esperienza.{" "}
                <Link href="/cookie" className="text-wa underline">
                  Scopri di più
                </Link>
              </p>
            </div>
            <button
              onClick={rejectAll}
              className="text-white/40 hover:text-white p-1 shrink-0"
              aria-label="Chiudi"
            >
              <X size={16} />
            </button>
          </div>

          <AnimatePresence>
            {showPreferences && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-white/5 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70">Cookie tecnici (necessari)</span>
                    <span className="text-[10px] font-bold text-wa">SEMPRE ATTIVI</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70">Cookie analitici</span>
                    <button
                      onClick={() => setAnalytics(!analytics)}
                      className={`w-10 h-5 rounded-full transition relative ${analytics ? "bg-wa" : "bg-white/20"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                          analytics ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-2">
            {showPreferences ? (
              <button
                onClick={savePreferences}
                className="w-full bg-wa hover:bg-wa/90 text-white py-2.5 rounded-full font-semibold text-sm transition active:scale-[0.98] inline-flex items-center justify-center gap-2"
              >
                <Check size={14} />
                Salva preferenze
              </button>
            ) : (
              <>
                <button
                  onClick={acceptAll}
                  className="flex-1 bg-wa hover:bg-wa/90 text-white py-2.5 rounded-full font-semibold text-sm transition active:scale-[0.98]"
                >
                  Accetta tutti
                </button>
                <button
                  onClick={rejectAll}
                  className="flex-1 border border-white/20 hover:bg-white/10 text-white py-2.5 rounded-full font-semibold text-sm transition active:scale-[0.98]"
                >
                  Rifiuta
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="flex-1 text-white/60 hover:text-white text-xs font-semibold py-2.5 transition"
                >
                  Preferenze
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
