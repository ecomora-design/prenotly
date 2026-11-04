"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Loader2, CheckCircle2, Trash2, Utensils,
  CreditCard, Banknote, Receipt, Users, Minus, AlertCircle, ArrowRightLeft
} from "lucide-react";

type TableItem = { service_id?: string; name: string; price: number; qty: number };
type Service = { id: string; name: string; price: number; category: string | null };

type TableOrder = {
  id: string;
  tenant_id: string;
  table_id: string;
  status: string;
  party_size: number;
  items: TableItem[];
  total: number;
  notes: string | null;
  opened_at: string;
  closed_at: string | null;
  paid_at: string | null;
  payment_method: string | null;
  sent_items_count?: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  table: { id: string; table_number: number; capacity: number; zone: string | null } | null;
  existingOrder: TableOrder | null;
  onSaved: () => void;
  tables?: any[];
};

export default function TableOrderModal({ isOpen, onClose, tenantId, table, existingOrder, onSaved, tables = [] }: Props) {
  const supabase = createClient();
  const [order, setOrder] = useState<TableOrder | null>(existingOrder);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [partySize, setPartySize] = useState(table?.capacity || 2);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [qty, setQty] = useState(1);
  const [customItem, setCustomItem] = useState({ name: "", price: "" });
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [currentTableNumber, setCurrentTableNumber] = useState<number | null>(table?.table_number || null);

  // Carica servizi del menu + ordine esistente
  useEffect(() => {
    if (!isOpen || !tenantId) return;

    async function load() {
      setLoading(true);
      setError(null);
      setOrder(existingOrder);

      if (!existingOrder) {
        setPartySize(table?.capacity || 2);
      }

      // Carica servizi
      const { data: svcs } = await supabase
        .from("services")
        .select("id, name, price, category")
        .eq("tenant_id", tenantId)
        .eq("is_available", true)
        .order("category")
        .order("name");

      setServices(svcs || []);
      setLoading(false);
    }
    load();
  }, [isOpen, tenantId, table?.id, existingOrder?.id]);

  // Apri comanda (se non esiste)
  async function openOrder() {
    if (!table) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/table-orders/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, tableId: table.id, partySize }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.order) {
          // Comanda già esistente, usala direttamente
          setOrder(data.order);
        } else if (data.orderId) {
          // Fallback: carica dal DB
          const { data: existing } = await supabase.from("table_orders").select("*").eq("id", data.orderId).single();
          if (existing) setOrder(existing);
        } else {
          throw new Error(data.error || "Errore");
        }
      } else {
        setOrder(data.order);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Aggiungi item (chiama API)
  async function addItem(item: { service_id?: string; name: string; price: number; qty: number }) {
    if (!order) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/table-orders/${order.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", item }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setError(null);
      setOrder(data.order);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Rimuovi item
  async function removeItem(index: number) {
    if (!order) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/table-orders/${order.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", itemIndex: index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setOrder(data.order);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Modifica quantità
  async function updateQty(index: number, newQty: number) {
    if (!order || newQty < 1) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/table-orders/${order.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateQty", itemIndex: index, qty: newQty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setOrder(data.order);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Cambia tavolo
  async function changeTable(newTableId: string) {
    if (!order) return;
    if (!confirm("Spostare la comanda su un altro tavolo?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/table-orders/${order.id}/change-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTableId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");

      // Trova il numero del nuovo tavolo per aggiornare il titolo
      const newTable = tables.find((t: any) => t.id === newTableId);
      if (newTable) setCurrentTableNumber(newTable.table_number);

      setOrder(data.order);
      setShowTableSelector(false);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Invia in cucina
  async function sendToKitchen() {
    if (!order) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/table-orders/${order.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setOrder(data.order);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Chiudi comanda (senza pagamento)
  async function closeOrder() {
    if (!order) return;
    if (!confirm("Chiudere la comanda? Non sarà più possibile aggiungere piatti.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/table-orders/${order.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setOrder(data.order);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Paga comanda
  async function payOrder(method: "cash" | "card" | "other") {
    if (!order) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/table-orders/${order.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setOrder(data.order);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Aggiungi piatto dal menu
  function handleAddService() {
    const svc = services.find(s => s.id === selectedServiceId);
    if (!svc) return;
    addItem({ service_id: svc.id, name: svc.name, price: Number(svc.price), qty });
    setSelectedServiceId("");
    setQty(1);
  }

  // Aggiungi piatto custom
  function handleAddCustom() {
    if (!customItem.name || !customItem.price) return;
    addItem({ name: customItem.name.trim(), price: parseFloat(customItem.price), qty: 1 });
    setCustomItem({ name: "", price: "" });
  }

  if (!table) return null;

  const isModifiable = order && ["open", "sent", "sent_partial", "preparing", "ready"].includes(order.status);
  const isSent = order?.status === "sent";
  const isClosed = order?.status === "closed";
  const isPaid = order?.status === "paid";
  const subtotal = order?.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#0A0A0A] border border-white/[0.08] rounded-t-3xl md:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto text-white"
          >
            {/* HEADER */}
            <div className="sticky top-0 bg-[#0A0A0A]/95 backdrop-blur-xl pt-3 pb-4 px-6 border-b border-white/[0.06] z-10">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-4 md:hidden" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
                    <span className="text-[#25D366] text-xl font-black">{table.table_number}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black leading-tight">Tavolo {currentTableNumber || table.table_number}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-white/40 flex items-center gap-1.5">
                        <Users size={11} /> {table.capacity} posti · {table.zone || "Sala"}
                      </p>
                      {order && order.status !== "paid" && order.status !== "cancelled" && tables.length > 1 && (
                        <button
                          onClick={() => setShowTableSelector(!showTableSelector)}
                          className="text-[10px] font-bold text-[#25D366] hover:text-white px-1.5 py-0.5 rounded bg-[#25D366]/10 hover:bg-[#25D366]/20 transition flex items-center gap-1"
                        >
                          <ArrowRightLeft size={9} /> Cambia
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition">
                  <X size={20} />
                </button>
              </div>

              {/* BADGE STATO */}
              {order && (
                <div className="mt-3 flex items-center gap-2">
                  {order.status === "open" && <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">● Aperta</span>}
                  {order.status === "sent" && <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">👨‍🍳 In cucina</span>}
                  {order.status === "closed" && <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">⏸ Chiusa</span>}
                  {isPaid && <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">✓ Pagata</span>}
                </div>
              )}
            </div>

            <div className="p-5 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 flex-1">{error}</p>
                </div>
              )}

              {/* SELETTORE CAMBIO TAVOLO */}
              {showTableSelector && order && (
                <div className="bg-white/[0.03] border border-[#25D366]/30 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">Sposta su quale tavolo?</p>
                  <div className="grid grid-cols-4 gap-2">
                    {tables.filter((t: any) => t.id !== order.table_id).map((t: any) => (
                      <button
                        key={t.id}
                        onClick={() => changeTable(t.id)}
                        disabled={saving}
                        className="bg-white/[0.05] hover:bg-[#25D366]/20 border border-white/[0.08] hover:border-[#25D366]/40 rounded-xl py-3 font-black text-sm transition disabled:opacity-50"
                      >
                        {t.table_number}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowTableSelector(false)}
                    className="w-full mt-2 text-xs font-bold text-white/40 hover:text-white py-2 transition"
                  >
                    Annulla
                  </button>
                </div>
              )}

              {/* NON ESISTE COMANDDA → Mostro "Apri" */}
              {!order ? (
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <label className="block">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Coperti</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPartySize(Math.max(1, partySize - 1))}
                          className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] font-black hover:bg-white/[0.1]"
                        >−</button>
                        <div className="flex-1 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center gap-2">
                          <Users size={14} className="text-white/40" />
                          <span className="font-black">{partySize}</span>
                        </div>
                        <button
                          onClick={() => setPartySize(partySize + 1)}
                          className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] font-black hover:bg-white/[0.1]"
                        >+</button>
                      </div>
                    </label>
                  </div>
                  <button
                    onClick={openOrder}
                    disabled={saving}
                    className="w-full bg-[#25D366] hover:bg-[#20ba5a] disabled:opacity-50 text-black py-4 rounded-2xl font-black transition flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    Apri comanda
                  </button>
                </div>
              ) : (
                <>
                  {/* LISTA ITEMS */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
                      Piatti ordinati ({order.items?.length || 0})
                    </p>
                    {!order.items || order.items.length === 0 ? (
                      <p className="text-xs text-white/30 text-center py-4">Nessun piatto ancora</p>
                    ) : (
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-2.5">
                            <span className="text-xs font-black text-[#25D366] w-6">{item.qty}×</span>
                            <span className="text-sm font-bold flex-1 truncate">{item.name}</span>
                            <span className="text-xs font-bold text-white/60">€{(item.qty * item.price).toFixed(2)}</span>
                            {isModifiable && (
                              <>
                                <button onClick={() => updateQty(idx, item.qty - 1)} className="p-1 hover:bg-white/10 rounded" disabled={saving}>
                                  <Minus size={12} />
                                </button>
                                <button onClick={() => updateQty(idx, item.qty + 1)} className="p-1 hover:bg-white/10 rounded" disabled={saving}>
                                  <Plus size={12} />
                                </button>
                                <button onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:bg-red-500/20 rounded" disabled={saving}>
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between items-center">
                        <span className="text-xs font-bold text-white/40 uppercase">Totale</span>
                        <span className="text-xl font-black">€{subtotal.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* AGGIUNGI PIATTO (solo se open) */}
                  {isModifiable && (
                    <>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Aggiungi piatto</p>

                        {/* Dal menu */}
                        {services.length > 0 && (
                          <div className="flex gap-2">
                            <select
                              value={selectedServiceId}
                              onChange={(e) => setSelectedServiceId(e.target.value)}
                              className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:border-[#25D366]/50 focus:outline-none"
                            >
                              <option value="">Dal menu...</option>
                              {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name} · €{Number(s.price).toFixed(2)}</option>
                              ))}
                            </select>
                            <input
                              type="number" min="1"
                              value={qty}
                              onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                              className="w-16 bg-white/[0.05] border border-white/[0.08] rounded-xl px-2 py-2.5 text-sm font-bold text-center focus:outline-none"
                            />
                            <button
                              onClick={handleAddService}
                              disabled={!selectedServiceId || saving}
                              className="bg-[#25D366] hover:bg-[#20ba5a] disabled:bg-white/10 text-black px-4 py-2.5 rounded-xl text-xs font-black transition"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}

                        {/* Custom */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customItem.name}
                            onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                            placeholder="Piatto custom"
                            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:border-[#25D366]/50 focus:outline-none"
                          />
                          <input
                            type="number" step="0.01" min="0"
                            value={customItem.price}
                            onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
                            placeholder="€"
                            className="w-20 bg-white/[0.05] border border-white/[0.08] rounded-xl px-2 py-2.5 text-sm font-bold text-center focus:outline-none"
                          />
                          <button
                            onClick={handleAddCustom}
                            disabled={!customItem.name || !customItem.price || saving}
                            className="bg-purple-500 hover:bg-purple-600 disabled:bg-white/10 text-white px-3 py-2.5 rounded-xl text-xs font-black transition"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* AZIONI CHIUSURA */}
                      {order.items && order.items.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={sendToKitchen}
                            disabled={saving}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3.5 rounded-2xl font-black transition flex items-center justify-center gap-2"
                          >
                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Utensils size={16} />}
                            Invia in cucina
                          </button>
                          <button
                            onClick={closeOrder}
                            disabled={saving}
                            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-3.5 rounded-2xl font-black transition flex items-center justify-center gap-2"
                          >
                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Receipt size={16} />}
                            Chiudi (€{subtotal.toFixed(2)})
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* PAGAMENTO (se closed) */}
                  {isClosed && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Metodo di pagamento</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => payOrder("cash")} disabled={saving} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 py-3 rounded-xl font-bold text-xs transition flex flex-col items-center gap-1 disabled:opacity-50">
                          <Banknote size={18} /> Contanti
                        </button>
                        <button onClick={() => payOrder("card")} disabled={saving} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-3 rounded-xl font-bold text-xs transition flex flex-col items-center gap-1 disabled:opacity-50">
                          <CreditCard size={18} /> Carta
                        </button>
                        <button onClick={() => payOrder("other")} disabled={saving} className="bg-white/[0.05] hover:bg-white/[0.1] text-white/70 py-3 rounded-xl font-bold text-xs transition flex flex-col items-center gap-1 disabled:opacity-50">
                          <Receipt size={18} /> Altro
                        </button>
                      </div>
                    </div>
                  )}

                  {/* RIEPILOGO PAGATO */}
                  {isPaid && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
                      <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm font-black text-emerald-300">Comanda pagata</p>
                      <p className="text-xs text-emerald-200/70 mt-1">€{Number(order.total).toFixed(2)} · {order.payment_method === "cash" ? "Contanti" : order.payment_method === "card" ? "Carta" : "Altro"}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
