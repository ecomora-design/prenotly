export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const trackingToken = (body.trackingToken || "").toString().trim();

    if (!id || !trackingToken) {
      return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order } = await supabase
      .from("orders")
      .select("id, tenant_id, order_code, items, total, order_type, delivery_address, scheduled_for, notes, status, payment_required, tracking_token")
      .eq("id", id)
      .eq("tracking_token", trackingToken)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
    }

    if (order.status !== "pending_payment") {
      return NextResponse.json({ error: "Ordine già pagato o non richiede pagamento" }, { status: 400 });
    }

    if (!order.payment_required) {
      return NextResponse.json({ error: "Questo ordine non richiede pagamento online" }, { status: 400 });
    }

    // Recupera tenant + stato Stripe
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, slug, business_name, brand_color, plan_type, stripe_account_id, stripe_connect_status")
      .eq("id", order.tenant_id)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: "Ristorante non trovato" }, { status: 404 });
    }

    const t = tenant as any;

    if (
      t.plan_type !== "food_premium" ||
      !t.stripe_account_id ||
      t.stripe_connect_status !== "active"
    ) {
      return NextResponse.json({ error: "Pagamento online non disponibile per questo ristorante" }, { status: 400 });
    }

    // Costruisci line_items dai prodotti dell'ordine
    const lineItems = (order.items as any[]).map((it) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: it.name,
        },
        unit_amount: Math.round(Number(it.price) * 100),
      },
      quantity: Number(it.qty) || 1,
    }));

    // Aggiungi delivery fee se presente
    const orderTotalCents = Math.round(Number(order.total) * 100);
    const subtotalCents = (order.items as any[]).reduce(
      (s, i) => s + Math.round(Number(i.price) * 100) * (Number(i.qty) || 1),
      0
    );
    const extraCents = orderTotalCents - subtotalCents;
    if (extraCents > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: order.order_type === "delivery" ? "Consegna" : "Supplemento" },
          unit_amount: extraCents,
        },
        quantity: 1,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.prenotly-italia.it";
    const basePath = `/${t.slug}/order/success?session_id={CHECKOUT_SESSION_ID}&code=${order.order_code}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_creation: "if_required",
      success_url: `${appUrl}${basePath}`,
      cancel_url: `${appUrl}/${t.slug}?payment_canceled=true&order=${order.order_code}`,
      metadata: {
        type: "order",
        order_id: order.id,
        tenant_id: order.tenant_id,
        order_code: order.order_code,
      },
      payment_intent_data: {
        transfer_data: {
          destination: t.stripe_account_id,
        },
        metadata: {
          type: "order",
          order_id: order.id,
          tenant_id: order.tenant_id,
        },
      },
    });

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Order checkout error:", err);
    return NextResponse.json({ error: err.message || "Errore interno" }, { status: 500 });
  }
}
