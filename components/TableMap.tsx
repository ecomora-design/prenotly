"use client";

import { motion } from "framer-motion";
import { Users, Check, X, Link as LinkIcon } from "lucide-react";

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
};

export default function TableMap({ tables, selectedId, onSelect, brandColor, partySize }: Props) {
  if (tables.length === 0) {
    return (
      <div className="bg-cream rounded-2xl p-8 text-center">
        <p className="text-sm text-night/50">Nessun tavolo configurato</p>
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-3xl p-6">
      <div className="flex items-center justify-center gap-4 mb-6 text-[11px] font-semibold text-night/60">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-white border border-night/10" />
          <span>Libero</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md" style={{ backgroundColor: brandColor }} />
          <span>Selezionato</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-blue-100" />
          <span>Unito</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-gray-200 opacity-50" />
          <span>Occupato</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 max-w-lg mx-auto">
        {tables.map((table) => {
          const isMergedChild = !!table.parent_table_id;
          const isDisabled =
            isMergedChild ||
            !table.is_active ||
            (table.isBusy ?? false) ||
            (partySize ? table.capacity < partySize : false);
          const isSelected = selectedId === table.id;

          return (
            <motion.button
              key={table.id}
              whileTap={!isDisabled ? { scale: 0.9 } : {}}
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelect(table)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition relative ${
                isSelected
                  ? "text-white shadow-xl shadow-black/10 scale-105"
                  : isMergedChild
                  ? "bg-blue-50 text-blue-400 border border-blue-100 cursor-not-allowed opacity-70"
                  : isDisabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                  : "bg-white text-night border-2 border-transparent hover:border-night/10 shadow-sm hover:shadow-md"
              } ${table.shape === "round" ? "rounded-full" : ""}`}
              style={isSelected ? { backgroundColor: brandColor } : undefined}
            >
              <span className="text-xl font-black flex items-center justify-center gap-1">
                {table.table_number}
                {isMergedChild && <span className="text-[10px]"><LinkIcon size={10} /></span>}
              </span>
              <span
                className={`text-[10px] font-bold flex items-center gap-1 ${
                  isSelected ? "text-white/80" : isDisabled ? "text-gray-400" : "text-night/50"
                }`}
              >
                <Users size={11} />
                {table.capacity}
              </span>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg"
                >
                  <Check size={14} style={{ color: brandColor }} />
                </motion.div>
              )}

              {isDisabled && table.is_active && !isSelected && !isMergedChild && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-400 flex items-center justify-center shadow-md">
                  <X size={12} className="text-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {partySize && (
        <p className="text-center text-xs text-night/40 mt-6 font-medium">
          I tavoli grigi sono già prenotati o troppo piccoli per {partySize} persone
        </p>
      )}
    </div>
  );
}
