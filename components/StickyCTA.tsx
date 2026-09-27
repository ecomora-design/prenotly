"use client";

import { useEffect, useState } from "react";
import { MessageCircle, ArrowRight } from "lucide-react";

export default function StickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Appare dopo 600px di scroll, nasconde in fondo
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nearBottom = y > docHeight - 200;
      setShow(y > 600 && !nearBottom);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden animate-slideUp">
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-night leading-tight">
              Prova gratis 14 giorni
            </p>
            <p className="text-[11px] text-gray-500">Senza carta di credito</p>
          </div>
          <a
            href="https://wa.me/393884027650?text=Ciao%20Prenotly!%20Vorrei%20iniziare%20la%20prova%20gratuita"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-wa hover:bg-waDark text-white px-5 py-3 rounded-full font-bold text-sm inline-flex items-center gap-2 active:scale-95 transition shrink-0 shadow-lg shadow-wa/30"
          >
            <MessageCircle size={16} />
            Inizia ora
          </a>
        </div>
      </div>
    </div>
  );
}
