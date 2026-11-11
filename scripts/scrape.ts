import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { scrapeShopify } from "./scrape-shopify";
import { scrapeZid } from "./scrape-zid";
import type { Listing } from "../lib/types";

const STORES: Array<{ run: () => Promise<Listing[]>; label: string }> = [
  { label: "thawaqa", run: () => scrapeShopify("thawaqa", "https://thawaqa.com") },
  { label: "unibook", run: () => scrapeZid("unibook", "https://unibookom.com") },
  { label: "phenuq", run: () => scrapeZid("phenuq", "https://phenuqstore.com") },
  { label: "rawazin", run: () => scrapeZid("rawazin", "https://rawazin.om") },
];

async function main() {
  const catalog: Listing[] = [];

  for (const store of STORES) {
    try {
      const listings = await store.run();
      catalog.push(...listings);
    } catch (err) {
      console.error(`[${store.label}] failed, skipping: ${(err as Error).message}`);
    }
  }

  const dataDir = path.join(__dirname, "..", "data");
  await mkdir(dataDir, { recursive: true });
  const outPath = path.join(dataDir, "catalog.json");
  await writeFile(outPath, JSON.stringify(catalog, null, 2), "utf-8");

  console.log(`\nWrote ${catalog.length} listings to ${outPath}`);
}

main();
