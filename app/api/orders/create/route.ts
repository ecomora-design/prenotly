import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Item = {
  serviceId: string;
  name: string;
  price: number;
  qty: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      slug,
      customerName,
      customerPhone,
      items,
      total,
      orderType,
      deliveryAddress,
      scheduledFor,
      notes,
    } = body;

    if (!slug || !customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Trova il tenant
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, business_name, whatsapp_number")
      .eq("slug", slug)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: "Attività non trovata" }, { status: 404 });
    }

    // Cerca o crea il customer
    let customerId: string | null = null;
    const phone = customerPhone || "";
    if (phone) {
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("whatsapp_number", phone)
        .maybeSingle();

      if (existing) {
        customerId = existing.id;
        await supabase
          .from("customers")
          .update({ name: customerName })
          .eq("id", customerId);
      } else {
        const { data: created } = await supabase
          .from("customers")
          .insert({
            tenant_id: tenant.id,
            name: customerName,
            whatsapp_number: phone,
          })
          .select("id")
          .single();
        customerId = created?.id || null;
      }
    }

    // Genera codice ordine
    const orderCode = "OR-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Salva l'ordine
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        tenant_id: tenant.id,
        customer_id: customerId,
        order_code: orderCode,
        items: items.map((i: Item) => ({
          service_id: i.serviceId,
          name: i.name,
          price: i.price,
          qty: i.qty,
        })),
        total: Number(total) || 0,
        order_type: orderType === "delivery" ? "delivery" : "takeaway",
        delivery_address: deliveryAddress || null,
        scheduled_for: scheduledFor || null,
        notes: notes || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Order insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("API orders error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore" },
      { status: 500 }
    );
  }
}
