"use client";

import { Language } from "@/lib/i18n";

type Props = {
  currentLang: Language;
  onChange: (lang: Language) => void;
  variant?: "dark" | "light";
};

const LANGS: { code: Language; flag: string; label: string }[] = [
  { code: "it", flag: "🇮🇹", label: "Italiano" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
];

export default function LanguageSwitcher({ currentLang, onChange, variant = "light" }: Props) {
  return (
    <div className={
      "inline-flex items-center gap-1 p-1 rounded-full border " +
      (variant === "dark"
        ? "bg-white/10 border-white/20 backdrop-blur-md"
        : "bg-white/80 border-gray-200 shadow-sm")
    }>
      {LANGS.map((l) => {
        const isActive = currentLang === l.code;
        return (
          <button
            key={l.code}
            onClick={() => onChange(l.code)}
            title={l.label}
            className={
              "px-2 py-1 rounded-full text-base leading-none transition-all " +
              (isActive
                ? variant === "dark"
                  ? "bg-white scale-110 shadow-md"
                  : "bg-night scale-110 shadow-sm"
                : "opacity-60 hover:opacity-100 hover:scale-105")
            }
          >
            <span className={isActive && variant === "light" ? "text-white" : ""}>
              {l.flag}
            </span>
          </button>
        );
      })}
    </div>
  );
}
