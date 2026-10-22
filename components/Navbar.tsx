"use client";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [open]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const links = [
    { href: "/#software", label: "Software" },
    { href: "/prezzi", label: "Prezzi" },
    { href: "/ristoranti", label: "Food" },
    { href: "/pro", label: "Beauty" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled || open
            ? "bg-[#FAFAF7]/85 backdrop-blur-xl border-b border-night/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="container-x py-4 md:py-5 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-display font-bold text-night tracking-tight">
            Prenot<span className="text-waDark">ly</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-night/60 hover:text-night transition text-[13px] font-semibold tracking-wide"
              >
                {l.label}
              </Link>
            ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="bg-night hover:bg-night/90 text-white px-5 py-2.5 rounded-full font-bold transition inline-flex items-center gap-2 text-xs shadow-sm"
                >
                  <User size={14} />
                  Dashboard
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-night/[0.06] py-2 min-w-[200px]">
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-night hover:bg-cream transition">
                      La mia attività
                    </Link>
                    <Link href="/dashboard/impostazioni" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-night hover:bg-cream transition">
                      Impostazioni
                    </Link>
                    <Link href="/dashboard/abbonamento" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-night hover:bg-cream transition">
                      Abbonamento
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 inline-flex items-center gap-2 transition">
                      <LogOut size={14} /> Esci
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-night/60 hover:text-night font-semibold transition text-[13px]">
                  Accedi
                </Link>
                <Link
                  href="/signup"
                  className="bg-night hover:bg-night/90 text-white px-5 py-2.5 rounded-full font-bold transition text-xs shadow-sm"
                >
                  Prova gratis
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden text-night p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 bg-[#FAFAF7] pt-20 px-6 lg:hidden overflow-y-auto">
          <div className="flex flex-col gap-1 pb-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-night text-lg font-display py-4 border-b border-night/[0.06]"
              >
                {l.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="bg-night text-white px-6 py-4 rounded-full text-center font-bold mt-6">
                  Vai alla dashboard
                </Link>
                <button onClick={() => { setOpen(false); handleLogout(); }} className="text-red-500 py-4 text-center font-semibold">
                  Esci
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-night text-lg font-semibold py-4 text-center border border-night/[0.1] rounded-full mt-6">
                  Accedi
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="bg-night text-white px-6 py-4 rounded-full text-center font-bold mt-3">
                  Prova gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
