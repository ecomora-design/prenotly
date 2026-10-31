"use client";
import { motion } from "framer-motion";
import { ArrowRight, Check, Star, Shield, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-white overflow-hidden">
      {/* GRADIENT RADIAL SOTTILE */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#25D366]/[0.1] to-transparent rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-[#25D366]/[0.08] rounded-full blur-3xl" />
      </div>

      <div className="container-x relative">
        
        {/* BADGE TRUST */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="flex -space-x-2">
            {[
              { initials: "MR", bg: "#25D366" },
              { initials: "GB", bg: "#128C7E" },
              { initials: "LC", bg: "#0F766E" },
              { initials: "SM", bg: "#22C55E" },
            ].map((u, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
                style={{ backgroundColor: u.bg }}
              >
                {u.initials}
              </div>
            ))}
            <div className="w-7 h-7 rounded-full border-2 border-white bg-white flex items-center justify-center text-[#0A2540] text-[9px] font-black shadow-sm">
              +126
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} className="fill-[#25D366] text-[#25D366]" />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-[#0A2540]">
              4.9/5 · 130+ attività in Italia
            </span>
          </div>
        </motion.div>

        {/* TITOLO */}
        <h1 className="text-center text-[44px] leading-[1.05] sm:text-6xl md:text-7xl md:leading-[1.02] font-bold text-[#0A2540] tracking-[-0.03em] max-w-5xl mx-auto">
          Prenotazioni, ordini e clienti.<br />
          <span className="bg-gradient-to-r from-[#128C7E] via-[#25D366] to-[#0F766E] bg-clip-text text-transparent">
            Senza complicazioni.
          </span>
        </h1>

        {/* SOTTOTITOLO */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-7 text-lg md:text-xl text-[#425466] leading-relaxed max-w-2xl mx-auto text-center"
        >
          Il gestionale italiano che unisce prenotazioni, ordini e clienti in un&apos;unica piattaforma. Affidabile, veloce, sicuro.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/signup"
            className="group relative bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white px-8 py-4 rounded-full font-bold text-sm transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-[#128C7E]/30 hover:shadow-xl hover:shadow-[#128C7E]/40 active:scale-[0.98]"
          >
            Prova gratis 7 giorni
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/prezzi"
            className="bg-white hover:bg-[#FAFBFC] border border-[#E6EBF1] hover:border-[#128C7E]/30 text-[#0A2540] px-8 py-4 rounded-full font-bold text-sm transition inline-flex items-center justify-center gap-2"
          >
            Vedi i prezzi
          </Link>
        </motion.div>

        {/* TRUST LINE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[13px] text-[#425466]/90"
        >
          {[
            "Nessuna carta di credito",
            "Attivo in 10 minuti",
            "Disdici quando vuoi",
          ].map((t) => (
            <span key={t} className="flex items-center gap-1.5 font-medium">
              <Check size={14} className="text-[#22C55E]" strokeWidth={3} />
              {t}
            </span>
          ))}
        </motion.div>

        {/* MOCKUP PRODOTTO */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-16 md:mt-24 relative max-w-5xl mx-auto"
        >
          {/* Shadow profonda sotto */}
          <div className="absolute inset-x-8 top-10 bottom-0 bg-gradient-to-b from-[#25D366]/25 to-transparent blur-3xl rounded-full" />
          
          <div className="relative bg-white rounded-2xl shadow-2xl shadow-[#0A2540]/20 border border-[#E6EBF1] overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FAFBFC] border-b border-[#E6EBF1]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF605C]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD44]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#00CA4E]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded-md px-3 py-1 text-[10px] font-medium text-[#425466] border border-[#E6EBF1] inline-flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  prenotly-italia.it/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="p-4 md:p-6 bg-white">
              {/* KPI ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
                {[
                  { label: "Ordini oggi", value: "24", trend: "+12%", color: "#25D366" },
                  { label: "Coperti", value: "86", trend: "+8%", color: "#3B82F6" },
                  { label: "Confermati", value: "18", trend: "+3", color: "#25D366" },
                  { label: "Incasso", value: "€842", trend: "+18%", color: "#F97316" },
                ].map((kpi, i) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    className="bg-[#FAFBFC] rounded-lg p-3 border border-[#E6EBF1]"
                  >
                    <p className="text-[9px] md:text-[10px] font-semibold text-[#425466]/80 uppercase tracking-wider mb-1">
                      {kpi.label}
                    </p>
                    <div className="flex items-end justify-between">
                      <p className="text-lg md:text-xl font-bold text-[#0A2540]">{kpi.value}</p>
                      <p className="text-[9px] font-semibold" style={{ color: kpi.color }}>
                        {kpi.trend}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CHART */}
              <div className="bg-[#FAFBFC] rounded-lg p-4 border border-[#E6EBF1] mb-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-semibold text-[#0A2540]">Andamento ordini</p>
                  <div className="flex gap-1 text-[9px] font-semibold">
                    <span className="px-2 py-0.5 bg-white rounded text-[#128C7E] border border-[#E6EBF1]">7gg</span>
                    <span className="px-2 py-0.5 text-[#425466]/80">30gg</span>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-20 md:h-24">
                  {[35, 55, 40, 70, 60, 85, 75, 95, 80, 100, 88, 92].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.6, delay: 1 + i * 0.04 }}
                      className="flex-1 rounded-t-sm"
                      style={{
                        background: i === 10 || i === 11
                          ? "linear-gradient(180deg, #128C7E 0%, #25D366 100%)"
                          : "#E6EBF1"
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ORDERS PREVIEW */}
              <div className="space-y-2">
                {[
                  { name: "Mario Rossi", type: "Asporto", total: "€24,50", status: "Confermato", color: "#22C55E" },
                  { name: "Giulia Bianchi", type: "Domicilio", total: "€38,00", status: "In preparazione", color: "#F97316" },
                ].map((o, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 + i * 0.1 }}
                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-[#E6EBF1]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#128C7E] text-[10px] font-bold">
                        {o.name[0]}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#0A2540]">{o.name}</p>
                        <p className="text-[9px] text-[#425466]/80">{o.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#0A2540]">{o.total}</span>
                      <span
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: o.color + "15", color: o.color }}
                      >
                        {o.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* FLOATING BADGES */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 }}
            className="hidden md:flex absolute -left-8 top-1/4 bg-white rounded-xl shadow-xl border border-[#E6EBF1] p-3 items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
              <Check size={14} className="text-[#22C55E]" strokeWidth={3} />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-[#425466]/80">Prenotazione</p>
              <p className="text-[11px] font-bold text-[#0A2540]">Tavolo 4 confermato</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2 }}
            className="hidden md:flex absolute -right-8 bottom-1/4 bg-white rounded-xl shadow-xl border border-[#E6EBF1] p-3 items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 flex items-center justify-center">
              <Shield size={14} className="text-[#128C7E]" />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-[#425466]/80">Sicurezza</p>
              <p className="text-[11px] font-bold text-[#0A2540]">SSL + Backup attivo</p>
            </div>
          </motion.div>
        </motion.div>

        {/* LOGHI CLIENTI */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-16 md:mt-20 text-center"
        >
          <p className="text-[11px] font-semibold text-[#425466]/85 uppercase tracking-widest mb-6">
            Scelto da ristoranti e professionisti
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 opacity-50">
            {["Pizzeria Da Michele", "Barberia Milano", "Estetica Bella", "Trattoria Toscana", "Sushi Zen", "Salone Sofia"].map((name) => (
              <span key={name} className="font-semibold text-[#0A2540] text-sm md:text-base">
                {name}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
