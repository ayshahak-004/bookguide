"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";
import { STORE_NAMES, STORE_HOMEPAGES, STORE_LOGOS, STORE_LOGO_IS_WHITE } from "@/lib/stores";
import { LanguageToggle } from "./LanguageToggle";
import type { StoreId } from "@/lib/types";

const STORE_ORDER: StoreId[] = ["thawaqa", "unibook", "phenuq", "rawazin"];

export function HomeHeader() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-4 pt-4 text-center">
      <div className="flex w-full items-center justify-end">
        <LanguageToggle />
      </div>

      <div>
        <h1 className="text-4xl font-extrabold text-navy">دليل الكتب</h1>
        <p className="mt-1 text-xl font-semibold text-navy/70">Book Guide</p>
      </div>

      <p className="text-sm text-neutral-600">{t("appSubtitle")}</p>
    </div>
  );
}

export function ParticipatingStores() {
  const { t, lang } = useLanguage();

  return (
    <div className="w-full text-center">
      <p className="mb-3 text-sm font-semibold text-navy">{t("participatingStores")}</p>
      <div className="flex flex-wrap justify-center gap-4">
        {STORE_ORDER.map((store) => (
          <a
            key={store}
            href={STORE_HOMEPAGES[store]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5"
          >
            <Image
              src={STORE_LOGOS[store]}
              alt={STORE_NAMES[store][lang]}
              width={56}
              height={48}
              unoptimized
              className={`h-12 w-auto object-contain mix-blend-multiply ${STORE_LOGO_IS_WHITE[store] ? "invert" : ""}`}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
