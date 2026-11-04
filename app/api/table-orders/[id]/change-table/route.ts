import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { newTableId } = await req.json();

    if (!newTableId) return NextResponse.json({ error: "newTableId richiesto" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const admin = createAdminClient();
    const { data: order } = await admin.from("table_orders").select("*").eq("id", id).single();
    if (!order) return NextResponse.json({ error: "Comanda non trovata" }, { status: 404 });
    if (order.status === "paid" || order.status === "cancelled") {
      return NextResponse.json({ error: "Comanda già chiusa" }, { status: 400 });
    }

    // Verifica che il nuovo tavolo appartenga al tenant
    const { data: newTable } = await admin
      .from("tables")
      .select("id")
      .eq("id", newTableId)
      .eq("tenant_id", order.tenant_id)
      .maybeSingle();
    if (!newTable) return NextResponse.json({ error: "Tavolo non valido" }, { status: 400 });

    // Verifica che il nuovo tavolo non abbia già una comanda aperta
    const { data: existingOnNew } = await admin
      .from("table_orders")
      .select("id")
      .eq("table_id", newTableId)
      .eq("tenant_id", order.tenant_id)
      .neq("status", "paid")
      .neq("status", "cancelled")
      .neq("id", id)
      .maybeSingle();
    if (existingOnNew) return NextResponse.json({ error: "Il tavolo di destinazione ha già una comanda aperta" }, { status: 409 });

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
        .select("id, reparto")
        .eq("user_id", user.id)
        .eq("tenant_id", order.tenant_id)
        .eq("is_active", true)
        .maybeSingle();
      isAuthorized = !!staffRow && (staffRow.reparto === "floor" || staffRow.reparto === "both");
    }
    if (!isAuthorized) return NextResponse.json({ error: "Non autorizzato (solo sala può cambiare tavolo)" }, { status: 403 });

    const { data: updated, error } = await admin
      .from("table_orders")
      .update({ table_id: newTableId })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Errore" }, { status: 500 });
  }
}
