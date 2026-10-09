"use client";

import { useState, useMemo } from "react";
import { Plus, Minus, ShoppingBag, X, MessageCircle, Clock, Truck, Store, Phone, Home, Menu as MenuIcon, Info } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
};

type CartItem = {
  service: Service;
  qty: number;
};

type Props = {
  tenantName: string;
  tenantAddress: string | null;
  tenantPhone: string | null;
  tenantDescription: string | null;
  openingHours: Record<string, string> | null;
  whatsappNumber: string;
  services: Service[];
};

export default function MenuClient({
  tenantName,
  tenantAddress,
  tenantPhone,
  tenantDescription,
  openingHours,
  whatsappNumber,
  services,
}: Props) {
  const [tab, setTab] = useState<"menu" | "info">("menu");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<"takeaway" | "delivery">("takeaway");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const menuByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {};
    services.forEach((s) => {
      const cat = s.category || "Altro";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    });
    return grouped;
  }, [services]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const now = new Date();
    const start = new Date(now.getTime() + 30 * 60000);
    start.setMinutes(start.getMinutes() < 30 ? 30 : 0);
    if (start.getMinutes() === 0) start.setHours(start.getHours() + 1);
    for (let i = 0; i < 8; i++) {
      const t = new Date(start.getTime() + i * 30 * 60000);
      slots.push(t.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
    }
    return slots;
  }, []);

  const addToCart = (service: Service) => {
    setCart((prev) => {
      const existing = prev[service.id];
      return { ...prev, [service.id]: { service, qty: existing ? existing.qty + 1 : 1 } };
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart((prev) => {
      const existing = prev[serviceId];
      if (!existing) return prev;
      if (existing.qty === 1) {
        const { [serviceId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [serviceId]: { ...existing, qty: existing.qty - 1 } };
    });
  };

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.qty * Number(i.service.price), 0);

  const buildWhatsAppMessage = () => {
    const lines: string[] = [];
    lines.push(`🍕 *Nuovo ordine da ${tenantName}*`);
    lines.push("");
    lines.push(`*Tipo:* ${orderType === "takeaway" ? "Asporto" : "Domicilio"}`);
    if (pickupTime) lines.push(`*Orario:* ${pickupTime}`);
    if (orderType === "delivery" && address) lines.push(`*Indirizzo:* ${address}`);
    lines.push("");
    lines.push("*Ordine:*");
    cartItems.forEach((item) => {
      lines.push(`• ${item.qty}x ${item.service.name} — €${(item.qty * Number(item.service.price)).toFixed(2)}`);
    });
    lines.push("");
    lines.push(`*Totale:* €${cartTotal.toFixed(2)}`);
    if (customerName) { lines.push(""); lines.push(`_Nome:_ ${customerName}`); }
    if (notes) lines.push(`_Note:_ ${notes}`);
    return lines.join("\n");
  };

  const sendToWhatsApp = () => {
    const phone = whatsappNumber.replace(/\s|\+|-/g, "");
    const msg = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-soft pb-24">
      {/* HEADER STICKY */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-night leading-tight">{tenantName}</h1>
            <p className="text-xs text-gray-500">Online ora · risponde subito</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-wa flex items-center justify-center text-white font-bold">
            {tenantName.charAt(0)}
          </div>
        </div>
      </header>

      {/* TAB CONTENT */}
      <div className="max-w-3xl mx-auto">
        {tab === "menu" && (
          <div className="px-4 py-6">
            <h2 className="text-2xl font-bold text-night mb-1">Il nostro menu</h2>
            <p className="text-sm text-gray-500 mb-6">Scegli, aggiungi al carrello e ordina su WhatsApp</p>

            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => {
                    const qty = cart[item.id]?.qty || 0;
                    return (
                      <div key={item.id} className="bg-white rounded-2xl p-4 flex justify-between items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-night text-sm">{item.name}</h4>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                          )}
                          <p className="font-bold text-night text-sm mt-1">€{Number(item.price).toFixed(2)}</p>
                        </div>
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-wa hover:bg-waDark text-white w-10 h-10 rounded-full flex items-center justify-center transition shrink-0 shadow-lg shadow-wa/30"
                            aria-label={`Aggiungi ${item.name}`}
                          >
                            <Plus size={20} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-wa/10 rounded-full p-1 shrink-0">
                            <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Rimuovi">
                              <Minus size={16} />
                            </button>
                            <span className="font-bold text-night w-5 text-center text-sm">{qty}</span>
                            <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-full bg-wa text-white flex items-center justify-center" aria-label="Aggiungi">
                              <Plus size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "info" && (
          <div className="px-4 py-6 space-y-4">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-bold text-night mb-3">Chi siamo</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {tenantDescription || "Nessuna descrizione disponibile."}
              </p>
            </div>

            {openingHours && (
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="text-wa" size={20} />
                  <h2 className="text-lg font-bold text-night">Orari</h2>
                </div>
                <div className="space-y-2 text-sm">
                  {Object.entries(openingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="font-semibold text-night uppercase">{day}</span>
                      <span className="text-gray-600">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(tenantAddress || tenantPhone) && (
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-lg font-bold text-night mb-3">Contatti</h2>
                {tenantAddress && (
                  <p className="text-sm text-gray-600 mb-2">📍 {tenantAddress}</p>
                )}
                {tenantPhone && (
                  <a href={`tel:${tenantPhone}`} className="text-sm text-wa font-semibold">
                    📞 {tenantPhone}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto grid grid-cols-3 px-2">
          <button
            onClick={() => setTab("menu")}
            className={`flex flex-col items-center gap-0.5 py-3 transition ${tab === "menu" ? "text-wa" : "text-gray-400"}`}
          >
            <MenuIcon size={22} />
            <span className="text-[10px] font-semibold">Menu</span>
          </button>

          <button
            onClick={() => cartCount > 0 ? setCartOpen(true) : setTab("menu")}
            className={`flex flex-col items-center gap-0.5 py-3 transition relative ${cartCount > 0 ? "text-wa" : "text-gray-400"}`}
          >
            <div className="relative">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-wa text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold">Carrello</span>
          </button>

          <button
            onClick={() => setTab("info")}
            className={`flex flex-col items-center gap-0.5 py-3 transition ${tab === "info" ? "text-wa" : "text-gray-400"}`}
          >
            <Info size={22} />
            <span className="text-[10px] font-semibold">Info</span>
          </button>
        </div>
      </nav>

      {/* CART DRAWER (mobile & desktop) */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setCartOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto max-w-3xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-night">Il tuo ordine</h3>
              <button onClick={() => setCartOpen(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Il carrello è vuoto</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.service.id} className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex items-center gap-1 bg-soft rounded-full p-1 shrink-0">
                          <button onClick={() => removeFromCart(item.service.id)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                            <Minus size={14} />
                          </button>
                          <span className="font-bold text-sm w-5 text-center">{item.qty}</span>
                          <button onClick={() => addToCart(item.service)} className="w-7 h-7 rounded-full bg-wa text-white flex items-center justify-center">
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm truncate">{item.service.name}</span>
                      </div>
                      <span className="font-semibold text-sm shrink-0">
                        €{(item.qty * Number(item.service.price)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-4 flex justify-between font-bold text-night text-lg">
                  <span>Totale</span>
                  <span>€{cartTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                  className="w-full bg-wa hover:bg-waDark text-white py-4 rounded-full font-bold transition"
                >
                  Procedi all&apos;ordine
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center">
          <div className="bg-white rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 md:p-8">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-night">Completa l&apos;ordine</h3>
              <button onClick={() => setCheckoutOpen(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>

            <label className="block mb-4">
              <span className="text-sm font-semibold text-night mb-2 block">Il tuo nome</span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Mario Rossi"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
              />
            </label>

            <div className="mb-4">
              <span className="text-sm font-semibold text-night mb-2 block">Come lo vuoi?</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOrderType("takeaway")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition ${orderType === "takeaway" ? "border-wa bg-wa/10 text-waDark font-semibold" : "border-gray-200 text-gray-600"}`}
                >
                  <Store size={18} /> Asporto
                </button>
                <button
                  onClick={() => setOrderType("delivery")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition ${orderType === "delivery" ? "border-wa bg-wa/10 text-waDark font-semibold" : "border-gray-200 text-gray-600"}`}
                >
                  <Truck size={18} /> Domicilio
                </button>
              </div>
            </div>

            {orderType === "delivery" && (
              <label className="block mb-4">
                <span className="text-sm font-semibold text-night mb-2 block">Indirizzo di consegna</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Via Roma 10, Bologna"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
                />
              </label>
            )}

            <div className="mb-4">
              <span className="text-sm font-semibold text-night mb-2 flex items-center gap-2">
                <Clock size={16} /> Orario
              </span>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPickupTime(t)}
                    className={`py-2 rounded-lg border text-sm transition ${pickupTime === t ? "border-wa bg-wa text-white font-semibold" : "border-gray-200 text-gray-700"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <label className="block mb-6">
              <span className="text-sm font-semibold text-night mb-2 block">Note (opzionale)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Senza cipolla, ben cotta..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none resize-none"
              />
            </label>

            <div className="bg-soft rounded-2xl p-4 mb-6 flex justify-between font-bold text-night text-lg">
              <span>Totale</span>
              <span>€{cartTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={sendToWhatsApp}
              disabled={!customerName || !pickupTime || (orderType === "delivery" && !address)}
              className="w-full bg-wa hover:bg-waDark disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-full font-bold transition flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              Invia ordine su WhatsApp
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Si aprirà WhatsApp con l&apos;ordine già scritto.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
