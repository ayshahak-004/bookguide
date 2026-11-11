// Normalizes Arabic text for matching: strips diacritics/tatweel and
// collapses letter variants (alef-hamza forms -> alef, taa marbuta -> haa,
// alef maksura -> yaa) so search and grouping aren't thrown off by
// spelling/typing variation.
//
// Every Arabic character is built from its numeric Unicode code point
// (never pasted as a glyph) so the exact character set is unambiguous:
const chr = (codePoint: number) => String.fromCodePoint(codePoint);

// Tashkeel diacritics (fatha, damma, kasra, shadda, sukun, ...) run from
// U+064B to U+065F. Superscript alef (U+0670) is a separate diacritic a
// little further along. The Arabic-Indic digits 0-9 (U+0660-U+0669) sit
// *inside* that gap, so the two diacritic sub-ranges are built and
// concatenated separately to avoid ever matching a digit.
const TASHKEEL_LOW = 0x064b;
const TASHKEEL_HIGH = 0x065f;
const SUPERSCRIPT_ALEF = 0x0670;
const DIACRITICS = new RegExp(
  `[${chr(TASHKEEL_LOW)}-${chr(TASHKEEL_HIGH)}${chr(SUPERSCRIPT_ALEF)}]`,
  "g"
);

const TATWEEL = new RegExp(chr(0x0640), "g"); // kashida / elongation character

// Alef with madda (0622), hamza above (0623), hamza below (0625) -> bare alef (0627)
const ALEF_VARIANTS = new RegExp(`[${chr(0x0622)}${chr(0x0623)}${chr(0x0625)}]`, "g");
const BARE_ALEF = chr(0x0627);

const TAA_MARBUTA = new RegExp(chr(0x0629), "g"); // ة
const HAA = chr(0x0647); // ه

const ALEF_MAKSURA = new RegExp(chr(0x0649), "g"); // ى
const YAA = chr(0x064a); // ي

export function normalizeArabic(input: string): string {
  return input
    .normalize("NFKC")
    .replace(DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(ALEF_VARIANTS, BARE_ALEF)
    .replace(TAA_MARBUTA, HAA)
    .replace(ALEF_MAKSURA, YAA)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
