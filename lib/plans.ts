export const PLANS = {
  food_base: {
    id: "food_base",
    name: "Food",
    subtitle: "Menu + Ordini",
    yearly: 359.88,
    monthly: 29.99,
    color: "#25D366",
    icon: "utensils",
    features: [
      "Menu digitale illimitato",
      "Ordini asporto e domicilio",
      "Automazioni WhatsApp",
      "Dashboard completa",
      "QR Code personalizzato",
      "Zero commissioni",
    ],
  },
  food_tables: {
    id: "food_tables",
    name: "Food + Tavoli",
    subtitle: "Tutto di Food + prenotazione tavoli",
    yearly: 420.00,
    monthly: 35,
    color: "#EAB308",
    icon: "calendar",
    badge: "POPOLARE",
    features: [
      "✨ Tutto di Food Base",
      "🍽️ Mappa tavoli interattiva",
      "📅 Prenotazione tavoli online",
      "👥 Gestione capienza e turni",
      "🔔 Promemoria anti no-show",
      "📊 Statistiche occupazione",
    ],
  },
  food_premium: {
    id: "food_premium",
    name: "Food Premium",
    subtitle: "Tutto + pagamenti online",
    yearly: 719.88,
    monthly: 59.99,
    color: "#8B5CF6",
    icon: "crown",
    badge: "TUTTO INCLUSO",
    features: [
      "✨ Tutto di Food + Tavoli",
      "💳 Pagamenti con carta in-app",
      "📱 Apple Pay + Google Pay",
      "🧾 Fatturazione automatica",
      "💰 Fondi direttamente sul conto",
      "🔒 Sicurezza Stripe",
      "🎁 Sconti e coupon",
      "📊 Statistiche incassi",
    ],
  },
  beauty: {
    id: "beauty",
    name: "Pro",
    subtitle: "Agenda + Prenotazioni",
    yearly: 359.88,
    monthly: 29.99,
    color: "#8B5CF6",
    icon: "scissors",
    features: [
      "Agenda intelligente",
      "Servizi con durata",
      "Prenotazioni in tempo reale",
      "Sync Google Calendar",
      "Promemoria anti no-show",
      "Multi-operatore",
      "Zero commissioni",
    ],
  },
  service: {
    id: "service",
    name: "Service",
    subtitle: "Software su misura",
    yearly: 0,
    monthly: 0,
    color: "#3B82F6",
    icon: "code",
    features: [
      "Analisi delle esigenze",
      "Sviluppo custom",
      "Integrazione con i tuoi strumenti",
      "Supporto dedicato",
    ],
  },
};

export type PlanId = keyof typeof PLANS;

export function getPlanFromTenant(tenant: any) {
  if (tenant.plan_type === "tables") return PLANS.food_tables;
  if (tenant.plan_type === "premium") return PLANS.food_premium;
  if (tenant.plan_type === "beauty") return PLANS.beauty;
  if (tenant.plan_type === "service") return PLANS.service;
  return PLANS.food_base;
}

export const FOOD_PLANS = [PLANS.food_base, PLANS.food_tables, PLANS.food_premium];
