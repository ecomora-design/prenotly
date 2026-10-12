import { NextResponse } from "next/server";
import { sendWhatsAppNotification } from "@/lib/whatsapp/notify";

export async function POST(req: Request) {
  try {
    const { phone, apiKey } = await req.json();

    if (!phone || !apiKey) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const result = await sendWhatsAppNotification({
      phone,
      apiKey,
      message:
        "✅ *Test Prenotly riuscito!*\n\n" +
        "Da ora riceverai qui tutte le notifiche delle prenotazioni.\n\n" +
        "Grazie per aver attivato le notifiche WhatsApp! 🎉",
    });

    return NextResponse.json({ success: result.success, error: result.error });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore" },
      { status: 500 }
    );
  }
}
