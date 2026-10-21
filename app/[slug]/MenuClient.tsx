"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PremiumMenu from "@/components/PremiumMenu";
import TableMap from "@/components/TableMap";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";
import SplashScreen from "@/components/SplashScreen";
import { ToastContainer, useToast } from "@/components/Toast";
import SkeletonMenu from "@/components/SkeletonMenu";
import PullToRefresh from "@/components/PullToRefresh";
import AppEnhancer from "@/components/AppEnhancer";
import {
  Plus, Minus, ShoppingBag, X, Clock,
  Truck, Store, MapPin, Phone, Info, BookOpen, ChevronLeft, Search,
  ChevronRight, Utensils, Users, Calendar, CheckCircle2,
  MessageCircle, Lock, Sparkles, ArrowRight, AlertCircle } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  image_url?: string | null;
};

type Table = {
  id: string;
  table_number: number;
  capacity: number;
  shape: string;
  is_active: boolean;
  isBusy?: boolean;
  position_x: number;
  position_y: number;
  isSelected?: boolean;
};

type CartItem = { service: Service; qty: number };

type Props = {
  tenantName: string;
  tenantAddress: string | null;
  tenantPhone: string | null;
  tenantDescription: string | null;
  openingHours: Record<string, string> | null;
  whatsappNumber: string;
  services: Service[];
  brandColor?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  slug: string;
  tableBookingEnabled?: boolean;
  tableSlots?: string[] | null;
  maxPartySize?: number;
  tables?: Table[];
  hasDelivery?: boolean;
  hasTakeaway?: boolean;
  deliveryFee?: number;
  minOrderDelivery?: number;
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTHS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

// Validazione numero WhatsApp
function isValidWhatsApp(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const clean = phone.replace(/\D/g, "");
  return clean.length >= 10;
}


export default function MenuClient({
  tenantName,
  tenantAddress,
  tenantPhone,
  tenantDescription,
  openingHours,
  whatsappNumber,
  services,
  brandColor = "#25D366",
  logoUrl,
  coverImageUrl,
  slug,
  tableBookingEnabled = false,
  tableSlots = ["19:30", "20:00", "20:30", "21:00", "21:30"],
  maxPartySize = 10,
  tables = [],
  hasDelivery = true,
  hasTakeaway = true,
  deliveryFee = 0,
  minOrderDelivery = 0,
}: Props) {
  const [tab, setTab] = useState<"menu" | "info">("menu");
  const [selectedCategory, setSelectedCategory] = useState<string>("tutto");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [tableBookingOpen, setTableBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [showTableUpgrade, setShowTableUpgrade] = useState(false);
  const toast = useToast();
  const [initialLoading, setInitialLoading] = useState(true);
  const { lang, setLang, t } = useLanguage();

  // Traduzione automatica delle descrizioni
  useEffect(() => {
    if (lang === "it" || !services || services.length === 0) return;

    console.log("[TRANSLATE-EFFECT] Lang:", lang, "| Services:", services?.length);
    const translateAll = async () => {
      const updates: Record<string, string> = {};

      for (const service of services) {
        if (!service.description) continue;
        const cacheKey = `${service.id}_${lang}`;
        
        // Se già in cache, usa quella
        if (translationCache.current[cacheKey]) {
          updates[service.id] = translationCache.current[cacheKey];
          continue;
        }

        // Altrimenti chiama l'API
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: service.description,
              targetLang: lang,
            }),
          });
          const data = await res.json();
          const translated = data.translated || service.description;
          translationCache.current[cacheKey] = translated;
          updates[service.id] = translated;
        } catch (err) {
          updates[service.id] = service.description;
        }
      }

      if (Object.keys(updates).length > 0) {
        setTranslatedDescriptions(prev => ({ ...prev, ...updates }));
      }
    };

    translateAll();
  }, [lang, services]);

  const [translatedDescriptions, setTranslatedDescriptions] = useState<Record<string, string>>({});
  const translationCache = useRef<Record<string, string>>({});
  const [view, setView] = useState<"welcome" | "order" | "menu">("welcome");
  const [orderSuccess, setOrderSuccess] = useState<{ code: string; total: number } | null>(null);
  const [lastOrderSnapshot, setLastOrderSnapshot] = useState<any>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+39");
  const [orderType, setOrderType] = useState<"takeaway" | "delivery">(hasTakeaway ? "takeaway" : "delivery");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Table booking
  const [tableCustomerName, setTableCustomerName] = useState("");
  const [tableCustomerPhone, setTableCustomerPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [partySize, setPartySize] = useState<number>(2);
  const [tableNotes, setTableNotes] = useState("");
  const [tableSuccess, setTableSuccess] = useState<{ code: string; waUrl: string } | null>(null);
  const [busyTables, setBusyTables] = useState<string[]>([]);

  const slots = tableSlots || ["19:30", "20:00", "20:30", "21:00", "21:30"];

  const menuByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {};
    services.forEach((s) => {
      const cat = s.category || "Altro";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    });
    return grouped;
  }, [services]);

  const categories = useMemo(() => Object.keys(menuByCategory), [menuByCategory]);

  const filteredServices = useMemo(() => {
    let list = services;
    if (selectedCategory !== "tutto") {
      list = list.filter((s) => (s.category || "Altro") === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [services, selectedCategory, searchQuery]);

  const filteredByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {};
    filteredServices.forEach((s) => {
      const cat = s.category || "Altro";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    });
    return grouped;
  }, [filteredServices]);

  const availableDays = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayKey = DAY_KEYS[d.getDay()];
      const hours = openingHours?.[dayKey];
      if (hours && hours !== "chiuso") days.push(d);
    }
    return days;
  }, [openingHours]);

  const timeSlots = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    const todayKey = DAY_KEYS[now.getDay()];
    const todayHours = openingHours?.[todayKey];

    // Se chiuso oggi, nessuno slot
    if (!todayHours || todayHours === "chiuso") return [];

    const parts = todayHours.split("-");
    if (parts.length !== 2) return [];
    const [startH, startM] = parts[0].split(":").map(Number);
    const [endH, endM] = parts[1].split(":").map(Number);

    const openTime = new Date(now);
    openTime.setHours(startH, startM, 0, 0);
    const closeTime = new Date(now);
    closeTime.setHours(endH, endM, 0, 0);

    // Se il ristorante ha già chiuso oggi, nessuno slot
    if (now >= closeTime) return [];

    // Parti da max(ora attuale + 30min, apertura)
    let current = new Date(Math.max(now.getTime() + 30 * 60000, openTime.getTime()));

    // Arrotonda ai prossimi 30 min
    const mins = current.getMinutes();
    if (mins < 30) current.setMinutes(30, 0, 0);
    else if (mins > 30) current.setHours(current.getHours() + 1, 0, 0, 0);
    else current.setSeconds(0, 0);

    // Fermati 30 min prima della chiusura
    const cutoff = new Date(closeTime.getTime() - 30 * 60000);
    while (current <= cutoff) {
      list.push(current.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
      current = new Date(current.getTime() + 30 * 60000);
    }

    return list;
  }, [openingHours]);

  // Carica tavoli occupati quando cambia data/ora
  useEffect(() => {
    if (!selectedDate || !selectedSlot) {
      setBusyTables([]);
      return;
    }

    async function loadBusy() {
      try {
        const [h, m] = selectedSlot!.split(":").map(Number);
        const dt = new Date(selectedDate!);
        dt.setHours(h, m, 0, 0);
        const dateStr = dt.toISOString();

        const res = await fetch(
          `/api/tables/busy?slug=${slug}&datetime=${encodeURIComponent(dateStr)}`
        );
        const data = await res.json();
        setBusyTables(data.busyTableIds || []);
      } catch (err) {
        console.error(err);
        setBusyTables([]);
      }
    }
    loadBusy();
  }, [selectedDate, selectedSlot, slug]);

  // Simula caricamento iniziale (per mostrare skeleton)
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    // Simula refresh
    await new Promise((resolve) => setTimeout(resolve, 800));
    if ("vibrate" in navigator) navigator.vibrate(10);
  };

  const addToCart = (service: Service) => {
    setCart((prev) => {
      const existing = prev[service.id];
      return { ...prev, [service.id]: { service, qty: existing ? existing.qty + 1 : 1 } };
    });
    // Haptic feedback
    if ("vibrate" in navigator) navigator.vibrate(10);
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
  const cartSubtotal = cartItems.reduce((sum, i) => sum + i.qty * Number(i.service.price), 0);
  const deliveryCost = orderType === "delivery" ? deliveryFee : 0;
  const cartTotal = cartSubtotal + deliveryCost;

  const sendOrder = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          customerName,
          customerPhone,
          items: cartItems.map((i) => ({
            serviceId: i.service.id,
            name: i.service.name,
            price: Number(i.service.price),
            qty: i.qty,
          })),
          total: cartTotal,
          orderType,
          deliveryAddress: orderType === "delivery" ? address : null,
          scheduledFor: pickupTime
            ? `${new Date().toISOString().split("T")[0]}T${pickupTime}:00`
            : null,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Errore durante l'invio. Riprova.");
        setSubmitting(false);
        return;
      }

      const code = data.order?.order_code || "ORDINE";

      setLastOrderSnapshot({
        code,
        subtotal: cartSubtotal,
        deliveryFee: orderType === "delivery" ? deliveryFee : 0,
        total: cartTotal,
        customerName,
        orderType,
        address,
        pickupTime,
        notes,
        items: cartItems.map((i) => ({
          name: i.service.name,
          qty: i.qty,
          price: Number(i.service.price),
        })),
      });

      setOrderSuccess({ code, total: cartTotal });
      setCheckoutOpen(false);
      setCart({});
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitError("Errore di connessione. Riprova.");
      setSubmitting(false);
    }
  };

  const buildOrderWhatsAppUrl = () => {
    if (!lastOrderSnapshot) return "#";
    const lines: string[] = [];
    lines.push(`🍕 *Nuovo ordine - ${tenantName}*`);
    lines.push("");
    lines.push(`🔖 Codice: *${lastOrderSnapshot.code}*`);
    lines.push(`📦 Tipo: ${lastOrderSnapshot.orderType === "delivery" ? "🚗 Domicilio" : "🥡 Asporto"}`);
    if (lastOrderSnapshot.pickupTime) lines.push(`⏰ Orario: ${lastOrderSnapshot.pickupTime}`);
    if (lastOrderSnapshot.address) lines.push(`📍 Indirizzo: ${lastOrderSnapshot.address}`);
    lines.push("");
    lines.push("━━━ *ORDINE* ━━━");
    lastOrderSnapshot.items.forEach((item: any) => {
      lines.push(`• ${item.qty}x ${item.name} — €${(item.qty * item.price).toFixed(2)}`);
    });
    lines.push("");
    if (lastOrderSnapshot.deliveryFee > 0) {
      lines.push(`💰 *Subtotale: €${lastOrderSnapshot.subtotal.toFixed(2)}*`);
      lines.push(`🚗 *Consegna: €${lastOrderSnapshot.deliveryFee.toFixed(2)}*`);
      lines.push(`💰 *Totale: €${lastOrderSnapshot.total.toFixed(2)}*`);
    } else {
      lines.push(`💰 *Totale: €${lastOrderSnapshot.total.toFixed(2)}*`);
    }
    lines.push("");
    lines.push("━━━ *CLIENTE* ━━━");
    lines.push(`👤 ${lastOrderSnapshot.customerName}`);
    if (lastOrderSnapshot.notes) lines.push(`📝 Note: ${lastOrderSnapshot.notes}`);

    if (!isValidWhatsApp(whatsappNumber)) return "#";
    const phone = whatsappNumber.replace(/\s|\+|-/g, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const sendTableBooking = async () => {
    if (!selectedDate || !selectedSlot || !selectedTable) return;

    setSubmitting(true);
    setSubmitError(null);

    const [h, m] = selectedSlot.split(":").map(Number);
    const dt = new Date(selectedDate);
    dt.setHours(h, m, 0, 0);

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          customerName: tableCustomerName,
          customerPhone: tableCustomerPhone,
          bookingType: "table",
          tableId: selectedTable.id,
          scheduledAt: dt.toISOString(),
          partySize,
          notes: tableNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || data.error || "Errore durante l'invio. Riprova.");
        setSubmitting(false);
        return;
      }

      const code = data.booking?.booking_code || "PRENOTAZIONE";

      const lines: string[] = [];
      lines.push(`🍽️ *Nuova prenotazione tavolo*`);
      lines.push(`_${tenantName}_`);
      lines.push("");
      lines.push(`🔖 Codice: *${code}*`);
      lines.push(`🪑 Tavolo: *${selectedTable.table_number}*`);
      lines.push(`📅 ${DAY_LABELS[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]}`);
      lines.push(`⏰ Ore ${selectedSlot}`);
      lines.push(`👥 Persone: ${partySize}`);
      lines.push("");
      lines.push("━━━ *CLIENTE* ━━━");
      lines.push(`👤 ${tableCustomerName}`);
      lines.push(`📞 ${tableCustomerPhone}`);
      if (tableNotes) lines.push(`📝 Note: ${tableNotes}`);

      if (!isValidWhatsApp(whatsappNumber)) {
        setSubmitError("Il ristorante non ha ancora configurato WhatsApp. Riprova più tardi.");
        setSubmitting(false);
        return;
      }
      const phone = whatsappNumber.replace(/\s|\+|-/g, "");
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;

      setTableSuccess({ code, waUrl });
      setTableBookingOpen(false);
      setSelectedDate(null);
      setSelectedSlot(null);
      setSelectedTable(null);
      setTableCustomerName("");
      setTableCustomerPhone("");
      setPartySize(2);
      setTableNotes("");
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitError("Errore di connessione. Riprova.");
      setSubmitting(false);
    }
  };

  // Computed tables with busy status
  const tablesWithStatus = useMemo(() => {
    return tables.map((t) => ({
      ...t,
      isBusy: busyTables.includes(t.id),
    }));
  }, [tables, busyTables]);

  if (view === "welcome") {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0A0A0A]">
        {/* Language Switcher top-right */}
        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher currentLang={lang} onChange={setLang} variant="dark" />
        </div>
        {/* Blob animati di sfondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ x: [0, 80, 0], y: [0, -60, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-40"
            style={{ backgroundColor: brandColor }}
          />
          <motion.div 
            animate={{ x: [0, -70, 0], y: [0, 80, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full blur-[110px] opacity-25"
            style={{ backgroundColor: brandColor }}
          />
          <motion.div 
            animate={{ x: [0, 50, 0], y: [0, 50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[130px] opacity-15"
            style={{ backgroundColor: "#FFFFFF" }}
          />
        </div>

        {/* Texture grana sottile */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }} />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">

          {/* LOGO con glow */}
          <motion.div 
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 180, delay: 0.1 }}
            className="relative mb-8"
          >
            <div 
              className="absolute inset-0 rounded-[36px] blur-3xl opacity-50" 
              style={{ backgroundColor: brandColor }} 
            />
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={tenantName} 
                className="relative w-32 h-32 rounded-[32px] object-cover ring-2 ring-white/20 shadow-2xl" 
              />
            ) : (
              <div 
                className="relative w-32 h-32 rounded-[32px] flex items-center justify-center text-white font-black text-5xl ring-2 ring-white/20 shadow-2xl"
                style={{ backgroundColor: brandColor }}
              >
                {tenantName.charAt(0)}
              </div>
            )}
          </motion.div>

          {/* Nome ristorante */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
              {tenantName}
            </h1>
            <p className="text-white/50 text-base font-medium">
              {t.welcome.split("! ")[1] || "Come possiamo servirti oggi?"}
            </p>
          </motion.div>

          {/* CARD MENU */}
          <div className="w-full max-w-md space-y-3">

            {/* Ordina Online */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView("order")}
              className="w-full group relative bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/25 rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 overflow-hidden text-left"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              <div 
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: brandColor + "25" }}
              >
                <ShoppingBag size={26} style={{ color: brandColor }} />
              </div>
              <div className="flex-1 min-w-0 relative">
                <h2 className="text-lg font-bold text-white leading-tight">{t.orderOnline}</h2>
                <p className="text-xs text-white/50 mt-0.5">{t.orderOnlineDesc}</p>
              </div>
              <ArrowRight size={20} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all relative" />
            </motion.button>

            {/* Prenota Tavolo */}
            {tableBookingEnabled && (
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setView("menu");
                  setTableBookingOpen(true);
                }}
                className="w-full group relative bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/25 rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 overflow-hidden text-left"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 bg-orange-500/25">
                  <Calendar size={26} className="text-orange-400" />
                </div>
                <div className="flex-1 min-w-0 relative">
                  <h2 className="text-lg font-bold text-white leading-tight">{t.bookTable}</h2>
                  <p className="text-xs text-white/50 mt-0.5">{t.bookTableDesc}</p>
                </div>
                <ArrowRight size={20} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all relative" />
              </motion.button>
            )}

            {/* Sfoglia Menu */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView("menu")}
              className="w-full group relative bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/25 rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 overflow-hidden text-left"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 bg-blue-500/25">
                <BookOpen size={26} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0 relative">
                <h2 className="text-lg font-bold text-white leading-tight">{t.browseMenu}</h2>
                <p className="text-xs text-white/50 mt-0.5">{t.browseMenuDesc}</p>
              </div>
              <ArrowRight size={20} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all relative" />
            </motion.button>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-14 text-center"
          >
            <p className="text-[10px] text-white/25 uppercase tracking-[0.3em] font-black">
              Powered by <span style={{ color: brandColor }}>Prenotly</span>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-32">
      <AppEnhancer brandColor={brandColor} tenantName={tenantName} />

      <SplashScreen
        tenantName={tenantName}
        logoUrl={logoUrl}
        brandColor={brandColor}
        isFood={true}
      />

      {/* HERO */}
      <div className="relative h-52 md:h-64 overflow-hidden">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt={tenantName} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}DD 50%, ${brandColor}88 100%)` }}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-6 right-6 w-40 h-40 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-white blur-3xl" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button onClick={() => setView("welcome")} className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 active:scale-95 transition hover:bg-black/60">
            <ChevronLeft size={14} className="text-white" />
            <span className="text-white text-[11px] font-semibold">Home</span>
          </button>

          {tableBookingEnabled && (
            <button
              onClick={() => setTableBookingOpen(true)}
              className="bg-white/95 backdrop-blur-md rounded-full px-3.5 py-2 flex items-center gap-1.5 active:scale-95 transition shadow-lg"
            >
              <Calendar size={12} className="text-night" />
              <span className="text-night text-[11px] font-bold">Prenota tavolo</span>
            </button>
          )}
        </div>
      </div>

      {/* CARD ATTIVITÀ */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="flex flex-col items-center pt-6 pb-4">
            <div className="mb-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={tenantName}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-2xl"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl ring-4 ring-white shadow-2xl"
                  style={{ backgroundColor: brandColor }}
                >
                  {tenantName.charAt(0)}
                </div>
              )}
            </div>
            <h1 className="text-lg font-bold text-night text-center px-4 leading-tight">
              {tenantName}
            </h1>
            {tenantAddress && (
              <p className="text-xs text-gray-500 mt-1 text-center px-4 flex items-center justify-center gap-1">
                <MapPin size={11} /> {tenantAddress}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 border-t border-gray-100">
            {tenantPhone && (
              <a
                href={`tel:${tenantPhone}`}
                className="py-3.5 flex items-center justify-center gap-2 text-xs font-bold text-night active:bg-soft transition border-r border-gray-100"
              >
                <Phone size={14} style={{ color: brandColor }} />
                Chiama
              </a>
            )}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\s|\+|-/g, "")}?text=Ciao!%20Vorrei%20informazioni`}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-3.5 flex items-center justify-center gap-2 text-xs font-bold text-night active:bg-soft transition ${!tenantPhone ? "col-span-2" : ""}`}
            >
              <MessageCircle size={14} style={{ color: brandColor }} />
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>

      {/* TABS */}
      <div className="max-w-3xl mx-auto px-4 mt-5">
        <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1">
          <button
            onClick={() => setTab("menu")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${tab === "menu" ? "text-white shadow-sm" : "text-gray-500"}`}
            style={tab === "menu" ? { backgroundColor: brandColor } : undefined}
          >
            <Utensils size={15} />
            Menu
          </button>
          <button
            onClick={() => setTab("info")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${tab === "info" ? "text-white shadow-sm" : "text-gray-500"}`}
            style={tab === "info" ? { backgroundColor: brandColor } : undefined}
          >
            <Info size={15} />
            Info
          </button>
        </div>
      </div>

      {/* CONTENUTO */}
      <div className="max-w-3xl mx-auto">
        {tab === "menu" && initialLoading && <SkeletonMenu brandColor={brandColor} />}

        {tab === "menu" && !initialLoading && (
          <PremiumMenu
            services={(filteredServices as any[]).map(s => ({ ...s, description: translatedDescriptions[s.id] || s.description })) as any}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            brandColor={brandColor}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            cart={cart as any}
            view={view}
            lang={lang}
            t={t}
          />
        )}

        {tab === "info" && (
          <div className="px-4 mt-5 pb-4 space-y-4">
            {tenantDescription && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-bold text-night mb-2 flex items-center gap-2">
                  <Info size={16} style={{ color: brandColor }} />
                  Chi siamo
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">{tenantDescription}</p>
              </div>
            )}

            {openingHours && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={18} style={{ color: brandColor }} />
                  <h2 className="text-base font-bold text-night">Orari di apertura</h2>
                </div>
                <div className="space-y-2">
                  {Object.entries(openingHours).map(([day, hours]) => {
                    const isToday = DAY_KEYS[new Date().getDay()] === day;
                    return (
                      <div
                        key={day}
                        className={`flex justify-between items-center text-sm py-1.5 px-2 rounded-lg ${isToday ? "bg-soft font-bold" : ""}`}
                      >
                        <span className={`text-xs uppercase font-semibold ${isToday ? "text-night" : "text-gray-500"}`}>{day}</span>
                        <span className={`text-xs font-semibold ${hours === "chiuso" ? "text-red-400" : "text-gray-700"}`}>{hours}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(tenantAddress || tenantPhone) && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-bold text-night mb-3">Contatti</h2>
                {tenantAddress && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(tenantAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 mb-3 active:bg-soft rounded-lg p-2 -m-2 transition"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColor}15` }}>
                      <MapPin size={16} style={{ color: brandColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-semibold">Indirizzo</p>
                      <p className="text-sm text-night font-semibold">{tenantAddress}</p>
                    </div>
                  </a>
                )}
                {tenantPhone && (
                  <a href={`tel:${tenantPhone}`} className="flex items-start gap-3 active:bg-soft rounded-lg p-2 -m-2 transition">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColor}15` }}>
                      <Phone size={16} style={{ color: brandColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-semibold">Telefono</p>
                      <p className="text-sm text-night font-semibold">{tenantPhone}</p>
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CART FLOATING */}
      <AnimatePresence>
        {view === "order" && cartCount > 0 && !cartOpen && !checkoutOpen && !orderSuccess && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-5 left-4 right-4 max-w-3xl mx-auto z-40 text-white py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-between px-5 active:scale-[0.98] transition"
            style={{ backgroundColor: brandColor, boxShadow: `0 12px 32px ${brandColor}50` }}
          >
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-sm font-bold">{cartCount}</div>
              <span className="text-sm">{t.yourOrder}</span>
            </span>
            <span className="text-lg">€{cartTotal.toFixed(2)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-[#F5F5F7] rounded-t-3xl max-h-[90vh] overflow-y-auto max-w-3xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-[#F5F5F7] pt-3 pb-4 px-5 border-b border-gray-200/50 z-10">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-night">{t.yourOrder}</h3>
                  <button onClick={() => setCartOpen(false)} className="text-gray-500 p-2 hover:bg-white rounded-full transition">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.service.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                      <div className="flex items-center gap-1 rounded-full p-0.5 shrink-0" style={{ backgroundColor: `${brandColor}15` }}>
                        <button onClick={() => removeFromCart(item.service.id)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center active:scale-90 transition shadow-sm">
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm w-5 text-center">{item.qty}</span>
                        <button onClick={() => addToCart(item.service)} className="w-7 h-7 rounded-full flex items-center justify-center text-white active:scale-90 transition" style={{ backgroundColor: brandColor }}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-night truncate">{item.service.name}</p>
                        <p className="text-xs text-gray-500">€{Number(item.service.price).toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-sm text-night shrink-0">€{(item.qty * Number(item.service.price)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-4 mb-5 shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{t.subtotal}</span>
                    <span className="font-semibold text-night">€{cartSubtotal.toFixed(2)}</span>
                  </div>
                  {orderType === "delivery" && deliveryFee > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{t.delivery}</span>
                      <span className="font-semibold text-night">+€{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {orderType === "delivery" && minOrderDelivery > 0 && cartSubtotal < minOrderDelivery && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                      <AlertCircle size={12} />
                      Ordine minimo: €{minOrderDelivery.toFixed(2)}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="font-bold text-night">{t.total}</span>
                    <span className="font-bold text-night text-2xl">€{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (orderType === "delivery" && minOrderDelivery > 0 && cartSubtotal < minOrderDelivery) {
                      toast.show(
                        "error",
                        "Ordine minimo non raggiunto",
                        `Per il domicilio serve un ordine minimo di €${minOrderDelivery.toFixed(2)}`
                      );
                      return;
                    }
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  className="w-full text-white py-4 rounded-2xl font-bold transition active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}
                >
                  {t.proceedOrder} <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHECKOUT */}
      <AnimatePresence>
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center">
            <motion.div
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#F5F5F7] rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#F5F5F7] pt-3 pb-4 px-6 border-b border-gray-200/50 z-10">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-night">{t.confirmOrder.split(" ")[0]} {t.yourOrder.toLowerCase()}</h3>
                  <button onClick={() => setCheckoutOpen(false)} className="text-gray-500 p-2 hover:bg-white rounded-full transition">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t.yourName}</span>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Mario Rossi" className="w-full bg-transparent border-0 text-base font-semibold text-night placeholder-gray-300 focus:outline-none p-0" />
                  </label>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t.yourPhone} *</span>
                    
                    <div className="flex items-center gap-3">
                      <select 
                        value={phonePrefix} 
                        onChange={(e) => setPhonePrefix(e.target.value)} 
                        className="bg-transparent border-0 text-base font-semibold text-night focus:outline-none p-0 cursor-pointer"
                      >
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+41">🇨🇭 +41</option>
                        <option value="+43">🇦🇹 +43</option>
                        <option value="+32">🇧🇪 +32</option>
                        <option value="+31">🇳🇱 +31</option>
                        <option value="+351">🇵🇹 +351</option>
                        <option value="+30">🇬🇷 +30</option>
                        <option value="+385">🇭🇷 +385</option>
                        <option value="+386">🇸🇮 +386</option>
                        <option value="+420">🇨🇿 +420</option>
                        <option value="+48">🇵🇱 +48</option>
                        <option value="+40">🇷🇴 +40</option>
                        <option value="+359">🇧🇬 +359</option>
                        <option value="+36">🇭🇺 +36</option>
                        <option value="+353">🇮🇪 +353</option>
                        <option value="+46">🇸🇪 +46</option>
                        <option value="+47">🇳🇴 +47</option>
                        <option value="+45">🇩🇰 +45</option>
                        <option value="+358">🇫🇮 +358</option>
                        <option value="+7">🇷🇺 +7</option>
                        <option value="+90">🇹🇷 +90</option>
                        <option value="+972">🇮🇱 +972</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+64">🇳🇿 +64</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+54">🇦🇷 +54</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+27">🇿🇦 +27</option>
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+212">🇲🇦 +38</option>
                      </select>
                      <div className="w-px h-6 bg-gray-200"></div>
                      <input type="tel" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="333 123 4567" className="w-full bg-transparent border-0 text-base font-semibold text-night placeholder-gray-300 focus:outline-none p-0" />
                    </div>
                  </label>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">{t.howYouWant}</span>
                  <div className={`grid gap-2 ${hasTakeaway && hasDelivery ? "grid-cols-2" : "grid-cols-1"}`}>
                    {hasTakeaway && (
                      <button onClick={() => setOrderType("takeaway")} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition font-semibold text-sm ${orderType === "takeaway" ? "text-white" : "bg-soft text-gray-600"}`} style={orderType === "takeaway" ? { backgroundColor: brandColor } : undefined}>
                        <Store size={16} /> {t.takeaway}
                      </button>
                    )}
                    {hasDelivery && (
                      <button onClick={() => setOrderType("delivery")} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition font-semibold text-sm ${orderType === "delivery" ? "text-white" : "bg-soft text-gray-600"}`} style={orderType === "delivery" ? { backgroundColor: brandColor } : undefined}>
                        <Truck size={16} /> {t.deliveryOption} {deliveryFee > 0 && <span className="text-xs opacity-70">+€{deliveryFee.toFixed(2)}</span>}
                      </button>
                    )}
                  </div>
                </div>

                {orderType === "delivery" && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <label className="block">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t.addressLabel}</span>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Via Roma 10, Bologna" className="w-full bg-transparent border-0 text-base font-semibold text-night placeholder-gray-300 focus:outline-none p-0" />
                    </label>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock size={12} /> {t.time}
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {(timeSlots && timeSlots.length > 0 ? timeSlots : ["12:00", "12:30", "13:00", "13:30", "14:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"]).map((t) => (
                      <button key={t} onClick={() => setPickupTime(t)} className={`py-2.5 rounded-xl text-sm font-bold transition ${pickupTime === t ? "text-white" : "bg-soft text-night"}`} style={pickupTime === t ? { backgroundColor: brandColor } : undefined}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t.notes}</span>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Senza cipolla, ben cotta..." rows={2} className="w-full bg-transparent border-0 text-sm text-night placeholder-gray-300 focus:outline-none p-0 resize-none" />
                  </label>
                </div>

                <div className="rounded-2xl p-5 shadow-sm text-white" style={{ backgroundColor: brandColor }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold opacity-90">{t.total}</span>
                    <span className="font-bold text-2xl">€{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  onClick={sendOrder}
                  disabled={!customerName || !customerPhone || !pickupTime || (orderType === "delivery" && !address) || submitting}
                  className="w-full disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 active:scale-[0.98]"
                  style={!customerName || !customerPhone || !pickupTime || (orderType === "delivery" && !address) || submitting ? undefined : { backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}
                >
                  {submitting ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t.sending}</>
                  ) : (
                    <><CheckCircle2 size={20} />{t.confirmOrder}</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ORDER SUCCESS */}
      <AnimatePresence>
        {orderSuccess && (
          <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.1 }} className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${brandColor}15` }}>
                <CheckCircle2 size={52} style={{ color: brandColor }} />
              </motion.div>
              <h2 className="text-2xl font-bold text-night mb-2">{t.orderConfirmed}</h2>
              <p className="text-gray-600 mb-6">{t.thanks} {customerName}! {t.orderSent} {tenantName}.</p>

              <div className="bg-soft rounded-2xl p-4 mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{t.orderCode}</p>
                <p className="font-mono text-lg font-bold text-night">{orderSuccess.code}</p>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t.total}</span>
                  <span className="font-bold text-night text-lg">€{orderSuccess.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-2xl p-4 mb-6 text-sm" style={{ backgroundColor: `${brandColor}10`, border: `1px solid ${brandColor}30` }}>
                <p className="text-night font-semibold mb-1">📲 Ultimo passaggio</p>
                <p className="text-gray-600 text-xs">Clicca il pulsante per inviare l&apos;ordine al ristorante su WhatsApp.</p>
              </div>

              <a href={buildOrderWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="w-full text-white py-4 rounded-2xl font-bold transition active:scale-95 flex items-center justify-center gap-2 mb-3" style={{ backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}>
                <MessageCircle size={20} />
                {t.sendWhatsapp}
              </a>

              <button
                onClick={() => { setOrderSuccess(null); setLastOrderSnapshot(null); setCustomerName(""); setAddress(""); setNotes(""); setPickupTime(""); }}
                className="w-full text-night py-3.5 rounded-2xl font-bold transition active:scale-95 bg-soft"
              >
                {t.backToMenu}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TABLE BOOKING MODAL - WIZARD */}
      <AnimatePresence>
        {tableBookingOpen && !tableSuccess && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center">
            <motion.div
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#F8F8FA] rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto"
            >
              {/* HEADER con Steps */}
              <div className="sticky top-0 bg-[#F8F8FA]/95 backdrop-blur-xl pt-3 pb-4 px-6 border-b border-gray-200/50 z-10">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-night">Prenota tavolo</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{tenantName}</p>
                  </div>
                  <button onClick={() => setTableBookingOpen(false)} className="text-gray-400 p-2 hover:bg-white rounded-full transition">
                    <X size={20} />
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex-1 flex items-center gap-2">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          bookingStep >= step ? 'text-white shadow-md' : 'bg-gray-200 text-gray-400'
                        }`}
                        style={bookingStep >= step ? { backgroundColor: brandColor } : undefined}
                      >
                        {bookingStep > step ? <CheckCircle2 size={16} /> : step}
                      </div>
                      {step < 4 && (
                        <div className={`flex-1 h-1 rounded-full transition-all ${bookingStep > step ? 'bg-opacity-100' : 'bg-gray-200'}`}
                          style={bookingStep > step ? { backgroundColor: brandColor } : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 min-h-[400px]">
                {/* STEP 1: PERSONE E DATA */}
                {bookingStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div>
                      <h4 className="text-2xl font-bold text-night mb-1">{t.howManyPeople}</h4>
                      <p className="text-sm text-gray-500 mb-4">Seleziona il numero di ospiti</p>
                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: maxPartySize }, (_, i) => i + 1).map((n) => (
                          <button
                            key={n}
                            onClick={() => { setPartySize(n); setSelectedTable(null); }}
                            className={`aspect-square rounded-2xl text-lg font-black transition-all ${
                              partySize === n 
                                ? "text-white shadow-lg scale-105" 
                                : "bg-white text-night shadow-sm hover:shadow-md border border-gray-100"
                            }`}
                            style={partySize === n ? { backgroundColor: brandColor } : undefined}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-2xl font-bold text-night mb-1">{t.when}</h4>
                      <p className="text-sm text-gray-500 mb-4">{t.chooseDay}</p>
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 hide-scrollbar">
                        {availableDays.slice(0, 14).map((d) => {
                          const active = selectedDate?.toDateString() === d.toDateString();
                          return (
                            <motion.button
                              key={d.toISOString()}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => { setSelectedDate(d); setSelectedSlot(null); setSelectedTable(null); }}
                              className={`min-w-[68px] py-3 rounded-2xl flex flex-col items-center transition-all shrink-0 ${
                                active ? "text-white shadow-lg scale-105" : "bg-white text-night shadow-sm border border-gray-100"
                              }`}
                              style={active ? { backgroundColor: brandColor } : undefined}
                            >
                              <span className={`text-[10px] font-bold uppercase ${active ? "text-white/80" : "text-gray-500"}`}>{DAY_SHORT[d.getDay()]}</span>
                              <span className="text-xl font-black mt-0.5">{d.getDate()}</span>
                              <span className={`text-[9px] font-semibold ${active ? "text-white/70" : "text-gray-400"}`}>{MONTHS[d.getMonth()].slice(0, 3)}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => setBookingStep(2)}
                      disabled={!selectedDate}
                      className="w-full disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 active:scale-[0.98] mt-4"
                      style={!selectedDate ? undefined : { backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}
                    >
                      {t.continue} <ChevronRight size={20} />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2: ORARIO */}
                {bookingStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div>
                      <h4 className="text-2xl font-bold text-night mb-1">{t.whatTime}</h4>
                      <p className="text-sm text-gray-500 mb-4">{t.chooseTime} · {partySize} {partySize === 1 ? t.people.slice(0, -1) : t.people} · {selectedDate?.toLocaleDateString(lang === 'it' ? 'it-IT' : lang === 'en' ? 'en-US' : 'de-DE', { day: 'numeric', month: 'long' })}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => { setSelectedSlot(slot); setSelectedTable(null); }}
                            className={`py-4 rounded-2xl text-base font-bold transition-all ${
                              selectedSlot === slot 
                                ? "text-white shadow-lg scale-105" 
                                : "bg-white text-night shadow-sm border border-gray-100 hover:shadow-md"
                            }`}
                            style={selectedSlot === slot ? { backgroundColor: brandColor } : undefined}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      {slots.length === 0 && (
                        <div className="bg-orange-50 border border-orange-100 text-orange-700 p-4 rounded-2xl text-sm">
                          ⚠️ Nessun orario disponibile per questo giorno. Prova un altro giorno.
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setBookingStep(1)}
                        className="px-6 py-4 rounded-2xl font-bold text-night bg-white border border-gray-200 transition active:scale-[0.98]"
                      >
                        {t.back}
                      </button>
                      <button
                        onClick={() => setBookingStep(3)}
                        disabled={!selectedSlot}
                        className="flex-1 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 active:scale-[0.98]"
                        style={!selectedSlot ? undefined : { backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}
                      >
                        {t.continue} <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: TAVOLO */}
                {bookingStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div>
                      <h4 className="text-2xl font-bold text-night mb-1">{t.chooseTable}</h4>
                      <p className="text-sm text-gray-500 mb-4">{t.tapFreeTable}</p>
                    </div>
                    {(tablesWithStatus as any[]).length > 0 && (
                      Object.entries(
                        (tablesWithStatus as any[]).reduce((acc: Record<string, any[]>, t: any) => {
                          const zone = t.zone || "Sala Principale";
                          if (!acc[zone]) acc[zone] = [];
                          acc[zone].push(t);
                          return acc;
                        }, {})
                      ).map(([zone, zoneTables]) => (
                        <div key={zone} className="mb-6 last:mb-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-px bg-gray-200 flex-1" />
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 px-2">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
                              {zone}
                            </h4>
                            <div className="h-px bg-gray-200 flex-1" />
                          </div>
                          <TableMap
                            tables={zoneTables as any}
                            selectedId={selectedTable?.id || null}
                            onSelect={(t: any) => setSelectedTable(t)}
                            brandColor={brandColor}
                            partySize={partySize}
                          />
                        </div>
                      ))
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setBookingStep(2)}
                        className="px-6 py-4 rounded-2xl font-bold text-night bg-white border border-gray-200 transition active:scale-[0.98]"
                      >
                        {t.back}
                      </button>
                      <button
                        onClick={() => setBookingStep(4)}
                        disabled={!selectedTable}
                        className="flex-1 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 active:scale-[0.98]"
                        style={!selectedTable ? undefined : { backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}
                      >
                        {t.continue} <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: DATI CLIENTE */}
                {bookingStep === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div>
                      <h4 className="text-2xl font-bold text-night mb-1">{t.yourData}</h4>
                      <p className="text-sm text-gray-500 mb-4">{t.confirmOnWhatsapp}</p>
                    </div>

                    {/* Riepilogo */}
                    <div className="rounded-2xl p-4 text-white" style={{ backgroundColor: brandColor }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs opacity-80 font-semibold uppercase tracking-wider">{t.summary}</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="opacity-90">{t.table}</span><span className="font-bold">{selectedTable?.table_number}</span></div>
                        <div className="flex justify-between"><span className="opacity-90">{t.people}</span><span className="font-bold">{partySize}</span></div>
                        <div className="flex justify-between"><span className="opacity-90">{t.date}</span><span className="font-bold">{selectedDate?.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</span></div>
                        <div className="flex justify-between"><span className="opacity-90">Orario</span><span className="font-bold">{selectedSlot}</span></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <label className="block">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t.yourName} *</span>
                        <input type="text" value={tableCustomerName} onChange={(e) => setTableCustomerName(e.target.value)} placeholder="Mario Rossi" className="w-full bg-transparent border-0 text-base font-semibold text-night placeholder-gray-300 focus:outline-none p-0" />
                      </label>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <label className="block">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t.yourPhone} *</span>
                        <input type="tel" required value={tableCustomerPhone} onChange={(e) => setTableCustomerPhone(e.target.value)} placeholder="+39 333 1234567" className="w-full bg-transparent border-0 text-base font-semibold text-night placeholder-gray-300 focus:outline-none p-0" />
                      </label>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <label className="block">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t.notes}</span>
                        <textarea value={tableNotes} onChange={(e) => setTableNotes(e.target.value)} placeholder="Es. seggiolone per bambino..." rows={2} className="w-full bg-transparent border-0 text-sm text-night placeholder-gray-300 focus:outline-none p-0 resize-none" />
                      </label>
                    </div>

                    {submitError && (
                      <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm flex items-start gap-2">
                        <span>⚠️</span>
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setBookingStep(3)}
                        className="px-6 py-4 rounded-2xl font-bold text-night bg-white border border-gray-200 transition active:scale-[0.98]"
                      >
                        {t.back}
                      </button>
                      <button
                        onClick={sendTableBooking}
                        disabled={!tableCustomerName || !tableCustomerPhone || submitting}
                        className="flex-1 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 active:scale-[0.98]"
                        style={!tableCustomerName || !tableCustomerPhone || submitting ? undefined : { backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}
                      >
                        {submitting ? (
                          <><div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />Invio...</>
                        ) : (
                          <><CheckCircle2 size={20} />Conferma</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TABLE SUCCESS */}
      <AnimatePresence>
        {tableSuccess && (
          <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.1 }} className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${brandColor}15` }}>
                <CheckCircle2 size={52} style={{ color: brandColor }} />
              </motion.div>
              <h2 className="text-2xl font-bold text-night mb-2">{t.bookingConfirmed}</h2>
              <p className="text-gray-600 mb-6">{t.seeYouAt} {tenantName} 🍽️</p>

              <div className="bg-soft rounded-2xl p-4 mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{t.bookingCode}</p>
                <p className="font-mono text-lg font-bold text-night">{tableSuccess.code}</p>
              </div>

              <div className="rounded-2xl p-4 mb-6 text-sm" style={{ backgroundColor: `${brandColor}10`, border: `1px solid ${brandColor}30` }}>
                <p className="text-night font-semibold mb-1">📲 Ultimo passaggio</p>
                <p className="text-gray-600 text-xs">Clicca il pulsante per inviare la prenotazione al ristorante su WhatsApp.</p>
              </div>

              <a href={tableSuccess.waUrl} target="_blank" rel="noopener noreferrer" className="w-full text-white py-4 rounded-2xl font-bold transition active:scale-95 flex items-center justify-center gap-2 mb-3" style={{ backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}>
                <MessageCircle size={20} />
                Invia prenotazione su WhatsApp
              </a>

              <button onClick={() => setTableSuccess(null)} className="w-full text-night py-3.5 rounded-2xl font-bold transition active:scale-95 bg-soft">
                Chiudi
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

      {/* UPGRADE TAVOLI MODAL */}
      <AnimatePresence>
        {showTableUpgrade && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center">
            <motion.div
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto"
            >
              <div className="pt-3 pb-4 px-6 border-b border-gray-100">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-night">Prenotazione tavoli</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Funzionalità premium</p>
                  </div>
                  <button onClick={() => setShowTableUpgrade(false)} className="text-gray-500 p-2 hover:bg-gray-100 rounded-full transition">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/30">
                    <Calendar size={28} className="text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-night mb-2">Fai prenotare i tavoli ai tuoi clienti</h4>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">I clienti scelgono tavolo dalla mappa, tu ricevi tutto in dashboard.</p>
                </div>

                <div className="bg-cream rounded-2xl p-5 space-y-3">
                  {[
                    "Mappa tavoli interattiva",
                    "Prenotazione online 24/7",
                    "Gestione turni e capienza",
                    "Numero persone personalizzabile",
                    "Promemoria anti no-show",
                    "Statistiche occupazione",
                  ].map((f) => (
                    <div key={f} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 size={16} className="text-waDark mt-0.5 shrink-0" />
                      <span className="text-night/80">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center bg-night rounded-2xl p-6 text-white">
                  <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Upgrade annuale</p>
                  <div className="flex items-baseline justify-center gap-1 mb-3">
                    <span className="text-4xl font-bold">35</span>
                    <span className="text-white/60">€/mese</span>
                  </div>
                  <p className="text-xs text-white/60">Pagamento annuale: <strong className="text-wa">420,00 €</strong></p>
                </div>

                <a
                  href={`https://wa.me/message/LLEKTVFCRCPVB1?text=${encodeURIComponent(`Ciao! Vorrei attivare la prenotazione tavoli per ${tenantName}. Piano Food + Tavoli a 420 €/anno.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-wa hover:bg-wa/90 text-white py-4 rounded-2xl font-bold transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  Attiva su WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
