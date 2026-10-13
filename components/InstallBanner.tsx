"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share, Plus, MoreVertical, Smartphone } from "lucide-react";

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Se già installata (standalone), non mostrare
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Se chiuso in questa sessione, non mostrare
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const android = /Android/.test(ua);
    const mobile = ios || android || /Mobi/.test(ua);

    setIsIOS(ios);
    setIsAndroid(android);
    setIsMobile(mobile);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Su Android/Chrome: mostra subito il banner col pulsante
      setTimeout(() => setShow(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS o mobile senza beforeinstallprompt: mostra dopo 3s con istruzioni
    if (ios || (mobile && !deferredPrompt)) {
      setTimeout(() => setShow(true), 3000);
    }

    // Desktop: mostra dopo 6s (più discreto)
    if (!mobile) {
      setTimeout(() => setShow(true), 6000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setShow(false);
          sessionStorage.setItem("pwa-banner-dismissed", "1");
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error(err);
      } finally {
        setInstalling(false);
      }
      return;
    }
    // Se non c'è deferredPrompt (iOS), apri le istruzioni
    setExpanded(true);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (!show) return null;

  // ─────────────────────────────────────
  // VERSIONE MOBILE: banner compatto fisso in basso
  // ─────────────────────────────────────
  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[95] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="bg-night text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Riga principale */}
            <div className="flex items-center gap-3 p-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-wa to-waDark flex items-center justify-center shrink-0 shadow-lg">
                <Smartphone size={20} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight">
                  Installa l&apos;app
                </p>
                <p className="text-[11px] text-white/60 leading-tight mt-0.5">
                  {isIOS
                    ? "Tocca per vedere come"
                    : deferredPrompt
                    ? "Un tap e sei pronto"
                    : "Aggiungi alla Home"}
                </p>
              </div>

              <button
                onClick={handleInstall}
                disabled={installing}
                className="bg-wa hover:bg-wa/90 text-white text-xs font-bold px-4 py-2.5 rounded-full transition active:scale-95 shrink-0 shadow-lg shadow-wa/30"
              >
                {installing ? "..." : "Installa"}
              </button>

              <button
                onClick={handleDismiss}
                className="text-white/40 hover:text-white p-1.5 shrink-0 transition"
                aria-label="Chiudi"
              >
                <X size={16} />
              </button>
            </div>

            {/* Istruzioni iOS espanse */}
            <AnimatePresence>
              {expanded && isIOS && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <div className="p-4 space-y-3 bg-white/[0.03]">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-wa/20 flex items-center justify-center shrink-0 text-wa text-xs font-bold">
                        1
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed pt-1">
                        Tocca <Share size={13} className="inline text-wa" /> <strong>Condividi</strong> in basso al centro (Safari)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-wa/20 flex items-center justify-center shrink-0 text-wa text-xs font-bold">
                        2
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed pt-1">
                        Scorri e tocca <Plus size={13} className="inline text-wa" /> <strong>Aggiungi alla schermata Home</strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-wa/20 flex items-center justify-center shrink-0 text-wa text-xs font-bold">
                        3
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed pt-1">
                        Tocca <strong>Aggiorna</strong> in alto a destra. Fatto! 🎉
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {expanded && isAndroid && !deferredPrompt && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <div className="p-4 space-y-3 bg-white/[0.03]">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-wa/20 flex items-center justify-center shrink-0 text-wa text-xs font-bold">
                        1
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed pt-1">
                        Tocca <MoreVertical size={13} className="inline text-wa" /> <strong>menu</strong> in alto a destra (Chrome)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-wa/20 flex items-center justify-center shrink-0 text-wa text-xs font-bold">
                        2
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed pt-1">
                        Tocca <strong>Installa app</strong> o <strong>Aggiungi a schermata Home</strong>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─────────────────────────────────────
  // VERSIONE DESKTOP: card in basso a destra
  // ─────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="fixed bottom-6 right-6 max-w-sm z-[80]"
      >
        <div className="bg-night text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-wa flex items-center justify-center shrink-0">
            <Download size={22} className="text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm mb-1">Installa l&apos;app</p>
            <p className="text-xs text-white/70 leading-relaxed">
              Aggiungi alla scrivania per ordinare più veloce
            </p>

            {deferredPrompt && (
              <button
                onClick={handleInstall}
                disabled={installing}
                className="mt-3 bg-wa hover:bg-wa/90 text-white text-xs font-bold px-4 py-2 rounded-full transition active:scale-[0.98]"
              >
                {installing ? "Installazione..." : "Installa ora"}
              </button>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="text-white/40 hover:text-white shrink-0 p-1 transition"
            aria-label="Chiudi"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
