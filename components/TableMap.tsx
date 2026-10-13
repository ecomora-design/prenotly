"use client";

import { motion } from "framer-motion";
import { Users, Check, X } from "lucide-react";

type Table = {
  id: string;
  table_number: number;
  capacity: number;
  position_x: number;
  position_y: number;
  shape: string;
  is_active: boolean;
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

  // Calcola dimensioni griglia
  const maxX = Math.max(...tables.map((t) => t.position_x), 0) + 1;
  const maxY = Math.max(...tables.map((t) => t.position_y), 0) + 1;

  return (
    <div className="bg-cream rounded-2xl p-4 overflow-hidden">
      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 mb-4 text-[10px] text-night/60">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-white border border-night/10" />
          <span>Libero</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md" style={{ backgroundColor: brandColor }} />
          <span>Selezionato</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-gray-200 opacity-50" />
          <span>Occupato</span>
        </div>
      </div>

      {/* Mappa */}
      <div
        className="grid gap-2 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${maxX}, minmax(0, 1fr))`,
          maxWidth: `${Math.min(maxX * 80, 500)}px`,
        }}
      >
        {Array.from({ length: maxY }).map((_, y) =>
          Array.from({ length: maxX }).map((_, x) => {
            const table = tables.find(
              (t) => t.position_x === x && t.position_y === y
            );

            if (!table) {
              return <div key={`empty-${x}-${y}`} className="aspect-square" />;
            }

            const isDisabled =
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
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition relative ${
                  isSelected
                    ? "text-white shadow-lg"
                    : isDisabled
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                    : "bg-white text-night border-2 border-night/10 hover:border-night/30 hover:shadow-md"
                }`}
                style={isSelected ? { backgroundColor: brandColor } : undefined}
              >
                <span className="text-sm font-bold">{table.table_number}</span>
                <span
                  className={`text-[9px] font-semibold flex items-center gap-0.5 ${
                    isSelected ? "text-white/80" : ""
                  }`}
                >
                  <Users size={9} />
                  {table.capacity}
                </span>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md"
                  >
                    <Check size={12} style={{ color: brandColor }} />
                  </motion.div>
                )}

                {isDisabled && table.is_active && !isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center shadow">
                    <X size={10} className="text-white" />
                  </div>
                )}
              </motion.button>
            );
          })
        )}
      </div>

      {partySize && (
        <p className="text-center text-[11px] text-night/40 mt-4">
          I tavoli grigi sono già prenotati o troppo piccoli per {partySize} persone
        </p>
      )}
    </div>
  );
}
