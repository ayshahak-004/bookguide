"use client";

import { useLanguage } from "@/lib/i18n";
import { SearchIcon } from "./icons";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="relative w-full">
      <SearchIcon className="pointer-events-none absolute start-5 top-1/2 h-5 w-5 -translate-y-1/2 text-navy/60" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-full border-2 border-navy/15 bg-white py-3.5 ps-12 pe-5 text-base shadow-sm placeholder:text-neutral-400 focus:border-navy focus:outline-none"
      />
    </div>
  );
}
