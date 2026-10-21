"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, ReceiptText, TrendingUp, Calendar } from "lucide-react";

type Order = {
  id: string;
  order_code: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  created_at: string;
  customers: { name: string | null } | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  type: "today" | "total";
  orders: Order[];
};

export default function ReportModal({ isOpen, onClose, type, orders }: Props) {
  const total = orders.reduce((s, o) => s + Number(o.total), 0);
  const avg = orders.length > 0 ? total / orders.length : 0;

  const title = type === "today" ? "Incasso Oggi" : "Incasso Totale";
  const subtitle = type === "today"
    ? "Ordini consegnati oggi"
    : "Tutti gli ordini consegnati";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white pt-3 pb-4 px-6 border-b border-night/[0.06] z-10">
              <div className="w-12 h-1.5 bg-night/10 rounded-full mx-auto mb-4 md:hidden" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-night flex items-center gap-2">
                    <Wallet size={20} className="text-emerald-500" />
                    {title}
                  </h3>
                  <p className="text-xs text-night/50 mt-0.5">{subtitle}</p>
                </div>
                <button onClick={onClose} className="text-night/40 hover:text-night p-2 rounded-full hover:bg-night/5 transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Riepilogo */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Totale</p>
                <p className="text-4xl font-black mb-3">€{total.toFixed(2)}</p>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase font-bold">Ordini</p>
                    <p className="text-lg font-black">{orders.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/60 uppercase font-bold">Ticket Medio</p>
                    <p className="text-lg font-black">€{avg.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Lista ordini */}
              <div>
                <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-3">
                  Dettaglio Ordini ({orders.length})
                </p>
                {orders.length === 0 ? (
                  <div className="bg-[#FAFAFA] rounded-2xl p-8 text-center">
                    <ReceiptText className="mx-auto text-night/20 mb-2" size={32} />
                    <p className="text-sm text-night/50">Nessun ordine consegnato</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {orders.map((o) => (
                      <div key={o.id} className="bg-[#FAFAFA] rounded-xl p-3 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-[10px] font-black text-night/60 bg-white px-1.5 py-0.5 rounded">
                              {o.order_code}
                            </span>
                            <span className="text-[10px] text-night/40">
                              {new Date(o.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })} · {new Date(o.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-night truncate">
                            {o.customers?.name || "Cliente"}
                          </p>
                          <p className="text-[11px] text-night/50 truncate">
                            {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                          </p>
                        </div>
                        <span className="text-base font-black text-emerald-600 ml-3 shrink-0">
                          €{Number(o.total).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
