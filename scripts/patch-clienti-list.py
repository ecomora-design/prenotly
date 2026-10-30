path = "app/dashboard/clienti/page.tsx"
with open(path) as f:
    c = f.read()

# 1. Riga cliente cliccabile
old_div = '<div key={c.id} className="bg-white rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">'
new_div = '''<div
                key={c.id}
                onClick={() => router.push(`/dashboard/clienti/${c.id}`)}
                className="bg-white rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:shadow-md hover:bg-gray-50/50 transition cursor-pointer"
              >'''

if old_div not in c:
    print("FAIL 1: div riga non trovato"); exit(1)
c = c.replace(old_div, new_div, 1)
print("✅ 1. Riga cliente cliccabile")

# 2. Stop propagation sul WhatsApp
old_wa = 'href={`https://wa.me/${phone}`}'
new_wa = 'href={`https://wa.me/${phone}`}\n                  onClick={(e) => e.stopPropagation()}'
if old_wa not in c:
    print("FAIL 2: whatsapp link non trovato"); exit(1)
c = c.replace(old_wa, new_wa, 1)
print("✅ 2. WhatsApp non apre dettaglio")

# 3. Import ChevronRight
if "ChevronRight" not in c:
    c = c.replace(
        'import { Loader2, MessageCircle, Search, Users } from "lucide-react";',
        'import { Loader2, MessageCircle, Search, Users, ChevronRight } from "lucide-react";',
        1
    )
    print("✅ 3. ChevronRight importato")

# 4. Icona ChevronRight dopo il bottone WhatsApp
old_close = '''                >
                  <MessageCircle size={18} />
                </a>
              </div>'''
new_close = '''                >
                  <MessageCircle size={18} />
                </a>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </div>'''
if old_close not in c:
    print("FAIL 4: chiusura riga non trovata"); exit(1)
c = c.replace(old_close, new_close, 1)
print("✅ 4. Freccia aggiunta")

with open(path, "w") as f:
    f.write(c)
print("🎉 File scritto")
