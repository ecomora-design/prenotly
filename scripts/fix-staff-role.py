path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()

# 1. Aggiungi role al tipo StaffMember
old_type = '''type StaffMember = {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
};'''
new_type = '''type StaffMember = {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
  role: string | null;
};'''

if old_type in c:
    c = c.replace(old_type, new_type, 1)
    print("✅ 1. role aggiunto al tipo StaffMember")
else:
    print("FAIL 1: tipo StaffMember non trovato")

# 2. Aggiungi role al select della query
old_sel = '.select("id, name, color, is_active")'
new_sel = '.select("id, name, color, is_active, role")'

if old_sel in c:
    c = c.replace(old_sel, new_sel, 1)
    print("✅ 2. role aggiunto al select")
else:
    print("FAIL 2: select non trovato")

with open(path, "w") as f:
    f.write(c)
print("🎉 Fatto")
