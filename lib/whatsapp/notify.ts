/**
 * Invia un messaggio WhatsApp tramite CallMeBot
 * https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */
export async function sendWhatsAppNotification({
  phone,
  apiKey,
  message,
}: {
  phone: string;
  apiKey: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Pulisci numero (solo cifre e +)
    let cleanPhone = phone.replace(/[^\d+]/g, "");
    if (cleanPhone.startsWith("+")) cleanPhone = cleanPhone.substring(1);
    if (!cleanPhone.startsWith("39")) cleanPhone = "39" + cleanPhone;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(
      message
    )}&apikey=${apiKey}`;

    const res = await fetch(url, { method: "GET" });

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error("CallMeBot error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Errore sconosciuto",
    };
  }
}

/**
 * Formatta il messaggio di notifica per una nuova prenotazione
 */
export function buildBookingNotificationMessage({
  businessName,
  customerName,
  customerPhone,
  serviceName,
  scheduledDate,
  scheduledTime,
  price,
  notes,
  bookingCode,
}: {
  businessName: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  price?: number;
  notes?: string;
  bookingCode: string;
}): string {
  const lines: string[] = [];

  lines.push(`🔔 *NUOVA PRENOTAZIONE*`);
  lines.push(`_${businessName}_`);
  lines.push("");
  lines.push(`📅 *Data:* ${scheduledDate}`);
  lines.push(`⏰ *Ora:* ${scheduledTime}`);
  lines.push(`✂️ *Servizio:* ${serviceName}`);
  if (price) lines.push(`💶 *Prezzo:* €${price.toFixed(2)}`);
  lines.push("");
  lines.push(`👤 *Cliente:* ${customerName}`);
  lines.push(`📞 *Telefono:* ${customerPhone}`);
  if (notes) {
    lines.push("");
    lines.push(`📝 *Note:* ${notes}`);
  }
  lines.push("");
  lines.push(`🔖 Codice: ${bookingCode}`);

  return lines.join("\n");
}

/**
 * Formatta il messaggio di notifica per un nuovo ordine
 */
export function buildOrderNotificationMessage({
  businessName,
  customerName,
  customerPhone,
  items,
  total,
  orderType,
  scheduledTime,
  address,
  orderCode,
}: {
  businessName: string;
  customerName: string;
  customerPhone?: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  orderType: string;
  scheduledTime: string;
  address?: string;
  orderCode: string;
}): string {
  const lines: string[] = [];

  lines.push(`🍕 *NUOVO ORDINE*`);
  lines.push(`_${businessName}_`);
  lines.push("");
  lines.push(`📦 *Tipo:* ${orderType === "delivery" ? "Domicilio" : "Asporto"}`);
  lines.push(`⏰ *Orario:* ${scheduledTime}`);
  if (address) lines.push(`📍 *Indirizzo:* ${address}`);
  lines.push("");
  lines.push(`*Ordine:*`);
  items.forEach((item) => {
    lines.push(`• ${item.qty}x ${item.name} — €${(item.qty * item.price).toFixed(2)}`);
  });
  lines.push("");
  lines.push(`💰 *Totale:* €${total.toFixed(2)}`);
  lines.push("");
  lines.push(`👤 *Cliente:* ${customerName}`);
  if (customerPhone) lines.push(`📞 *Telefono:* ${customerPhone}`);
  lines.push(`🔖 Codice: ${orderCode}`);

  return lines.join("\n");
}
