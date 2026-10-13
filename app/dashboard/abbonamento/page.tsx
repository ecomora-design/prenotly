"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, CheckCircle2, Clock, CreditCard, MessageCircle,
  ArrowRight, Sparkles, Lock, Zap
} from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  product_type: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  trial_ends_at: string | null;
  subscription_ends_at?: string | null;
};

const MONTHLY_PRICE = 29.99;
const YEARLY_TOTAL = MONTHLY_PRICE * 12; // 359.88

export default function AbbonamentoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(id, slug, product_type, subscription_status, subscription_plan, trial_ends_at)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!link || !link.tenants) { router.push("/onboarding"); return; }

      setTenant(link.tenants as unknown as Tenant);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !tenant) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  const isActive = tenant.subscription_status === "active";
  const trialHoursLeft = tenant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  const planName = tenant.product_type === "food" ? "Prenotly Food"
    : tenant.product_type === "beauty" ? "Prenotly Beauty" : "Prenotly";

  const whatsappMsg = encodeURIComponent(
    `Ciao Prenotly! Voglio attivare l'abbonamento annuale per la mia attività "${tenant.slug}".\n\n` +
    `Piano: ${planName}\n` +
    `Importo: €${YEARLY_TOTAL.toFixed(2)} + IVA (12 mesi)\n\n` +
    `Procediamo con il pagamento?`
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">Il tuo abbonamento</h1>
        <p className="text-gray-500 text-sm">Attiva l&apos;abbonamento annuale e pubblica la tua web app</p>
      </div>

      {/* TRIAL ATTIVO */}
      {tenant.subscription_status === "trial" && trialHoursLeft > 0 && (
        <div className="bg-gradient-to-br from-wa to-waDark rounded-3xl p-6 md:p-8 text-white mb-6 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">Demo attiva</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{trialHoursLeft} ore rimanenti</h2>
          <p className="text-white/90 text-sm mb-6">
            Circa {Math.ceil(trialHoursLeft / 24)} giorni. Attiva l&apos;abbonamento per non perdere l&apos;accesso.
          </p>
          <a
            href={`https://wa.me/393934842118?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-waDark px-6 py-3.5 rounded-full font-bold hover:bg-gray-100 transition active:scale-95"
          >
            <MessageCircle size={18} />
            Attiva ora
          </a>
        </div>
      )}

      {/* ATTIVO */}
      {isActive && (
        <div className="bg-green-50 border border-green-100 rounded-3xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="text-green-600" size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider text-green-700">Attivo</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-night mb-2">{planName}</h2>
          <p className="text-gray-600 text-sm">
            Il tuo abbonamento annuale è attivo. La tua web app è pubblicata online.
          </p>
        </div>
      )}

      {/* CARD PREZZO ANNUALE */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6 border-2 border-wa/20">
        <div className="bg-gradient-to-r from-wa to-waDark p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Piano annuale</span>
          </div>
          <h2 className="text-lg font-bold">{planName}</h2>
        </div>

        <div className="p-6 md:p-8">
          {/* Prezzo */}
          <div className="text-center pb-6 border-b border-gray-100">
            <div className="flex items-end justify-center gap-2 mb-2">
              <span className="text-4xl md:text-5xl font-bold text-night">
                €{YEARLY_TOTAL.toFixed(2)}
              </span>
              <span className="text-gray-500 mb-2">/anno</span>
            </div>
            <p className="text-sm text-gray-500">
              Paghi <strong className="text-night">€{MONTHLY_PRICE.toFixed(2)}/mese</strong> in un&apos;unica soluzione
            </p>
            <div className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full mt-3">
              💡 Risparmi 2 mesi rispetto al mensile
            </div>
            <p className="text-xs text-gray-400 mt-3">IVA esclusa · Fattura elettronica inclusa</p>
          </div>

          {/* Cosa include */}
          <ul className="space-y-3 py-6">
            {[
              "Web app personalizzata online 12 mesi",
              "Automazioni WhatsApp automatica 24/7",
              "Dashboard completa per gestire tutto",
              "Menu/Servizi illimitati",
              "Ordini e prenotazioni illimitati",
              "Logo e colori personalizzati",
              "Aggiornamenti gratuiti",
              "Supporto via WhatsApp",
              "Fattura elettronica automatica",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle2 size={18} className="text-wa mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {/* CTA principale */}
          <div className="pt-6 border-t border-gray-100">
            {isActive ? (
              <button disabled className="w-full bg-green-100 text-green-700 py-4 rounded-full font-bold inline-flex items-center justify-center gap-2 cursor-default">
                <CheckCircle2 size={20} />
                Abbonamento attivo
              </button>
            ) : (
              <>
                <a
                  href={`https://wa.me/393934842118?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-wa hover:bg-waDark text-white py-4 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98] mb-3"
                >
                  <MessageCircle size={20} />
                  Attiva ora — €{YEARLY_TOTAL.toFixed(2)}/anno
                </a>
                <p className="text-xs text-gray-500 text-center">
                  Ti contatteremo su WhatsApp per completare il pagamento
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* COSA SBLOCCA IL PAGAMENTO */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-base font-bold text-night mb-4 flex items-center gap-2">
          <Zap size={20} className="text-wa" />
          Cosa si sblocca quando attivi
        </h2>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-wa mt-0.5 shrink-0" />
            <span className="text-gray-700">
              <strong className="text-night">Pubblicazione online</strong> della tua web app su prenotly-italia.it/{tenant.slug}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-wa mt-0.5 shrink-0" />
            <span className="text-gray-700">
              <strong className="text-night">Automazioni WhatsApp attiva</strong> che risponde ai tuoi clienti 24/7
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-wa mt-0.5 shrink-0" />
            <span className="text-gray-700">
              <strong className="text-night">Ordini e prenotazioni illimitati</strong> senza commissioni
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-wa mt-0.5 shrink-0" />
            <span className="text-gray-700">
              <strong className="text-night">Fattura elettronica</strong> automatica per la tua contabilità
            </span>
          </li>
        </ul>
      </div>

      {/* INFO PAGAMENTO */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
        <Lock className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div className="text-sm">
          <p className="font-bold text-night mb-1">Pagamento sicuro</p>
          <p className="text-gray-600">
            Il pagamento avviene tramite <strong>bonifico bancario</strong> o <strong>carta di credito</strong>. Ti invieremo i dettagli su WhatsApp appena ci contatti. Fattura elettronica emessa automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
