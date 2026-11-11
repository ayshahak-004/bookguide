# CLAUDE.md

Guidance for Claude Code (or any future contributor) working in this repo.

## Project summary

**BookGuide** (دليل الكتب) is a no-backend price/availability comparison
site for four Omani bookstores (Thawaqa, Unibook, Phenuq, Rawazin). A
scraper script collects book listings into `data/catalog.json`; the
Next.js site reads that file directly (no database, no API routes) and
lets a reader fuzzy-search by title/author/ISBN in Arabic or English, pick
their governorate, and see price, stock, delivery fee, and total cost per
store, with "cheapest"/"fastest"/"within budget" badges.

Built as a university mini-project — small and prototype-scoped by design,
not a production system. Full narrative history of how it was built is in
`docs/DEVLOG.md` and `docs/SESSION_REPORT.md`.

- Live: https://bookguide.vercel.app
- Repo: https://github.com/ayshahak-004/bookguide

## Running it

```bash
npm install
npm run dev     # dev server at http://localhost:3000
npm run build   # production build (also type-checks)
npm run lint    # ESLint
npm run scrape  # refresh data/catalog.json from the 4 live stores (baseline ~80/store sample)
```

A working `data/catalog.json` is already committed, so `npm run scrape`
is optional for just running the site.

Two extra scripts aren't wired into `npm run scrape` and are run by hand
when needed:

```bash
npx tsx scripts/scrape-targeted.ts   # guarantee specific demo titles are in the catalog
npx tsx scripts/trim-thawaqa.ts      # run right after - keeps the client bundle small
npx tsx scripts/audit-targeted.ts    # re-check existing matches with no new network requests
```

## Stores and how each scraper works

| Store | Platform | Scraper | Data source |
|---|---|---|---|
| Thawaqa (ذواقة) | Shopify | `scripts/scrape-shopify.ts` | `/products.json?limit=250&page=N` - public bulk JSON, cheap regardless of catalog size |
| Unibook, Phenuq, Rawazin | Zid | `scripts/scrape-zid.ts` (one scraper, reused for all three) | `sitemap_products.xml` for URLs, then the `<script type="application/ld+json">` `Product` block embedded in each page |

`/api/` is disallowed by `robots.txt` on all three Zid stores, so there is
no bulk endpoint for them - each product needs its own page fetch, throttled
to ~1 request/second with a descriptive User-Agent. This is also why their
full catalogs (tens of thousands of products each) are never scraped in
full; see "Known issues" below.

`scripts/scrape.ts` is the orchestrator (`npm run scrape`): it calls both
scrapers for all four stores and writes the combined, randomly-sampled
baseline catalog. `scripts/scrape-targeted.ts` is a separate, more
surgical scraper: it pulls Thawaqa's *entire* catalog (cheap, bulk JSON)
and, for the three Zid stores, downloads their full sitemaps and matches a
hardcoded `TARGET_TITLES` list against the URL slugs locally before
fetching only likely candidates - avoiding a multi-hour full scrape just to
guarantee a handful of demo titles are present. Always run
`scripts/trim-thawaqa.ts` afterward, or Thawaqa's full catalog bloats the
client-side JS bundle (see DEVLOG - this hit 4.7MB once already).

`data/delivery.json` is **not** scraped - fee amounts were read by hand off
each store's own "Shipping & Payment" page and transcribed (see DEVLOG
entry "Delivery fees looked dynamic-only, but weren't on every store").

## Known issues

- **Sparse baseline coverage.** Outside the `TARGET_TITLES` list, each
  store only samples ~80 arbitrary products, so a random search usually
  won't find a match. This is the single biggest limitation of the
  prototype.
- **Delivery fees are simplified.** Most stores publish one flat domestic
  rate rather than true per-governorate pricing; only Rawazin's
  Musandam/Al Wusta "remote area" surcharge is modeled. Delivery-time
  estimates are mostly still `"TODO"` placeholders.
- **Author extraction is best-effort.** A regex looks for "تأليف:" in the
  Arabic product description; it's not always present or clean.
- **Two titles have weak/ambiguous matches**: "رحلة عقل" and "البعث" can
  resolve to a different, unrelated book in some stores because the
  matcher is bag-of-words, not phrase-order-aware. See README "Known
  limitations" for which store/title combos to double check.
- **The same book can appear as multiple cards.** Books are grouped by
  ISBN, falling back to normalized title. Different stores often carry
  different print editions with different ISBNs, so the "same" book can
  split into separate cards rather than merging into one with multiple
  store rows.
- **Thawaqa's logo looks faint.** That's their actual brand color, not a
  rendering bug - confirmed by inspecting the raw source image.

## Ideas for next changes

- Real per-governorate delivery fees for Unibook/Phenuq/Rawazin (currently
  flat), once that data is available from the stores.
- Move the catalog off the client bundle (a server-rendered search API or
  route handler) so catalog size can grow past prototype scale without
  repeating the bundle-bloat incident in the DEVLOG.
- Smarter book grouping - e.g. normalize away edition/volume suffixes, or
  group by (normalized title + author) instead of ISBN, to stop the same
  book splitting into multiple cards.
- Replace the hand-transcribed `data/delivery.json` with a periodic
  refresh script (would need a headless browser for the Zid stores' Vue-
  rendered shipping-fee tables - plain `fetch`/`curl` can't execute their JS).
- Phrase-aware title matching (not just bag-of-words) for
  `scrape-targeted.ts`, to remove the two ambiguous-match caveats above.
- Basic CI (`npm run build && npm run lint`) on push, now that there's a
  GitHub remote to hang a workflow off of.
