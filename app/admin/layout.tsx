"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, ShoppingBag, Inbox, Clock,
  Euro, Menu, X, Shield, Home, Lock, Eye, EyeOff
} from "lucide-react";

const ADMIN_PASSWORD = "PrenotlyAdmin2024!";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("prenotly_admin_auth");
    if (saved) {
      const { expires } = JSON.parse(saved);
      if (Date.now() < expires) {
        setAuthenticated(true);
      } else {
        localStorage.removeItem("prenotly_admin_auth");
      }
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      const expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem(
        "prenotly_admin_auth",
        JSON.stringify({ expires })
      );
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("prenotly_admin_auth");
    setAuthenticated(false);
    setPassword("");
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-night">
        <div className="text-white">Caricamento...</div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-night flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-wa/20 mb-4">
              <Lock className="text-wa" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Pannello Admin
            </h1>
            <p className="text-white/60 text-sm">
              Accesso riservato
            </p>
          </div>

          <form onSubmit={handleLogin} className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <label className="block mb-4">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">
                Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Inserisci la password"
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-white/30 focus:outline-none focus:border-wa"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-2.5 text-sm mb-4">
                Password errata
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-wa hover:bg-waDark text-white py-3.5 rounded-xl font-bold transition active:scale-[0.98]"
            >
              Accedi
            </button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">
            🔒 Accesso protetto
          </p>
        </div>
      </main>
    );
  }

  const navItems = [
    { href: "/admin", label: "Panoramica", icon: LayoutDashboard },
    { href: "/admin/clienti", label: "Clienti", icon: Users },
    { href: "/admin/scadenze", label: "Scadenze", icon: Clock },
    { href: "/admin/incassi", label: "Incassi", icon: Euro },
    { href: "/admin/ordini", label: "Ordini", icon: ShoppingBag },
    { href: "/admin/richieste", label: "Richieste Service", icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-night text-white">
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-64 bg-night border-r border-white/10 min-h-screen sticky top-0 h-screen">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-wa" />
              <span className="text-xs font-bold text-wa uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <Link href="/" className="text-xl font-bold">
              Prenot<span className="text-wa">ly</span>
            </Link>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition mb-1 ${
                    active ? "bg-wa/20 text-wa" : "text-white/70 hover:bg-white/5"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/10 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-white/70 hover:bg-white/5 transition"
            >
              <Home size={18} />
              Vai al sito
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-400 hover:bg-red-500/10 transition"
            >
              <Lock size={18} />
              Blocca
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="lg:hidden sticky top-0 z-30 bg-night border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-wa" />
              <span className="text-sm font-bold">Admin</span>
            </div>
            <div className="w-9" />
          </header>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-night lg:hidden overflow-y-auto">
              <div className="p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-wa" />
                  <span className="font-bold">Super Admin</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2"
                  aria-label="Chiudi"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="p-3">
                {navItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base transition mb-1 ${
                        active ? "bg-wa/20 text-wa" : "text-white/80 active:bg-white/5"
                      }`}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base text-white/70 active:bg-white/5 mt-2"
                >
                  <Home size={20} />
                  Vai al sito
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base text-red-400 active:bg-red-500/10 mt-2"
                >
                  <Lock size={20} />
                  Blocca
                </button>
              </nav>
            </div>
          )}

          <div className="p-4 md:p-8 pb-16">{children}</div>
        </div>
      </div>
    </div>
  );
}
