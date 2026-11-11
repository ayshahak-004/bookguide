# BookGuide (دليل الكتب)

A small prototype that lets a reader search for a book once and see its
price, stock status, and delivery cost across four Omani bookstores —
highlighting the cheapest and fastest option — instead of checking each
store's website one by one.

Built for a university "Introduction to AI" mini project, with generative
AI tools ("vibe coding"). No backend, no database — a scraper script
collects data into a JSON file and the Next.js site reads it.

## Stores covered

| Store | Platform | Source used |
|---|---|---|
| Thawaqa (ذواقة) | Shopify | `/products.json` (public JSON API) |
| Unibook (مكتبة الجامعة) | Zid | Sitemap + embedded `Product` JSON-LD on each page |
| Phenuq (فينيق) | Zid | Sitemap + embedded `Product` JSON-LD on each page |
| Rawazin (روازن) | Zid | Sitemap + embedded `Product` JSON-LD on each page |

`/api/` is blocked by `robots.txt` on all three Zid stores, so those are
scraped by reading the public sitemap for product URLs, then parsing the
`<script type="application/ld+json">` Product block already embedded in
each product page (the same structured data Google uses for rich search
results) rather than calling any private API.

## Tech stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- [Fuse.js](https://www.fusejs.io/) for fuzzy search, with Arabic text
  normalization (diacritics/tatweel stripped, letter variants collapsed)
  so search works regardless of spelling style
- No database — `data/catalog.json` is produced by the scrape scripts and
  read directly by the site; `data/delivery.json` holds per-store
  delivery fees, sourced from each store's own "Shipping & Payment" page

## Getting started

```bash
npm install
npm run scrape   # refresh data/catalog.json from the live stores (optional —
                  # a working catalog.json is already committed)
npm run dev       # start the dev server at http://localhost:3000
```

Other scripts:

```bash
npm run build     # production build (also type-checks)
npm run lint       # ESLint
```

## How the data flows

1. `npm run scrape` runs `scripts/scrape.ts`, which calls `scrape-shopify.ts`
   (Thawaqa) and `scrape-zid.ts` (Unibook/Phenuq/Rawazin, same scraper
   reused for all three) and writes a baseline sample (~80 products/store,
   whatever each store lists first) to `data/catalog.json`. If a store
   fails, it's skipped and the others still run. Requests are throttled to
   ~1/second with a descriptive User-Agent.
2. `scripts/scrape-targeted.ts` tops that up: it pulls Thawaqa's *entire*
   catalog (cheap — one bulk JSON request per 250 products, regardless of
   catalog size) and, for the three Zid stores, downloads their full
   product sitemaps and locally matches a list of specific titles
   (`TARGET_TITLES` in that file) against the URL slugs before fetching
   only the matching product pages — rather than scraping every one of the
   tens of thousands of products those stores carry. Run it with
   `npx tsx scripts/scrape-targeted.ts`, then `npx tsx scripts/trim-thawaqa.ts`
   right after — Thawaqa's full catalog is tens of thousands of products,
   and importing all of it into the client bundle balloons page weight
   (it hit 4.7MB before trimming); the trim step keeps only the demo-title
   matches plus a small baseline sample. Edit `TARGET_TITLES` in both
   files to target different books. `scripts/audit-targeted.ts` re-checks
   matches already in `catalog.json` against the matching logic without
   any new requests — useful after changing the matcher.
3. `data/delivery.json` holds each store's delivery fee (flat or
   per-governorate), free-shipping threshold, and estimated delivery days.
   Fee amounts were read directly off each store's own "Shipping & Payment"
   page (`/shipping-and-payment`) — where a store lists several
   weight/carrier tiers for the same coverage area, the lightest tier was
   used, since a single book is a light package. Fields still marked
   `"TODO"` (mainly delivery-time estimates) weren't published anywhere
   found and are placeholders for you to fill in by hand.
4. The site (`app/page.tsx`) imports both JSON files at build time,
   groups listings into one "book" per ISBN (or per normalized title when
   no ISBN is available), and lets the user fuzzy-search, filter, sort,
   and pick a governorate to see the delivery fee and total cost per store.

## Known limitations (prototype scope)

- Outside of the targeted titles (see above), the catalog only samples
  ~80 products per store, so a random search is a coin flip.
- Delivery fees are a simplification: most stores publish one flat
  domestic rate rather than true per-governorate pricing, except Rawazin,
  which explicitly prices Musandam and Al Wusta higher (2.500 vs 2 OMR) as
  "remote areas" — that distinction is reflected in `data/delivery.json`.
  Delivery-time estimates are mostly still `"TODO"` — not published on the
  pages checked.
- Author names are extracted with a best-effort regex from the Arabic
  product description (look for "تأليف:") and are not always clean or
  present.
- Title matching for the targeted scrape is a bag-of-words check (shared
  significant words, not phrase order), so a handful of words that are
  also common in unrelated titles can occasionally produce a weak match.
  Two from the current list are worth a manual glance before demoing:
  "رحلة عقل" (Rawazin's hit has extra words — likely a different book)
  and "البعث" (Thawaqa's and Phenuq's hits are long, clearly unrelated
  titles that happen to contain that word; Unibook's and Rawazin's hits
  are a clean bare match).

## Deploying

```bash
npm i -g vercel   # if not already installed
vercel login
vercel            # deploy from this directory, follow the prompts
```
