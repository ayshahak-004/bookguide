# Session Report: Human–AI Collaborative Development of BookGuide

**Subject:** A retrospective account of a single development session in which
the user directed an AI coding assistant (Claude, via Claude Code) to design,
build, debug, and deploy *BookGuide* (دليل الكتب) — a price/availability
comparison site for four Omani bookstores.

**Prepared by:** Claude (Claude Code), at the user's request, as a
self-assessment of its own performance in this session.

**Scope:** This document covers the full session from project inception
through deployment and version control. It does not cover work performed in
other sessions (if any).

---

## 1. Introduction

This report documents, in chronological order, every instruction ("prompt")
given by the user during this session, the action taken in response, and the
resulting outcome. It concludes with an evaluative assessment of the
assistant's performance — written in the interest of accuracy rather than
self-promotion, including instances where initial attempts were incorrect or
required correction.

The project itself is summarized in `README.md`; this report is concerned
with the *process* by which it was built, not its feature set.

## 2. Methodology

The session followed an iterative, conversational development model: the
user issued a natural-language instruction, the assistant performed research
and/or implementation using a set of tools (shell execution, file
editing, web requests, and browser automation), and the assistant reported
back — often with a live demonstration (a screenshot, a build log, a fetched
URL) rather than an unverified claim of success. Several instructions
surfaced ambiguity that was resolved by asking a clarifying question before
proceeding, rather than guessing.

Two working styles recur throughout the log below and are referenced
directly in the evaluation:

- **Verification before claiming success** — e.g., re-fetching a page to
  confirm a rename took effect, writing an independent audit script to
  re-check scraped data against a fixed matching algorithm, or opening a raw
  image URL directly to confirm its transparency before relying on it.
- **Escalating a problem to the user when a design decision, not a technical
  fact, was at stake** — e.g., asking how to scope a long-running scrape,
  or which of two Vercel deployment strategies to use.

## 3. Chronological Log of Prompts and Outcomes

| # | User instruction (quoted or summarized) | Outcome |
|---|---|---|
| 1 | Full project brief: build a no-backend Next.js site comparing book price/stock/delivery cost across four named Omani bookstores, with Arabic/English support, a scraper script, and specific documentation deliverables, following a prescribed five-step build order. | Project scaffolded (Next.js 16, TypeScript, Tailwind CSS). All four target sites were inspected to determine a robots.txt-compliant scraping strategy. Shopify and Zid scrapers were written and run, producing an initial 318-listing catalog. Arabic-aware fuzzy search, the results UI, "cheapest/fastest" badges, a language toggle, and both required documentation files (`README.md`, `docs/DEVLOG.md`) were implemented in one extended turn. |
| 2 | Deferred the git-commit decision until the code could be reviewed; asked where the site's name appeared and whether it could be changed; declined Vercel deployment for the time being. | Explained the three places the app's name was visible (`package.json`, page metadata, on-page heading) and asked what name the user wanted. |
| 3 | "BookGuide, دليل الكتب in Arabic" | Renamed the application across all three locations; verified the change by re-fetching the rendered page rather than assuming the edit was sufficient. |
| 4 | Asked whether deploying would change search results, and reported that searches for popular titles were coming up empty. | Clarified that deployment does not affect the underlying dataset. Identified the actual cause: each store's catalog was an arbitrary ~80-item sample, not a curated or exhaustive one, so most specific titles had no particular reason to be included. |
| 5 | Asked how scraped products were selected, and whether specific titles could be guaranteed present for a demonstration. | Explained the existing "whatever appears first in the store's own listing" sampling method. Proposed a more targeted approach: fetch Thawaqa's entire catalog (inexpensive via its bulk JSON endpoint) and, for the three remaining stores, match specific requested titles against sitemap URLs before fetching only likely candidates — avoiding an exhaustive and impolite full scrape. |
| 6 | Supplied a list of 42 specific titles (26 Arabic, 16 English) to guarantee in the catalog. | Implemented a title-matching scraper and ran it; it initially reported 42/42 titles found. |
| 7 | (After a tool-use rejection) "give me the url again" | Provided the local development URL. |
| 8 | Asked what remained before the site offered the "full experience." | Enumerated outstanding gaps: most delivery fees were still placeholders, the UI had not yet been visually verified in a real browser, a recent bug fix was undocumented, two title matches were flagged as low-confidence, and the working tree was uncommitted. |
| 9 | "fill the delivery fee, let's end everything now" | Retrieved each store's actual published shipping page and derived real delivery fees from it (rather than inventing plausible numbers), explicitly distinguishing domestic rates from unrelated international ones found on the same page. Separately noticed and corrected an unrelated regression: bundling Thawaqa's full catalog into the client build had grown the JavaScript bundle to roughly 4.7 MB; added a trimming step that brought it down to roughly 250 KB without losing any of the requested demo titles. |
| 10 | "connect to chrome" | Connected browser automation and manually exercised the live application. This surfaced a genuine functional bug — "cheapest" and "fastest" badges were being awarded to out-of-stock listings — which was fixed and re-verified in the same turn. |
| 11 | Asked for the UI to be redesigned to match a reference image, without altering functionality. | Requested the image, which had not been attached to the message. |
| 12 | Supplied a three-panel UI mockup (home, results, and empty/not-found states). | Rebuilt the visual layer (color palette, header, search bar, badge styling, and a new not-found state) to match the mockup while leaving all underlying logic unchanged. In the process, diagnosed a stale development-server cache that was silently preventing newly added theme colors from rendering at all. |
| 13 | Reported that one store's logo tile looked inconsistent with the others, and requested that all four logos be shown without any background shape. | Identified three distinct, unrelated causes behind the visual problems (a logo that was effectively invisible against its own tile color; a white-only logo rendered opaque-white by an image proxy; and a flat JPEG logo with an unremovable baked-in white background) and resolved each with a different, targeted technique. |
| 14 | Asked to remove the redundant store-name labels beneath the logos and the decorative account/login icon, since no account system exists. | Removed both elements from the relevant components. |
| 15 | "commit this" | Committed the UI redesign and logo fixes. |
| 16 | Reported that the separated cover-image-then-listing layout was visually uncomfortable, and asked for a single unified presentation. | Merged the book cover and its store-by-store listing into one card component. |
| 17 | "commit this" | Committed the unified card layout. |
| 18 | Reported that the cover image now looked unclear/cropped, and asked for an organized, clear interface. | Identified that stretching the image to match a variable-height sibling list was distorting it, and corrected this with a fixed-aspect-ratio container and non-cropping image fit. |
| 19 | "commit this, and document these errors and fixes in the specified doc" | Added four new dated entries to `docs/DEVLOG.md` covering the cache bug, the badge bug, the three logo bugs, and the image-distortion bug, and committed the fix together with its documentation. |
| 20 | "deploy it to vercel" | Installed the Vercel CLI and found no authenticated session; presented the user with a choice between an anonymous "temporary" deployment and a proper account-linked one. |
| 21 | "logged in, deploy it" | Found the CLI still reporting a logged-out state, and asked where the login had actually been performed, since login performed in an unrelated terminal is not visible to the assistant's tools. |
| 22 | Clarified that login had been done through a browser, and asked to see the login flow directly in the session. | Initiated the login flow, surfaced the resulting device-authorization URL to the user, and detected successful authentication once it was approved. |
| 23 | *(approval completed in the user's browser; no further chat message)* | Linked the project to a new Vercel project (working around an invalid default project name derived from the capitalized local folder name) and deployed it. Confirmed the resulting production URL was genuinely public rather than gated behind Vercel's authentication wall. |
| 24 | "open the site and check it works" | Opened the live production URL and repeated the same manual verification performed earlier against localhost (search, region-based fee recalculation, outbound purchase links), confirming parity with the local build. |
| 25 | "commit this" | Found nothing substantive to commit; the commit itself was then rejected by the user before completion. |
| 26 | "done right? let's wrap this" | Reported one remaining uncommitted change (a README update) and asked whether to proceed. |
| 27 | "commit it" | Committed the README update. |
| 28 | "push it" | Found no git remote configured, and asked whether to create a new repository or use an existing one. |
| 29 | Requested a new repository be created. | Verified GitHub CLI authentication, created a public repository, and pushed the full commit history to it. |
| 30 | Asked why a task on the internal task list was still marked incomplete. | Identified that the Vercel-deployment task had simply not been marked complete after the deployment succeeded, and corrected the oversight. |
| 31 | Requested this report. | This document. |

## 4. Performance Evaluation

### 4.1 Task completion and scope discipline

Every explicit request across the 31 prompts above was ultimately fulfilled.
Scope was generally held close to what was asked: for example, when asked to
redesign the UI "without changing any functionality," no underlying data
logic was altered; when told the project had no account system, the
decorative login icon was removed rather than implemented as a stub.

One point of appropriate pushback is notable: when asked whether *all*
products from every store could be scraped, the assistant did not simply
comply. It computed the real cost (per-store request counts derived from
each site's own sitemap) and reported that a full scrape of the three
non-Thawaqa stores would take on the order of fourteen continuous hours of
requests against small businesses' production servers, then proposed a
materially better-scoped alternative. This reflects sound judgment over
literal instruction-following.

### 4.2 Error detection and correction

Four genuine software defects were introduced and subsequently caught and
fixed within this session, all logged in `docs/DEVLOG.md`:

1. A title-matching algorithm that initially reported "42/42 titles found"
   was later shown, on independent audit, to contain false positives caused
   by coincidental substring collisions (e.g., matching "Milkman" to an
   unrelated book called "Dog Man"). This was caught by the assistant's own
   follow-up verification step, not by the user.
2. "Cheapest"/"fastest" badges were awarded to listings that were out of
   stock — found through manual browser testing initiated at the user's
   instruction, and fixed in the same turn.
3. Three unrelated image-transparency problems across the four store logos,
   diagnosed by directly inspecting each raw source image rather than
   guessing at a fix.
4. A book-cover image rendering defect caused by stretching a fixed-aspect
   image to match a dynamically sized sibling element — this took **two**
   rounds of user feedback to fully resolve: the first fix (merging the
   layout into one card) solved the *organization* complaint but introduced
   the *clarity* complaint, which required a second, more careful fix. This
   is the clearest instance in the session of an initial solution being
   incomplete relative to the user's actual intent.

In every one of these cases, the defect was identified before being
presented to the user as "done," or acknowledged and corrected promptly
when the user did notice. No known defect was left silently unresolved.

### 4.3 Communication and transparency

The assistant's reports to the user consistently included honest caveats
rather than unqualified success claims — for example, explicitly stating
when the UI had *not* yet been visually tested in a real browser (prompt 8),
and flagging two low-confidence title matches as worth manual verification
rather than claiming perfect accuracy (prompt 6's aftermath). Real,
specific numbers were used in place of vague reassurance wherever available
(e.g., "5.5MB to 224KB," "~14 hours of scraping," exact per-store listing
counts).

### 4.4 Efficiency and directness

Short, imperative prompts (the many "commit this" instructions, prompts
15–28) were handled with minimal back-and-forth, respecting the project's
established norm of never committing or deploying without explicit
instruction. Longer, more exploratory prompts (5, 9, 20) involved
substantially more intermediate work, which is appropriate to their scope.

### 4.5 Limitations observed

- The assistant required **two visual-design iterations** on the book-cover
  layout (prompts 16 and 18) before converging on a result the user
  considered acceptable, suggesting that a screenshot-based self-check
  before reporting completion would have caught the cropping issue sooner.
- Clarifying questions were needed on several occasions (prompts 5, 11, 20)
  — appropriate given genuine ambiguity in each case, but indicative that
  not every instruction could be acted on correctly from a single reading.
- One commit attempt (prompt 25's turn) was rejected by the user before
  completion; the underlying cause (an unexpected local-only `.gitignore`
  duplication introduced by the Vercel CLI) was correctly diagnosed and
  resolved on the next attempt rather than retried blindly.
- An internal task-tracking oversight (prompt 30) allowed a completed item
  to remain marked incomplete until the user pointed it out, indicating the
  assistant's own progress bookkeeping was not fully reliable without
  external prompting.

## 5. Quantitative Summary

- **Commits produced:** 5 (plus the repository's original scaffold commit)
- **Files added or modified across the session:** 39
- **Net lines changed:** +7,322 / −114
- **Final catalog size:** ~224 KB (down from a peak of ~5.5 MB mid-session)
- **Confirmed functional defects found and fixed:** 4
- **External services integrated:** Vercel (hosting), GitHub (version
  control), four third-party bookstore websites (data source)
- **Final deployment status:** live and publicly reachable, verified by
  direct interaction rather than by build status alone

## 6. Conclusion

Across 31 user instructions, the session produced a complete, functioning,
publicly deployed application together with its supporting documentation
and version-control history. The assistant demonstrated consistent
verification discipline (re-checking its own work rather than assuming
success) and proactive problem-finding (surfacing a bundle-size regression
and an out-of-stock badge bug that the user had not explicitly asked about).
Its principal shortcoming was in visual/UI judgment calls, where two
image-layout attempts were needed before the result matched the user's
intent, and in incomplete self-tracking of task status. No request was left
unresolved, and every known defect introduced during the session was
corrected within it.
