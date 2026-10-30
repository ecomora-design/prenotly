path = "app/dashboard/layout.tsx"
with open(path) as f:
    c = f.read()

# 1. Import TrendingDown
if "TrendingDown" not in c:
    if "BarChart3\n} from" in c:
        c = c.replace("BarChart3\n} from", "BarChart3, TrendingDown\n} from", 1)
        print("✅ 1. Import TrendingDown aggiunto")
    else:
        print("FAIL 1: import non trovato")

# 2. Aggiungi voce Spese nella sezione Vendite
old_nav = '''        { href: "/dashboard/report", label: "Report Incassi", icon: BarChart3 },
        { href: "/dashboard/servizi", label: isFood ? "Menu" : "Servizi", icon: Utensils },'''

new_nav = '''        { href: "/dashboard/report", label: "Report Incassi", icon: BarChart3 },
        ...(tenant.plan_type === "food_premium" ? [{ href: "/dashboard/spese", label: "Spese", icon: TrendingDown }] : []),
        { href: "/dashboard/servizi", label: isFood ? "Menu" : "Servizi", icon: Utensils },'''

if old_nav in c:
    if "dashboard/spese" not in c:
        c = c.replace(old_nav, new_nav, 1)
        print("✅ 2. Voce Spese aggiunta al menu")
    else:
        print("→ 2. Voce Spese già presente")
else:
    print("FAIL 2: sezione Vendite non trovata")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Fatto")
