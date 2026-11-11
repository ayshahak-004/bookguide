"use client";

import { useLanguage } from "@/lib/i18n";
import { BookSearchIllustration } from "./icons";

export function NotFoundState({ onClear }: { onClear: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <BookSearchIllustration className="h-36 w-36" />
      <h2 className="text-lg font-bold text-navy">{t("notFoundTitle")}</h2>
      <p className="max-w-sm text-sm text-neutral-600">{t("notFoundSubtitle")}</p>
      <button
        type="button"
        onClick={onClear}
        className="rounded-full bg-navy px-5 py-2.5 font-semibold text-white hover:bg-navy-light"
      >
        {t("clearSearchButton")}
      </button>
    </div>
  );
}
