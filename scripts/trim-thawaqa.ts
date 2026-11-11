import { readFile, writeFile } from "fs/promises";
import path from "path";
import { scoreMatch, tokenize } from "./lib/match-title";
import type { Listing } from "../lib/types";

// Thawaqa's full catalog (~14k products) made catalog.json 5.5MB, which
// bloats the client JS bundle to ~4.7MB - too heavy for a mobile-friendly
// prototype. Trim it back down to: listings matching one of the demo
// target titles, plus a baseline random sample for general coverage.
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
const BASELINE_SAMPLE_SIZE = 80;

async function main() {
  const catalogPath = path.join(__dirname, "..", "data", "catalog.json");
  const catalog: Listing[] = JSON.parse(await readFile(catalogPath, "utf-8"));

  const thawaqa = catalog.filter((l) => l.store === "thawaqa");
  const others = catalog.filter((l) => l.store !== "thawaqa");

  const targetTokenSets = TARGET_TITLES.map(tokenize);
  const matched = thawaqa.filter((l) => {
    const tTokens = tokenize(l.title);
    return targetTokenSets.some((targetTokens) => scoreMatch(targetTokens, tTokens) >= 0.999);
  });
  const matchedUrls = new Set(matched.map((l) => l.url));

  const baseline = thawaqa
    .filter((l) => !matchedUrls.has(l.url))
    .slice(0, BASELINE_SAMPLE_SIZE);

  const trimmedThawaqa = [...matched, ...baseline];
  const merged = [...others, ...trimmedThawaqa];

  console.log(`thawaqa: ${thawaqa.length} -> ${trimmedThawaqa.length} (${matched.length} demo matches + ${baseline.length} baseline sample)`);
  console.log(`catalog.json total: ${catalog.length} -> ${merged.length}`);

  await writeFile(catalogPath, JSON.stringify(merged, null, 2), "utf-8");
}

main();
