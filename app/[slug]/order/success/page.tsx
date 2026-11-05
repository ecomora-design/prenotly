"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";
  const sessionId = searchParams.get("session_id") || "";

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-6">
          <CheckCircle2 size={52} className="text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-night mb-2">
          Pagamento ricevuto
        </h1>
        <p className="text-gray-600 mb-6">
          Il tuo ordine è stato confermato. Il ristorante inizierà a prepararlo a breve.
        </p>

        {code && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
              Codice ordine
            </p>
            <p className="font-mono text-lg font-bold text-night">{code}</p>
          </div>
        )}

        {sessionId && (
          <p className="text-[11px] text-gray-400 mb-4">
            Pagamento verificato con Stripe
          </p>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-6 py-3.5 rounded-2xl font-bold transition active:scale-95"
        >
          Torna alla home <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-night" size={32} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
