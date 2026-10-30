"use client";


import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import OnboardingGuide from "@/components/OnboardingGuide";
import PWABanner from "@/components/PWABanner";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Utensils, ShoppingBag, Calendar,
  CreditCard, QrCode, Settings, LogOut, Menu, X, Loader2,
  ExternalLink, Users, ChevronRight, Sparkles, Bell, LayoutGrid, BarChart3, TrendingDown
} from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  business_type: string;
  product_type: string | null;
  category: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  logo_url: string | null;
  brand_color: string | null;
  enable_table_bookings: boolean | null;
  plan_type: string | null;
  subscription_ends_at: string | null;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [realtimeAlert, setRealtimeAlert] = useState<{ type: "booking" | "order", data: any } | null>(null);




  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(*)")
        .eq("user_id", user.id)
        .maybeSingle();

      setUser(user);
      if (!link || !link.tenants) { router.push("/onboarding"); return; }

      const t = link.tenants as any;
      setTenant(t);

      if (t.onboarding_completed === false) {
        setShowOnboarding(true);
      }

      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  
  // ── REALTIME NOTIFICHE E SUONO (ORDINI E PRENOTAZIONI) ──
  useEffect(() => {
    if (!tenant?.id) return;
    
    // Filtro locale: solo chi è food ascolta gli ordini
    const isFoodLocal =
      tenant.category === "ristoranti" ||
      tenant.category === "pizzerie" ||
      (!tenant.category && (tenant.product_type === "food" || tenant.business_type === "restaurant"));

    const channel = supabase
      .channel('custom-insert-channel')
      // Ascolta nuove PRENOTAZIONI
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings', filter: `tenant_id=eq.${tenant.id}` },
        (payload) => {
          setRealtimeAlert({ type: "booking", data: payload.new });
          playNotificationSound();
          setTimeout(() => setRealtimeAlert(null), 12000);
        }
      )
      // Ascolta nuovi ORDINI
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenant.id}` },
        (payload) => {
          if (!isFoodLocal) return;
          setRealtimeAlert({ type: "order", data: payload.new });
          playNotificationSound();
          setTimeout(() => setRealtimeAlert(null), 12000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant?.id, supabase]);

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      // Un bel suono "Ding" a due toni
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!tenant) return;
    await supabase
      .from("tenants")
      .update({ onboarding_completed: true })
      .eq("id", tenant.id);
    setShowOnboarding(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <Loader2 className="animate-spin text-night mx-auto mb-3" size={28} />
          <p className="text-xs text-night/40 font-medium">Caricamento dashboard...</p>
        </div>
      </main>
    );
  }

  if (!tenant) return null;

  // Priorità assoluta alla categoria esplicita (impostata da admin)
  const isFoodCategory = tenant.category === "ristoranti" || tenant.category === "pizzerie";
  const isServiceCategory = tenant.category === "servizi" || tenant.category === "dentisti" || tenant.category === "parrucchieri";
  // Fallback sui campi vecchi solo se la category non è impostata
  const isFood = isFoodCategory || (!isServiceCategory && (tenant.product_type === "food" || tenant.business_type === "restaurant"));
  const isTrial = tenant.subscription_status === "trial";
  const isMenuOnly = !isTrial && tenant.plan_type === "food_menu";
  
  const menuOnlyBlockedRoutes = ["/dashboard/ordini", "/dashboard/prenotazioni", "/dashboard/tavoli", "/dashboard/clienti", "/dashboard/report", "/dashboard/calendario"];
  const isBlockedRoute = isMenuOnly && menuOnlyBlockedRoutes.some(r => pathname.startsWith(r));
  const planAllowsOrders = isTrial || tenant.plan_type !== "food_menu";
  const brandColor = tenant.brand_color || (isFood ? "#25D366" : "#8B5CF6");
  
  // QUI CONTROLLIAMO SE MOSTRARE LE PRENOTAZIONI
  
  const planAllowsTables = isTrial || tenant.plan_type === "food_standard" || tenant.plan_type === "food_premium";
  const showBookings = planAllowsTables && tenant.enable_table_bookings !== false;

  // Controllo se l'abbonamento è scaduto
  const now = Date.now();
  const trialEnds = tenant.trial_ends_at ? new Date(tenant.trial_ends_at).getTime() : 0;
  const subEnds = tenant.subscription_ends_at ? new Date(tenant.subscription_ends_at).getTime() : 0;
  
  let isExpired = false;
  if (tenant.subscription_status === "trial" && trialEnds && trialEnds < now) isExpired = true;
  if (tenant.subscription_status === "active" && subEnds && subEnds < now) isExpired = true;
  if (tenant.subscription_status === "expired" || tenant.subscription_status === "suspended") isExpired = true;


  // Sidebar items grouped
  const navSections = [
    {
      label: "Panoramica",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: isFood ? "Vendite" : "Agenda",
      items: [
        ...(isFood ? [{ href: "/dashboard/ordini", label: "Ordini", icon: ShoppingBag }] : []),
        ...(showBookings ? [
          ...(isFood ? [
          { href: "/dashboard/prenotazioni", label: "Agenda Sala", icon: Calendar },
        ] : [
          { href: "/dashboard/appuntamenti", label: "Appuntamenti", icon: Calendar },
        ]),
        ] : []),
        ...(isFood ? [{ href: "/dashboard/tavoli", label: "Gestione Tavoli", icon: LayoutGrid }] : []),
        { href: "/dashboard/report", label: "Report Incassi", icon: BarChart3 },
        ...(tenant.plan_type === "food_premium" ? [{ href: "/dashboard/spese", label: "Spese", icon: TrendingDown }] : []),
        { href: "/dashboard/servizi", label: isFood ? "Menu" : "Servizi", icon: Utensils },
      ],
    },
    {
      label: "Clienti",
      items: isFood && !planAllowsOrders ? [] : [
        { href: "/dashboard/clienti", label: "Rubrica clienti", icon: Users },
      ],
    },
    {
      label: "Marketing",
      items: [
        { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
      ],
    },
    {
      label: "Impostazioni",
      items: [
        { href: "/dashboard/impostazioni", label: "Attività", icon: Settings },
        { href: "/dashboard/abbonamento", label: "Abbonamento", icon: CreditCard },
      ],
    },
  ];


  const planBadge = (() => {
    if (tenant.subscription_status !== "active") return null;
    const plans: Record<string, { label: string; color: string }> = {
      food_menu: { label: "MENU", color: "#64748B" },
      food_standard: { label: "FOOD", color: "#25D366" },
      
      food_premium: { label: "PREMIUM", color: "#8B5CF6" },
      servizi: { label: "PRO", color: "#8B5CF6" },
    };
    return plans[tenant.plan_type || ""] || null;
  })();

  const trialHoursLeft = tenant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  const showTrialBanner = tenant.subscription_status === "trial" && trialHoursLeft > 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      
      {/* REALTIME NOTIFICATION TOAST */}
      <AnimatePresence>
        {realtimeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-[9999] bg-white rounded-2xl shadow-2xl border-2 p-4 w-80 flex gap-4 items-start ${realtimeAlert.type === "order" ? "border-blue-500" : "border-wa"}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${realtimeAlert.type === "order" ? "bg-blue-100" : "bg-wa/20"}`}>
              <Bell className={`animate-bounce ${realtimeAlert.type === "order" ? "text-blue-500" : "text-wa"}`} size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-night">
                {realtimeAlert.type === "order" ? "Nuovo Ordine!" : "Nuova Prenotazione!"}
              </h4>
              <p className="text-xs text-night/60 mt-1">
                {realtimeAlert.type === "order" 
                  ? "Hai ricevuto un nuovo ordine di asporto/domicilio." 
                  : (isFood 
                    ? "Un cliente ha appena prenotato un tavolo." 
                    : "Un cliente ha appena prenotato un appuntamento.")}
              </p>
              <a 
                href={realtimeAlert.type === "order" ? "/dashboard/ordini" : "/dashboard/prenotazioni"} 
                className={`text-[10px] font-bold mt-2 block uppercase tracking-wider hover:underline ${realtimeAlert.type === "order" ? "text-blue-500" : "text-wa"}`}
              >
                Vai a {realtimeAlert.type === "order" ? "gli ordini" : "l'agenda"} &rarr;
              </a>
            </div>
            <button onClick={() => setRealtimeAlert(null)} className="text-night/40 hover:text-night p-1"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {showOnboarding && (
        <OnboardingGuide
          isFood={isFood}
          businessSlug={tenant.slug}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {/* Banner Abbonamento Scaduto */}
      {isExpired && (
        <div className="bg-red-500 text-white px-4 py-3 text-center text-sm sticky top-0 z-50 flex items-center justify-center gap-3 flex-wrap shadow-lg">
          <span className="font-bold">⚠️ Il tuo abbonamento è scaduto.</span>
          <Link href="/dashboard/abbonamento" className="bg-white text-red-600 px-4 py-1.5 rounded-full font-bold text-xs hover:bg-red-50 transition">
            Rinnova ora
          </Link>
        </div>
      )}

      {/* Trial banner */}
      {showTrialBanner && !isExpired && (
        <div className="bg-night text-white px-4 py-2.5 text-center text-xs sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full bg-wa animate-pulse shrink-0" />
            <span>
              Demo attiva · <strong>{trialHoursLeft} ore rimanenti</strong>
            </span>
            <Link
              href="/dashboard/abbonamento"
              className="bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 font-semibold transition shrink-0"
            >
              Attiva
            </Link>
          </div>
        </div>
      )}

      <div className="flex">
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-night/[0.06] min-h-screen sticky top-0 h-screen">
          {/* Logo */}
          <div className="px-5 h-16 flex items-center border-b border-night/[0.06]">
            <Link href="/" className="text-lg font-bold text-night tracking-tight">
              Prenot<span className="text-waDark">ly</span>
            </Link>
          </div>

          {/* Tenant selector */}
          <div className="p-3">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-night/[0.03] transition cursor-pointer">
              {tenant.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={tenant.business_name}
                  className="w-9 h-9 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: brandColor }}
                >
                  {tenant.business_name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-night truncate">
                  {tenant.business_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[10px] text-night/40 capitalize truncate">
                    {tenant.product_type || tenant.business_type}
                  </p>
                  {planBadge && (
                    <span
                      className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ backgroundColor: planBadge.color + "20", color: planBadge.color }}
                    >
                      {planBadge.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-night/[0.06] mx-3" />

          {/* Nav sections */}
          <nav className="flex-1 overflow-y-auto p-3">
            {navSections.filter(s => s.items.length > 0).map((section, sIdx) => (
              <div key={section.label} className={sIdx > 0 ? "mt-5" : ""}>
                <p className="text-[10px] font-bold text-night/30 uppercase tracking-widest px-3 mb-1.5">
                  {section.label}
                </p>
                {section.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition mb-0.5 ${
                        active
                          ? "bg-night/[0.04] text-night"
                          : "text-night/60 hover:bg-night/[0.03] hover:text-night"
                      }`}
                    >
                      <item.icon
                        size={16}
                        className={active ? "text-night" : "text-night/40"}
                      />
                      <span className="flex-1">{item.label}</span>
                      {active && (
                        <div
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: brandColor }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Public link */}
          <div className="p-3 border-t border-night/[0.06]">
            <Link
              href={`/${tenant.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-night/60 hover:bg-night/[0.03] hover:text-night transition mb-1 group"
            >
              <ExternalLink size={13} className="text-night/40" />
              <span className="truncate flex-1">/{tenant.slug}</span>
              <ChevronRight size={12} className="text-night/20 group-hover:translate-x-0.5 transition" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-night/50 hover:bg-red-50 hover:text-red-500 transition"
            >
              <LogOut size={13} />
              Esci
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 min-w-0">
          {/* Mobile header */}
          <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-night/[0.06]">
            <div className="px-4 h-14 flex items-center justify-between">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-night"
                aria-label="Menu"
              >
                <Menu size={22} />
              </button>
              <Link href="/" className="text-base font-bold text-night tracking-tight">
                Prenot<span className="text-waDark">ly</span>
              </Link>
              {tenant.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={tenant.business_name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: brandColor }}
                >
                  {tenant.business_name.charAt(0)}
                </div>
              )}
            </div>
          </header>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-white lg:hidden overflow-y-auto">
              <div className="px-4 h-14 flex items-center justify-between border-b border-night/[0.06] sticky top-0 bg-white">
                <span className="font-bold text-night text-base">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-4 border-b border-night/[0.06]">
                <div className="flex items-center gap-3">
                  {tenant.logo_url ? (
                    <img
                      src={tenant.logo_url}
                      alt={tenant.business_name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: brandColor }}
                    >
                      {tenant.business_name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-night truncate">
                      {tenant.business_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[10px] text-night/40 capitalize">
                        {tenant.product_type || tenant.business_type}
                      </p>
                      {planBadge && (
                        <span
                          className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ backgroundColor: planBadge.color + "20", color: planBadge.color }}
                        >
                          {planBadge.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <nav className="p-4">
                {navSections.map((section) => (
                  <div key={section.label} className="mb-5">
                    <p className="text-[10px] font-bold text-night/30 uppercase tracking-widest px-2 mb-1.5">
                      {section.label}
                    </p>
                    {section.items.map((item) => {
                      const active =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition mb-0.5 ${
                            active
                              ? "bg-night/[0.04] text-night"
                              : "text-night/60 active:bg-night/[0.03]"
                          }`}
                        >
                          <item.icon
                            size={18}
                            className={active ? "text-night" : "text-night/40"}
                          />
                          <span className="flex-1">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}

                <Link
                  href={`/${tenant.slug}`}
                  target="_blank"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-night/60 active:bg-night/[0.03]"
                >
                  <ExternalLink size={18} className="text-night/40" />
                  Vedi la tua pagina
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 active:bg-red-50 mt-1"
                >
                  <LogOut size={18} />
                  Esci
                </button>
              </nav>
            </div>
          )}

          <div className="p-4 md:p-8 pb-24 lg:pb-8 max-w-6xl mx-auto">
          {isBlockedRoute ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 className="text-xl font-bold text-night mb-2">Funzionalità non inclusa</h2>
              <p className="text-sm text-night/60 mb-6">
                Il tuo piano <strong>Menu Digitale</strong> non include questa sezione. Passa a <strong>Food + Ordini</strong> per sbloccare ordini, prenotazioni, tavoli e clienti.
              </p>
              <Link href="/dashboard/abbonamento" className="bg-night hover:bg-night/90 text-white px-6 py-3 rounded-full font-bold text-sm transition active:scale-95">
                Passa al piano superiore
              </Link>
            </div>
          ) : children}
        </div>
        </div>
      </div>
      <PWABanner />
    </div>
  );
}
