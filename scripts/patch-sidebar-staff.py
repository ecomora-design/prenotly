path = "app/dashboard/layout.tsx"
with open(path) as f:
    c = f.read()

# Import UserCircle2
if "UserCircle2" not in c:
    c = c.replace("TrendingDown\n} from", "TrendingDown, UserCircle2\n} from", 1)
    print("✅ Import UserCircle2")

# Voce Staff dopo Spese
old_nav = '...(tenant.plan_type === "food_premium" ? [{ href: "/dashboard/spese", label: "Spese", icon: TrendingDown }] : []),'
new_nav = old_nav + '\n        ...(tenant.plan_type === "food_premium" ? [{ href: "/dashboard/staff", label: "Staff", icon: UserCircle2 }] : []),'

if "dashboard/staff" not in c:
    if old_nav in c:
        c = c.replace(old_nav, new_nav, 1)
        print("✅ Voce Staff aggiunta")
    else:
        print("FAIL: nav non trovata")
else:
    print("→ Voce Staff già presente")

with open(path, "w") as f:
    f.write(c)
print("🎉 Fatto")
