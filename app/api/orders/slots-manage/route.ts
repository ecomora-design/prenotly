import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const url = new URL(req.url);
    const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];

    const admin = createAdminClient();
    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id, tenants(opening_hours, max_orders_per_slot)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link?.tenants) return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });

    const tenant = link.tenants as any;
    const defaultCapacity = tenant.max_orders_per_slot || 5;

    const startOfDay = new Date(`${date}T00:00:00`).toISOString();
    const endOfDay = new Date(`${date}T23:59:59`).toISOString();

    const { data: orders } = await admin
      .from("orders")
      .select("scheduled_for")
      .eq("tenant_id", link.tenant_id)
      .gte("scheduled_for", startOfDay)
      .lte("scheduled_for", endOfDay)
      .not("status", "in", "(cancelled,delivered)");

    const webCounts: Record<string, number> = {};
    (orders || []).forEach((o) => {
      if (!o.scheduled_for) return;
      const d = new Date(o.scheduled_for);
      const slot = d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
      webCounts[slot] = (webCounts[slot] || 0) + 1;
    });

    const { data: overrides } = await admin
      .from("slot_management")
      .select("*")
      .eq("tenant_id", link.tenant_id)
      .eq("date", date);

    return NextResponse.json({
      date,
      defaultCapacity,
      openingHours: tenant.opening_hours,
      webCounts,
      overrides: overrides || [],
    });
  } catch (err) {
    console.error("Slots manage GET error:", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const body = await req.json();
    const { date, slot, manual_orders_count, is_blocked, capacity_override, notes } = body;

    if (!date || !slot) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

    const admin = createAdminClient();
    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link) return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });

    const { data: existing } = await admin
      .from("slot_management")
      .select("id")
      .eq("tenant_id", link.tenant_id)
      .eq("date", date)
      .eq("slot", slot)
      .maybeSingle();

    const payload = {
      tenant_id: link.tenant_id,
      date,
      slot,
      manual_orders_count: manual_orders_count ?? 0,
      is_blocked: is_blocked ?? false,
      capacity_override: capacity_override || null,
      notes: notes || null,
    };

    if (existing) {
      const { error } = await admin.from("slot_management").update(payload).eq("id", existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await admin.from("slot_management").insert(payload);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Slots manage POST error:", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
