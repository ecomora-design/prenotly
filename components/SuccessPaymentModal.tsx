"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, X, ArrowRight, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PLAN_NAMES: Record<string, string> = {
  food_base: "Prenotly Food",
  food_tables: "Prenotly Food + Tavoli",
  food_premium: "Prenotly Food Premium",
  beauty: "Prenotly Pro",
};

const PLAN_FEATURES: Record<string, string[]> = {
  food_base: [
    "Menu digitale personalizzabile",
    "Ordini asporto e domicilio",
    "Notifiche realtime in dashboard",
    "Dashboard gestionale completa",
  ],
  food_tables: [
    "Tutto di Food",
    "Mappa tavoli interattiva",
    "Prenotazione tavoli online",
    "Gestione capienza e turni",
    "Promemoria anti no-show",
  ],
  food_premium: [
    "Tutto di Food + Tavoli",
    "Pagamenti con carta in-app",
    "Apple Pay + Google Pay",
    "Fatturazione automatica",
    "Sicurezza Stripe",
  ],
  beauty: [
    "Agenda intelligente",
    "Prenotazioni con slot in tempo reale",
    "Sync Google Calendar",
    "Promemoria anti no-show",
    "Multi-operatore",
  ],
};

export default function SuccessPaymentModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [planType, setPlanType] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success !== "true") return;

    async function loadPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenants(plan_type)")
        .eq("user_id", user.id)
        .maybeSingle();
      if (link?.tenants) {
        const t = link.tenants as any;
        setPlanType(t.plan_type);
        setOpen(true);
      }
    }
    loadPlan();
  }, [searchParams, supabase]);

  const handleClose = () => {
    setOpen(false);
    // Rimuovi il parametro success dall'URL
    router.replace("/dashboard/abbonamento");
  };

  if (!open || !planType) return null;

  const planName = PLAN_NAMES[planType] || "Il tuo piano";
  const features = PLAN_FEATURES[planType] || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-[#25D366] to-[#128C7E] p-8 text-white text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="relative w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
            >
              <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 mb-2">
                Pagamento riuscito
              </p>
              <h2 className="text-2xl font-bold mb-2">
                Benvenuto in {planName}! 🎉
              </h2>
              <p className="text-sm text-white/80">
                Il tuo abbonamento è attivo. Ecco cosa hai sbloccato:
              </p>
            </motion.div>
          </div>

          {/* Feature list */}
          <div className="p-6">
            <div className="space-y-2.5 mb-6">
              {features.map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[#25D366]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-[#128C7E]" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-[#0A2540] font-medium">{f}</span>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={() => { handleClose(); router.push("/dashboard"); }}
              className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-[#25D366]/30 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Vai alla dashboard
              <ArrowRight size={16} />
            </motion.button>

            <button
              onClick={handleClose}
              className="w-full mt-3 text-[#425466] py-2.5 text-xs font-semibold hover:text-[#0A2540] transition"
            >
              Chiudi
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
