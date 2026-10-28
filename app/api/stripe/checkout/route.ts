export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PRICE_MAP: Record<string, string> = {
  "food_menu": process.env.STRIPE_PRICE_FOOD_MENU!,
  "food_standard": process.env.STRIPE_PRICE_FOOD_STANDARD!,
  "food_premium": process.env.STRIPE_PRICE_FOOD_PREMIUM!,
};

export async function POST(req: Request) {
  try {
    const { planType } = await req.json();
    if (!planType) return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });

    const priceId = PRICE_MAP[planType];
    if (!priceId) return NextResponse.json({ error: "Piano non valido" }, { status: 400 });

    // Validazione: verifica che il prezzo corrisponda al piano
    try {
      const price = await stripe.prices.retrieve(priceId);
      const expectedAmounts: Record<string, number> = {
        "food_menu": 999,
        "food_standard": 2999,
        "food_premium": 9999,
      };
      if (price.unit_amount !== expectedAmounts[planType]) {
        console.error("[CHECKOUT] ❌ INCOERENZA PREZZO:", {
          planType,
          priceId,
          expected: expectedAmounts[planType],
          actual: price.unit_amount,
        });
        return NextResponse.json({ 
          error: "Configurazione prezzo errata. Contatta il supporto." 
        }, { status: 500 });
      }
    } catch (err: any) {
      console.error("[CHECKOUT] Errore validazione prezzo:", err.message);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const admin = createAdminClient();
    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id, tenants(id, business_name, slug, stripe_customer_id)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link?.tenants) return NextResponse.json({ error: "Attività non trovata" }, { status: 404 });

    const tenant = link.tenants as any;
    let customerId = tenant.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: tenant.business_name,
        metadata: { tenant_id: tenant.id, tenant_slug: tenant.slug },
      });
      customerId = customer.id;
      await admin.from("tenants").update({ stripe_customer_id: customerId }).eq("id", tenant.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.prenotly-italia.it";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: appUrl + "/dashboard/abbonamento?success=true&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: appUrl + "/dashboard/abbonamento?canceled=true",
      metadata: { tenant_id: tenant.id, plan_type: planType, interval: "monthly" },
      subscription_data: {
        metadata: { tenant_id: tenant.id, plan_type: planType, interval: "monthly" },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message || "Errore interno" }, { status: 500 });
  }
}
