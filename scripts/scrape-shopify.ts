import { politeFetchJson } from "./lib/http";
import type { Listing, StoreId } from "../lib/types";

interface ShopifyVariant {
  price: string;
  available: boolean;
  sku: string | null;
}

interface ShopifyProduct {
  title: string;
  handle: string;
  variants: ShopifyVariant[];
  images: { src: string }[];
}

interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}

const PAGE_LIMIT = 250;
const MAX_PRODUCTS = 80;

export async function scrapeShopify(
  store: StoreId,
  baseUrl: string,
  maxProducts: number = MAX_PRODUCTS
): Promise<Listing[]> {
  const listings: Listing[] = [];
  const scrapedAt = new Date().toISOString();

  for (let page = 1; listings.length < maxProducts; page++) {
    const url = `${baseUrl}/products.json?limit=${PAGE_LIMIT}&page=${page}`;
    console.log(`[${store}] fetching page ${page}`);
    const data = await politeFetchJson<ShopifyProductsResponse>(url);
    if (!data || data.products.length === 0) break;

    for (const product of data.products) {
      const variant = product.variants[0];
      if (!variant) continue;

      listings.push({
        store,
        title: product.title,
        isbn: variant.sku && /^\d{10,13}$/.test(variant.sku) ? variant.sku : undefined,
        price_omr: parseFloat(variant.price),
        in_stock: variant.available,
        url: `${baseUrl}/products/${product.handle}`,
        image_url: product.images[0]?.src,
        scraped_at: scrapedAt,
      });

      if (listings.length >= maxProducts) break;
    }

    if (data.products.length < PAGE_LIMIT) break;
  }

  console.log(`[${store}] collected ${listings.length} listings`);
  return listings;
}
