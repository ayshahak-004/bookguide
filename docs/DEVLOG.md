# Development Log

Dated entries for notable problems hit while building this project, their
cause, the fix, and how the fix was checked.

## 2026-11-11

### Node.js was not installed

**Problem:** `node`/`npm` were not available in the shell at all.
**Cause:** Fresh machine, nothing installed yet.
**Fix:** Installed Node.js LTS via `winget install OpenJS.NodeJS.LTS`.
**Verified:** `node -v` → `v26.13.0`, `npm -v` → `11.20.0` in a fresh shell.

### `create-next-app` refused the project directory name

**Problem:** `npx create-next-app .` failed with "name can no longer
contain capital letters".
**Cause:** `create-next-app` derives the npm package name from the target
directory's basename, and the project lives in `C:\BooksStores`
(capitalized) — npm package names must be lowercase.
**Fix:** Scaffolded into a temporary lowercase directory
(`C:\booksstores-tmp`), copied the files into `C:\BooksStores`, and set
`"name": "omani-books-compare"` directly in `package.json`.
**Verified:** `npm run dev` and `npm run build` both ran successfully
afterward.

### Zid stores block `/api/` in `robots.txt`

**Problem:** Planned to pull product data from each Zid store's internal
API, but that would ignore the site's published crawling rules.
**Cause:** `robots.txt` on Unibook, Phenuq, and Rawazin all explicitly
`Disallow: /api/`.
**Fix:** Switched to a robots-compliant source: fetch each store's public
`sitemap_products.xml` for product URLs, then parse the
`<script type="application/ld+json">` `Product` block that's already
embedded in every product page (the same structured data the stores
publish for Google's rich search results).
**Verified:** Manually fetched a sample product page from each of the
three stores and confirmed the JSON-LD block parses to the expected
`name`/`sku`/`offers.price`/`offers.availability` fields.

### "Out of stock" markup is present on in-stock pages too

**Problem:** Initially planned to detect stock status by searching the
HTML for "نفدت الكمية" (sold out) / "نبهني عند التوفر" (notify me) text.
**Cause:** That markup block (`class="... js-section-out-of-stock d-none"`)
is always present in the page's DOM, just hidden with a CSS class and
toggled by client-side JS — so its mere presence proves nothing about
actual stock.
**Fix:** Used the `offers.availability` field from the page's `Product`
JSON-LD instead, which reflects server-rendered truth.
**Verified:** Cross-checked a known in-stock Rawazin product — the hidden
out-of-stock block was present in the raw HTML, but `offers.availability`
correctly read `"InStock"`.

### Rawazin scraper collected 0 listings on first run

**Problem:** `scrape-zid.ts` returned 80/80 listings for Unibook and
Phenuq but 0 for Rawazin, with no fetch errors logged.
**Cause:** The JSON-LD extractor matched on `parsed["@type"] === "Product"`
(capital P). Unibook and Phenuq both use `"Product"`, but Rawazin's pages
use lowercase `"product"` — so every Rawazin page was fetched
successfully but silently failed the type check.
**Fix:** Made the `@type` comparison case-insensitive
(`parsed["@type"].toLowerCase() === "product"`).
**Verified:** Re-ran the scraper for Rawazin only
(`scripts/rescrape-rawazin.ts`) and got 80/80 listings, merged into
`data/catalog.json` (confirmed store counts with a one-off `node -e`
script: `thawaqa: 80, unibook: 80, phenuq: 78, rawazin: 80`).

### Stale sitemap entries (404s)

**Problem:** A meaningful fraction of sitemap URLs on the Zid stores
(roughly a third, on Phenuq) 404 — products that were removed or renamed
without the sitemap being regenerated.
**Fix:** The scraper requests `MAX_PRODUCTS + 40` URLs from the sitemap
instead of exactly the target count, and skips (rather than aborts on)
any non-200 response, so a bad sitemap entry just costs one wasted
request instead of shrinking the catalog.
**Verified:** Final per-store counts landed at or near the 80 target
(78 for Phenuq, 80 for the other three) despite the 404s logged during
the run.

### Arabic diacritic-stripping regex accidentally ate digits

**Problem:** First draft of `normalizeArabic()` used a single character
range from the first tashkeel mark to the superscript alef
(`\u064B`–`\u0670`) to strip diacritics.
**Cause:** The Arabic-Indic digits ٠-٩ (`\u0660`–`\u0669`) sit *inside*
that numeric range, so a book title or price containing Arabic-Indic
digits would have had them silently deleted.
**Fix:** Built the diacritics regex from two separate code-point ranges
(`\u064B`–`\u065F` and `\u0670`) instead of one contiguous range, and
wrote every Arabic character in `lib/arabic.ts` from its numeric code
point rather than a pasted glyph, to keep the exact character set
auditable.
**Verified:** Added test cases (diacritics, tatweel, alef/taa-marbuta
variants, and literal Arabic-Indic digits) and confirmed with
`[...output].map(c => c.codePointAt(0))` that digits survive unchanged
while diacritics/tatweel are removed and letter variants are collapsed.

### ESLint flagged the localStorage-hydration pattern

**Problem:** `npm run lint` failed with
`react-hooks/set-state-in-effect` on both the saved-region and
saved-language `useEffect`s.
**Cause:** That rule treats any `setState` call inside a `useEffect` as a
smell, including the standard "read a persisted value after mount,
since `localStorage` isn't available during SSR" pattern used here.
**Fix:** Added a scoped `eslint-disable-next-line` with a comment
explaining why, rather than restructuring already-correct code.
**Verified:** `npm run lint` passes with no errors.

### TypeScript build error on the Fuse.js generic type

**Problem:** `npm run build` failed type-checking:
`Fuse<SearchableBook>` was not assignable to the `Fuse<Book>` parameter
of `searchBooks`.
**Cause:** `SearchableBook` (an internal type with extra normalized
search fields) is a superset of `Book`, but Fuse's `getFn` option makes
`Fuse<T>` invariant in `T`, so a `Fuse<SearchableBook>` instance isn't
treated as a `Fuse<Book>`.
**Fix:** Exported `SearchableBook` from `lib/search.ts` and changed
`searchBooks`'s parameter type to `Fuse<SearchableBook>` to match what
`createSearchIndex` actually returns.
**Verified:** `npm run build` compiles, type-checks, and prerenders the
page successfully.

### Slug-matching false positives from short-word substring collisions

**Problem:** Built `scripts/scrape-targeted.ts` to guarantee ~40 specific
demo titles show up in the catalog, by matching each title's words against
Zid stores' sitemap URL slugs (and, after fetching, against the real
scraped title) to decide what to keep. The first run claimed "42/42 titles
found," but spot-checking the log showed "Dog Man" confirmed as a match
for "Milkman," and "draw goua che 12x12ml" (a craft-paint product)
confirmed for "The Alchemist."
**Cause:** The match score allowed one word to count as a hit if it was a
substring of the other ("so slugs that split/concatenate words differently
than the real title still match"). But short common fragments are
*coincidentally* substrings of unrelated longer words: "man" is literally
inside "mil**man**", "che" is inside "al**che**mist", and "ends" is inside
"fri**ends**" — so "Milkman" matched any slug containing "man," and
"It Ends with Us" matched "Fox and His Friends."
**Fix:** Replaced plain substring containment with a stricter rule in
`scripts/lib/match-title.ts`: two words only count as equivalent if one is
a prefix/suffix of the other *and* the length difference is small (≤2
chars) — catches real noise like a trailing colon or a dropped letter,
not arbitrary shared fragments.
**Verified:** Wrote `scripts/audit-targeted.ts`, a read-only script that
re-checks every title already in `data/catalog.json` against the fixed
matcher with no new network requests. Re-ran it and confirmed all the
known-bad matches (Dog Man, draw-goua-che, Fox and His Friends, and a
"How to Win Friends" listing that had been double-counted for "It Ends
with Us") no longer pass, while every title that *was* a correct match
still is. Two titles ("رحلة عقل" and "البعث") still get a same-words,
different-book match in one store each — flagged in the README rather
than "fixed," since that's an inherent limit of bag-of-words matching on
short, generic phrases, not a bug.

### Delivery fees looked dynamic-only, but weren't on every store

**Problem:** Needed real delivery fees to replace the `"TODO"`
placeholders in `data/delivery.json`. Fetching Unibook's
`/shipping-and-payment` page with `curl` and grepping for `"رسوم الشحن"`
(shipping fee) only turned up a Vue `v-for="cost in shippingMethodData.cost"`
template directive with no number next to it — looked like the real
numbers only existed after client-side JS populated `shippingMethodData`,
which a plain HTTP fetch can't see.
**Cause:** Zid's theme renders that `v-for` block server-side with the
real value already interpolated (a Vue-syntax template that's actually
SSR'd, then hydrated client-side) — the fee rows further down the same
page *did* have real numbers; the first grep just hadn't looked far enough
past the directive to see them.
**Fix:** Grepped for the rendered `<span class="color-primary s-content">`
value itself instead of the `v-for` directive, and read enough
surrounding context on each row to see which courier/coverage it
belonged to (ruling out, for example, Phenuq's 5 OMR and 8 OMR rows, which
turned out to be international rates to the UAE and Saudi Arabia, not
domestic Oman pricing).
**Verified:** Cross-checked each kept figure against its row's declared
coverage (city list) before writing it into `data/delivery.json`:
Thawaqa 2 OMR flat (from the original brief), Unibook 1 OMR flat and
Phenuq 1 OMR flat (each store's lightest domestic weight tier, both with
~113+ city/nationwide coverage), Rawazin 2 OMR flat except 2.500 OMR for
Musandam and Al Wusta specifically, which Rawazin's own table lists under
a separate "remote areas" shipping option.

### Full Thawaqa catalog bloated the client JS bundle to 4.7MB

**Problem:** After `scrape-targeted.ts` pulled in Thawaqa's entire
catalog (to guarantee the demo titles would be found there), `catalog.json`
grew to 5.5MB and the resulting client JS chunk hit 4.7MB — a serious
problem for a site that's supposed to be mobile-friendly; that's megabytes
of dead weight downloaded on every visit for books nobody searched for.
**Cause:** "Fetch everything, it's cheap for Thawaqa" was true for the
*scraping* cost (a handful of bulk JSON requests) but ignored the
*shipping* cost — the whole catalog gets imported directly into the
client bundle (`app/page.tsx` does `import catalogData from
"@/data/catalog.json"`), so its size is the site's size.
**Fix:** `scripts/trim-thawaqa.ts` keeps only the Thawaqa listings that
match one of the demo target titles, plus a small baseline sample (80) of
the rest for general browsing — discarding the remaining ~14,100 products
that were pure bundle weight.
**Verified:** `data/catalog.json` dropped from 5.5MB to 224KB and the
largest JS chunk from 4.7MB to 248KB. Re-ran `audit-targeted.ts`
afterward and confirmed all 42 target titles still resolve to a match
(nothing useful was discarded, only the untargeted long tail).

### Custom Tailwind color tokens silently didn't render

**Problem:** After redesigning the UI around a cream/navy palette defined
in `app/globals.css`'s `@theme inline` block, the navy header bar and the
active language-toggle pill both rendered with **no background at all** -
completely invisible against the page.
**Cause:** `getComputedStyle(el).backgroundColor` came back
`rgba(0,0,0,0)` even though `bg-navy` was applied and `text-navy` worked
fine elsewhere on the same page. The dev server (`next dev`) had been
running continuously since *before* these color tokens were added, and
Turbopack's filesystem cache for dev (on by default in Next.js 16) never
picked up the new theme tokens.
**Fix:** Killed the running dev server, deleted `.next/`, and restarted
`npm run dev` fresh. No code changes were needed - the CSS was already
correct.
**Verified:** Same elements rendered with the correct navy background
immediately on the next reload.

### "Cheapest"/"fastest" badges were awarded to out-of-stock listings

**Problem:** Live-testing a search for a book that happened to be out of
stock at all four stores, the "cheapest total" badge still appeared on
one of the out-of-stock rows - implying it was the best buy when it
couldn't actually be bought there.
**Cause:** `computeBadges()` only checked that a row had a computed total
(`total_omr !== null`); it never checked `listing.in_stock`. An
out-of-stock row with a known price and delivery fee still produces a
valid total and can "win" the cheapest/fastest comparison.
**Fix:** `computeBadges()` (`lib/rows.ts`) now filters to
`rows.filter(r => r.listing.in_stock)` before computing the
cheapest/fastest/within-budget sets, so a badge is never shown on
something that isn't actually purchasable there.
**Verified:** Re-ran the same out-of-stock search - no badges appear
anywhere now. Searched "Atomic Habits" (in stock at two stores) - the
cheapest badge still correctly appears on the cheaper in-stock listing.

### Real store logos needed three different fixes, not one

**Problem:** Replacing the letter-tile placeholders with each store's
real logo (linked to its homepage), three different problems showed up:
Thawaqa's logo was invisible on its own navy tile; Unibook's logo was a
blank white square; and after switching to "just the logo, no background
shape" per request, Rawazin's logo displayed with an ugly white box
around it that didn't match the page.
**Cause:** Three unrelated causes bundled into one feature. (1) Thawaqa's
logo PNG is a muted navy/gray wordmark on a transparent background,
invisible against an equally dark navy tile. (2) Unibook's only logo
asset is pure white artwork on a transparent background, and the resize
URL used `img.zid.store`'s `background=white` proxy parameter, which
bakes an opaque white canvas behind an already-white logo. (3) Rawazin's
only hosted logo is a flat JPEG - JPEG has no alpha channel, so it can
only ever have its own baked-in white square background, with or without
a proxy.
**Fix:** Switched all four logos to their raw, unproxied source URLs so
any real transparency survives intact. Applied a CSS `invert` filter to
Unibook's logo specifically (flips white-on-transparent to
black-on-transparent, readable on a light page). Applied
`mix-blend-mode: multiply` to all four logos, which makes Rawazin's baked
-in white square disappear into the page background (white blended via
multiply is a no-op) while doing nothing visible to the genuinely
transparent logos.
**Verified:** Opened each raw logo URL directly in a browser tab first to
confirm its actual transparency/colors before wiring it into the app.
After the fix, all four logos render cleanly directly on the page
background with no visible box or shape around any of them.

### Book cover image was distorted trying to match the result-list height

**Problem:** After merging the cover image and the store-listing rows
into one unified card, the cover looked wrong - often showing only a
cropped sliver of the actual artwork instead of the full cover.
**Cause:** The image container used `self-stretch` (to match the height
of its flex sibling, the list of store rows) with `object-cover`. For a
book carried by three or four stores, that stretched the box into a
tall, narrow strip, and `object-cover` cropped the cover image to fill
that arbitrary, content-dependent shape rather than preserving its own
proportions.
**Fix:** Gave the image a fixed `aspect-[2/3]` box sized by width only
(matching a typical book-cover ratio), with `self-start` so it no longer
stretches to match its sibling's height, and switched to `object-contain`
so the whole cover is always visible (letterboxed against the page's own
cream color on any proportion mismatch) instead of cropped.
**Verified:** Re-searched "Atomic Habits" - the cover now displays fully
and undistorted regardless of how many store rows are listed beside it.

### `vercel link` rejected the project name (again)

**Problem:** `vercel link --yes` failed with "Project names ... must be
lowercase," refusing to link the project at all.
**Cause:** Same root cause as the very first `create-next-app` failure
in this log - the Vercel CLI, like `create-next-app`, derives a default
project name from the current directory's basename, and the project
lives in `C:\BooksStores` (capitalized).
**Fix:** Passed an explicit lowercase name: `vercel link --yes --project
bookguide`.
**Verified:** Linked successfully to `aysh6/bookguide`; `vercel deploy`
then built and published without error.
