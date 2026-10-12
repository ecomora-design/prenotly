import { Clock, MessageCircle, Sparkles } from "lucide-react";

type Reason = "trial_expired" | "subscription_expired" | null;

export default function TrialExpired({
  businessName,
  reason,
}: {
  businessName: string;
  reason?: Reason;
}) {
  const isTrialExpired = reason === "trial_expired";

  return (
    <main className="min-h-screen bg-soft flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            isTrialExpired ? "bg-yellow-50" : "bg-red-50"
          }`}
        >
          {isTrialExpired ? (
            <Clock className="text-yellow-600" size={40} />
          ) : (
            <Sparkles className="text-red-500" size={40} />
          )}
        </div>

        <h1 className="text-2xl font-bold text-night mb-3">{businessName}</h1>

        <p className="text-gray-600 mb-2">
          {isTrialExpired
            ? "Questo spazio è temporaneamente non disponibile."
            : "Questo spazio non è al momento attivo."}
        </p>
        <p className="text-sm text-gray-400 mb-8">
          {isTrialExpired
            ? "La demo gratuita è scaduta."
            : "L'abbonamento non è attivo."}
        </p>

        <a
          href="https://wa.me/393934842118?text=Ciao%20Prenotly!%20Vorrei%20maggiori%20informazioni"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-wa hover:bg-waDark text-white px-6 py-3.5 rounded-full font-bold transition active:scale-95"
        >
          <MessageCircle size={18} />
          Contattaci
        </a>

        <p className="text-xs text-gray-400 mt-6">
          Sei il proprietario di questa attività?{" "}
          <a href="/login" className="text-wa font-semibold hover:underline">
            Accedi alla dashboard
          </a>
        </p>
      </div>
    </main>
  );
}
