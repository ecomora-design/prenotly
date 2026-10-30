import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const date = url.searchParams.get("date"); // YYYY-MM-DD

    if (!slug || !date) {
      return NextResponse.json({ error: "slug e date richiesti" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });
    }

    // Capacità = numero operatori attivi (default 1)
    const { data: activeStaff } = await supabase
      .from("staff")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true);
    const capacity = (activeStaff && activeStaff.length > 0) ? activeStaff.length : 1;

    // Prenotazioni del giorno (solo appuntamenti, non cancellati)
    const dayStart = new Date(date + "T00:00:00.000Z").toISOString();
    const dayEnd = new Date(date + "T23:59:59.999Z").toISOString();

    const { data: bookings } = await supabase
      .from("bookings")
      .select("scheduled_at, duration_minutes, status")
      .eq("tenant_id", tenant.id)
      .eq("booking_type", "appointment")
      .gte("scheduled_at", dayStart)
      .lte("scheduled_at", dayEnd)
      .neq("status", "cancelled");

    // Conta prenotazioni per slot (HH:MM in timezone Europe/Rome)
    const occupied: Record<string, number> = {};
    (bookings || []).forEach((b) => {
      const d = new Date(b.scheduled_at);
      const hh = d.toLocaleTimeString("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit", hour12: false });
      occupied[hh] = (occupied[hh] || 0) + 1;
    });

    return NextResponse.json({ occupied, capacity });
  } catch (err) {
    console.error("slots-availability error:", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
