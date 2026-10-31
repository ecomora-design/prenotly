import { MessageCircle, Mail } from "lucide-react";

export default function Footer() {
  const cols = [
    { title: "Prodotto", links: [
      { label: "Come funziona", href: "/#come-funziona" },
      { label: "Prezzi", href: "/prezzi" },
      { label: "Food", href: "/ristoranti" },
      { label: "Pro", href: "/pro" },
      { label: "Service", href: "/service" },
    ]},
    { title: "Attività", links: [
      { label: "Ristoranti", href: "/ristoranti" },
      { label: "Pizzerie", href: "/ristoranti" },
      { label: "Parrucchieri", href: "/pro" },
      { label: "Centri estetici", href: "/pro" },
    ]},
    { title: "Legale", links: [
      { label: "Termini e Condizioni", href: "/termini" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookie" },
      { label: "DPA", href: "/dpa" },
      { label: "Disclaimer", href: "/disclaimer" },
    ]},
  ];

  return (
    <footer className="bg-cream border-t border-night/5 py-12 md:py-14">
      <div className="container-x">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
          <div className="col-span-2">
            <a href="/" className="text-2xl font-bold text-night inline-block mb-3">
              Prenot<span className="text-waDark">ly</span>
            </a>
            <p className="text-night/75 text-sm leading-relaxed mb-4">
              Prenotazioni e ordini su App.<br />
              Senza telefonate.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="https://wa.me/message/LLEKTVFCRCPVB1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-night/70 hover:text-waDark transition"
              >
                <MessageCircle size={16} className="text-waDark" />
                +39 393 484 2118
              </a>
              <a
                href="mailto:info@prenotly-italia.it"
                className="flex items-center gap-2 text-night/70 hover:text-waDark transition break-all"
              >
                <Mail size={16} className="text-waDark" />
                info@prenotly-italia.it
              </a>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="font-semibold text-night mb-3 text-sm">{c.title}</h3>
              <ul className="space-y-2 text-sm text-night/75">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="hover:text-waDark transition">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-night/10 text-sm text-night/70 flex flex-col md:flex-row justify-between gap-3">
          <p>
            © {new Date().getFullYear()} Prenotly · P.IVA 01800600882 · prenotly-italia.it
          </p>
          <p>Made in Italy 🇮🇹</p>
        </div>
      </div>
    </footer>
  );
}
