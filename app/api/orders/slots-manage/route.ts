import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const url = new URL(req.url);
    const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
    const date = url.searchParams.get("date") || todayStr;

    const admin = createAdminClient();
    
    const { data: link, error: linkErr } = await admin
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (linkErr) { console.error("GET tenant_users error:", linkErr); return NextResponse.json({ error: linkErr.message }, { status: 500 }); }
    if (!link) return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });

    const { data: tenant, error: tenantErr } = await admin
      .from("tenants")
      .select("opening_hours, max_orders_per_slot")
      .eq("id", link.tenant_id)
      .maybeSingle();
    if (tenantErr) { console.error("GET tenants error:", tenantErr); return NextResponse.json({ error: tenantErr.message }, { status: 500 }); }
    if (!tenant) return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });

    const defaultCapacity = tenant.max_orders_per_slot || 5;

    const dayStart = new Date(`${date}T00:00:00.000Z`).getTime();
    const startOfDay = new Date(dayStart - 24 * 60 * 60 * 1000).toISOString();
    const endOfDay = new Date(dayStart + 48 * 60 * 60 * 1000).toISOString();

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
      
      const slot = d.toLocaleTimeString("it-IT", {
        timeZone: "Europe/Rome",
        hour: "2-digit",
        minute: "2-digit",
      });

      const orderDate = d.toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
      if (orderDate !== date) return;

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
    console.log("🟢 POST slots-manage | user:", user?.email || "NO USER");
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const body = await req.json();
    console.log("🟢 POST body:", body);
    const { date, slot, manual_orders_count, is_blocked, capacity_override, notes } = body;

    if (!date || !slot) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

    const normalizedSlot = slot.length > 5 ? slot.slice(0, 5) : slot;

    const admin = createAdminClient();
    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();

    console.log("🟢 POST link tenant:", link);
    if (!link) return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });

    const { data: existing } = await admin
      .from("slot_management")
      .select("id")
      .eq("tenant_id", link.tenant_id)
      .eq("date", date)
      .eq("slot", normalizedSlot)
      .maybeSingle();

    const payload = {
      tenant_id: link.tenant_id,
      date,
      slot: normalizedSlot,
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
