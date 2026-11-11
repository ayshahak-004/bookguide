"use client";

import { useLanguage } from "@/lib/i18n";

export function LanguageToggle({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { lang, setLang } = useLanguage();
  const base = "rounded-full px-3 py-1 text-sm font-medium transition-colors";
  const trackClass =
    variant === "dark"
      ? "flex gap-1 rounded-full bg-white/10 p-1"
      : "flex gap-1 rounded-full border border-navy/15 bg-white p-1";

  const activeClass = variant === "dark" ? "bg-white text-navy" : "bg-navy text-white";
  const inactiveClass = variant === "dark" ? "text-white/70 hover:text-white" : "text-navy/60 hover:text-navy";

  return (
    <div className={trackClass}>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`${base} ${lang === "en" ? activeClass : inactiveClass}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={`${base} ${lang === "ar" ? activeClass : inactiveClass}`}
      >
        عربي
      </button>
    </div>
  );
}
