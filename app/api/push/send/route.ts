import { NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

// Configura VAPID (una volta)
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:info@prenotly-italia.it",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type Payload = {
  tenantId: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export async function POST(req: Request) {
  try {
    const body: Payload = await req.json();
    const { tenantId, title, body: msgBody, url, tag } = body;

    if (!tenantId || !title || !msgBody) {
      return NextResponse.json({ error: "tenantId, title e body richiesti" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Carica tutte le subscription del tenant
    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("tenant_id", tenantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!subs || subs.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "Nessuna subscription" });
    }

    const payload = JSON.stringify({
      title,
      body: msgBody,
      url: url || "/staff/dashboard",
      tag: tag || "prenotly-notification",
    });

    let sent = 0;
    let failed = 0;
    const toDelete: string[] = [];

    await Promise.all(
      subs.map(async (sub: any) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
          sent++;
        } catch (err: any) {
          failed++;
          // 404 o 410 = subscription scaduta → eliminala
          if (err.statusCode === 404 || err.statusCode === 410) {
            toDelete.push(sub.endpoint);
          }
        }
      })
    );

    // Pulisci subscription scadute
    if (toDelete.length > 0) {
      await supabase.from("push_subscriptions").delete().in("endpoint", toDelete);
    }

    return NextResponse.json({ success: true, sent, failed, cleaned: toDelete.length });
  } catch (err: any) {
    console.error("send error:", err);
    return NextResponse.json({ error: err.message || "Errore" }, { status: 500 });
  }
}
