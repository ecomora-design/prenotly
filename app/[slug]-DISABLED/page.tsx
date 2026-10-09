import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MenuClient from "./MenuClient";
import InstallBanner from "@/components/InstallBanner";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TenantPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!tenant) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  return (
    <>
      <MenuClient
        tenantName={tenant.business_name}
        tenantAddress={tenant.address}
        tenantPhone={tenant.phone}
        tenantDescription={tenant.description}
        openingHours={tenant.opening_hours}
        whatsappNumber={tenant.whatsapp_number || ""}
        services={services || []}
      />
      <InstallBanner />
    </>
  );
}
