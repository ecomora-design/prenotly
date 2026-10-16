"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, breadcrumb, actions }: Props) {
  return (
    <div className="mb-6 md:mb-8">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-night/40 mb-3">
          {breadcrumb.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {item.href ? (
                <Link href={item.href} className="hover:text-night transition">
                  {item.label}
                </Link>
              ) : (
                <span className="text-night/70">{item.label}</span>
              )}
              {i < breadcrumb.length - 1 && <ChevronRight size={12} />}
            </div>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-[28px] font-bold text-night tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-night/50 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
