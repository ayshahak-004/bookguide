"use client";

import { useEffect, useMemo, useState } from "react";
import catalogData from "@/data/catalog.json";
import deliveryData from "@/data/delivery.json";
import { groupListings } from "@/lib/group";
import { createSearchIndex, searchBooks } from "@/lib/search";
import { buildRows, sortRows, computeBadges } from "@/lib/rows";
import { useLanguage } from "@/lib/i18n";
import { REGIONS, loadSavedRegion, saveRegion } from "@/lib/regions";
import type { DeliveryData, Listing } from "@/lib/types";
import { SearchBar } from "@/components/SearchBar";
import { RegionSelect } from "@/components/RegionSelect";
import { FiltersBar } from "@/components/FiltersBar";
import { BookCard } from "@/components/BookCard";
import { TopBar } from "@/components/TopBar";
import { HomeHeader, ParticipatingStores } from "@/components/Hero";
import { NotFoundState } from "@/components/NotFoundState";

const allBooks = groupListings(catalogData as Listing[]);
const fuse = createSearchIndex(allBooks);
const delivery = deliveryData as DeliveryData;

export default function Home() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState(REGIONS[0].id);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortByTotal, setSortByTotal] = useState(false);
  const [budget, setBudget] = useState("");

  useEffect(() => {
    const saved = loadSavedRegion();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage after mount, not derived from props/state
    if (saved) setRegion(saved);
  }, []);

  const handleRegionChange = (id: string) => {
    setRegion(id);
    saveRegion(id);
  };

  const matches = useMemo(() => searchBooks(fuse, query), [query]);
  const budgetValue = budget.trim() ? parseFloat(budget) : null;

  const results = useMemo(() => {
    return matches
      .map((book) => {
        const allRows = buildRows(book.listings, delivery, region);
        const visibleRows = inStockOnly ? allRows.filter((r) => r.listing.in_stock) : allRows;
        if (visibleRows.length === 0) return null;
        const sorted = sortRows(visibleRows, sortByTotal);
        const badges = computeBadges(sorted, budgetValue);
        return { book, rows: sorted, badges };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [matches, region, inStockOnly, sortByTotal, budgetValue]);

  const hasQuery = query.trim() !== "";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6">
      {hasQuery ? <TopBar /> : <HomeHeader />}

      <SearchBar value={query} onChange={setQuery} />

      {!hasQuery && <ParticipatingStores />}

      {hasQuery && (
        <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-4">
          <RegionSelect value={region} onChange={handleRegionChange} />
          <FiltersBar
            inStockOnly={inStockOnly}
            onInStockOnlyChange={setInStockOnly}
            sortByTotal={sortByTotal}
            onSortByTotalChange={setSortByTotal}
            budget={budget}
            onBudgetChange={setBudget}
          />
        </div>
      )}

      <main className="flex flex-col gap-5">
        {hasQuery && results.length === 0 && (
          <NotFoundState onClear={() => setQuery("")} />
        )}
        {results.length > 0 && (
          <p className="text-sm font-medium text-navy/60">
            {results.length} {t("resultsCount")}
          </p>
        )}
        {results.map(({ book, rows, badges }) => (
          <BookCard key={book.key} book={book} rows={rows} badges={badges} />
        ))}
      </main>
    </div>
  );
}
