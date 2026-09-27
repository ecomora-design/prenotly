"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Non mostrare se già installata (standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Non mostrare se già chiuso in questa sessione
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS non supporta beforeinstallprompt, mostra dopo 3 secondi
    if (ios) {
      setTimeout(() => setShow(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShow(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 animate-[slideUp_0.4s_ease-out]">
      <div className="bg-night text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-wa flex items-center justify-center shrink-0">
          <Download className="text-white" size={22} />
        </div>

        <div className="flex-1">
          <p className="font-bold mb-1">Installa l&apos;app</p>
          <p className="text-sm text-white/80 mb-3">
            {isIOS
              ? "Tocca Condividi e poi \"Aggiungi alla schermata Home\"."
              : "Aggiungi alla schermata home per ordinare più veloce."}
          </p>

          {!isIOS && (
            <button
              onClick={handleInstall}
              className="bg-wa hover:bg-waDark text-white text-sm font-semibold px-4 py-2 rounded-full transition"
            >
              Installa ora
            </button>
          )}

          {isIOS && (
            <p className="text-xs text-white/60">
              📤 &nbsp;→&nbsp; ➕ Aggiungi alla Home
            </p>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="text-white/60 hover:text-white shrink-0"
          aria-label="Chiudi"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
