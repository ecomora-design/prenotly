import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const admin = createAdminClient();
    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!link) return NextResponse.json({ error: "Non sei un titolare" }, { status: 403 });

    const body = await req.json();
    const { name, role, color, email, password } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e password obbligatori" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password troppo corta (min 6)" }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const { data: existing } = await admin
      .from("staff")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "Email già usata da un altro operatore" }, { status: 409 });
    }

    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
    });
    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "Errore creazione account: " + (authErr?.message || "sconosciuto") }, { status: 500 });
    }

    const maxOrder = 0;
    const { data: staffRows } = await admin
      .from("staff")
      .select("sort_order")
      .eq("tenant_id", link.tenant_id)
      .order("sort_order", { ascending: false })
      .limit(1);
    const nextOrder = (staffRows && staffRows[0]?.sort_order ? staffRows[0].sort_order : maxOrder) + 1;

    const { data: staff, error: staffErr } = await admin
      .from("staff")
      .insert({
        tenant_id: link.tenant_id,
        name: String(name).trim(),
        role: role?.trim() || null,
        color: color || "#25D366",
        email: cleanEmail,
        user_id: authData.user.id,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (staffErr) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Errore staff: " + staffErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, staff });
  } catch (err) {
    console.error("staff create error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore" }, { status: 500 });
  }
}
