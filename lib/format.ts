import type { Lang } from "./i18n";

export function formatOmr(amount: number, lang: Lang): string {
  const value = amount.toFixed(3);
  return lang === "ar" ? `${value} ر.ع` : `OMR ${value}`;
}
