"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, ShoppingBag, Calendar, X, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Notification = {
  id: string;
  type: "order" | "booking";
  title: string;
  message: string;
  time: string;
  href: string;
  isNew: boolean;
};

export default function NotificationCenter({ tenantId, brandColor }: { tenantId: string; brandColor: string }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tenantId) return;

    // Carica notifiche esistenti
    async function loadRecent() {
      const [{ data: orders }, { data: bookings }] = await Promise.all([
        supabase.from("orders").select("id, order_code, total, created_at").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(5),
        supabase.from("bookings").select("id, booking_code, scheduled_at, created_at").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(5),
      ]);

      const all: Notification[] = [
        ...(orders || []).map((o: any) => ({
          id: o.id,
          type: "order" as const,
          title: "Nuovo Ordine",
          message: `${o.order_code} · €${Number(o.total).toFixed(2)}`,
          time: new Date(o.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
          href: "/dashboard/ordini",
          isNew: false,
        })),
        ...(bookings || []).map((b: any) => ({
          id: b.id,
          type: "booking" as const,
          title: "Nuova Prenotazione",
          message: `${b.booking_code} · ${new Date(b.scheduled_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })} ${new Date(b.scheduled_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`,
          time: new Date(b.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
          href: "/dashboard/prenotazioni",
          isNew: false,
        })),
      ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);

      setNotifications(all);
    }
    loadRecent();

    // Ascolta nuovi eventi in realtime
    const channel = supabase
      .channel("notification-center")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          const newNotif: Notification = {
            id: payload.new.id,
            type: "order",
            title: "Nuovo Ordine",
            message: `${payload.new.order_code} · €${Number(payload.new.total).toFixed(2)}`,
            time: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
            href: "/dashboard/ordini",
            isNew: true,
          };
          setNotifications(prev => [newNotif, ...prev].slice(0, 15));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings", filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          const newNotif: Notification = {
            id: payload.new.id,
            type: "booking",
            title: "Nuova Prenotazione",
            message: `${payload.new.booking_code}`,
            time: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
            href: "/dashboard/prenotazioni",
            isNew: true,
          };
          setNotifications(prev => [newNotif, ...prev].slice(0, 15));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tenantId, supabase]);

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter(n => n.isNew).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center gap-2 border border-night/[0.08] hover:border-night/20 bg-white text-night px-3 py-2.5 rounded-full text-xs font-semibold transition"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-12 right-0 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-night/[0.08] z-[100] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-night/[0.06] bg-cream/40">
              <div>
                <h3 className="font-bold text-night text-sm">Notifiche</h3>
                <p className="text-[10px] text-night/50 mt-0.5">
                  {notifications.length === 0 ? "Nessuna notifica" : `${notifications.length} recenti`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] font-bold text-night/50 hover:text-night px-2 py-1 rounded hover:bg-white transition">
                    Segna lette
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 text-night/40 hover:text-night transition">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto text-night/20 mb-2" size={32} />
                  <p className="text-xs text-night/50">Nessuna notifica ancora</p>
                  <p className="text-[10px] text-night/30 mt-1">Apparranno qui quando ricevi ordini</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={`${n.type}-${n.id}`}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-night/[0.04] last:border-0 hover:bg-cream/40 transition ${n.isNew ? 'bg-blue-50/40' : ''}`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: n.type === "order" ? "#3B82F620" : `${brandColor}20` }}
                    >
                      {n.type === "order" ? (
                        <ShoppingBag size={16} className="text-blue-600" />
                      ) : (
                        <Calendar size={16} style={{ color: brandColor }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-night text-xs">{n.title}</p>
                        {n.isNew && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                      </div>
                      <p className="text-[11px] text-night/60 truncate mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-night/40 mt-0.5 flex items-center gap-1">
                        <Clock size={9} /> {n.time}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="p-2 border-t border-night/[0.06] bg-cream/30">
              <Link href="/dashboard/ordini" onClick={() => setOpen(false)} className="block text-center py-2 text-xs font-bold text-night hover:bg-white rounded-lg transition">
                Vedi tutti gli ordini →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
