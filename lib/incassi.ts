import { SupabaseClient } from "@supabase/supabase-js";

export type TopItem = { name: string; qty: number; total: number };
export type TopTable = { number: number; total: number; orders: number };

export type IncassiResult = {
  ordini: number;
  ordiniCount: number;
  tavoli: number;
  tavoliCount: number;
  appuntamenti: number;
  appuntamentiCount: number;
  totaleLordo: number;
  coperti: number;
  topPiatti: TopItem[];
  topTavoli: TopTable[];
};

const EMPTY: IncassiResult = {
  ordini: 0,
  ordiniCount: 0,
  tavoli: 0,
  tavoliCount: 0,
  appuntamenti: 0,
  appuntamentiCount: 0,
  totaleLordo: 0,
  coperti: 0,
  topPiatti: [],
  topTavoli: [],
};

export async function calcolaIncassi(
  supabase: SupabaseClient,
  tenantId: string,
  fromDate: Date,
  toDate: Date
): Promise<IncassiResult> {
  try {
    const fromISO = fromDate.toISOString();
    const toISO = toDate.toISOString();

    // 1. Ordini asporto/domicilio delivered
    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_code, total, items, order_type, created_at, status")
      .eq("tenant_id", tenantId)
      .eq("status", "delivered")
      .gte("created_at", fromISO)
      .lte("created_at", toISO);

    // 2. Comande tavoli pagate
    const { data: tableOrders } = await supabase
      .from("table_orders")
      .select("id, table_id, total, paid_amount, party_size, paid_at, items, tables(table_number)")
      .eq("tenant_id", tenantId)
      .eq("status", "paid")
      .gte("paid_at", fromISO)
      .lte("paid_at", toISO);

    // 3. Appuntamenti completati (con prezzo da services)
    const { data: appointments } = await supabase
      .from("bookings")
      .select("id, service_id, status, scheduled_at, party_size, services(price)")
      .eq("tenant_id", tenantId)
      .eq("booking_type", "appointment")
      .eq("status", "completed")
      .gte("scheduled_at", fromISO)
      .lte("scheduled_at", toISO);

    const ordiniCount = orders?.length || 0;
    const ordiniTotal = (orders || []).reduce((s, o: any) => s + Number(o.total || 0), 0);

    const tavoliCount = tableOrders?.length || 0;
    const tavoliTotal = (tableOrders || []).reduce(
      (s, o: any) => s + Number(o.paid_amount || o.total || 0),
      0
    );
    const coperti = (tableOrders || []).reduce((s, o: any) => s + (o.party_size || 0), 0);

    const appuntamentiCount = appointments?.length || 0;
    const appuntamentiTotal = (appointments || []).reduce((s, a: any) => {
      const price = Number(a.services?.price || 0);
      return s + price;
    }, 0);

    // Top piatti (da ordini + comande)
    const plateCount: Record<string, { qty: number; total: number }> = {};
    const addItems = (items: any[]) => {
      (items || []).forEach((it: any) => {
        if (!it.name) return;
        if (!plateCount[it.name]) plateCount[it.name] = { qty: 0, total: 0 };
        plateCount[it.name].qty += Number(it.qty || 1);
        plateCount[it.name].total += Number(it.qty || 1) * Number(it.price || 0);
      });
    };
    (orders || []).forEach((o: any) => addItems(o.items));
    (tableOrders || []).forEach((o: any) => addItems(o.items));

    const topPiatti = Object.entries(plateCount)
      .map(([name, v]) => ({ name, qty: v.qty, total: v.total }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Top tavoli
    const tableCount: Record<string, { number: number; total: number; orders: number }> = {};
    (tableOrders || []).forEach((o: any) => {
      const num = o.tables?.table_number;
      if (!num) return;
      const key = String(num);
      if (!tableCount[key]) tableCount[key] = { number: Number(num), total: 0, orders: 0 };
      tableCount[key].total += Number(o.paid_amount || o.total || 0);
      tableCount[key].orders += 1;
    });
    const topTavoli = Object.values(tableCount)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      ordini: ordiniTotal,
      ordiniCount,
      tavoli: tavoliTotal,
      tavoliCount,
      appuntamenti: appuntamentiTotal,
      appuntamentiCount,
      totaleLordo: ordiniTotal + tavoliTotal + appuntamentiTotal,
      coperti,
      topPiatti,
      topTavoli,
    };
  } catch (err) {
    console.error("calcolaIncassi error:", err);
    return EMPTY;
  }
}
