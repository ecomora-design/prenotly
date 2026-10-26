export const PLANS = {
  food_menu: {
    id: "food_menu",
    name: "Menu Digitale",
    subtitle: "Solo menu",
    yearly: 119.88,
    monthly: 9.99,
    color: "#64748B",
    icon: "utensils",
    features: [
      "Menu digitale personalizzabile",
      "Categorie, foto e allergeni",
      "QR Code per il tavolo",
      "Web app brandizzata",
      "Aggiornamenti illimitati",
    ],
  },
  food_standard: {
    id: "food_standard",
    name: "Food + Ordini",
    subtitle: "Menu, Ordini e Tavoli",
    yearly: 359.88,
    monthly: 29.99,
    color: "#25D366",
    icon: "calendar",
    badge: "POPOLARE",
    features: [
      "✨ Tutto di Menu Digitale",
      "🛍️ Ordini asporto e domicilio",
      "📅 Prenotazione tavoli online",
      "🔔 Notifiche realtime",
      "👥 Gestione capienza e turni",
      "📊 Statistiche di base",
    ],
  },
  food_premium: {
    id: "food_premium",
    name: "Premium Pro",
    subtitle: "Tutto + pagamenti + QR + fatturazione",
    yearly: 1199.88,
    monthly: 99.99,
    color: "#8B5CF6",
    icon: "crown",
    badge: "TUTTO INCLUSO",
    features: [
      "✨ Tutto di Food + Ordini",
      "💳 Pagamenti in-app (Stripe)",
      "📱 Ordini diretti da QR Code",
      "🧾 Fatturazione automatica",
      "🗄️ Database e report su misura",
      "🔒 Sicurezza avanzata",
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
  if (tenant.plan_type === "food_standard") return PLANS.food_standard;
  if (tenant.plan_type === "food_premium") return PLANS.food_premium;
  if (tenant.plan_type === "beauty") return PLANS.beauty;
  if (tenant.plan_type === "service") return PLANS.service;
  return PLANS.food_menu;
}

export const FOOD_PLANS = [PLANS.food_menu, PLANS.food_standard, PLANS.food_premium];
