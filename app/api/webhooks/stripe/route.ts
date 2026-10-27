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
    console.error("[WEBHOOK] ❌ Firma non valida:", err.message);
    return NextResponse.json({ error: "Firma non valida" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tenantId = session.metadata?.tenant_id;
    const planType = session.metadata?.plan_type;
    const interval = session.metadata?.interval;
    console.log("  tenant_id:", tenantId);
    console.log("  plan_type:", planType);
    console.log("  interval:", interval);
    console.log("  payment_status:", session.payment_status);

    if (tenantId && planType) {
      const finalInterval = interval || "monthly";
      const now = new Date();
      let endsAt: Date;
      if (finalInterval === "yearly") {
        endsAt = new Date(now);
        endsAt.setFullYear(endsAt.getFullYear() + 1);
      } else {
        endsAt = new Date(now);
        endsAt.setMonth(endsAt.getMonth() + 1);
      }

      const { data, error } = await supabase
        .from("tenants")
        .update({
          subscription_status: "active",
          plan_type: planType,
          subscription_interval: finalInterval,
          subscription_ends_at: endsAt.toISOString(),
          enable_table_bookings: planType === "food_standard" || planType === "food_premium",
          stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : (session.subscription as any)?.id || null,
        })
        .eq("id", tenantId)
        .select();

      if (error) {
        console.error("[WEBHOOK] ❌ ERRORE DB:", error.message);
        console.error("[WEBHOOK] Dettagli:", JSON.stringify(error, null, 2));
        return NextResponse.json({ error: "Errore DB: " + error.message }, { status: 500 });
      }
    } else {
      console.error("[WEBHOOK] ❌ Metadata mancanti!", { tenantId, planType });
    }
  }

  // ── SUBSCRIPTION CREATED (fallback a checkout.session.completed) ──
  if (event.type === "customer.subscription.created") {
    const sub = event.data.object as Stripe.Subscription;
    const tenantId = sub.metadata?.tenant_id;
    const planType = sub.metadata?.plan_type;
    const interval = sub.metadata?.interval;
    console.log("  tenant_id:", tenantId);
    console.log("  plan_type:", planType);
    console.log("  interval:", interval);

    if (tenantId && planType) {
      const finalInterval = interval || "monthly";
      const now = new Date();
      let endsAt: Date;
      if (finalInterval === "yearly") {
        endsAt = new Date(now);
        endsAt.setFullYear(endsAt.getFullYear() + 1);
      } else {
        endsAt = new Date(now);
        endsAt.setMonth(endsAt.getMonth() + 1);
      }

      const { data, error } = await supabase
        .from("tenants")
        .update({
          subscription_status: "active",
          plan_type: planType,
          subscription_interval: finalInterval,
          subscription_ends_at: endsAt.toISOString(),
          enable_table_bookings: planType === "food_standard" || planType === "food_premium",
          stripe_subscription_id: sub.id,
        })
        .eq("id", tenantId)
        .select();

      if (error) {
        console.error("[WEBHOOK] ❌ ERRORE DB:", error.message);
        return NextResponse.json({ error: "Errore DB: " + error.message }, { status: 500 });
      }
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const item = sub.items?.data?.[0];
    const periodEnd = (item as any)?.current_period_end || (sub as any).current_period_end;
    if (sub.status === "active" && periodEnd) {
      const endsAt = new Date(periodEnd * 1000);
      await supabase.from("tenants").update({
        subscription_status: "active",
        subscription_ends_at: endsAt.toISOString(),
      }).eq("stripe_customer_id", customerId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    await supabase.from("tenants").update({ subscription_status: "expired" }).eq("stripe_customer_id", customerId);
  }
  return NextResponse.json({ received: true });
}
