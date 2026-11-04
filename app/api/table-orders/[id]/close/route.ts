import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { paymentMethod } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const admin = createAdminClient();
    const { data: order } = await admin.from("table_orders").select("*").eq("id", id).single();
    if (!order) return NextResponse.json({ error: "Comanda non trovata" }, { status: 404 });
    // Se già paid/cancelled, errore
    if (order.status === "paid" || order.status === "cancelled") {
      return NextResponse.json({ error: "Comanda già pagata o annullata" }, { status: 400 });
    }
    // Se già closed, restituisci 200 con l'ordine (idempotente)
    if (order.status === "closed") {
      return NextResponse.json({ order });
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

    const updateData: any = {
      status: "closed",
      closed_at: new Date().toISOString(),
    };

    if (paymentMethod) {
      updateData.status = "paid";
      updateData.paid_at = new Date().toISOString();
      updateData.payment_method = paymentMethod;
    }

    const { data: updated, error } = await admin
      .from("table_orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Errore" }, { status: 500 });
  }
}
