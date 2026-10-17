import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Item = { serviceId: string; name: string; price: number; qty: number; };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, customerName, customerPhone, items, total, orderType, deliveryAddress, scheduledFor, notes } = body;

    // QUI: Telefono obbligatorio (!customerPhone)
    if (!slug || !customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Dati mancanti (il telefono è obbligatorio)" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", slug).single();
    if (!tenant) return NextResponse.json({ error: "Attività non trovata" }, { status: 404 });

    // Salviamo il cliente con il telefono
    const { data: created, error: custError } = await supabase
      .from("customers")
      .insert({ 
        tenant_id: tenant.id, 
        name: customerName,
        whatsapp_number: customerPhone
      })
      .select("id")
      .single();
    
    if (custError || !created) {
      return NextResponse.json({ error: "Errore cliente: " + custError?.message }, { status: 500 });
    }
    
    const customerId = created.id;
    const orderCode = "OR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data: order, error: orderError } = await supabase.from("orders").insert({
        tenant_id: tenant.id,
        customer_id: customerId,
        order_code: orderCode,
        items: items.map((i: Item) => ({ service_id: i.serviceId, name: i.name, price: i.price, qty: i.qty })),
        total: Number(total) || 0,
        order_type: orderType === "delivery" ? "delivery" : "takeaway",
        delivery_address: deliveryAddress || null,
        scheduled_for: scheduledFor || null,
        notes: notes || null,
        status: "pending",
      }).select().single();

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });
    
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore" }, { status: 500 });
  }
}
