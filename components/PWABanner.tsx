"use client";

import { useEffect, useState } from "react";
import { X, Share, Download, Smartphone, Plus, ExternalLink } from "lucide-react";

export default function PWABanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) return;

    const timer = setTimeout(() => setShow(true), 3000);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShow(false);
      setDeferredPrompt(null);
    } else {
      // Se beforeinstallprompt non è supportato (es. Safari Mac o IP locale)
      alert("Per installare l'app: \n\n• Su Chrome/Edge: clicca l'icona di installazione nella barra degli indirizzi (in alto a destra).\n\n• Su iPhone/iPad: tocca Condividi e poi 'Aggiungi alla schermata Home'.\n\nNota: l'installazione funziona solo se il sito è su HTTPS o localhost.");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[9999] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-night/[0.08] p-4">
      <button onClick={() => setShow(false)} className="absolute top-3 right-3 text-night/40 hover:text-night p-1">
        <X size={18} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-wa/10 flex items-center justify-center shrink-0">
          <Smartphone className="text-wa" size={24} />
        </div>
        <div className="flex-1 pr-6">
          <h3 className="font-bold text-night text-sm">Installa l'app</h3>
          <p className="text-xs text-night/60 mt-1">
            {isIOS ? "Aggiungi l'app alla tua home per accedervi al volo." : "Installa l'app sul tuo dispositivo per un accesso rapido."}
          </p>
          
          {isIOS ? (
            <div className="mt-3 bg-cream rounded-xl p-3 space-y-2 text-[11px] text-night/80">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-white flex items-center justify-center font-bold text-night shrink-0">1</span>
                <span>Tocca <Share size={12} className="inline text-blue-500" /> <strong>Condividi</strong> in basso</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-white flex items-center justify-center font-bold text-night shrink-0">2</span>
                <span>Scorri e scegli <Plus size={12} className="inline" /> <strong>Aggiungi alla Home</strong></span>
              </div>
            </div>
          ) : (
            <button onClick={handleInstall} className="mt-3 w-full bg-night hover:bg-night/90 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md">
              <Download size={14} /> Installa App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
