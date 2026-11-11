"use client";

import { useLanguage } from "@/lib/i18n";

export function FiltersBar({
  inStockOnly,
  onInStockOnlyChange,
  sortByTotal,
  onSortByTotalChange,
  budget,
  onBudgetChange,
}: {
  inStockOnly: boolean;
  onInStockOnlyChange: (value: boolean) => void;
  sortByTotal: boolean;
  onSortByTotalChange: (value: boolean) => void;
  budget: string;
  onBudgetChange: (value: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="flex flex-1 flex-col gap-1 text-sm">
        <span className="font-semibold text-navy">{t("budgetLabel")}</span>
        <input
          type="number"
          min="0"
          step="0.1"
          inputMode="decimal"
          value={budget}
          onChange={(e) => onBudgetChange(e.target.value)}
          placeholder={t("budgetPlaceholder")}
          className="w-full min-w-[8rem] rounded-xl border-2 border-navy/15 bg-white px-3 py-2.5 text-navy placeholder:text-neutral-400 focus:border-navy focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-2 pb-2.5 text-sm text-navy/80">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => onInStockOnlyChange(e.target.checked)}
          className="h-4 w-4 accent-navy"
        />
        {t("inStockOnlyLabel")}
      </label>

      <label className="flex items-center gap-2 pb-2.5 text-sm text-navy/80">
        <input
          type="checkbox"
          checked={sortByTotal}
          onChange={(e) => onSortByTotalChange(e.target.checked)}
          className="h-4 w-4 accent-navy"
        />
        {t("sortByTotalLabel")}
      </label>
    </div>
  );
}
