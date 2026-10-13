"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share, Plus, MoreVertical } from "lucide-react";

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Non mostrare se già installata
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Non mostrare se già chiuso in questa sessione
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const android = /Android/.test(ua);

    setIsIOS(ios);
    setIsAndroid(android);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostra il banner dopo 3 secondi
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS/Android senza beforeinstallprompt: mostra dopo 5s
    if (ios || android) {
      setTimeout(() => {
        if (!deferredPrompt) setShow(true);
      }, 5000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
    setInstalling(false);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-[80]"
      >
        <div className="bg-night text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-wa flex items-center justify-center shrink-0">
            <Download size={22} className="text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm mb-1">Installa l&apos;app</p>

            {isIOS ? (
              <p className="text-xs text-white/70 leading-relaxed">
                Tocca <Share size={11} className="inline mx-1" /> Condividi, poi{" "}
                <Plus size={11} className="inline mx-1" /> Aggiungi alla schermata Home
              </p>
            ) : isAndroid && !deferredPrompt ? (
              <p className="text-xs text-white/70 leading-relaxed">
                Tocca <MoreVertical size={11} className="inline mx-1" /> menu, poi{" "}
                &quot;Installa app&quot; o &quot;Aggiungi alla Home&quot;
              </p>
            ) : (
              <p className="text-xs text-white/70 leading-relaxed">
                Aggiungi alla schermata Home per ordinare più veloce
              </p>
            )}

            {deferredPrompt && !isIOS && (
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
