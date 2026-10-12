"use client";

import { X, Sparkles } from "lucide-react";
import { useState } from "react";

export default function DemoBanner({ type }: { type: "ristorante" | "parrucchiere" }) {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="bg-gradient-to-r from-violet-500 to-wa text-white px-4 py-3 relative">
      <div className="max-w-3xl mx-auto flex items-center gap-3 pr-8">
        <Sparkles size={18} className="shrink-0" />
        <p className="text-xs md:text-sm font-medium flex-1">
          <strong>Demo live:</strong>{" "}
          {type === "ristorante"
            ? "così apparirebbe il tuo menu ai tuoi clienti. Prova ad aggiungere piatti al carrello!"
            : "così apparirebbe la tua agenda ai tuoi clienti. Prova a prenotare un appuntamento!"}
        </p>
      </div>
      <button
        onClick={() => setClosed(true)}
        className="absolute top-2.5 right-3 p-1.5 rounded-full hover:bg-white/20"
        aria-label="Chiudi"
      >
        <X size={16} />
      </button>
    </div>
  );
}
