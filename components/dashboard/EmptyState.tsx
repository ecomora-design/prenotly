"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
  icon: any;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
};

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-night/[0.06] p-12 md:p-16 text-center"
    >
      <div className="w-16 h-16 mx-auto rounded-2xl bg-night/[0.03] flex items-center justify-center mb-5">
        <Icon size={28} className="text-night/30" />
      </div>
      <h3 className="text-base font-bold text-night mb-1.5">{title}</h3>
      <p className="text-sm text-night/50 max-w-sm mx-auto mb-6">{description}</p>

      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-5 py-3 rounded-full font-semibold text-sm transition active:scale-[0.98]"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-5 py-3 rounded-full font-semibold text-sm transition active:scale-[0.98]"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}
