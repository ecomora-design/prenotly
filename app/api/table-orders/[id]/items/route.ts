import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Item = { service_id?: string; name: string; price: number; qty: number };

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, item, itemIndex } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const admin = createAdminClient();

    // Carica comanda
    const { data: order } = await admin.from("table_orders").select("*").eq("id", id).single();
    if (!order) return NextResponse.json({ error: "Comanda non trovata" }, { status: 404 });
    if (order.status === "paid" || order.status === "cancelled") {
      return NextResponse.json({ error: "Comanda già pagata o annullata, impossibile modificare" }, { status: 400 });
    }

    // Verifica autorizzazione
    const { data: owner } = await admin
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .eq("tenant_id", order.tenant_id)
      .maybeSingle();
    let isAuthorized = !!owner;
    if (!isAuthorized) {
      const { data: staffRow } = await admin
        .from("staff")
        .select("id")
        .eq("user_id", user.id)
        .eq("tenant_id", order.tenant_id)
        .eq("is_active", true)
        .maybeSingle();
      isAuthorized = !!staffRow;
    }
    if (!isAuthorized) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });

    let items = (order.items as Item[]) || [];

    if (action === "add") {
      if (!item || !item.name || !item.price) return NextResponse.json({ error: "Item non valido" }, { status: 400 });
      items.push({ service_id: item.service_id, name: item.name, price: Number(item.price), qty: Number(item.qty) || 1 });
    } else if (action === "remove") {
      if (typeof itemIndex !== "number" || itemIndex < 0 || itemIndex >= items.length) {
        return NextResponse.json({ error: "Indice non valido" }, { status: 400 });
      }
      items.splice(itemIndex, 1);
    } else if (action === "updateQty") {
      if (typeof itemIndex !== "number" || !items[itemIndex]) return NextResponse.json({ error: "Indice non valido" }, { status: 400 });
      items[itemIndex].qty = Number(body.qty) || 1;
    } else {
      return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const { data: updated, error } = await admin
      .from("table_orders")
      .update({ items, total })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Errore" }, { status: 500 });
  }
}
