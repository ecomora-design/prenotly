import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { paymentMethod } = body;

    if (!paymentMethod || !["cash", "card", "other"].includes(paymentMethod)) {
      return NextResponse.json({ error: "paymentMethod richiesto (cash, card, other)" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const admin = createAdminClient();
    const { data: order } = await admin.from("table_orders").select("*").eq("id", id).single();
    if (!order) return NextResponse.json({ error: "Comanda non trovata" }, { status: 404 });
    if (order.status === "paid") return NextResponse.json({ error: "Già pagata" }, { status: 400 });

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
      .update({
        status: "paid",
        closed_at: order.closed_at || new Date().toISOString(),
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // LIBERA IL TAVOLO: chiudi il booking associato (se esiste) per oggi
    try {
      const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
      const todayStart = new Date(todayStr + "T00:00:00").toISOString();
      const todayEnd = new Date(todayStr + "T23:59:59").toISOString();

      const { data: bookingsToClose } = await admin
        .from("bookings")
        .select("id")
        .eq("tenant_id", order.tenant_id)
        .eq("table_id", order.table_id)
        .eq("booking_type", "table")
        .neq("status", "cancelled")
        .neq("status", "completed")
        .gte("scheduled_at", todayStart)
        .lte("scheduled_at", todayEnd);

      if (bookingsToClose && bookingsToClose.length > 0) {
        await admin
          .from("bookings")
          .update({ status: "completed" })
          .in("id", bookingsToClose.map((b: any) => b.id));
        console.log(`[PAY] Chiusi ${bookingsToClose.length} booking per tavolo ${order.table_id}`);
      }
    } catch (bookingErr) {
      console.error("[PAY] Errore chiusura booking:", bookingErr);
      // Non bloccare il pagamento se la chiusura booking fallisce
    }

    return NextResponse.json({ order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Errore" }, { status: 500 });
  }
}
