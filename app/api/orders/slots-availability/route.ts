import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const date = url.searchParams.get("date");

    if (!slug || !date) {
      return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, max_orders_per_slot")
      .eq("slug", slug)
      .single();

    if (!tenant) return NextResponse.json({ error: "Attività non trovata" }, { status: 404 });

    const defaultCapacity = tenant.max_orders_per_slot || 5;

    const dayStart = new Date(`${date}T00:00:00.000Z`).getTime();
    const startOfDay = new Date(dayStart - 24 * 60 * 60 * 1000).toISOString();
    const endOfDay = new Date(dayStart + 48 * 60 * 60 * 1000).toISOString();

    const { data: orders } = await supabase
      .from("orders")
      .select("scheduled_for")
      .eq("tenant_id", tenant.id)
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

    const { data: overrides } = await supabase
      .from("slot_management")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("date", date);

    const availability: Record<string, any> = {};

    (overrides || []).forEach((o) => {
      const slotKey = o.slot.slice(0, 5); 
      const webCount = webCounts[slotKey] || 0;
      const manualCount = o.manual_orders_count || 0;
      const total = webCount + manualCount;
      const capacity = o.capacity_override || defaultCapacity;

      availability[slotKey] = {
        web_count: webCount,
        manual_count: manualCount,
        total,
        capacity,
        available: !o.is_blocked && total < capacity,
        is_blocked: o.is_blocked,
      };
    });

    Object.keys(webCounts).forEach((slot) => {
      if (!availability[slot]) {
        const webCount = webCounts[slot];
        availability[slot] = {
          web_count: webCount,
          manual_count: 0,
          total: webCount,
          capacity: defaultCapacity,
          available: webCount < defaultCapacity,
          is_blocked: false,
        };
      }
    });

    return NextResponse.json({ maxPerSlot: defaultCapacity, availability });
  } catch (err) {
    console.error("Slot availability error:", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
