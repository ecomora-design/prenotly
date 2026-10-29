import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = "movisicily@gmail.com";

export async function POST(req: Request) {
  try {
    // 1. Verifica che chi chiama sia admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Non sei autorizzato" }, { status: 403 });
    }

    // 2. Prendi il tenant_id dal body
    const { tenantId } = await req.json();
    if (!tenantId) return NextResponse.json({ error: "tenantId mancante" }, { status: 400 });

    // 3. Trova l'user_id del proprietario del tenant
    const admin = createAdminClient();
    const { data: link, error: linkErr } = await admin
      .from("tenant_users")
      .select("user_id, role")
      .eq("tenant_id", tenantId)
      .eq("role", "owner")
      .maybeSingle();

    if (linkErr || !link) {
      return NextResponse.json({ error: "Nessun proprietario trovato per questo tenant" }, { status: 404 });
    }

    // 4. Prendi l'email dell'utente
    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(link.user_id);
    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    // 5. Genera il magic link
    const { data: linkData, error: genErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email,
      options: { redirectTo: "https://www.prenotly-italia.it/dashboard" },
    });

    if (genErr || !linkData?.properties?.action_link) {
      console.error("Generate link error:", genErr);
      return NextResponse.json({ error: "Errore generazione link" }, { status: 500 });
    }

    return NextResponse.json({
      url: linkData.properties.action_link,
      email: userData.user.email,
    });
  } catch (err) {
    console.error("Impersonate error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore" }, { status: 500 });
  }
}
