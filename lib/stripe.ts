import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY mancante. Aggiungila su Vercel.");
    }
    _stripe = new Stripe(apiKey, {
      apiVersion: "2026-09-30.endive",
      typescript: true,
    });
  }
  return _stripe;
}

// Per compatibilità con il codice esistente che fa "import { stripe }"
// Usiamo un Proxy che inizializza al primo utilizzo
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const realStripe = getStripe();
    const value = (realStripe as any)[prop];
    return typeof value === "function" ? value.bind(realStripe) : value;
  },
});
