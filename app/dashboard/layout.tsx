"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import OnboardingGuide from "@/components/OnboardingGuide";
import {
  LayoutDashboard, Utensils, ShoppingBag, Calendar, CalendarDays,
  CreditCard, QrCode, Settings, LogOut, Menu, X, Loader2,
  ExternalLink, Users, ChevronRight, Sparkles, Bell, Download
} from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  business_type: string;
  product_type: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  logo_url: string | null;
  brand_color: string | null;
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
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

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
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
    setShowInstallBtn(false);
  };

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

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
      <main className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <Loader2 className="animate-spin text-waDark mx-auto mb-3" size={32} />
          <p className="text-sm text-night/40 font-medium">Caricamento...</p>
        </div>
      </main>
    );
  }

  if (!tenant) return null;

  const isFood = tenant.product_type === "food" || tenant.business_type === "restaurant";
  const brandColor = tenant.brand_color || (isFood ? "#25D366" : "#8B5CF6");

  const navItems = [
    { href: "/dashboard", label: "Panoramica", icon: LayoutDashboard },
    { href: "/dashboard/servizi", label: isFood ? "Menu" : "Servizi", icon: Utensils },
    ...(isFood
      ? [{ href: "/dashboard/ordini", label: "Ordini", icon: ShoppingBag }]
      : [
          { href: "/dashboard/prenotazioni", label: "Prenotazioni", icon: Calendar },
          { href: "/dashboard/calendario", label: "Calendario", icon: CalendarDays },
        ]),
    { href: "/dashboard/clienti", label: "Clienti", icon: Users },
    { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
    { href: "/dashboard/impostazioni", label: "Impostazioni", icon: Settings },
    { href: "/dashboard/abbonamento", label: "Abbonamento", icon: CreditCard },
  ];

  const trialHoursLeft = tenant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  const showTrialBanner = tenant.subscription_status === "trial" && trialHoursLeft > 0;

  return (
    <div className="min-h-screen bg-cream">
      {showOnboarding && (
        <OnboardingGuide
          isFood={isFood}
          businessSlug={tenant.slug}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {/* Banner trial */}
      {showTrialBanner && (
        <div
          className="text-white px-4 py-3 text-center text-xs md:text-sm sticky top-0 z-40"
          style={{ backgroundColor: brandColor }}
        >
          <div className="container-x flex items-center justify-center gap-2">
            <Sparkles size={14} className="shrink-0" />
            <span>
              Demo attiva — <strong>{trialHoursLeft} ore rimanenti</strong>
            </span>
            <Link
              href="/dashboard/abbonamento"
              className="bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 font-bold transition shrink-0 ml-2"
            >
              Attiva ora
            </Link>
          </div>
        </div>
      )}

      <div className="flex">
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-night/5 min-h-screen sticky top-0 h-screen">
          {/* Logo */}
          <div className="p-6 border-b border-night/5">
            <Link href="/" className="text-xl font-bold text-night">
              Prenot<span className="text-waDark">ly</span>
            </Link>
          </div>

          {/* Profilo */}
          <div className="p-5 border-b border-night/5">
            <div className="flex items-center gap-3 mb-3">
              {tenant.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={tenant.business_name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-cream shrink-0"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: brandColor }}
                >
                  {tenant.business_name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-night text-sm truncate">
                  {tenant.business_name}
                </p>
                <p className="text-xs text-night/50 capitalize">
                  {tenant.product_type || tenant.business_type}
                </p>
              </div>
            </div>
            <Link
              href={`/${tenant.slug}`}
              target="_blank"
              className="flex items-center justify-between text-xs font-semibold text-night/60 hover:text-waDark bg-cream rounded-xl px-3 py-2 transition group"
            >
              <span className="truncate">prenotly-italia.it/{tenant.slug}</span>
              <ExternalLink size={12} className="shrink-0 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 overflow-y-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition mb-0.5 ${
                    active
                      ? "bg-night text-white"
                      : (item as any).highlight
                      ? "text-night/70 hover:bg-cream"
                      : "text-night/60 hover:bg-cream hover:text-night"
                  }`}
                >
                  <item.icon size={18} className={active ? "text-wa" : ""} />
                  <span className="flex-1">{item.label}</span>

                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-night/5 space-y-0.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-500 hover:bg-red-50 transition"
            >
              <LogOut size={18} />
              Esci
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 min-w-0">
          {/* Header mobile */}
          <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-night/5">
            <div className="px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-night"
                aria-label="Menu"
              >
                <Menu size={24} />
              </button>
              <Link href="/" className="text-lg font-bold text-night">
                Prenot<span className="text-waDark">ly</span>
              </Link>
              {tenant.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={tenant.business_name}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-cream"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: brandColor }}
                >
                  {tenant.business_name.charAt(0)}
                </div>
              )}
            </div>
          </header>

          {/* Menu mobile */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-white lg:hidden overflow-y-auto">
              <div className="p-4 flex items-center justify-between border-b border-night/5 sticky top-0 bg-white">
                <span className="font-bold text-night">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2"
                  aria-label="Chiudi"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-5 border-b border-night/5">
                <div className="flex items-center gap-3 mb-3">
                  {tenant.logo_url ? (
                    <img
                      src={tenant.logo_url}
                      alt={tenant.business_name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-cream"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: brandColor }}
                    >
                      {tenant.business_name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-night truncate">{tenant.business_name}</p>
                    <p className="text-xs text-night/50 capitalize">
                      {tenant.product_type || tenant.business_type}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/${tenant.slug}`}
                  target="_blank"
                  className="flex items-center justify-between text-xs font-semibold text-night/60 bg-cream rounded-xl px-3 py-2.5"
                >
                  <span className="truncate">prenotly-italia.it/{tenant.slug}</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <nav className="p-3">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base transition mb-1 ${
                        active
                          ? "bg-night text-white"
                          : "text-night/70 active:bg-cream"
                      }`}
                    >
                      <item.icon size={20} className={active ? "text-wa" : ""} />
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight size={16} className={active ? "text-white/50" : "text-night/20"} />
                    </Link>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base text-red-500 active:bg-red-50 mt-2"
                >
                  <LogOut size={20} />
                  Esci
                </button>
              </nav>
            </div>
          )}

          <div className="p-4 md:p-8 pb-24 lg:pb-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
