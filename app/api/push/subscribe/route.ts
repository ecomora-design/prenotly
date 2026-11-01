import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subscription, staffId, tenantId } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: "Subscription non valida" }, { status: 400 });
    }
    if (!staffId || !tenantId) {
      return NextResponse.json({ error: "staffId e tenantId richiesti" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    // Salva (upsert per endpoint)
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        staff_id: staffId,
        tenant_id: tenantId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: req.headers.get("user-agent") || null,
      },
      { onConflict: "user_id,endpoint" }
    );

    if (error) {
      console.error("subscribe error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("subscribe error:", err);
    return NextResponse.json({ error: err.message || "Errore" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { endpoint } = body;
    if (!endpoint) return NextResponse.json({ error: "endpoint richiesto" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Errore" }, { status: 500 });
  }
}
