import { normalizeArabic } from "../../lib/arabic";

// Short connector words that shouldn't count as evidence of a match on
// their own (common in both English titles and URL slugs).
const STOPWORDS = new Set(["the", "a", "an", "of", "and", "or", "is", "it", "in", "on", "to", "with", "us", "my", "i"]);

export function tokenize(title: string): string[] {
  const normalized = normalizeArabic(title);
  const words = normalized.split(" ").filter(Boolean);
  const filtered = words.filter((w) => w.length > 0 && !STOPWORDS.has(w));
  return filtered.length > 0 ? filtered : words;
}

// Turns a product URL's last path segment into a normalized, space-separated
// bag of words, the same shape tokenize() produces for a title.
export function slugToTokens(url: string): string[] {
  const lastSegment = decodeURIComponent(url.split("/").filter(Boolean).pop() ?? "");
  const spaced = lastSegment.replace(/-/g, " ");
  return normalizeArabic(spaced).split(" ").filter(Boolean);
}

// A short/common word (e.g. "man", "che", "ends") is very often a
// coincidental substring of some unrelated longer word ("milkman",
// "alchemist", "friends") - plain substring containment is too noisy.
// Instead, only treat two tokens as "close enough" when one is a prefix OR
// suffix of the other (catches real variation like a trailing colon, or a
// dropped/added letter) AND the length difference is small - catches
// punctuation/spelling noise without matching arbitrary shared fragments.
const MIN_FUZZY_LEN = 4;
const MAX_LEN_DIFF = 2;

function closeEnough(a: string, b: string): boolean {
  if (a === b) return true;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  if (shorter.length < MIN_FUZZY_LEN) return false;
  if (longer.length - shorter.length > MAX_LEN_DIFF) return false;
  return longer.startsWith(shorter) || longer.endsWith(shorter);
}

// Fraction of the title's (non-stopword) tokens that appear in the slug.
export function scoreMatch(titleTokens: string[], slugTokens: string[]): number {
  if (titleTokens.length === 0) return 0;
  let matched = 0;
  for (const t of titleTokens) {
    if (slugTokens.some((s) => closeEnough(s, t))) matched++;
  }
  return matched / titleTokens.length;
}
