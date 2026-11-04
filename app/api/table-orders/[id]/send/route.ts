import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const admin = createAdminClient();
    const { data: order } = await admin.from("table_orders").select("*").eq("id", id).single();
    if (!order) return NextResponse.json({ error: "Comanda non trovata" }, { status: 404 });
    if (order.status !== "open") {
      return NextResponse.json({ error: "Comanda non è in stato 'open', non può essere inviata" }, { status: 400 });
    }

    const items = (order.items as any[]) || [];
    if (items.length === 0) {
      return NextResponse.json({ error: "Comanda vuota, aggiungi almeno un piatto" }, { status: 400 });
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

    const { data: updated, error } = await admin
      .from("table_orders")
      .update({ status: "sent" })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Push notification allo staff (fire-and-forget)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.prenotly-italia.it";
      fetch(baseUrl + "/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: order.tenant_id,
          title: "👨‍🍳 Comanda in cucina",
          body: `Tavolo · ${items.length} piatti · €${Number(order.total).toFixed(2)}`,
          url: "/staff/dashboard",
          tag: "table-order-" + id,
        }),
      }).catch(err => console.error("push send error:", err));
    } catch (pushErr) {
      console.error("push trigger error:", pushErr);
    }

    return NextResponse.json({ order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Errore" }, { status: 500 });
  }
}
