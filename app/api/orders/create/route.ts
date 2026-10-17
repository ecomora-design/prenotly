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
    const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", slug).single();
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

    if (orderError) {
      console.error("Errore salvataggio ordine:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }
    
    return NextResponse.json({ order });
  } catch (err) {
    console.error("Errore API:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore" }, { status: 500 });
  }
}
