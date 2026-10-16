import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PRICE_MAP: Record<string, string> = {
  food: process.env.STRIPE_PRICE_FOOD!,
  tables: process.env.STRIPE_PRICE_TABLES!,
  premium: process.env.STRIPE_PRICE_PREMIUM!,
  pro: process.env.STRIPE_PRICE_PRO!,
};

export async function POST(req: Request) {
  try {
    const { planType } = await req.json();

    if (!planType || !PRICE_MAP[planType]) {
      return NextResponse.json({ error: "Piano non valido" }, { status: 400 });
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

    if (!link?.tenants) {
      return NextResponse.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const tenant = link.tenants as any;
    let customerId = tenant.stripe_customer_id;

    // Crea customer Stripe se non esiste
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: tenant.business_name,
        metadata: { tenant_id: tenant.id, tenant_slug: tenant.slug },
      });
      customerId = customer.id;

      await admin
        .from("tenants")
        .update({ stripe_customer_id: customerId })
        .eq("id", tenant.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Crea checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_MAP[planType], quantity: 1 }],
      success_url: `${appUrl}/dashboard/abbonamento?success=true`,
      cancel_url: `${appUrl}/dashboard/abbonamento?canceled=true`,
      metadata: { tenant_id: tenant.id, plan_type: planType },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore" },
      { status: 500 }
    );
  }
}
