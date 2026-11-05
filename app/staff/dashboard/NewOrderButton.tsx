"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Utensils, Truck, X, Loader2 } from "lucide-react";
import TableMap from "@/components/TableMap";
import TableOrderModal from "@/components/TableOrderModal";
import ManualOrderModal from "@/components/ManualOrderModal";

type Props = {
  tenantId: string;
  onSaved?: () => void;
};

export default function NewOrderButton({ tenantId, onSaved }: Props) {
  const supabase = createClient();
  const [step, setStep] = useState<"idle" | "choose" | "table" | "tableOrder" | "manualOrder">("idle");
  const [tables, setTables] = useState<any[]>([]);
  const [tableOrders, setTableOrders] = useState<Record<string, any>>({});
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [loadingTables, setLoadingTables] = useState(false);

  async function loadTables() {
    setLoadingTables(true);
    const [tablesRes, ordersRes] = await Promise.all([
      supabase.from("tables").select("*").eq("tenant_id", tenantId).eq("is_active", true).order("table_number"),
      supabase.from("table_orders").select("*").eq("tenant_id", tenantId).in("status", ["open", "sent", "sent_partial", "preparing", "ready", "closed"]),
    ]);
    setTables(tablesRes.data || []);
    const map: Record<string, any> = {};
    (ordersRes.data || []).forEach((o: any) => { map[o.table_id] = o; });
    setTableOrders(map);
    setLoadingTables(false);
  }

  function closeAll() {
    setStep("idle");
    setSelectedTable(null);
  }

  function handleSaved() {
    onSaved?.();
    closeAll();
  }

  function handleTableSelect(t: any) {
    setSelectedTable(t);
    setStep("tableOrder");
  }

  return (
    <>
      <button
        onClick={() => setStep("choose")}
        className="inline-flex items-center gap-1 bg-wa hover:bg-waDark text-white px-2.5 py-1.5 rounded-full text-[10px] font-bold transition active:scale-95 shadow-sm"
        aria-label="Nuovo ordine"
      >
        <Plus size={12} />
        <span className="hidden sm:inline">Ordine</span>
      </button>

      {/* STEP 1: choose type */}
      <AnimatePresence>
        {step === "choose" && (
          <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-night">Che tipo di ordine?</h3>
                <button onClick={closeAll} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setStep("table"); loadTables(); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 transition active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <Utensils size={22} />
                  </div>
                  <p className="font-bold text-night text-sm">Tavolo</p>
                  <p className="text-[10px] text-night/50 text-center">Apri comanda al tavolo</p>
                </button>
                <button
                  onClick={() => setStep("manualOrder")}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 transition active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                    <Truck size={22} />
                  </div>
                  <p className="font-bold text-night text-sm">Asporto</p>
                  <p className="text-[10px] text-night/50 text-center">Asporto o domicilio</p>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STEP 2: choose table */}
      <AnimatePresence>
        {step === "table" && (
          <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-night">Seleziona tavolo</h3>
                <button onClick={closeAll} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
              {loadingTables ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-wa" size={28} />
                </div>
              ) : tables.length === 0 ? (
                <p className="text-center text-sm text-night/50 py-8">Nessun tavolo configurato</p>
              ) : (
                <TableMap
                  tables={tables.map((t: any) => ({ ...t, isBusy: !!tableOrders[t.id] }))}
                  selectedId={null}
                  onSelect={handleTableSelect}
                  brandColor="#25D366"
                  isAdmin={false}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TableOrderModal */}
      <TableOrderModal
        isOpen={step === "tableOrder"}
        onClose={closeAll}
        tenantId={tenantId}
        table={selectedTable}
        existingOrder={selectedTable ? tableOrders[selectedTable.id] : null}
        onSaved={handleSaved}
        tables={tables}
      />

      {/* ManualOrderModal */}
      <ManualOrderModal
        isOpen={step === "manualOrder"}
        onClose={closeAll}
        tenantId={tenantId}
        onSaved={handleSaved}
      />
    </>
  );
}
