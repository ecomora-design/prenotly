"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  tenantName: string;
  logoUrl?: string | null;
  brandColor: string;
  isFood?: boolean;
};

export default function SplashScreen({ tenantName, logoUrl, brandColor, isFood }: Props) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Emoji generico in base al tipo
  const emoji = isFood ? "🍕" : "📅";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}CC 60%, ${brandColor}99 100%)`,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.3, 1, 1.3], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-white rounded-full blur-3xl"
          />

          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="mb-6"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={tenantName}
                  className="w-24 h-24 rounded-3xl object-cover shadow-2xl ring-4 ring-white/30"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-4xl ring-4 ring-white/30 shadow-2xl">
                  {tenantName.charAt(0)}
                </div>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-white text-2xl font-bold tracking-tight text-center px-6"
            >
              {tenantName}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-4xl mt-4"
            >
              {emoji}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex gap-1.5"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  className="w-2 h-2 rounded-full bg-white"
                />
              ))}
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-white/50 text-[10px] font-semibold tracking-widest uppercase"
          >
            powered by Prenotly
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
