import { readFile, writeFile } from "fs/promises";
import path from "path";
import { politeFetchText } from "./lib/http";
import { scoreMatch, slugToTokens, tokenize } from "./lib/match-title";
import { extractProductUrls, fetchZidListing } from "./scrape-zid";
import { scrapeShopify } from "./scrape-shopify";
import type { Listing, StoreId } from "../lib/types";

// Titles the user wants guaranteed to show up in the demo. Arabic and
// English titles are handled identically - tokenize()/normalizeArabic()
// just lowercase+collapse English text untouched.
const TARGET_TITLES: string[] = [
  "العادات الذرية",
  "الليالي البيضاء",
  "الدرب الذي بيننا",
  "كل أزرق السماء",
  "ديوان مجنون ليلى",
  "البكور",
  "قوانين الطبيعة البشرية",
  "سحر التفكير الكبير",
  "الداء والدواء",
  "رحلة عقل",
  "شجرتي شجرة البرتقال الرائعة",
  "يأت بخلق جديد",
  "دلشاد",
  "البعث",
  "تغريبة القافر",
  "عالم صوفي",
  "يوم في حياة عابد سلامة",
  "معادلة الحب",
  "لماذا أنا متعب",
  "لصوص النجاح العشرة",
  "الأب الغني والأب الفقير",
  "فن اللامبالاة",
  "قواعد العشق الأربعون",
  "أرض زيكولا",
  "ساق البامبو",
  "سيدات القمر",
  "Thinking, Fast and Slow",
  "The Psychology of Money",
  "Think and Grow Rich",
  "God Emperor of Dune",
  "A Mind for Numbers",
  "The Body Keeps the Score",
  "Milkman",
  "How to Win Friends and Influence People",
  "Wuthering Heights",
  "Great Expectations",
  "Atomic Habits",
  "The Alchemist",
  "Rich Dad Poor Dad",
  "Ikigai",
  "1984",
  "It Ends with Us",
];

const ZID_STORES: Array<{ store: StoreId; baseUrl: string }> = [
  { store: "unibook", baseUrl: "https://unibookom.com" },
  { store: "phenuq", baseUrl: "https://phenuqstore.com" },
  { store: "rawazin", baseUrl: "https://rawazin.om" },
];

const CANDIDATE_SCORE_THRESHOLD = 0.6;
const CANDIDATES_PER_TITLE = 2;
const CONFIRM_SCORE_THRESHOLD = 0.7;

async function discoverProductSitemaps(baseUrl: string): Promise<string[]> {
  const index = await politeFetchText(`${baseUrl}/sitemap.xml`);
  if (!index) return [];
  const locs = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return locs.filter((loc) => /sitemap_products.*\.xml/.test(loc));
}

async function buildSlugIndex(store: StoreId, baseUrl: string) {
  const sitemapFiles = await discoverProductSitemaps(baseUrl);
  console.log(`[${store}] found ${sitemapFiles.length} product sitemap file(s)`);

  const entries: Array<{ url: string; tokens: string[] }> = [];
  for (const file of sitemapFiles) {
    console.log(`[${store}] fetching ${file}`);
    const xml = await politeFetchText(file);
    if (!xml) continue;
    for (const url of extractProductUrls(xml)) {
      entries.push({ url, tokens: slugToTokens(url) });
    }
  }
  console.log(`[${store}] indexed ${entries.length} product URLs`);
  return entries;
}

async function findZidMatches(
  store: StoreId,
  slugIndex: Array<{ url: string; tokens: string[] }>,
  title: string
): Promise<Listing | null> {
  const titleTokens = tokenize(title);
  const scored = slugIndex
    .map((entry) => ({ entry, score: scoreMatch(titleTokens, entry.tokens) }))
    .filter((x) => x.score >= CANDIDATE_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, CANDIDATES_PER_TITLE);

  for (const { entry } of scored) {
    console.log(`[${store}] candidate for "${title}": ${entry.url}`);
    const listing = await fetchZidListing(store, entry.url);
    if (!listing) continue;

    const confirmScore = scoreMatch(titleTokens, tokenize(listing.title));
    if (confirmScore >= CONFIRM_SCORE_THRESHOLD) {
      console.log(`[${store}] confirmed "${listing.title}" for "${title}"`);
      return listing;
    }
  }
  return null;
}

async function main() {
  const catalogPath = path.join(__dirname, "..", "data", "catalog.json");
  const existing: Listing[] = JSON.parse(await readFile(catalogPath, "utf-8"));

  console.log("\n=== Full Thawaqa catalog ===");
  const thawaqaAll = await scrapeShopify("thawaqa", "https://thawaqa.com", Infinity);

  const coverage = new Map<string, Set<StoreId>>();
  for (const title of TARGET_TITLES) coverage.set(title, new Set());

  const normalizedThawaqaTitles = thawaqaAll.map((l) => tokenize(l.title));
  for (const title of TARGET_TITLES) {
    const titleTokens = tokenize(title);
    const hit = normalizedThawaqaTitles.some(
      (t) => scoreMatch(titleTokens, t) >= CONFIRM_SCORE_THRESHOLD
    );
    if (hit) coverage.get(title)!.add("thawaqa");
  }

  const newZidListings: Listing[] = [];
  for (const { store, baseUrl } of ZID_STORES) {
    console.log(`\n=== ${store}: building slug index ===`);
    const slugIndex = await buildSlugIndex(store, baseUrl);

    console.log(`\n=== ${store}: matching ${TARGET_TITLES.length} titles ===`);
    for (const title of TARGET_TITLES) {
      const match = await findZidMatches(store, slugIndex, title);
      if (match) {
        newZidListings.push(match);
        coverage.get(title)!.add(store);
      }
    }
  }

  // Merge: replace Thawaqa entirely with the full catalog; for the Zid
  // stores, keep the existing random sample and add newly matched titles
  // that weren't already in it.
  const existingUrls = new Set(existing.map((l) => l.url));
  const keptExisting = existing.filter((l) => l.store !== "thawaqa");
  const dedupedNewZid = newZidListings.filter((l) => !existingUrls.has(l.url));
  const merged = [...keptExisting, ...thawaqaAll, ...dedupedNewZid];

  await writeFile(catalogPath, JSON.stringify(merged, null, 2), "utf-8");

  console.log(`\n=== Coverage report ===`);
  for (const title of TARGET_TITLES) {
    const stores = [...coverage.get(title)!];
    console.log(`${stores.length > 0 ? "✓" : "✗"} ${title} -> ${stores.join(", ") || "not found"}`);
  }

  const foundCount = TARGET_TITLES.filter((t) => coverage.get(t)!.size > 0).length;
  console.log(`\n${foundCount}/${TARGET_TITLES.length} titles found in at least one store.`);
  console.log(`catalog.json now has ${merged.length} listings.`);
}

main();
