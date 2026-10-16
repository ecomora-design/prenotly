"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

type Props = {
  label: string;
  value: string | number;
  change?: { value: string; trend: "up" | "down" | "neutral" };
  icon: any;
  iconColor?: string;
  iconBg?: string;
  href?: string;
  delay?: number;
};

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconColor = "#0F172A",
  iconBg = "#F1F5F9",
  href,
  delay = 0,
}: Props) {
  const Wrapper: any = href ? Link : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Wrapper
        {...wrapperProps}
        className={`block bg-white rounded-2xl border border-night/[0.06] p-5 ${
          href ? "hover:border-night/[0.12] hover:shadow-sm transition cursor-pointer" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            <Icon size={18} style={{ color: iconColor }} />
          </div>

          {change && (
            <div
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full ${
                change.trend === "up"
                  ? "bg-green-50 text-green-700"
                  : change.trend === "down"
                  ? "bg-red-50 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {change.trend === "up" && <ArrowUpRight size={11} />}
              {change.trend === "down" && <ArrowDownRight size={11} />}
              {change.value}
            </div>
          )}
        </div>

        <p className="text-[11px] font-semibold text-night/40 uppercase tracking-wider mb-1.5">
          {label}
        </p>
        <p className="text-2xl md:text-3xl font-bold text-night tracking-tight">
          {value}
        </p>
      </Wrapper>
    </motion.div>
  );
}
