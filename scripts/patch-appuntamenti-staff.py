path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()

# ============================================================
# 1. Aggiorna il tipo Appointment: aggiungi staff_id + staff
# ============================================================
old_type = '''  duration_minutes: number | null;
  customers: { name: string | null; whatsapp_number: string | null } | null;
};'''
new_type = '''  duration_minutes: number | null;
  staff_id: string | null;
  customers: { name: string | null; whatsapp_number: string | null } | null;
  staff: { name: string; color: string } | null;
};

type StaffMember = {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
};'''

if old_type not in c:
    print("FAIL 1: type Appointment non trovato")
    exit(1)
if "type StaffMember" not in c:
    c = c.replace(old_type, new_type, 1)
    print("✅ 1. Tipo Appointment + StaffMember")

# ============================================================
# 2. Aggiungi state staff alla pagina principale
# ============================================================
old_state = '''  const [tenantId, setTenantId] = useState<string>("");
  const [showManualModal, setShowManualModal] = useState(false);'''
new_state = '''  const [tenantId, setTenantId] = useState<string>("");
  const [showManualModal, setShowManualModal] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);'''

if old_state not in c:
    print("FAIL 2: state non trovato")
    exit(1)
if "[staffList, setStaffList]" not in c:
    c = c.replace(old_state, new_state, 1)
    print("✅ 2. State staffList")

# ============================================================
# 3. Load: aggiungi staff_id al select + carica staff
# ============================================================
old_load = '''    const { data } = await supabase
      .from("bookings")
      .select("id, booking_code, scheduled_at, status, notes, duration_minutes, customer_id")
      .eq("tenant_id", link.tenant_id)
      .eq("booking_type", "appointment")
      .order("scheduled_at", { ascending: true });

    const rawAppointments = data || [];

    const { data: customers } = await supabase
      .from("customers")
      .select("id, name, whatsapp_number")
      .eq("tenant_id", link.tenant_id);

    const custMap: Record<string, { name: string | null; whatsapp_number: string | null }> = {};
    (customers || []).forEach((c: any) => { custMap[c.id] = { name: c.name, whatsapp_number: c.whatsapp_number }; });

    setAppointments(
      rawAppointments.map((a: any) => ({
        ...a,
        customers: custMap[a.customer_id] || null,
      }))
    );'''

new_load = '''    const { data } = await supabase
      .from("bookings")
      .select("id, booking_code, scheduled_at, status, notes, duration_minutes, customer_id, staff_id")
      .eq("tenant_id", link.tenant_id)
      .eq("booking_type", "appointment")
      .order("scheduled_at", { ascending: true });

    const rawAppointments = data || [];

    const [customersRes, staffRes] = await Promise.all([
      supabase.from("customers").select("id, name, whatsapp_number").eq("tenant_id", link.tenant_id),
      supabase.from("staff").select("id, name, color, is_active").eq("tenant_id", link.tenant_id),
    ]);

    const custMap: Record<string, { name: string | null; whatsapp_number: string | null }> = {};
    (customersRes.data || []).forEach((c: any) => { custMap[c.id] = { name: c.name, whatsapp_number: c.whatsapp_number }; });

    const staffData = (staffRes.data || []) as StaffMember[];
    setStaffList(staffData);

    const staffMap: Record<string, { name: string; color: string }> = {};
    staffData.forEach(s => { staffMap[s.id] = { name: s.name, color: s.color }; });

    setAppointments(
      rawAppointments.map((a: any) => ({
        ...a,
        customers: custMap[a.customer_id] || null,
        staff: a.staff_id ? (staffMap[a.staff_id] || null) : null,
      }))
    );'''

if old_load not in c:
    print("FAIL 3: load block non trovato")
    exit(1)
if "staffMap" not in c:
    c = c.replace(old_load, new_load, 1)
    print("✅ 3. Load con staff")

# ============================================================
# 4. Passa staffList al modal
# ============================================================
old_modal = '''          <ManualAppointmentModal'''
new_modal = '''          <ManualAppointmentModal
            staffList={staffList}'''

if old_modal not in c:
    print("FAIL 4: modal non trovato")
    exit(1)
if "staffList={staffList}" not in c:
    c = c.replace(old_modal, new_modal, 1)
    print("✅ 4. staffList passata al modal")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Parte 1 completata (tipo, state, load, prop)")
