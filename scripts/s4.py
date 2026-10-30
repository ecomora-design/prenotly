path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()

# Il marker esatto: "      </AnimatePresence>\n    </div>\n  );\n}"
# Questo è la chiusura del componente principale
old = '''        )}
      </AnimatePresence>
    </div>
  );
}'''

new = '''        )}
      </AnimatePresence>

      {/* MODAL ASSEGNAZIONE OPERATORE */}
      {assigningFor && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAssigningFor(null)}>
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-night">Assegna operatore</h3>
              <button onClick={() => setAssigningFor(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {staffList.filter(s => s.is_active).map(s => (
                <button
                  key={s.id}
                  onClick={() => assignStaff(assigningFor, s.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition text-left"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: s.color }}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-night text-sm">{s.name}</p>
                    <p className="text-[11px] text-gray-500">{s.role || "Operatore"}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={() => assignStaff(assigningFor, null)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition text-left border-t border-gray-100 mt-2 pt-3"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 shrink-0">
                  <X size={18} />
                </div>
                <div>
                  <p className="font-bold text-night text-sm">Rimuovi assegnazione</p>
                  <p className="text-[11px] text-gray-500">Nessun operatore</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}'''

if old not in c:
    print("FAIL: chiusura componente non trovata")
    exit(1)
if "MODAL ASSEGNAZIONE OPERATORE" in c:
    print("→ già presente")
    exit(0)

c = c.replace(old, new, 1)
with open(path, "w") as f:
    f.write(c)
print("✅ Step 4: modal assegnazione aggiunto dentro il componente")
