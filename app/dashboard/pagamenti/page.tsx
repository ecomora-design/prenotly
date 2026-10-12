"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, CreditCard, Info, MessageCircle, ArrowRight
} from "lucide-react";

export default function PagamentiPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setLoading(false);
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">
          Pagamenti
        </h1>
        <p className="text-gray-500 text-sm">
          Gestisci le modalità di pagamento della tua attività
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-wa/10 flex items-center justify-center">
            <CreditCard className="text-waDark" size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-night">Pagamenti in arrivo</h2>
            <p className="text-xs text-gray-500">
              Stiamo attivando i pagamenti con carta direttamente dall&apos;app
            </p>
          </div>
        </div>

        <div className="bg-soft rounded-2xl p-5 mb-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            Presto potrai ricevere pagamenti con carta di credito direttamente
            dai tuoi clienti. I fondi arriveranno <strong className="text-night">direttamente
            sul tuo conto bancario</strong>, con una piccola commissione di servizio.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-wa/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-waDark text-xs font-bold">✓</span>
            </div>
            <span className="text-gray-700">
              Pagamenti con carta, Apple Pay e Google Pay
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-wa/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-waDark text-xs font-bold">✓</span>
            </div>
            <span className="text-gray-700">
              Fondi direttamente sul tuo conto bancario
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-wa/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-waDark text-xs font-bold">✓</span>
            </div>
            <span className="text-gray-700">
              Fatturazione elettronica automatica
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-wa/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-waDark text-xs font-bold">✓</span>
            </div>
            <span className="text-gray-700">
              Zero costi di attivazione
            </span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-gray-600">
            Vuoi attivare subito i pagamenti con carta? Scrivici su WhatsApp e ti
            aiutiamo a configurarli in 5 minuti.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-wa to-waDark rounded-3xl p-6 md:p-8 text-white text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-3">
          Vuoi attivare i pagamenti ora?
        </h2>
        <p className="text-white/90 text-sm mb-6">
          Contattaci e ti spieghiamo come funziona
        </p>
        <a
          href="https://wa.me/message/LLEKTVFCRCPVB1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-waDark px-7 py-4 rounded-full font-bold transition active:scale-95"
        >
          <MessageCircle size={18} />
          Scrivici su WhatsApp
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
