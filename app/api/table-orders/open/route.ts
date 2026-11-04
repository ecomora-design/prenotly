import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, tableId, partySize, notes } = body;

    if (!tenantId || !tableId) {
      return NextResponse.json({ error: "tenantId e tableId richiesti" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const admin = createAdminClient();

    // Verifica che l'utente appartenga al tenant (titolare o staff)
    const { data: owner } = await admin
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    let isAuthorized = !!owner;

    if (!isAuthorized) {
      const { data: staffRow } = await admin
        .from("staff")
        .select("id")
        .eq("user_id", user.id)
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .maybeSingle();
      isAuthorized = !!staffRow;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    // Verifica che il tavolo non abbia già una comanda aperta
    const { data: existing } = await admin
      .from("table_orders")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("table_id", tableId)
      .eq("status", "open")
      .maybeSingle();

    if (existing) {
      // Carica la comanda completa per restituirla al client
      const { data: fullOrder } = await admin
        .from("table_orders")
        .select("*")
        .eq("id", existing.id)
        .single();
      return NextResponse.json({ error: "Esiste già una comanda aperta per questo tavolo", order: fullOrder, orderId: existing.id }, { status: 409 });
    }

    const { data: order, error } = await admin
      .from("table_orders")
      .insert({
        tenant_id: tenantId,
        table_id: tableId,
        party_size: partySize || 2,
        status: "open",
        items: [],
        total: 0,
        opened_by: user.id,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("table_order open error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err: any) {
    console.error("API open error:", err);
    return NextResponse.json({ error: err.message || "Errore" }, { status: 500 });
  }
}
