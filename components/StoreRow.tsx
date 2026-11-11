"use client";

import { useLanguage } from "@/lib/i18n";
import { formatOmr } from "@/lib/format";
import { STORE_NAMES, STORE_COLORS } from "@/lib/stores";
import { rowKey, type Badges, type Row } from "@/lib/rows";
import { CartIcon, StoreTile } from "./icons";

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>{label}</span>
  );
}

export function StoreRow({ row, badges }: { row: Row; badges: Badges }) {
  const { lang, t } = useLanguage();
  const key = rowKey(row);
  const storeName = STORE_NAMES[row.listing.store][lang];

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {badges.cheapestKey === key && (
            <Badge label={t("cheapestBadge")} className="bg-gold text-navy" />
          )}
          {badges.fastestKey === key && (
            <Badge label={t("fastestBadge")} className="bg-navy text-white" />
          )}
          {badges.withinBudgetKeys.has(key) && (
            <Badge label={t("withinBudgetBadge")} className="border border-navy/20 bg-cream-dark text-navy" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <StoreTile label={storeName} color={STORE_COLORS[row.listing.store]} size={28} />
          <span className="font-semibold text-navy">{storeName}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1 text-sm">
          <div>
            {row.listing.in_stock ? (
              <span className="font-medium text-green-700">
                {row.listing.stock_count != null
                  ? t("stockLastLeft").replace("{n}", String(row.listing.stock_count))
                  : t("inStock")}
              </span>
            ) : (
              <span className="font-medium text-red-600">{t("outOfStock")}</span>
            )}
          </div>
          <div className="text-neutral-600">{formatOmr(row.listing.price_omr, lang)}</div>
          <div className="text-neutral-600">
            {t("deliveryFeeLabel")}:{" "}
            {row.free_shipping
              ? t("freeShipping")
              : row.fee_omr !== null
                ? formatOmr(row.fee_omr, lang)
                : t("deliveryUnknown")}
          </div>
          <div className="font-bold text-navy">
            {t("totalLabel")}: {row.total_omr !== null ? formatOmr(row.total_omr, lang) : "—"}
          </div>
          <div className="text-xs text-neutral-500">
            {t("estimatedDaysLabel")}:{" "}
            {row.days_estimate === "TODO" ? t("estimatedDaysUnknown") : row.days_estimate}
          </div>
        </div>

        <a
          href={row.listing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 whitespace-nowrap rounded-full bg-navy px-4 py-2.5 font-semibold text-white hover:bg-navy-light"
        >
          <CartIcon className="h-4 w-4" />
          {t("buyButton")}
        </a>
      </div>
    </div>
  );
}
