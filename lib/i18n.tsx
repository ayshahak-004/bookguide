"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const STORAGE_KEY = "language";

const dict = {
  appTitle: { ar: "دليل الكتب", en: "Book Guide" },
  appSubtitle: {
    ar: "بحث واحد لكل مكتبات عمان",
    en: "One search for every bookstore in Oman",
  },
  participatingStores: { ar: "المكتبات المشاركة", en: "Participating Bookstores" },
  notFoundTitle: { ar: "عذراً، لم يتم العثور على الكتاب", en: "Sorry, book not found" },
  notFoundSubtitle: {
    ar: "يرجى التحقق من العنوان أو المحاولة مرة أخرى لاحقاً",
    en: "Please check the title or try again later.",
  },
  clearSearchButton: { ar: "مسح البحث", en: "Clear search" },
  stockLastLeft: { ar: "آخر {n} نسخ", en: "Last {n} left" },
  searchPlaceholder: { ar: "ابحث بالعنوان أو المؤلف أو ISBN...", en: "Search by title, author or ISBN..." },
  regionLabel: { ar: "المحافظة", en: "Governorate" },
  regionPlaceholder: { ar: "اختر محافظتك", en: "Select your governorate" },
  budgetLabel: { ar: "الميزانية (ر.ع)", en: "Budget (OMR)" },
  budgetPlaceholder: { ar: "اختياري", en: "Optional" },
  inStockOnlyLabel: { ar: "المتوفر فقط", en: "In stock only" },
  sortByTotalLabel: { ar: "الترتيب حسب التكلفة الإجمالية", en: "Sort by total cost" },
  cheapestBadge: { ar: "الأرخص إجمالاً", en: "Cheapest total" },
  fastestBadge: { ar: "الأسرع توصيلاً", en: "Fastest delivery" },
  withinBudgetBadge: { ar: "ضمن الميزانية", en: "Within budget" },
  buyButton: { ar: "اشترِ من المتجر", en: "Buy" },
  inStock: { ar: "متوفر", en: "In stock" },
  outOfStock: { ar: "غير متوفر", en: "Out of stock" },
  deliveryFeeLabel: { ar: "التوصيل", en: "Delivery" },
  deliveryUnknown: { ar: "سيتم تحديده", en: "TBD" },
  totalLabel: { ar: "الإجمالي", en: "Total" },
  estimatedDaysLabel: { ar: "مدة التوصيل", en: "Delivery time" },
  freeShipping: { ar: "توصيل مجاني", en: "Free shipping" },
  estimatedDaysUnknown: { ar: "غير محدد", en: "TBD" },
  emptyState: { ar: "لم يتم العثور عليه في أي متجر", en: "Not found in any store" },
  searchHint: { ar: "ابدأ بكتابة اسم الكتاب أو المؤلف", en: "Start typing a book title or author" },
  languageToggle: { ar: "English", en: "العربية" },
  resultsCount: { ar: "نتيجة", en: "results" },
} as const;

export type TranslationKey = keyof typeof dict;

export function translate(lang: Lang, key: TranslationKey): string {
  return dict[key][lang];
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable - fall back to default language
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage after mount, not derived from props/state
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable - language choice just won't persist
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: (key) => translate(lang, key) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
