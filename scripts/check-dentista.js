const { createClient } = require("@supabase/supabase-js");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const email = "dentistaprova@gmail.com";

  let allUsers = [];
  let page = 1;
  while (true) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 100 });
    if (error) { console.error(error); break; }
    allUsers = allUsers.concat(data.users);
    if (data.users.length < 100) break;
    page++;
  }

  const user = allUsers.find(u => u.email === email);
  if (!user) {
    console.log("❌ Utente non trovato con email:", email);
    console.log("Email disponibili:");
    allUsers.forEach(u => console.log(" -", u.email));
    return;
  }

  console.log("✅ User ID:", user.id);
  console.log("   Email:", user.email);

  const { data: link } = await sb
    .from("tenant_users")
    .select("tenant_id, tenants(business_name, slug, category, plan_type)")
    .eq("user_id", user.id)
    .maybeSingle();

  console.log("   Tenant:", JSON.stringify(link, null, 2));

  if (link?.tenant_id) {
    const { data: staff } = await sb.from("staff").select("id, name, role, color").eq("tenant_id", link.tenant_id);
    console.log("   Staff:", staff?.length || 0, "operatori");
    if (staff) staff.forEach(s => console.log("     -", s.name, "(" + (s.role || "operatore") + ")"));

    const { data: apts } = await sb.from("bookings").select("booking_code, scheduled_at, status").eq("tenant_id", link.tenant_id).eq("booking_type", "appointment").order("scheduled_at", { ascending: false }).limit(5);
    console.log("   Appuntamenti:", apts?.length || 0);
    if (apts) apts.forEach(a => console.log("     -", a.booking_code, a.scheduled_at, a.status));
  }
})();
