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


import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
    return {};
  }

  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("business_name, description, logo_url, brand_color")
    .eq("slug", slug)
    .single();

  if (!tenant) {
    return { title: "Prenotly" };
  }

  const brandColor = tenant.brand_color || "#25D366";
  const logoUrl = tenant.logo_url || "/icon-512.png";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prenotly-italia.it";

  return {
    title: tenant.business_name,
    description:
      tenant.description || `Prenota o ordina da ${tenant.business_name}`,
    manifest: `/api/manifest?slug=${slug}`,
    applicationName: tenant.business_name,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: tenant.business_name,
    },
    icons: {
      icon: logoUrl,
      apple: `/api/apple-icon?slug=${slug}`,
    },
    openGraph: {
      title: tenant.business_name,
      description: tenant.description || `Prenota o ordina da ${tenant.business_name}`,
      url: `${appUrl}/${slug}`,
      siteName: tenant.business_name,
      images: tenant.logo_url ? [{ url: tenant.logo_url }] : [],
      locale: "it_IT",
      type: "website",
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": tenant.business_name,
    },
  };
}

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

  // Tavoli (solo se feature attiva)
  let tables: any[] = [];
  if ((tenant.enable_table_bookings ?? tenant.has_table_booking) !== false) {
    const { data: tablesData } = await supabase
      .from("tables")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .order("table_number", { ascending: true });
    tables = tablesData || [];
  }

  const isDemo = slug.startsWith("demo-");

  if (tenant.business_type === "restaurant") {
    return (
      <>
        {isDemo && <DemoBanner type="ristorante" />}
        <MenuClient
          planType={tenant.plan_type}
          tenantName={tenant.business_name}
          tenantAddress={tenant.address}
          tenantPhone={tenant.phone}
          tenantDescription={tenant.description}
          openingHours={tenant.opening_hours}
          appNumber={tenant.app_number || ""}
          services={services || []}
          brandColor={tenant.brand_color || "#25D366"}
          logoUrl={tenant.logo_url}
          coverImageUrl={tenant.cover_image_url}
          slug={slug}
          tableBookingEnabled={(tenant.enable_table_bookings ?? tenant.has_table_booking) !== false}
          tables={tables}
          maxPartySize={tenant.max_party_size ?? 10}
          hasDelivery={tenant.has_delivery ?? true}
          hasTakeaway={tenant.has_takeaway ?? true}
          deliveryFee={Number(tenant.delivery_fee) || 0}
          minOrderDelivery={Number(tenant.min_order_delivery) || 0}
          tableSlots={tenant.booking_slots || tenant.table_slots}
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
        appNumber={tenant.app_number || ""}
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
