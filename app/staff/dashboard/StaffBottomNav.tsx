"use client";

import { Utensils, ChefHat, ShoppingBag, Calendar, CalendarClock } from "lucide-react";

type TabKey = "tables" | "kitchen" | "orders" | "shifts" | "appointments" | "timeoff";

type Tab = {
  key: TabKey;
  label: string;
  icon: any;
  emoji: string;
};

type Props = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  tabs: Tab[];
};

export default function StaffBottomNav({ activeTab, onChange, tabs }: Props) {
  if (tabs.length === 0) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-night/[0.08]"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-stretch justify-around max-w-md mx-auto px-2 pt-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition ${
                active ? "text-waDark" : "text-night/40 active:bg-night/5"
              }`}
              aria-label={t.label}
            >
              <div className={`p-1.5 rounded-xl transition ${active ? "bg-wa/15" : ""}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${active ? "text-waDark" : ""}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
