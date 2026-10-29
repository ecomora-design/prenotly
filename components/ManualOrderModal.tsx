"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Loader2, CheckCircle2, UserPlus, FileText,
  Store, Truck, AlertCircle
} from "lucide-react";

type Service = { id: string; name: string; price: number };
type Item = { id: string; name: string; price: number; qty: number };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onSaved: () => void;
};

export default function ManualOrderModal({ isOpen, onClose, tenantId, onSaved }: Props) {
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    items: [] as Item[],
    orderType: "takeaway" as "takeaway" | "delivery",
    deliveryAddress: "",
    scheduledTime: "",
    notes: "",
    status: "delivered",
  });

  const [selector, setSelector] = useState({ serviceId: "", qty: 1 });
  const [customItem, setCustomItem] = useState({ name: "", price: "" });

  useEffect(() => {
    if (isOpen && tenantId) {
      supabase.from("services")
        .select("id, name, price")
        .eq("tenant_id", tenantId)
        .eq("is_available", true)
        .order("name")
        .then(({ data }) => setServices(data || []));
    }
  }, [isOpen, tenantId, supabase]);

  const resetForm = () => {
    setForm({
      customerName: "", customerPhone: "", items: [],
      orderType: "takeaway", deliveryAddress: "", scheduledTime: "",
      notes: "", status: "delivered",
    });
    setSelector({ serviceId: "", qty: 1 });
    setCustomItem({ name: "", price: "" });
  };

  const addServiceItem = () => {
    const svc = services.find((s) => s.id === selector.serviceId);
    if (!svc) return;
    setForm({
      ...form,
      items: [...form.items, { id: svc.id, name: svc.name, price: Number(svc.price), qty: selector.qty }],
    });
    setSelector({ serviceId: "", qty: 1 });
  };

  const addCustomItem = () => {
    if (!customItem.name || !customItem.price) return;
    setForm({
      ...form,
      items: [...form.items, { id: "custom-" + Date.now(), name: customItem.name, price: parseFloat(customItem.price), qty: 1 }],
    });
    setCustomItem({ name: "", price: "" });
  };

  const removeItem = (idx: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!tenantId || form.items.length === 0) return;
    setSaving(true);

    try {
      const code = "MAN-" + Math.random().toString(36).substring(2, 6).toUpperCase();
      let customerId: string | null = null;

      if (form.customerName.trim()) {
        const phone = form.customerPhone.trim();
        if (phone) {
          const { data: existing } = await supabase
            .from("customers")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("app_number", phone)
            .maybeSingle();

          if (existing) {
            customerId = existing.id;
            await supabase.from("customers").update({ name: form.customerName.trim() }).eq("id", customerId);
          } else {
            const { data: created } = await supabase.from("customers").insert({
              tenant_id: tenantId,
              name: form.customerName.trim(),
              app_number: phone,
            }).select("id").single();
            customerId = created?.id || null;
          }
        } else {
          const { data: created } = await supabase.from("customers").insert({
            tenant_id: tenantId,
            name: form.customerName.trim(),
            app_number: "",
          }).select("id").single();
          customerId = created?.id || null;
        }
      }

      const total = form.items.reduce((sum, i) => sum + i.price * i.qty, 0);
      const scheduledFor = form.scheduledTime
        ? new Date().toISOString().split("T")[0] + "T" + form.scheduledTime + ":00"
        : null;

      const { error } = await supabase.from("orders").insert({
        tenant_id: tenantId,
        customer_id: customerId,
        order_code: code,
        items: form.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        total,
        order_type: form.orderType,
        delivery_address: form.orderType === "delivery" ? form.deliveryAddress || null : null,
        scheduled_for: scheduledFor,
        notes: form.notes || null,
        status: form.status,
      });

      if (error) throw error;

      resetForm();
      onSaved();
      onClose();
    } catch (err: any) {
      alert("Errore: " + (err.message || "Errore sconosciuto"));
    } finally {
      setSaving(false);
    }
  };

  const total = form.items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#FAFAFA] rounded-t-3xl md:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-xl pt-3 pb-4 px-6 border-b border-night/[0.06] z-10">
              <div className="w-12 h-1.5 bg-night/10 rounded-full mx-auto mb-4 md:hidden" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-night flex items-center gap-2">
                    <UserPlus size={20} className="text-purple-500" />
                    Nuovo Ordine Manuale
                  </h3>
                  <p className="text-xs text-night/50 mt-0.5">Registra un ordine al telefono o al banco</p>
                </div>
                <button onClick={onClose} className="text-night/40 hover:text-night p-2 rounded-full hover:bg-white transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-night/[0.06]">
                <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-3">Cliente (opzionale)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Nome cliente"
                    className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-semibold focus:border-night/30 focus:outline-none transition"
                  />
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="Telefono"
                    className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-semibold focus:border-night/30 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-night/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-night/40 uppercase tracking-widest">Piatti ordinati</p>
                  <span className="text-[10px] font-bold text-night/40">{form.items.length} items</span>
                </div>

                {services.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    <select
                      value={selector.serviceId}
                      onChange={(e) => setSelector({ ...selector, serviceId: e.target.value })}
                      className="flex-1 bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-3 py-2.5 text-sm font-semibold focus:border-night/30 focus:outline-none"
                    >
                      <option value="">Piatto dal menu...</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} · €{Number(s.price).toFixed(2)}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={selector.qty}
                      onChange={(e) => setSelector({ ...selector, qty: parseInt(e.target.value) || 1 })}
                      className="w-16 bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-2 py-2.5 text-sm font-bold text-center focus:border-night/30 focus:outline-none"
                    />
                    <button
                      onClick={addServiceItem}
                      disabled={!selector.serviceId}
                      className="bg-night hover:bg-night/90 disabled:bg-night/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={customItem.name}
                    onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                    placeholder="Piatto personalizzato"
                    className="flex-1 bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-3 py-2.5 text-sm focus:border-night/30 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={customItem.price}
                    onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
                    placeholder="€"
                    className="w-20 bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-2 py-2.5 text-sm font-bold text-center focus:border-night/30 focus:outline-none"
                  />
                  <button
                    onClick={addCustomItem}
                    disabled={!customItem.name || !customItem.price}
                    className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/30 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {form.items.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-night/[0.06]">
                    {form.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#FAFAFA] rounded-lg p-2.5">
                        <span className="text-sm font-bold text-night flex-1">
                          <strong>{item.qty}×</strong> {item.name}
                        </span>
                        <span className="text-sm font-black text-night/70 mr-3">€{(item.qty * item.price).toFixed(2)}</span>
                        <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-500 p-1">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-night/[0.06] space-y-3">
                <div>
                  <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Tipo ordine</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setForm({ ...form, orderType: "takeaway" })}
                      className={"py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 " + (form.orderType === "takeaway" ? "bg-night text-white" : "bg-[#FAFAFA] text-night/60")}
                    >
                      <Store size={14} /> Asporto
                    </button>
                    <button
                      onClick={() => setForm({ ...form, orderType: "delivery" })}
                      className={"py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 " + (form.orderType === "delivery" ? "bg-night text-white" : "bg-[#FAFAFA] text-night/60")}
                    >
                      <Truck size={14} /> Domicilio
                    </button>
                  </div>
                </div>

                {form.orderType === "delivery" && (
                  <input
                    type="text"
                    value={form.deliveryAddress}
                    onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                    placeholder="Indirizzo di consegna"
                    className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-semibold focus:border-night/30 focus:outline-none"
                  />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Orario</p>
                    <input
                      type="time"
                      value={form.scheduledTime}
                      onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-bold focus:border-night/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Stato</p>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-3 py-3 text-sm font-bold focus:border-night/30 focus:outline-none"
                    >
                      <option value="delivered">Consegnato (pagato)</option>
                      <option value="confirmed">In preparazione</option>
                      <option value="preparing">In cucina</option>
                      <option value="ready">Pronto</option>
                      <option value="pending">In attesa</option>
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Note (opzionale)"
                  className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm focus:border-night/30 focus:outline-none"
                />
              </div>

              <div className="bg-night rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white/60">Totale</span>
                  <span className="text-3xl font-black">€{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || form.items.length === 0}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/30 text-white py-4 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Salva Ordine
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
