"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share, Plus, MoreVertical, Smartphone, Check } from "lucide-react";

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Se già installata (standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Se chiuso in questa sessione
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
      setTimeout(() => setShow(true), 2500);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS o mobile senza beforeinstallprompt: mostra dopo 3s
    if (ios || (mobile && !deferredPrompt)) {
      setTimeout(() => setShow(true), 3000);
    }

    // Desktop: dopo 6s
    if (!mobile) {
      setTimeout(() => setShow(true), 6000);
    }

    // Ascolta installazione completata
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installed) return;

    // ANDROID con prompt nativo
    if (deferredPrompt) {
      setInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setInstalled(true);
          setShow(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error(err);
      } finally {
        setInstalling(false);
      }
      return;
    }

    // iOS o Android senza prompt: mostra istruzioni
    setExpanded(true);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (installed || !show) return null;

  // ═══════════════ MOBILE ═══════════════
  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[95]"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="m-3 bg-night text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
            {/* Riga principale - cliccabile interamente su iOS */}
            <button
              onClick={handleInstall}
              disabled={installing}
              className="w-full flex items-center gap-3 p-4 active:bg-white/5 transition text-left disabled:opacity-60"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-wa to-waDark flex items-center justify-center shrink-0 shadow-lg shadow-wa/30">
                <Smartphone size={22} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight flex items-center gap-2">
                  {installing ? "Installazione..." : "Installa l'app"}
                  {!installing && (
                    <span className="text-[9px] bg-wa/20 text-wa px-2 py-0.5 rounded-full font-mono">
                      GRATIS
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-white/60 leading-tight mt-0.5">
                  {isIOS
                    ? "Tocca per vedere come fare"
                    : deferredPrompt
                    ? "Un tap e sei pronto"
                    : "Tocca per installare"}
                </p>
              </div>

              <div className="bg-wa hover:bg-wa/90 text-white text-xs font-bold px-4 py-2.5 rounded-full transition shrink-0 shadow-lg shadow-wa/30 inline-flex items-center gap-1.5">
                {installing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Download size={14} />
                    Installa
                  </>
                )}
              </div>
            </button>

            {/* Pulsante chiudi in alto a destra (assoluto) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="absolute top-3 right-3 text-white/30 hover:text-white/80 p-1.5 transition z-10"
              aria-label="Chiudi"
            >
              <X size={14} />
            </button>

            {/* Istruzioni espanse iOS */}
            <AnimatePresence>
              {expanded && isIOS && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <div className="p-4 space-y-3 bg-white/[0.03]">
                    {[
                      {
                        n: 1,
                        text: (
                          <>
                            Tocca <Share size={13} className="inline text-wa" />{" "}
                            <strong>Condividi</strong> in basso (Safari)
                          </>
                        ),
                      },
                      {
                        n: 2,
                        text: (
                          <>
                            Scorri e tocca <Plus size={13} className="inline text-wa" />{" "}
                            <strong>Aggiungi alla schermata Home</strong>
                          </>
                        ),
                      },
                      {
                        n: 3,
                        text: (
                          <>
                            Tocca <strong>Aggiorna</strong> in alto. Fatto! 🎉
                          </>
                        ),
                      },
                    ].map((step) => (
                      <div key={step.n} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-wa/20 flex items-center justify-center shrink-0 text-wa text-xs font-bold">
                          {step.n}
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed pt-1">
                          {step.text}
                        </p>
                      </div>
                    ))}
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
                    {[
                      {
                        n: 1,
                        text: (
                          <>
                            Tocca <MoreVertical size={13} className="inline text-wa" />{" "}
                            <strong>menu</strong> in alto a destra (Chrome)
                          </>
                        ),
                      },
                      {
                        n: 2,
                        text: (
                          <>
                            Tocca <strong>Installa app</strong> o{" "}
                            <strong>Aggiungi a schermata Home</strong>
                          </>
                        ),
                      },
                      {
                        n: 3,
                        text: <>Conferma con <strong>Installa</strong>. Fatto! 🎉</>,
                      },
                    ].map((step) => (
                      <div key={step.n} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-wa/20 flex items-center justify-center shrink-0 text-wa text-xs font-bold">
                          {step.n}
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed pt-1">
                          {step.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ═══════════════ DESKTOP ═══════════════
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-wa to-waDark flex items-center justify-center shrink-0">
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
                className="mt-3 bg-wa hover:bg-wa/90 text-white text-xs font-bold px-4 py-2 rounded-full transition active:scale-[0.98] disabled:opacity-60"
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
