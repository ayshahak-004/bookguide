import type { StoreId } from "./types";

export const STORE_NAMES: Record<StoreId, { ar: string; en: string }> = {
  thawaqa: { ar: "ذواقة", en: "Thawaqa" },
  unibook: { ar: "مكتبة الجامعة", en: "Unibook" },
  phenuq: { ar: "فينيق", en: "Phenuq" },
  rawazin: { ar: "روازن", en: "Rawazin" },
};

// A distinct accent color per store, used as a background behind its logo
// (and as a fallback initial-letter tile if a logo image ever fails to load).
export const STORE_COLORS: Record<StoreId, string> = {
  thawaqa: "#1e2a4a",
  unibook: "#e2654f",
  phenuq: "#2f8f5b",
  rawazin: "#b98f3a",
};

// Unibook's logo artwork is white-on-transparent (no colored version
// exists anywhere on their site) - rendered plain it's invisible against a
// light page background, so it needs a CSS color-invert to read as dark.
export const STORE_LOGO_IS_WHITE: Record<StoreId, boolean> = {
  thawaqa: false,
  unibook: true,
  phenuq: false,
  rawazin: false,
};

export const STORE_HOMEPAGES: Record<StoreId, string> = {
  thawaqa: "https://thawaqa.com",
  unibook: "https://unibookom.com",
  phenuq: "https://phenuqstore.com",
  rawazin: "https://rawazin.om",
};

// Each store's own logo, taken directly from its site rather than through
// an image proxy, so the original transparency (where it exists) survives -
// a proxied/resized copy can bake in an opaque white canvas even when the
// source has none. Shopify theme asset for Thawaqa; Zid's Organization
// JSON-LD asset for the other three.
export const STORE_LOGOS: Record<StoreId, string> = {
  thawaqa: "https://thawaqa.com/cdn/shop/files/thawaqa-logo-1000_1000x.png",
  unibook: "https://media.zid.store/a2625368-bc4b-4cc0-baaf-f5a6fcfa3c06/e5c0cf34-f949-47a7-92f0-365567091843.png",
  phenuq: "https://media.zid.store/df2319cf-9a03-4afe-a8b8-ac567eccd35d/f9ad7b1c-3585-4a36-becf-c2dbc4019b0e.png",
  // Rawazin's only hosted copy is a flat JPEG with a baked-in white square
  // (JPEG has no alpha channel, so no transparent version can exist) -
  // mix-blend-mode: multiply (applied in the component) drops white pixels
  // out against the page background, same as if it were transparent.
  rawazin:
    "https://media.zid.store/d2badddb-b623-4e8a-aa65-2094fc64d6c6/678d46e0-125f-4dbb-ae7c-b157de63c3f5-200x.jpeg",
};
