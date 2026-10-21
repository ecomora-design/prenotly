"use client";

import { motion } from "framer-motion";
import { Users, Check, Link as LinkIcon, Utensils, Circle } from "lucide-react";

type Table = {
  id: string;
  table_number: number;
  capacity: number;
  shape: string;
  is_active: boolean;
  parent_table_id?: string | null;
  isBusy?: boolean;
  isSelected?: boolean;
};

type Props = {
  tables: Table[];
  selectedId: string | null;
  onSelect: (table: Table) => void;
  brandColor: string;
  partySize?: number;
  isAdmin?: boolean;
};

export default function TableMap({ tables, selectedId, onSelect, brandColor, partySize, isAdmin }: Props) {
  if (tables.length === 0) {
    return (
      <div className="bg-[#0A0A0A] rounded-[32px] p-16 text-center border border-white/[0.04]">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/[0.03] flex items-center justify-center">
          <Utensils className="text-white/20" size={36} />
        </div>
        <p className="text-sm font-bold text-white/40">Nessun tavolo in questa zona</p>
        <p className="text-xs text-white/20 mt-1">Aggiungi un tavolo per iniziare</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
        {tables.map((table) => {
          const isMergedChild = !!table.parent_table_id;
          const isTooSmall = partySize ? table.capacity < partySize : false;
          const isDisabled = isMergedChild || !table.is_active || (partySize ? isTooSmall : false);
          const isSelected = selectedId === table.id;
          const isRound = table.shape === "round";

          // Colori in base allo stato
          let bg = "bg-[#0F0F15]";
          let border = "border-white/[0.06]";
          let text = "text-white";
          let sub = "text-white/40";
          let glow = "";
          
          if (table.isBusy) {
            bg = "bg-[#2A0F0F]";
            border = "border-red-500/40";
            text = "text-red-400";
            sub = "text-red-400/50";
            glow = "shadow-[0_0_20px_rgba(239,68,68,0.15)]";
          } else if (isSelected) {
            bg = "bg-[#0A2A1A]";
            border = "border-emerald-500";
            text = "text-emerald-400";
            sub = "text-emerald-400/50";
            glow = "shadow-[0_0_25px_rgba(16,185,129,0.3)]";
          } else if (!table.is_active) {
            bg = "bg-[#0A0A0A]";
            border = "border-white/[0.03]";
            text = "text-white/20";
            sub = "text-white/10";
          } else {
            bg = "bg-white/[0.02]";
            border = "border-white/10";
            glow = "shadow-[0_4px_20px_rgba(0,0,0,0.4)]";
          }

          return (
            <motion.button
              key={table.id}
              whileHover={!isDisabled || isAdmin ? { scale: 1.04, y: -2 } : {}}
              whileTap={!isDisabled || isAdmin ? { scale: 0.96 } : {}}
              disabled={isDisabled && !isAdmin}
              onClick={() => onSelect(table)}
              className={`
                relative aspect-square flex flex-col items-center justify-center gap-1
                transition-all duration-300 border-2
                ${isRound ? 'rounded-full' : 'rounded-2xl'}
                ${bg} ${border} ${glow}
                ${!isDisabled || isAdmin ? 'cursor-pointer hover:border-white/20' : 'cursor-not-allowed opacity-60'}
              `}
            >
              {/* Indicatore di stato (LED) */}
              <div className="absolute top-2.5 right-2.5">
                {table.isBusy ? (
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                ) : isMergedChild ? (
                  <LinkIcon size={12} className="text-blue-400" />
                ) : table.is_active ? (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                )}
              </div>

              {/* Numero Tavolo */}
              <span className={`text-3xl font-black tracking-tighter ${text} leading-none`}>
                {table.table_number}
              </span>

              {/* Capacità */}
              <div className={`flex items-center gap-1 text-[10px] font-bold ${sub}`}>
                <Users size={11} strokeWidth={2.5} />
                {table.capacity}
              </div>

              {/* Check selezionato */}
              {isSelected && !isAdmin && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-[#0A0A0A]"
                >
                  <Check size={14} strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
