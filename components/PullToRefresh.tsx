"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowDown, Check } from "lucide-react";

type Props = {
  onRefresh: () => Promise<void>;
  brandColor: string;
  children: React.ReactNode;
  disabled?: boolean;
};

export default function PullToRefresh({ onRefresh, brandColor, children, disabled }: Props) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const startY = useRef<number>(0);
  const pulling = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 80;
  const MAX_PULL = 120;

  useEffect(() => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Attiva solo se siamo in cima alla pagina
      if (window.scrollY > 5 || refreshing) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling.current || refreshing) return;
      if (window.scrollY > 5) {
        pulling.current = false;
        setPullDistance(0);
        return;
      }

      const distance = e.touches[0].clientY - startY.current;
      if (distance > 0) {
        // Resistenza progressiva
        const resisted = Math.min(distance * 0.5, MAX_PULL);
        setPullDistance(resisted);
        // Previeni scroll normale se stiamo tirando
        if (resisted > 10 && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;

      if (pullDistance >= THRESHOLD && !refreshing) {
        setRefreshing(true);
        setPullDistance(THRESHOLD);

        if ("vibrate" in navigator) navigator.vibrate(20);

        try {
          await onRefresh();
          setShowSuccess(true);
          if ("vibrate" in navigator) navigator.vibrate([10, 30, 10]);
          setTimeout(() => setShowSuccess(false), 800);
        } catch (err) {
          console.error(err);
        } finally {
          setTimeout(() => {
            setRefreshing(false);
            setPullDistance(0);
          }, 400);
        }
      } else {
        setPullDistance(0);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, refreshing, onRefresh, disabled]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const showIndicator = pullDistance > 5;

  return (
    <div ref={containerRef} className="relative">
      {/* Indicatore pull-to-refresh */}
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[80] flex justify-center pointer-events-none"
            style={{
              transform: `translateY(${Math.min(pullDistance - 40, 60)}px)`,
            }}
          >
            <div
              className="w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center border-2"
              style={{
                borderColor: brandColor,
                transform: `rotate(${progress * 360}deg)`,
              }}
            >
              {refreshing ? (
                <Loader2 size={20} className="animate-spin" style={{ color: brandColor }} />
              ) : showSuccess ? (
                <Check size={20} style={{ color: brandColor }} />
              ) : (
                <ArrowDown
                  size={20}
                  style={{
                    color: brandColor,
                    transform: `rotate(${progress >= 1 ? 180 : 0}deg)`,
                    transition: "transform 0.2s",
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenuto */}
      <motion.div
        animate={{
          y: refreshing ? 40 : pullDistance * 0.3,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 400 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
