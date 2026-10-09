import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/393934842118?text=Ciao%20Prenotly!%20Vorrei%20informazioni"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Scrivici su WhatsApp"
      className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full bg-wa hover:bg-waDark text-white flex items-center justify-center shadow-2xl shadow-wa/40 transition active:scale-95"
    >
      <MessageCircle size={26} className="md:w-7 md:h-7" />
    </a>
  );
}
