export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json({ error: "Firma non valida" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // ── CHECKOUT COMPLETATO ──
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tenantId = session.metadata?.tenant_id;
    const planType = session.metadata?.plan_type;
    const interval = session.metadata?.interval;

    if (tenantId && planType && interval) {
      const now = new Date();
      let endsAt: Date;
      if (interval === "yearly") {
        endsAt = new Date(now);
        endsAt.setFullYear(endsAt.getFullYear() + 1);
      } else {
        endsAt = new Date(now);
        endsAt.setMonth(endsAt.getMonth() + 1);
      }

      const { error } = await supabase
        .from("tenants")
        .update({
          subscription_status: "active",
          plan_type: planType,
          subscription_interval: interval,
          subscription_ends_at: endsAt.toISOString(),
          enable_table_bookings: planType === "food_tables" || planType === "food_premium",
          stripe_subscription_id: session.subscription as string,
        })
        .eq("id", tenantId);

      if (error) {
        console.error("Errore aggiornamento tenant:", error);
        return NextResponse.json({ error: "Errore DB" }, { status: 500 });
      }
      console.log("✅ Abbonamento attivato: " + planType + " (" + interval + ") per tenant " + tenantId);
    }
  }

  // ── SUBSCRIPTION AGGIORNATA ──
  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;

    // In API recenti, current_period_end è dentro items.data[0]
    const item = sub.items?.data?.[0];
    const periodEnd = (item as any)?.current_period_end || (sub as any).current_period_end;

    if (sub.status === "active" && periodEnd) {
      const endsAt = new Date(periodEnd * 1000);
      await supabase
        .from("tenants")
        .update({
          subscription_status: "active",
          subscription_ends_at: endsAt.toISOString(),
        })
        .eq("stripe_customer_id", customerId);
    }
  }

  // ── SUBSCRIPTION CANCELLED ──
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    await supabase
      .from("tenants")
      .update({ subscription_status: "expired" })
      .eq("stripe_customer_id", customerId);
  }

  return NextResponse.json({ received: true });
}
