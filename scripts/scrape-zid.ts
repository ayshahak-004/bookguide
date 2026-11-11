import { politeFetchText } from "./lib/http";
import type { Listing, StoreId } from "../lib/types";

export interface ZidProductJsonLd {
  "@type": string;
  name: string;
  sku?: string;
  description?: string;
  image?: string | string[];
  offers?: {
    price: string;
    availability: string;
  };
}

const MAX_PRODUCTS = 80;
// Grab extra sitemap URLs beyond MAX_PRODUCTS since some sitemap entries 404 (stale listings).
const SITEMAP_URL_BUFFER = 40;

export function extractProductUrls(sitemapXml: string, limit?: number): string[] {
  const matches = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  const urls = matches.map((m) => m[1]);
  return limit === undefined ? urls : urls.slice(0, limit);
}

export function extractJsonLdProduct(html: string): ZidProductJsonLd | null {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1].trim());
      if (typeof parsed["@type"] === "string" && parsed["@type"].toLowerCase() === "product") {
        return parsed as ZidProductJsonLd;
      }
    } catch {
      // malformed block, skip
    }
  }
  return null;
}

export function extractStockCount(html: string): number | undefined {
  const match = html.match(
    /id="product-available-quantity"[\s\S]{0,200}?class="quantity-value">\s*(\d+)\s*</
  );
  return match ? parseInt(match[1], 10) : undefined;
}

export function extractAuthor(description: string | undefined): string | undefined {
  if (!description) return undefined;
  const match = description.match(/تأليف[:\s]+([^\n\r]+?)(?=الناشر|نبذة|$)/);
  const author = match?.[1]?.trim();
  if (!author || author.length === 0 || author.length > 80) return undefined;
  return author;
}

export function isInStock(availability: string | undefined): boolean {
  if (!availability) return false;
  return availability.includes("InStock") && !availability.includes("OutOfStock");
}

// Fetches one Zid product page and builds a Listing from its JSON-LD, or
// null if the page 404s / has no usable Product schema.
export async function fetchZidListing(store: StoreId, url: string): Promise<Listing | null> {
  const html = await politeFetchText(url);
  if (!html) return null;

  const product = extractJsonLdProduct(html);
  if (!product || !product.offers) return null;

  const sku = product.sku;
  const image = Array.isArray(product.image) ? product.image[0] : product.image;

  return {
    store,
    title: product.name,
    author: extractAuthor(product.description),
    isbn: sku && /^\d{10,13}$/.test(sku) ? sku : undefined,
    price_omr: parseFloat(product.offers.price),
    in_stock: isInStock(product.offers.availability),
    stock_count: extractStockCount(html),
    url,
    image_url: image,
    scraped_at: new Date().toISOString(),
  };
}

export async function scrapeZid(store: StoreId, baseUrl: string): Promise<Listing[]> {
  const listings: Listing[] = [];

  console.log(`[${store}] fetching sitemap`);
  const sitemapXml = await politeFetchText(`${baseUrl}/sitemap_products.xml`);
  if (!sitemapXml) {
    console.warn(`[${store}] could not fetch sitemap, skipping store`);
    return listings;
  }

  const urls = extractProductUrls(sitemapXml, MAX_PRODUCTS + SITEMAP_URL_BUFFER);

  for (const url of urls) {
    if (listings.length >= MAX_PRODUCTS) break;

    console.log(`[${store}] fetching ${url}`);
    const listing = await fetchZidListing(store, url);
    if (listing) listings.push(listing);
  }

  console.log(`[${store}] collected ${listings.length} listings`);
  return listings;
}
