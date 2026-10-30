import re
path = "app/dashboard/staff/page.tsx"
with open(path) as f:
    c = f.read()

# 1. Type Staff: aggiungi email + user_id
old_type = '''type Staff = {
  id: string;
  name: string;
  role: string | null;
  color: string;
  is_active: boolean;
  sort_order: number;
};'''
new_type = '''type Staff = {
  id: string;
  name: string;
  role: string | null;
  color: string;
  is_active: boolean;
  sort_order: number;
  email: string | null;
  user_id: string | null;
};'''
if old_type in c:
    c = c.replace(old_type, new_type, 1)
    print("✅ 1. Tipo Staff")

# 2. useState form: aggiungi email + password
m = re.search(r'const \[form, setForm\] = useState\(\{[^}]*\}\)', c)
if m:
    c = c[:m.start()] + 'const [form, setForm] = useState({ name: "", role: "", color: "#25D366", email: "", password: "" })' + c[m.end():]
    print("✅ 2. useState form")

# 3. openNew
old_open = 'function openNew() { setEditingId(null); setForm({ name: "", role: "", color: "#25D366" }); setShowModal(true); }'
new_open = 'function openNew() { setEditingId(null); setForm({ name: "", role: "", color: "#25D366", email: "", password: "" }); setShowModal(true); }'
if old_open in c:
    c = c.replace(old_open, new_open, 1)
    print("✅ 3. openNew")

# 4. openEdit
old_edit = 'function openEdit(s: Staff) { setEditingId(s.id); setForm({ name: s.name, role: s.role || "", color: s.color }); setShowModal(true); }'
new_edit = 'function openEdit(s: Staff) { setEditingId(s.id); setForm({ name: s.name, role: s.role || "", color: s.color, email: s.email || "", password: "" }); setShowModal(true); }'
if old_edit in c:
    c = c.replace(old_edit, new_edit, 1)
    print("✅ 4. openEdit")

# 5. handleSave
old_save = '''  async function handleSave() {
    if (!form.name.trim()) { alert("Inserisci un nome"); return; }
    if (!tenantId) return;
    setSaving(true);
    let error;
    if (editingId) {
      ({ error } = await supabase.from("staff").update({ name: form.name.trim(), role: form.role.trim() || null, color: form.color }).eq("id", editingId));
    } else {
      const max = staff.length > 0 ? Math.max(...staff.map(s => s.sort_order)) : 0;
      ({ error } = await supabase.from("staff").insert({ tenant_id: tenantId, name: form.name.trim(), role: form.role.trim() || null, color: form.color, sort_order: max + 1 }));
    }
    setSaving(false);
    if (error) { alert("Errore: " + error.message); return; }
    setShowModal(false);
    load();
  }'''

new_save = '''  async function handleSave() {
    if (!form.name.trim()) { alert("Inserisci un nome"); return; }
    if (!tenantId) return;
    setSaving(true);

    if (editingId) {
      const { error } = await supabase.from("staff").update({ name: form.name.trim(), role: form.role.trim() || null, color: form.color }).eq("id", editingId);
      setSaving(false);
      if (error) { alert("Errore: " + error.message); return; }
      setShowModal(false);
      load();
      return;
    }

    if (!form.email?.trim() || !form.password?.trim()) {
      alert("Email e password obbligatorie per un nuovo operatore");
      setSaving(false);
      return;
    }
    if (form.password.length < 6) {
      alert("Password almeno 6 caratteri");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/dashboard/staff/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        role: form.role.trim() || null,
        color: form.color,
        email: form.email.trim(),
        password: form.password,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { alert("Errore: " + (data.error || "Sconosciuto")); return; }
    setShowModal(false);
    load();
  }'''

if old_save in c:
    c = c.replace(old_save, new_save, 1)
    print("✅ 5. handleSave")

# 6. Aggiungi campi JSX dopo Ruolo
old_role = '''<div><label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Ruolo</label><input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Es. Parrucchiere" className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none" /></div>'''

new_role = old_role + '''

                {!editingId && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Email *</label>
                      <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="operatore@email.com" className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Password *</label>
                      <input type="text" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 caratteri" className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none" />
                      <p className="text-[10px] text-amber-600 mt-1">Comunica questa password all&apos;operatore. Non sarà visibile dopo la creazione.</p>
                    </div>
                  </>
                )}'''

if old_role in c:
    c = c.replace(old_role, new_role, 1)
    print("✅ 6. Campi email/password JSX")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Fatto")
