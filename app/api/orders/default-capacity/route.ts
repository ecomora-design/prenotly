import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const admin = createAdminClient();
    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!link) return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });

    const { data: tenant } = await admin
      .from("tenants")
      .select("max_orders_per_slot")
      .eq("id", link.tenant_id)
      .maybeSingle();

    return NextResponse.json({
      capacity: tenant?.max_orders_per_slot || 5,
    });
  } catch (err) {
    console.error("default-capacity GET error:", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const { capacity } = await req.json();
    const num = Number(capacity);
    if (!Number.isInteger(num) || num < 1 || num > 20) {
      return NextResponse.json({ error: "Capacità deve essere tra 1 e 20" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!link) return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });

    const { error } = await admin
      .from("tenants")
      .update({ max_orders_per_slot: num })
      .eq("id", link.tenant_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, capacity: num });
  } catch (err) {
    console.error("default-capacity POST error:", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
