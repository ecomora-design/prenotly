"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, CreditCard, Info, MessageCircle, ArrowRight,
  CheckCircle2, Lock, Crown, AlertCircle
} from "lucide-react";

type Tenant = {
  id: string;
  plan_type: string | null;
  stripe_account_id: string | null;
  stripe_connect_status: string | null;
};

export default function PagamentiPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(id, plan_type, stripe_account_id, stripe_connect_status)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (link?.tenants) setTenant(link.tenants as any);
      setLoading(false);
    }
    init();
  }, []);

  async function handleConnect() {
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore sconosciuto");
        setConnecting(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("URL di onboarding mancante");
        setConnecting(false);
      }
    } catch (err: any) {
      setError(err.message || "Errore di rete");
      setConnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  const isPremium = tenant?.plan_type === "food_premium";
  const isConnected = tenant?.stripe_connect_status === "active";
  const isPending = !!tenant?.stripe_account_id && !isConnected;

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

      {!isPremium && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <Lock size={36} className="text-amber-500" />
          </div>
          <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
            <Crown size={11} /> Solo Premium Pro
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-night mb-2">
            Pagamenti online con Stripe
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Con Premium Pro puoi collegare il tuo account Stripe e ricevere pagamenti online per ogni ordine. I soldi arrivano direttamente sul tuo conto, senza commissioni Prenotly.
          </p>
          <Link
            href="/dashboard/abbonamento"
            className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-6 py-3 rounded-full text-sm font-bold transition"
          >
            <Crown size={15} /> Passa a Premium Pro
          </Link>
        </div>
      )}

      {isPremium && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isConnected ? "bg-emerald-100" : "bg-purple-100"}`}>
              {isConnected ? (
                <CheckCircle2 className="text-emerald-600" size={28} />
              ) : (
                <CreditCard className="text-purple-600" size={28} />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-night">
                {isConnected ? "Stripe connesso" : "Collega il tuo Stripe"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isConnected
                  ? "Ricevi pagamenti online per ogni ordine"
                  : "Ricevi i pagamenti degli ordini direttamente sul tuo conto"}
              </p>
            </div>
            {isConnected && (
              <span className="hidden md:inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                <CheckCircle2 size={11} /> Attivo
              </span>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}

          {!isConnected && (
            <>
              <div className="bg-soft rounded-2xl p-4 mb-5">
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  {isPending
                    ? "Hai iniziato la configurazione ma non è ancora completa. Riprendi da dove avevi lasciato."
                    : "Collega il tuo account Stripe in pochi minuti. Stripe gestisce i dati fiscali e l'IBAN, tu ricevi i pagamenti direttamente."}
                </p>
                <ul className="text-xs text-gray-600 space-y-1.5 ml-1">
                  <li>✓ I soldi vanno direttamente sul tuo conto</li>
                  <li>✓ Nessuna commissione Prenotly</li>
                  <li>✓ Commissione Stripe: 1,5% + 0,25 € per transazione</li>
                </ul>
              </div>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full bg-[#635BFF] hover:bg-[#5449E5] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md"
              >
                {connecting ? (
                  <><Loader2 className="animate-spin" size={16} /> Reindirizzamento...</>
                ) : (
                  <>{isPending ? "Riprendi configurazione" : "Collega il tuo Stripe"} <ArrowRight size={16} /></>
                )}
              </button>
            </>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 mb-6">
        <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
        <div className="flex-1">
          <p className="text-xs text-gray-700">
            {isPremium && isConnected
              ? "Il tuo Stripe è attivo. Gli ordini online verranno pagati direttamente con carta."
              : "Hai bisogno di aiuto per configurare Stripe? Scrivici su WhatsApp."}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-wa to-waDark rounded-3xl p-6 md:p-8 text-white text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-3">
          Serve una mano?
        </h2>
        <p className="text-white/90 text-sm mb-6">
          Il team Prenotly è a tua disposizione
        </p>
        <a
          href="https://wa.me/message/LLEKTVFCRCPVB1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-waDark px-7 py-4 rounded-full font-bold transition active:scale-95"
        >
          <MessageCircle size={18} />
          Scrivici su App
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
