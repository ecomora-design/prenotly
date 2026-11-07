export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const admin = createAdminClient();
    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id, tenants(id, business_name, plan_type, stripe_account_id)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link?.tenants) {
      return NextResponse.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const tenant = link.tenants as any;

    // GATE: solo Premium Pro
    if (!["food_standard", "food_premium"].includes(tenant.plan_type)) {
      return NextResponse.json(
        { error: "Funzione disponibile solo con il piano Premium Pro" },
        { status: 403 }
      );
    }

    let accountId = tenant.stripe_account_id;

    // Crea account Express se non esiste (API Accounts v2)
    if (!accountId) {
      const account = await (stripe.v2.core.accounts.create as any)({
        contact_email: user.email,
        display_name: tenant.business_name,
        dashboard: "express",
        identity: {
          country: "IT",
        },
        defaults: {
          responsibilities: {
            fees_collector: "stripe",
            losses_collector: "stripe",
          },
        },
        configuration: {
          merchant: {
            capabilities: {
              card_payments: { requested: true },
            },
          },
        },
      });

      accountId = account.id;

      await admin
        .from("tenants")
        .update({
          stripe_account_id: accountId,
          stripe_connect_status: "pending",
        })
        .eq("id", tenant.id);
    }

    // Genera link di onboarding (monouso)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.prenotly-italia.it";

    const accountLink = await (stripe.v2.core.accountLinks.create as any)({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["recipient"],
          refresh_url: `${appUrl}/dashboard/pagamenti?stripe_refresh=true`,
          return_url: `${appUrl}/dashboard/pagamenti?stripe_return=true`,
        },
      },
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error("Stripe Connect onboard error:", err);
    return NextResponse.json({ error: err.message || "Errore interno" }, { status: 500 });
  }
}
