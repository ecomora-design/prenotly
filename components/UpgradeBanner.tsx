"use client";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type Props = { tenant: { plan_type: string | null } };

const NEXT_PLANS: Record<string, { name: string; price: string; bullets: string[] }> = {
  food_menu: { name: "Food + Ordini", price: "29,99 €/mese", bullets: ["🛍️ Ordini asporto", "📅 Prenotazione tavoli", "🔔 Notifiche realtime"] },
  food_standard: { name: "Premium Pro", price: "79,99 €/mese", bullets: ["💳 Pagamenti in-app", "📱 Ordini da QR", "📊 Spese e incassi"] },
  beauty: { name: "Servizi Premium", price: "79,99 €/mese", bullets: ["👥 Staff illimitato", "📊 Stats per operatore", "💳 Pagamenti"] },
};

export default function UpgradeBanner({ tenant }: Props) {
  const next = tenant.plan_type ? NEXT_PLANS[tenant.plan_type] : null;
  if (!next) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-night to-night/90 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-lg">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
        <Sparkles size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm">Passa a {next.name} · {next.price}</p>
        <p className="text-[11px] text-white/60 mt-0.5 truncate">{next.bullets.join(" · ")}</p>
      </div>
      <Link href="/dashboard/abbonamento" className="bg-white text-night hover:bg-white/90 px-4 py-2 rounded-full font-bold text-xs inline-flex items-center gap-1 shrink-0 transition">
        Scopri <ArrowRight size={12} />
      </Link>
    </motion.div>
  );
}
