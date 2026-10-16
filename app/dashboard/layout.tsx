"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import OnboardingGuide from "@/components/OnboardingGuide";
import {
  LayoutDashboard, Utensils, ShoppingBag, Calendar, CalendarDays,
  CreditCard, QrCode, Settings, LogOut, Menu, X, Loader2,
  ExternalLink, Users, ChevronRight, Sparkles, Bell,
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

  const isFood = tenant.product_type === "food" || tenant.business_type === "restaurant";
  const brandColor = tenant.brand_color || (isFood ? "#25D366" : "#8B5CF6");

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
      items: isFood
        ? [
            { href: "/dashboard/ordini", label: "Ordini", icon: ShoppingBag },
            { href: "/dashboard/servizi", label: "Menu", icon: Utensils },
          ]
        : [
            { href: "/dashboard/prenotazioni", label: "Prenotazioni", icon: Calendar },
            { href: "/dashboard/calendario", label: "Calendario", icon: CalendarDays },
            { href: "/dashboard/servizi", label: "Servizi", icon: Utensils },
          ],
    },
    {
      label: "Clienti",
      items: [
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

  const trialHoursLeft = tenant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  const showTrialBanner = tenant.subscription_status === "trial" && trialHoursLeft > 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {showOnboarding && (
        <OnboardingGuide
          isFood={isFood}
          businessSlug={tenant.slug}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {/* Trial banner */}
      {showTrialBanner && (
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
                <p className="text-[10px] text-night/40 capitalize truncate">
                  {tenant.product_type || tenant.business_type}
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-night/[0.06] mx-3" />

          {/* Nav sections */}
          <nav className="flex-1 overflow-y-auto p-3">
            {navSections.map((section, sIdx) => (
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
                    <p className="text-[10px] text-night/40 capitalize">
                      {tenant.product_type || tenant.business_type}
                    </p>
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

          <div className="p-4 md:p-8 pb-24 lg:pb-8 max-w-6xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
