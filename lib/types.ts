export type StoreId = "thawaqa" | "unibook" | "phenuq" | "rawazin";

export interface Listing {
  store: StoreId;
  title: string;
  author?: string;
  isbn?: string;
  price_omr: number;
  in_stock: boolean;
  stock_count?: number;
  url: string;
  image_url?: string;
  scraped_at: string;
}

export interface StoreDelivery {
  fee_type: "flat" | "by_region";
  flat_fee_omr?: number;
  fees_by_region?: Record<string, number | "TODO">;
  free_over_omr: number | null | "TODO";
  estimated_days: string;
}

export type DeliveryData = Record<StoreId, StoreDelivery>;
