import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MenuClient from "./MenuClient";
import BookingClient from "./BookingClient";
import InstallBanner from "@/components/InstallBanner";
import DemoBanner from "@/components/DemoBanner";
import TrialExpired from "./TrialExpired";

export const dynamic = "force-dynamic";

const RESERVED_SLUGS = [
  "login", "signup", "dashboard", "onboarding",
  "ristoranti", "parrucchieri", "prezzi", "service",
  "admin", "demo-ristorante", "demo-parrucchiere", "demo-salone",
  "test-supabase", "api", "manifest", "favicon", "privacy",
];

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TenantPage({ params }: Props) {
  const { slug } = await params;

  if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
    notFound();
  }

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!tenant) notFound();

  const now = Date.now();
  const status = tenant.subscription_status;
  const trialEnds = tenant.trial_ends_at ? new Date(tenant.trial_ends_at).getTime() : 0;
  const subEnds = tenant.subscription_ends_at ? new Date(tenant.subscription_ends_at).getTime() : 0;

  let isBlocked = false;
  let blockReason: "trial_expired" | "subscription_expired" | null = null;

  if (status === "trial") {
    if (trialEnds && trialEnds < now) {
      isBlocked = true;
      blockReason = "trial_expired";
    }
  } else if (status === "active") {
    if (subEnds && subEnds < now) {
      isBlocked = true;
      blockReason = "subscription_expired";
    }
  } else if (status === "expired" || status === "suspended") {
    isBlocked = true;
    blockReason = "subscription_expired";
  }

  if (isBlocked) {
    return <TrialExpired businessName={tenant.business_name} reason={blockReason} />;
  }

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  const isDemo = slug.startsWith("demo-");

  if (tenant.business_type === "restaurant") {
    return (
      <>
        {isDemo && <DemoBanner type="ristorante" />}
        <MenuClient
          tenantName={tenant.business_name}
          tenantAddress={tenant.address}
          tenantPhone={tenant.phone}
          tenantDescription={tenant.description}
          openingHours={tenant.opening_hours}
          whatsappNumber={tenant.whatsapp_number || ""}
          services={services || []}
          brandColor={tenant.brand_color || "#25D366"}
          logoUrl={tenant.logo_url}
          coverImageUrl={tenant.cover_image_url}
          slug={slug}
          tableBookingEnabled={tenant.table_booking_enabled ?? true}
          tableSlots={tenant.table_slots}
          maxPartySize={tenant.max_party_size ?? 8}
        />
        <InstallBanner />
      </>
    );
  }

  return (
    <>
      {isDemo && <DemoBanner type="parrucchiere" />}
      <BookingClient
        tenantName={tenant.business_name}
        tenantAddress={tenant.address}
        tenantPhone={tenant.phone}
        tenantDescription={tenant.description}
        whatsappNumber={tenant.whatsapp_number || ""}
        services={services || []}
        openingHours={tenant.opening_hours}
        brandColor={tenant.brand_color || "#8B5CF6"}
        logoUrl={tenant.logo_url}
        coverImageUrl={tenant.cover_image_url}
        slug={slug}
      />
      <InstallBanner />
    </>
  );
}
