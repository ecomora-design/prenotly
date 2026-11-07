"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, ChefHat, Package, XCircle, Loader2,
  ShoppingBag, Store, Truck, Phone, MapPin, ArrowLeft
} from "lucide-react";
import Link from "next/link";

type OrderItem = { name: string; qty: number; price: number };

type Order = {
  id: string;
  order_code: string;
  items: OrderItem[];
  total: number;
  order_type: "takeaway" | "delivery";
  status: string;
  scheduled_for: string | null;
  notes: string | null;
  created_at: string;
  delivery_address: string | null;
};

type Props = {
  initialOrder: Order;
  customerName: string;
  businessName: string;
  businessSlug: string;
  businessColor: string;
  businessPhone: string | null;
};

const STEPS = [
  { key: "pending", label: "Ricevuto", icon: ShoppingBag },
  { key: "confirmed", label: "Accettato", icon: CheckCircle2 },
  { key: "preparing", label: "In cucina", icon: ChefHat },
  { key: "ready", label: "Pronto", icon: Package },
  { key: "delivered", label: "Consegnato", icon: CheckCircle2 },
];

const STATUS_ORDER = ["pending", "confirmed", "preparing", "ready", "delivered"];

function stepIndex(status: string): number {
  if (status === "pending_payment") return 0;
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export default function TrackClient({
  initialOrder,
  customerName,
  businessName,
  businessSlug,
  businessColor,
  businessPhone,
}: Props) {
  const supabase = createClient();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [updating, setUpdating] = useState(false);

  // Realtime: ascolta cambiamenti di stato
  useEffect(() => {
    const channel = supabase
      .channel("track-" + order.id)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload: any) => {
          setUpdating(true);
          setOrder((prev) => ({ ...prev, status: payload.new.status }));
          setTimeout(() => setUpdating(false), 800);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id, supabase]);

  const currentIdx = stepIndex(order.status);
  const isPendingPayment = order.status === "pending_payment";
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";
  const TypeIcon = order.order_type === "delivery" ? Truck : Store;

  const scheduledTime = order.scheduled_for
    ? new Date(order.scheduled_for).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Rome",
      })
    : null;

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-10">
      {/* HEADER */}
      <header className="bg-white border-b border-night/[0.06] sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={businessSlug ? `/${businessSlug}` : "/"}
            className="flex items-center gap-2 text-night/60 hover:text-night transition"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-bold">Torna al menu</span>
          </Link>
          <span className="text-[10px] font-black text-night/40 uppercase tracking-wider">
            Traccia ordine
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* CARD BUSINESS */}
        <div
          className="rounded-3xl p-5 mb-5 text-white"
          style={{ backgroundColor: businessColor }}
        >
          <p className="text-[10px] font-black uppercase tracking-wider text-white/70 mb-1">
            {businessName}
          </p>
          <h1 className="text-2xl font-black mb-1">Ciao {customerName.split(" ")[0]}!</h1>
          <p className="text-sm text-white/90">
            {isCancelled
              ? "Il tuo ordine è stato annullato."
              : isDelivered
              ? "Il tuo ordine è stato consegnato. Buon appetito! 🍽️"
              : isPendingPayment
              ? "Stiamo verificando il pagamento. Ci vorrà solo un momento…"
              : "Il tuo ordine è in lavorazione. Ti aggiorniamo qui in tempo reale."}
          </p>
        </div>

        {isPendingPayment && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <Loader2 size={18} className="text-amber-600 animate-spin shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">Verifica pagamento in corso</p>
              <p className="text-[11px] text-amber-800 mt-0.5">Stiamo confermando il pagamento con Stripe. La pagina si aggiornerà automaticamente.</p>
            </div>
          </div>
        )}

        {/* STATO ATTUALE */}
        <div className="bg-white rounded-3xl p-5 border border-night/[0.06] shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black text-night/40 uppercase tracking-wider">
                Codice ordine
              </p>
              <p className="font-mono text-sm font-bold text-night">{order.order_code}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <TypeIcon size={14} className="text-night/40" />
              <span className="text-xs font-bold text-night/60">
                {order.order_type === "delivery" ? "Domicilio" : "Asporto"}
              </span>
            </div>
          </div>

          {scheduledTime && (
            <div className="flex items-center gap-1.5 text-xs text-night/60 pt-3 border-t border-night/[0.04]">
              <Clock size={12} />
              <span className="font-bold">Orario:</span>
              <span>{scheduledTime}</span>
            </div>
          )}

          {order.delivery_address && (
            <div className="flex items-start gap-1.5 text-xs text-night/60 mt-2">
              <MapPin size={12} className="mt-0.5 shrink-0" />
              <span>{order.delivery_address}</span>
            </div>
          )}
        </div>

        {/* TIMELINE */}
        {!isCancelled ? (
          <div className="bg-white rounded-3xl p-5 border border-night/[0.06] shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-night/40 uppercase tracking-wider">
                Stato ordine
              </p>
              {updating && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 animate-pulse">
                  <Loader2 size={10} className="animate-spin" /> aggiornamento
                </span>
              )}
            </div>

            <div className="relative">
              {/* Linea verticale */}
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-night/[0.08]" />

              {/* Steps */}
              <div className="space-y-4">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx <= currentIdx;
                  const isActive = idx === currentIdx;
                  return (
                    <div key={step.key} className="flex items-start gap-3 relative">
                      <motion.div
                        animate={{
                          scale: isActive ? [1, 1.1, 1] : 1,
                          backgroundColor: isDone ? businessColor : "#F1F5F9",
                        }}
                        transition={{
                          scale: { duration: 1, repeat: isActive ? Infinity : 0, repeatType: "reverse" },
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm"
                      >
                        <Icon
                          size={16}
                          className={isDone ? "text-white" : "text-night/30"}
                          strokeWidth={isActive ? 3 : 2}
                        />
                      </motion.div>
                      <div className="flex-1 pt-1.5">
                        <p
                          className={`text-sm font-bold transition-colors ${
                            isActive ? "text-night" : isDone ? "text-night/70" : "text-night/30"
                          }`}
                        >
                          {step.label}
                          {isActive && !isDelivered && (
                            <span className="ml-2 text-[10px] font-black uppercase tracking-wider" style={{ color: businessColor }}>
                              ● ora
                            </span>
                          )}
                        </p>
                        {isActive && !isDelivered && (
                          <p className="text-[11px] text-night/50 mt-0.5">
                            {step.key === "pending" && "Abbiamo ricevuto il tuo ordine"}
                            {step.key === "confirmed" && "Il ristorante ha accettato il tuo ordine"}
                            {step.key === "preparing" && "Il tuo ordine è in preparazione"}
                            {step.key === "ready" && "Il tuo ordine è pronto!"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 rounded-3xl p-5 border border-red-200 mb-4 flex items-start gap-3">
            <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 text-sm">Ordine annullato</p>
              <p className="text-xs text-red-700/80 mt-0.5">
                Contatta il ristorante se hai bisogno di chiarimenti.
              </p>
            </div>
          </div>
        )}

        {/* RIEPILOGO ORDINE */}
        <div className="bg-white rounded-3xl p-5 border border-night/[0.06] shadow-sm mb-4">
          <p className="text-[10px] font-black text-night/40 uppercase tracking-wider mb-3">
            Il tuo ordine
          </p>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-night/70">
                  <strong className="text-night">{item.qty}×</strong> {item.name}
                </span>
                <span className="font-bold text-night">
                  €{(item.qty * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-night/[0.04] flex justify-between items-center">
            <span className="text-xs font-bold text-night/50 uppercase tracking-wider">Totale</span>
            <span className="text-lg font-black" style={{ color: businessColor }}>
              €{Number(order.total).toFixed(2)}
            </span>
          </div>
        </div>

        {/* NOTE */}
        {order.notes && (
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mb-4">
            <p className="text-[10px] font-black text-orange-800 uppercase tracking-wider mb-1">
              Note
            </p>
            <p className="text-xs text-orange-900">{order.notes}</p>
          </div>
        )}

        {/* CONTATTI */}
        {businessPhone && (
          <a
            href={`tel:${businessPhone}`}
            className="flex items-center justify-center gap-2 w-full bg-white border border-night/[0.08] rounded-2xl py-3 text-sm font-bold text-night hover:bg-night/[0.02] transition"
          >
            <Phone size={14} />
            Chiama {businessName}
          </a>
        )}

        <p className="text-center text-[10px] text-night/40 mt-6">
          Pagina aggiornata in tempo reale · Prenotly
        </p>
      </div>
    </main>
  );
}
