import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const datetime = url.searchParams.get("datetime");

    if (!slug || !datetime) {
      return NextResponse.json({ busyTableIds: [] });
    }

    const supabase = createAdminClient();

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!tenant) return NextResponse.json({ busyTableIds: [] });

    // Verifica prenotazioni nello stesso slot (±2 ore)
    const target = new Date(datetime);
    const start = new Date(target.getTime() - 2 * 60 * 60 * 1000);
    const end = new Date(target.getTime() + 2 * 60 * 60 * 1000);

    const { data: bookings } = await supabase
      .from("bookings")
      .select("table_id, scheduled_at, duration_minutes")
      .eq("tenant_id", tenant.id)
      .eq("booking_type", "table")
      .neq("status", "cancelled")
      .gte("scheduled_at", start.toISOString())
      .lte("scheduled_at", end.toISOString());

    const busyTableIds: string[] = [];
    (bookings || []).forEach((b) => {
      if (!b.table_id) return;
      const bStart = new Date(b.scheduled_at).getTime();
      const bEnd = bStart + (b.duration_minutes || 120) * 60000;
      const tStart = target.getTime();
      const tEnd = tStart + 120 * 60000;

      if (tStart < bEnd && tEnd > bStart) {
        busyTableIds.push(b.table_id);
      }
    });

    return NextResponse.json({ busyTableIds });
  } catch (err) {
    console.error("Busy tables error:", err);
    return NextResponse.json({ busyTableIds: [] });
  }
}
