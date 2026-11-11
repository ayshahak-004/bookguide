import { quoteDelivery, computeTotal } from "./delivery";
import type { Listing, DeliveryData } from "./types";

export interface Row {
  listing: Listing;
  fee_omr: number | null;
  total_omr: number | null;
  free_shipping: boolean;
  days_estimate: string;
  days_sort_key: number; // Infinity when the estimate can't be parsed (sorts last)
}

function parseLeadingDays(estimate: string): number {
  const match = estimate.match(/\d+/);
  return match ? parseInt(match[0], 10) : Infinity;
}

export function buildRows(listings: Listing[], delivery: DeliveryData, region: string): Row[] {
  return listings.map((listing) => {
    const quote = quoteDelivery(delivery[listing.store], region, listing.price_omr);
    const estimate = delivery[listing.store]?.estimated_days ?? "TODO";
    return {
      listing,
      fee_omr: quote.fee_omr,
      total_omr: computeTotal(listing.price_omr, quote.fee_omr),
      free_shipping: quote.free_shipping_applied,
      days_estimate: estimate,
      days_sort_key: parseLeadingDays(estimate),
    };
  });
}

export function sortRows(rows: Row[], byTotal: boolean): Row[] {
  const withIndex = rows.map((row, index) => ({ row, index }));
  withIndex.sort((a, b) => {
    if (byTotal) {
      const totalA = a.row.total_omr ?? Infinity;
      const totalB = b.row.total_omr ?? Infinity;
      if (totalA !== totalB) return totalA - totalB;
    } else {
      if (a.row.listing.price_omr !== b.row.listing.price_omr) {
        return a.row.listing.price_omr - b.row.listing.price_omr;
      }
    }
    return a.index - b.index;
  });
  return withIndex.map((x) => x.row);
}

export interface Badges {
  cheapestKey?: string;
  fastestKey?: string;
  withinBudgetKeys: Set<string>;
}

function rowKey(row: Row): string {
  return `${row.listing.store}:${row.listing.url}`;
}

export function computeBadges(rows: Row[], budget: number | null): Badges {
  // "Cheapest" / "fastest" / "within budget" only mean something for a
  // listing you can actually buy right now - never badge an out-of-stock row.
  const inStock = rows.filter((r) => r.listing.in_stock);

  const withTotal = inStock.filter((r) => r.total_omr !== null);
  const cheapest = withTotal.reduce<Row | undefined>(
    (best, row) => (!best || row.total_omr! < best.total_omr! ? row : best),
    undefined
  );

  const withDays = inStock.filter((r) => r.days_sort_key !== Infinity);
  const fastest = withDays.reduce<Row | undefined>(
    (best, row) => (!best || row.days_sort_key < best.days_sort_key ? row : best),
    undefined
  );

  const withinBudgetKeys = new Set<string>();
  if (budget !== null && budget > 0) {
    for (const row of inStock) {
      if (row.total_omr !== null && row.total_omr <= budget) {
        withinBudgetKeys.add(rowKey(row));
      }
    }
  }

  return {
    cheapestKey: cheapest ? rowKey(cheapest) : undefined,
    fastestKey: fastest ? rowKey(fastest) : undefined,
    withinBudgetKeys,
  };
}

export { rowKey };
