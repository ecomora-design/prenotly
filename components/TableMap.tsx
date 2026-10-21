"use client";

import { motion } from "framer-motion";
import { Users, Check, Link as LinkIcon, Utensils } from "lucide-react";

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
      <div className="bg-gradient-to-br from-[#F5F5F7] to-[#EBEBEF] rounded-3xl p-12 text-center border border-white/60">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white shadow-sm flex items-center justify-center">
          <Utensils className="text-gray-300" size={28} />
        </div>
        <p className="text-sm font-bold text-night/50">Nessun tavolo disponibile</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Bordo decorativo vetro */}
      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

      <div className="relative grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
        {tables.map((table, idx) => {
          const isMergedChild = !!table.parent_table_id;
          const isTooSmall = partySize ? table.capacity < partySize : false;
          const isDisabled = isMergedChild || !table.is_active || (partySize ? isTooSmall : false);
          const isSelected = selectedId === table.id;
          const isRound = table.shape === "round";

          return (
            <motion.button
              key={table.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04, type: "spring", damping: 20 }}
              whileHover={!isDisabled || isAdmin ? { scale: 1.06, y: -3 } : {}}
              whileTap={!isDisabled || isAdmin ? { scale: 0.94 } : {}}
              disabled={isDisabled && !isAdmin}
              onClick={() => onSelect(table)}
              className={`
                relative aspect-square flex flex-col items-center justify-center gap-1
                transition-all duration-300 border-2
                ${isRound ? 'rounded-full' : 'rounded-2xl'}
                ${isSelected
                  ? 'text-white shadow-2xl scale-105 border-transparent'
                  : table.isBusy
                  ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-400 cursor-not-allowed shadow-sm'
                  : isDisabled
                  ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'bg-white border-gray-100 text-night shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-gray-200 cursor-pointer'
                }
              `}
              style={isSelected ? {
                background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}DD 100%)`,
                boxShadow: `0 12px 32px ${brandColor}50, 0 0 0 4px ${brandColor}20`
              } : undefined}
            >
              {/* Indicatore di stato - LED in alto a destra */}
              <div className="absolute top-2 right-2">
                {table.isBusy ? (
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                ) : isMergedChild ? (
                  <LinkIcon size={10} className="text-blue-400" />
                ) : isDisabled ? (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                ) : (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: '#10B981',
                      boxShadow: '0 0 8px rgba(16,185,129,0.6)'
                    }}
                  />
                )}
              </div>

              {/* Numero tavolo */}
              <span className={`text-3xl font-black tracking-tighter leading-none ${isSelected ? 'text-white' : ''}`}>
                {table.table_number}
              </span>

              {/* Capacità */}
              <div className={`flex items-center gap-1 text-[10px] font-bold ${isSelected ? 'text-white/80' : 'opacity-60'}`}>
                <Users size={10} strokeWidth={2.5} />
                {table.capacity}
              </div>

              {/* Check selezionato */}
              {isSelected && !isAdmin && (
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-lg border-2 border-emerald-500"
                >
                  <Check size={14} strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legenda compatta */}
      {!isAdmin && (
        <div className="flex items-center justify-center gap-5 mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-gray-500">Libero</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] font-bold text-gray-500">Occupato</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-[10px] font-bold text-gray-500">Non disponibile</span>
          </div>
        </div>
      )}
    </div>
  );
}
