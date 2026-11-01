import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import TrackClient from "./TrackClient";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function TrackPage({ params }: Props) {
  const { code } = await params;

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select(`
      id, order_code, tracking_token, items, total, order_type, status,
      scheduled_for, notes, created_at, delivery_address,
      customers(name, whatsapp_number),
      tenants(business_name, slug, brand_color, phone)
    `)
    .eq("tracking_token", code)
    .maybeSingle();

  if (!order) notFound();

  const t = order.tenants as any;
  const c = order.customers as any;

  return (
    <TrackClient
      initialOrder={{
        id: order.id,
        order_code: order.order_code,
        items: order.items as any,
        total: order.total,
        order_type: order.order_type,
        status: order.status,
        scheduled_for: order.scheduled_for,
        notes: order.notes,
        created_at: order.created_at,
        delivery_address: order.delivery_address,
      }}
      customerName={c?.name || "Cliente"}
      businessName={t?.business_name || "Attività"}
      businessSlug={t?.slug || ""}
      businessColor={t?.brand_color || "#25D366"}
      businessPhone={t?.phone || null}
    />
  );
}
