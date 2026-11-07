import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Item = { serviceId: string; name: string; price: number; qty: number; };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, customerName, customerPhone, items, total, orderType, deliveryAddress, scheduledFor, notes } = body;

    if (!slug || !customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Dati mancanti (il telefono è obbligatorio)" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: tenant } = await supabase.from("tenants").select("id, plan_type, stripe_account_id, stripe_connect_status, web_discount_enabled, web_discount_percent, delivery_fee").eq("slug", slug).single();
    if (!tenant) return NextResponse.json({ error: "Attività non trovata" }, { status: 404 });

    const phone = customerPhone.trim();
    let customerId: string | null = null;

    // 1. Cerchiamo se il cliente esiste già con questo numero
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("whatsapp_number", phone)
      .maybeSingle();

    if (existingCustomer) {
      // Se esiste, usiamo il suo ID e aggiorniamo il nome (nel caso lo abbia cambiato)
      customerId = existingCustomer.id;
      await supabase.from("customers").update({ name: customerName }).eq("id", customerId);
    } else {
      // Se NON esiste, creiamo un nuovo cliente
      const { data: created, error: custError } = await supabase
        .from("customers")
        .insert({ 
          tenant_id: tenant.id, 
          name: customerName,
          whatsapp_number: phone
        })
        .select("id")
        .single();
      
      if (custError || !created) {
        console.error("Errore creazione cliente:", custError);
        return NextResponse.json({ error: "Errore cliente: " + custError?.message }, { status: 500 });
      }
      customerId = created.id;
    }

    // 2. Salviamo l'ordine collegato al cliente
    const orderCode = "OR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Token pubblico per tracking (12 caratteri, non indovinabile)
    const trackingToken = Array.from({length: 12}, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
    
    // Ricalcolo server-side: ignora il total dal client (anti-manomissione)
    const serverSubtotal = items.reduce((sum: number, i: Item) => sum + (Number(i.price) * Number(i.qty)), 0);
    const serverDelivery = orderType === "delivery" ? (Number((tenant as any).delivery_fee) || 0) : 0;
    const serverDiscount = ((tenant as any).web_discount_enabled && (tenant as any).web_discount_percent > 0)
      ? Math.round(serverSubtotal * (tenant as any).web_discount_percent) / 100
      : 0;
    const serverTotal = Math.max(0, serverSubtotal + serverDelivery - serverDiscount);

    const paymentRequired =
      ["food_standard", "food_premium"].includes((tenant as any).plan_type) &&
      !!(tenant as any).stripe_account_id &&
      (tenant as any).stripe_connect_status === "active";

    const { data: order, error: orderError } = await supabase.from("orders").insert({
        tenant_id: tenant.id,
        customer_id: customerId,
        order_code: orderCode,
        items: items.map((i: Item) => ({ service_id: i.serviceId, name: i.name, price: i.price, qty: i.qty })),
        total: serverTotal,
        order_type: orderType === "delivery" ? "delivery" : "takeaway",
        delivery_address: deliveryAddress || null,
        scheduled_for: scheduledFor || null,
        notes: notes || null,
        status: paymentRequired ? "pending_payment" : "pending",
        payment_required: paymentRequired,
        tracking_token: trackingToken,
      }).select().single();

    if (orderError) {
      console.error("Errore salvataggio ordine:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    if (paymentRequired) {
      return NextResponse.json({ order, requires_payment: true });
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.prenotly-italia.it";
      fetch(baseUrl + "/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          title: "🛍️ Nuovo ordine",
          body: customerName + " · " + orderType + " · €" + serverSubtotal.toFixed(2),
          url: "/staff/dashboard",
          tag: "order-" + Date.now(),
        }),
      }).catch(err => console.error("push send error:", err));
    } catch (pushErr) {
      console.error("push trigger error:", pushErr);
    }

    
    return NextResponse.json({ order });
  } catch (err) {
    console.error("Errore API:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore" }, { status: 500 });
  }
}
