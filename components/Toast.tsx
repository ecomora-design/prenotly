"use client";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export type ToastData = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
};

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[150] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="bg-night text-white rounded-2xl p-4 shadow-2xl border border-white/10 flex items-start gap-3 pointer-events-auto"
            >
              <div className={`w-8 h-8 rounded-full ${COLORS[toast.type]} flex items-center justify-center shrink-0`}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-white/40 hover:text-white p-1 shrink-0 transition"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const show = (type: ToastType, title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, dismiss, show };
}

