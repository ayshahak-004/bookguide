import { readFile } from "fs/promises";
import path from "path";
import { scoreMatch, tokenize } from "./lib/match-title";
import type { Listing } from "../lib/types";

const TARGET_TITLES: string[] = [
  "العادات الذرية", "الليالي البيضاء", "الدرب الذي بيننا", "كل أزرق السماء",
  "ديوان مجنون ليلى", "البكور", "قوانين الطبيعة البشرية", "سحر التفكير الكبير",
  "الداء والدواء", "رحلة عقل", "شجرتي شجرة البرتقال الرائعة", "يأت بخلق جديد",
  "دلشاد", "البعث", "تغريبة القافر", "عالم صوفي", "يوم في حياة عابد سلامة",
  "معادلة الحب", "لماذا أنا متعب", "لصوص النجاح العشرة", "الأب الغني والأب الفقير",
  "فن اللامبالاة", "قواعد العشق الأربعون", "أرض زيكولا", "ساق البامبو", "سيدات القمر",
  "Thinking, Fast and Slow", "The Psychology of Money", "Think and Grow Rich",
  "God Emperor of Dune", "A Mind for Numbers", "The Body Keeps the Score", "Milkman",
  "How to Win Friends and Influence People", "Wuthering Heights", "Great Expectations",
  "Atomic Habits", "The Alchemist", "Rich Dad Poor Dad", "Ikigai", "1984", "It Ends with Us",
];

async function main() {
  const catalogPath = path.join(__dirname, "..", "data", "catalog.json");
  const catalog: Listing[] = JSON.parse(await readFile(catalogPath, "utf-8"));

  // Flag exact duplicate URLs within the catalog (possible artifact of the
  // targeted-matching run adding the same listing for two different titles).
  const urlCounts = new Map<string, number>();
  for (const l of catalog) urlCounts.set(l.url, (urlCounts.get(l.url) ?? 0) + 1);
  const dupes = [...urlCounts.entries()].filter(([, n]) => n > 1);
  console.log(`Duplicate URLs in catalog.json: ${dupes.length}`);
  for (const [url, n] of dupes) console.log(`  x${n}  ${url}`);

  console.log(`\nTotal listings: ${catalog.length}`);

  const withTokens = catalog.map((l) => ({ l, tokens: tokenize(l.title) }));

  for (const title of TARGET_TITLES) {
    const titleTokens = tokenize(title);
    const matches = withTokens
      .map(({ l, tokens }) => ({ l, score: scoreMatch(titleTokens, tokens) }))
      .filter((x) => x.score >= 0.999)
      .sort((a, b) => a.l.title.length - b.l.title.length);

    console.log(`\n--- "${title}" ---`);
    if (matches.length === 0) {
      console.log("  NO MATCH");
      continue;
    }
    const seen = new Set<string>();
    for (const { l } of matches) {
      if (seen.has(l.store)) continue;
      seen.add(l.store);
      console.log(`  [${l.store}] "${l.title}"  ${l.url}`);
    }
  }
}

main();
