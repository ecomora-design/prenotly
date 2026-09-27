"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Blocca scroll quando menu mobile aperto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  const links = [
    { href: "#come-funziona", label: "Come funziona" },
    { href: "#funzioni", label: "Funzioni" },
    { href: "#settori", label: "Per chi è" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled || open
            ? "bg-white/95 backdrop-blur border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="container-x py-3 md:py-4 flex items-center justify-between">
          <a href="/" className="text-xl md:text-2xl font-bold text-night">
            Prenot<span className="text-wa">ly</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-gray-700 hover:text-wa transition"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#demo"
              className="bg-wa hover:bg-waDark text-white px-5 py-2.5 rounded-full font-semibold transition shadow-lg shadow-wa/20"
            >
              Richiedi una demo
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-night p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu fullscreen */}
      {open && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-night text-lg font-semibold py-4 border-b border-gray-100 active:text-wa"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#demo"
              onClick={() => setOpen(false)}
              className="bg-wa text-white px-6 py-4 rounded-full text-center font-semibold mt-6 active:bg-waDark"
            >
              Richiedi una demo
            </a>
          </div>
        </div>
      )}
    </>
  );
}
