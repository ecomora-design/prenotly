// Feature flags per piano di abbonamento
// true = incluso nel piano, false = richiede upgrade

export type PlanKey = 'food_menu' | 'food_standard' | 'food_premium' | 'beauty' | 'servizi' | 'services_premium';

export type FeatureKey =
  | 'clientNotes'
  | 'staff'
  | 'expenses'
  | 'suppliers'
  | 'loyalty'
  | 'invoices';

export const PLAN_FEATURES: Record<PlanKey, Record<FeatureKey, boolean>> = {
  food_menu: {
    clientNotes: false,
    staff: false,
    expenses: false,
    suppliers: false,
    loyalty: false,
    invoices: false,
  },
  food_standard: {
    clientNotes: false,
    staff: false,
    expenses: false,
    suppliers: false,
    loyalty: false,
    invoices: false,
  },
  food_premium: {
    clientNotes: true,
    staff: true,
    expenses: true,
    suppliers: true,
    loyalty: true,
    invoices: true,
  },
  beauty: {
    clientNotes: true,
    staff: false,   // staff esclusiva di services_premium
    expenses: false,
    suppliers: false,
    loyalty: false,
    invoices: false,
  },
  services_premium: {
    clientNotes: true,
    staff: true,    // 99,99 €/mese - staff abilitato
    expenses: true,
    suppliers: false,
    loyalty: false,
    invoices: true,
  },
  servizi: {
    clientNotes: false,
    staff: false,
    expenses: false,
    suppliers: false,
    loyalty: false,
    invoices: false,
  },
};

export function planHasFeature(planType: string | null | undefined, feature: FeatureKey): boolean {
  if (!planType) return false;
  const plan = PLAN_FEATURES[planType as PlanKey];
  if (!plan) return false;
  return plan[feature] === true;
}

export function getRequiredPlanLabel(feature: FeatureKey): string {
  // Tutte le feature premium richiedono "Premium Pro"
  return 'Premium Pro (99,99 €/mese)';
}
