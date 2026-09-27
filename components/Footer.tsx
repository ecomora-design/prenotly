import { MessageCircle, Mail } from "lucide-react";

export default function Footer() {
  const cols = [
    { title: "Prodotto", links: ["Come funziona", "Funzioni", "FAQ", "Demo"] },
    { title: "Ristoranti", links: ["Ristoranti", "Pizzerie", "Bar & Bistrot", "Asporto"] },
    { title: "Servizi", links: ["Parrucchieri", "Estetiste", "Studi medici", "Palestre"] },
    { title: "Legale", links: ["Privacy", "Cookie", "Termini"] },
  ];

  return (
    <footer className="bg-soft border-t border-gray-100 py-12 md:py-14">
      <div className="container-x">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-10">
          <div className="col-span-2">
            <a href="/" className="text-2xl font-bold text-night inline-block mb-3">
              Prenot<span className="text-wa">ly</span>
            </a>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Ordini e prenotazioni su WhatsApp.<br />
              Anche quando sei chiuso.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="https://wa.me/393884027650"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-700 hover:text-wa transition"
              >
                <MessageCircle size={16} className="text-wa" />
                +39 388 402 7650
              </a>
              <a
                href="mailto:info@prenotly-italia.it"
                className="flex items-center gap-2 text-gray-700 hover:text-wa transition break-all"
              >
                <Mail size={16} className="text-wa" />
                info@prenotly-italia.it
              </a>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-semibold text-night mb-3 text-sm">{c.title}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-wa transition">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 text-sm text-gray-500 flex flex-col md:flex-row justify-between gap-3">
          <p>© {new Date().getFullYear()} Prenotly · prenotly-italia.it · P.IVA 00000000000</p>
          <p>Made in Italy 🇮🇹</p>
        </div>
      </div>
    </footer>
  );
}
