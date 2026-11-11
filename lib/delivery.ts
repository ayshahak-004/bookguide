import type { StoreDelivery } from "./types";

export interface DeliveryQuote {
  fee_omr: number | null; // null = not yet known (TODO in delivery.json)
  free_shipping_applied: boolean;
}

export function quoteDelivery(
  delivery: StoreDelivery | undefined,
  region: string,
  subtotal_omr: number
): DeliveryQuote {
  if (!delivery) return { fee_omr: null, free_shipping_applied: false };

  const freeOver = delivery.free_over_omr;
  if (typeof freeOver === "number" && subtotal_omr >= freeOver) {
    return { fee_omr: 0, free_shipping_applied: true };
  }

  if (delivery.fee_type === "flat") {
    return {
      fee_omr: delivery.flat_fee_omr ?? null,
      free_shipping_applied: false,
    };
  }

  const fee = delivery.fees_by_region?.[region];
  return {
    fee_omr: typeof fee === "number" ? fee : null,
    free_shipping_applied: false,
  };
}

export function computeTotal(price_omr: number, fee_omr: number | null): number | null {
  if (fee_omr === null) return null;
  return price_omr + fee_omr;
}
