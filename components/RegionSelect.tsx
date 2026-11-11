"use client";

import { useLanguage } from "@/lib/i18n";
import { REGIONS } from "@/lib/regions";

export function RegionSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t, lang } = useLanguage();
  return (
    <label className="flex flex-1 flex-col gap-1 text-sm">
      <span className="font-semibold text-navy">{t("regionLabel")}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border-2 border-navy/15 bg-white px-3 py-2.5 text-navy focus:border-navy focus:outline-none"
      >
        {REGIONS.map((region) => (
          <option key={region.id} value={region.id}>
            {lang === "ar" ? region.ar : region.en}
          </option>
        ))}
      </select>
    </label>
  );
}
