import { MessageCircle, Mail, CheckCircle2 } from "lucide-react";

export default function ContactCTA() {
  return (
    <section id="demo" className="py-20 md:py-32 bg-gradient-to-br from-night via-night to-waDark text-white">
      <div className="container-x max-w-3xl text-center">
        <span className="inline-block bg-wa/20 text-wa text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          Prova gratuita · 14 giorni · Nessuna carta
        </span>

        <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
          Mentre leggi questa pagina,<br className="hidden md:block" />
          qualcuno sta provando a prenotare da te.
        </h2>

        <p className="text-white/80 text-base md:text-lg mb-4">
          Rispondi? O lasci che vada dalla concorrenza?
        </p>

        <p className="text-white/80 text-base md:text-lg mb-10">
          Attiva Prenotly oggi. In 10 minuti hai il tuo spazio online, la segreteria WhatsApp pronta, e il primo cliente che riceve conferma automatica.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center mb-10">
          <a
            href="https://wa.me/393884027650?text=Ciao%20Prenotly!%20Vorrei%20iniziare%20la%20prova%20gratuita"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-wa hover:bg-waDark px-7 py-4 rounded-full font-bold transition shadow-xl shadow-wa/30 active:scale-95"
          >
            <MessageCircle size={20} />
            Inizia la prova gratuita
          </a>
          <a
            href="mailto:info@prenotly-italia.it"
            className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 px-7 py-4 rounded-full font-bold transition active:scale-95"
          >
            <Mail size={20} />
            info@prenotly-italia.it
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
          {[
            "Setup in 10 minuti",
            "Zero carta di credito",
            "Disdici quando vuoi",
          ].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-wa" /> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
