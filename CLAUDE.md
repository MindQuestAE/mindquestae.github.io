# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. `AGENTS.md` is a symlink to this file.

## Project Overview

This is a static website for MindQuest, a General Knowledge Quiz Competition for Indian-diaspora high school students in the UAE, now in its second edition, held in 2026 and branded "MindQuest 2.0". The project is a single-page HTML application with separated CSS and JavaScript files, deployed to GitHub Pages at https://mindquestquiz.com (`CNAME`).

## Architecture

**Modular File Structure:**
- `index.html` - Main HTML structure with semantic sections, SEO meta, JSON-LD and the inline SVG icon sprite
- `assets/styles.css` - External CSS file with complete styling (the implementation of the design system)
- `assets/script.js` - External JavaScript file with all functionality
- `sw.js` - Service worker (caching for repeat visits, see "Service Worker" below)
- `robots.txt`, `sitemap.xml`, `CNAME` - SEO / hosting files
- `docs/2026-design.html` - Living design system reference for the 2026 theme (rendered with the live stylesheet, `noindex`)
- `ad.html` + `widget/mq-widget.v1.js` - Embeddable banner snippet (documented in `WIDGET.md`)
- `assets/` - Images and favicon resources
  - `mindquest-logo-nav.svg` - Official MindQuest 2.0 logo (the "2.0" is part of the artwork), cropped to its tight bounding box (viewBox only, paths unchanged), shown at 56px tall (50px on phones), preloaded
  - `brand/` - Unmodified originals of the new logo set (`mindquestlogo-ver2-0-01` and `-tag-01`, .svg and .png, 2000×2000 with large margins); the nav and footer SVGs are derived from these. The print sources (.eps/.psd/.ai/.pdf/.jpg) are deliberately not in the repo
  - `mindquest-wordmark.svg` - Logo with the "Unlock Your Mind, Conquer The Quest" tagline (cropped from `brand/…-tag-01.svg`), used in the footer on a white tile
  - `og-image.png` - 1200×630 social sharing card (`og:image` / `twitter:image`)
  - `2025/` - Downloadable 2025 prelims question paper and answer key (PDF)
  - `schools.json` - UAE school suggestions, loaded when a registration school field receives focus (see "School List")
  - `gecbta-loga.png` - GECBTA organizer logo
  - `ackaf-logo.png` - AKCAF organizer logo
  - `carrefour.png`, `almarai.png`, `romana-water.png`, `kidsventure.png`, `aster.png` - 2025 sponsor logos
  - `favicon/` - Favicon package and `site.webmanifest`; the icon is a clipped crop of the book-M / lightbulb-Q symbol from `brand/mindquestlogo-ver2-0-01.svg` on a white tile (not a redraw)
  - `pattern-01.png`, `gecbta-loga.jpg` - Brand source files, not referenced by the site (the old 2025 logo files were removed)
- `tests/`, `playwright.config.js`, `package.json`, `Makefile` - Browser tests and helper commands (see "Testing")
- `.github/workflows/deploy.yml` - Builds `dist` and deploys it to GitHub Pages on push to `main` or `master`, or manually (`workflow_dispatch`); both branches are allowed in the `github-pages` environment. The Pages artifact is named per run attempt (so "Re-run jobs" works) and deleted after the deploy. GitHub Pages publishes `index.html` and `ad.html` explicitly, the `assets/` tree, `widget/mq-widget.v1.js`, `CNAME`, `robots.txt`, `sitemap.xml` and `sw.js`. Assets are copied recursively, then `styles.css`, `script.js` and `sw.js` are minified into `dist`. Do not go back to a recursive HTML input; add public HTML pages explicitly after confirming they should be published. PDFs and `assets/schools.json` deploy under `assets/`. `docs/2026-design.html` is published explicitly by the workflow at `/docs/2026-design.html`; it is `noindex` and stays out of the sitemap
- `scripts/verify_dist.py` - Run by the deploy workflow: validates same-origin HTML / manifest / CSS / JS / service-worker precache references against `dist` and fails the deployment on missing files, so any new same-origin file the site references must exist under `assets/`

**Key Design System:**
- Brand colors: Oxford Blue (#0A2155), Minion Yellow (#F9D84B), Slate Gray (#4F4F4F), Sky Blue (#B3D4FC)
- Typography: Montserrat (headings, labels, buttons), Lato (body text)
- Responsive design with mobile-first approach
- Logo styling: The MindQuest logo is never recoloured, restyled or shadowed, and sits on paper or a white tile (never directly on Oxford Blue). Organizer logos sit on #F9D84B rounded squares for branding consistency; sponsor logos sit on plain white tiles
- Full reference: `docs/2026-design.html` (see "2026 Theme" below)

## Development Commands

This is a static HTML website with no build process. Development can be done by:

1. **Local Development:** Open `index.html` directly in a browser (the service worker only registers over HTTP)
2. **Live Server:** Use any HTTP server like Python's built-in server:
   ```bash
   python3 -m http.server 8000   # or: make serve
   ```
   or Node.js http-server:
   ```bash
   npx http-server
   ```

## Code Organization

**HTML Structure (index.html):**
- Inline SVG icon sprite (`<svg class="icon-library">`) at the top of `<body>`
- Skip link, cookie consent banner and scroll progress bar
- Semantic navigation with smooth scrolling links to all sections
- Hero (`#home`) with event overview, CTA buttons and the warm-up flash cards (real 2025 prelims questions; flip for the answer)
- Category ticker
- About (`#about`) with a bento of feature highlights and the 2025 recap strip
- Format (`#format`) with the three step cards, eligibility and house rules
- Dates (`#dates`) scoreboard — registration state, the official launch (date, venue) and the quiz day (date, venue)
- Prizes (`#prizes`) with the podium and special awards
- Archives (`#archives`) with the 2025 prelims PDFs, a click-to-load YouTube video and Instagram embeds
- Register (`#register`) — two-participant registration form, with an email alternative
- Partners (`#partners`) with GECBTA and AKCAF information and the 2025 sponsor wall
- FAQ (`#faq`) using native `<details>` accordions
- Contact (`#contact`) with contact information and message form
- Footer with organized navigation links

**JavaScript Features (assets/script.js):**
- Cookie consent and consent-gated Google Analytics loading (see "Analytics & Consent")
- Mobile navigation hamburger toggle (closes on outside click, Escape and resize)
- Smooth scrolling navigation with navbar offset (instant when reduced motion is requested)
- Scroll progress indicator, navbar scrolled state and active nav link highlighting
- Intersection Observer reveal animations with staggered siblings
- FAQ exclusive opening (fallback for browsers without `<details name>`)
- Lazy loading of Instagram `embed.js` when the archives near the viewport
- Click-to-load YouTube videos in the archives (`.video-facade`)
- Warm-up flash cards: flip, Previous and Next (`warmupQuestions`)
- Registration and contact forms: validation and submission to separate Google Apps Script endpoints
- Error handling for images

**CSS Features (assets/styles.css):**
- CSS custom properties for all colors, type, radii, borders and shadows
- Metric-matched fallback `@font-face` rules ("Montserrat Fallback", "Lato Fallback") so web font swaps do not shift the layout
- CSS Grid and Flexbox layouts for responsive design
- Responsive breakpoints at 1080px, 900px and 600px
- Hard offset shadows and 2px outlines (no gradients other than the dot grid, no blur, no soft shadows)
- Hover lift / press effects on buttons and cards
- Keyframes for the highlighter stroke, ticker, eyebrow pulse, buzzer bob and loading spinner
- `prefers-reduced-motion` support
- Scoreboard, podium, step card, ticker, FAQ, form and footer styling

## Content Management

**Event Information (MindQuest 2.0, 2026):**
- No cash prizes in 2026 (trophies and certificates only). MindQuest 2025 cash prizes are mentioned as history only, and the amounts are deliberately not published anywhere on the site (they invited disputes from parents) — do not add AED figures back
- Official launch: Sunday 8 November 2026, 3:00 PM, Sharjah Expo Centre (Sharjah Book Fair), Hall 07, Stall ZD4
- The quiz: Sunday 29 November 2026, prelims 2:30 PM and finals (Grand Finale) 5:00 PM, The Millennium School, Al Qusais (the poster says only "Dubai"; the user confirmed Al Qusais, shown as in the 2025 recap; no street address). Registration is open and limited to 120 teams, first come, first served: say so, never state how many places remain, and do not add a counter. Registration closes Tuesday 24 November 2026 (organiser, 4 Nov 2026). Both events are Event nodes in the JSON-LD (no end date, offers or performers). The quiz Event `startDate` is the 2:30 PM prelims start
- Organizers: GECBTA in association with AKCAF
- Target audience: Indian diaspora high school students (Grade 8-12 Indian / Year 9-13 British) in UAE
- MindQuest 2025 was held Oct 19, 2025 at The Millennium School, Al Qusais, Dubai

**Tagline:** the hero lead opens with the poster's line "UAE's Biggest High School Quiz for the Indian Diaspora", also used in the page title, meta, Open Graph and Twitter descriptions (the user wants this claim). Do not add other superlatives.

**Naming:** this edition is "MindQuest 2.0" everywhere in visible copy, including sentences that used to say "MindQuest 2026" (champions, registration, sponsorship). "2026" appears only as a plain year: the page title's trailing "2026", "the 2026 champions" and the © line. Last year's edition is "MindQuest 2025". Do not use "Season 1 / Season 2" or "'26". The navbar shows the new logo, which carries its own "2.0", so there is no separate badge.

**2026 Theme ("Quiz Board"):** light paper background, 2px Oxford Blue outlines with hard offset shadows, sections framed as quiz "Rounds", warm-up question card in the hero. `docs/2026-design.html` documents colour, typography, shape, layout, buttons, labels, cards, signature components, forms, motion, voice and accessibility; check it before adding or changing UI, and update it when the stylesheet changes.

**Warm-up flash cards:** the hero card is a deck of real questions from the MindQuest 2025 written prelims. The question is on the front; clicking, tapping or pressing Enter/Space flips it to the answer; Previous/Next move through the deck. It is deliberately not multiple choice, because the prelims are written-answer and an A/B/C/D card confused visitors.
- `warmupQuestions` in `assets/script.js` holds 24 of the paper's 30 questions (`n` is the number on the paper); questions 14, 16, 20, 23, 28 and 30 refer to pictures on the paper and are left out
- Question and answer text is copied from the PDFs in `assets/2025/`, including the paper's own punctuation and spelling — do not paraphrase it. The first question is also written into `index.html` so the card renders without JavaScript
- The flip control is a real `<button>` with `aria-expanded`; the answer is announced through the `#qLive` live region and is only written into the page while the card is flipped
- Both faces share one grid cell and `.flashcard-face` has a min-height sized for the longest question at each breakpoint, so the card never changes height (a Playwright test checks this); re-check the min-heights if longer questions are added
- With `prefers-reduced-motion` the faces swap without the rotation

**Icons:** inline SVG sprite, no icon font. Symbols are defined once in `<svg class="icon-library">` at the top of `<body>` in `index.html` and used as `<svg class="icon" aria-hidden="true"><use href="#icon-name"></use></svg>`. Icons inherit `currentColor` and size with `font-size`. To add an icon, add a `<symbol id="icon-…" viewBox="0 0 24 24">` to the sprite (and to the copy in `docs/2026-design.html` if the design doc needs it).

**School List (`assets/schools.json`):**
- JSON array of 225 UAE schools as strings, each exactly `School Name - Area - EMIRATE` (emirate in capitals, one of the seven), unique and sorted case-insensitively; keep that format and order when editing
- Registration loads it on the first school-field focus and shares one native datalist between both participants
- The list is not exhaustive, especially outside Dubai, so the autocomplete must still accept a free-text school that is not on the list
- It is precached in `STATIC_CACHE_URLS` in `sw.js`; a failed suggestions fetch still allows free-text school entry

**Archives:** `#archives` holds three things.
- Downloads: `assets/2025/mindquest-2025-prelims-question-paper.pdf` and `mindquest-2025-prelims-answer-key.pdf`, also linked from the warm-up card
- Videos: each video is an `<a class="video-facade">` in `index.html` — a plain link to YouTube with a lazy-loaded thumbnail. `assets/script.js` replaces it with a `youtube-nocookie.com` iframe on click, so no YouTube code loads before that. To add a video, copy the block and change the video ID in `href`, `data-video-id` and the thumbnail URL, set `data-video-title` and `title` to the video's real title (from `https://www.youtube.com/oembed?url=…&format=json`), and write a short one-line caption as the visible text. A single video is shown wide and centred; two or more fall into the three-column grid. `https://www.youtube-nocookie.com` must stay in the CSP `frame-src`
- Photos: official Instagram post embeds (`blockquote.instagram-media` with a permalink); `embed.js` is lazy-loaded by `assets/script.js`. To swap photos, change the permalinks — no image files are stored locally. Instagram must stay allowed in the CSP `script-src` and `frame-src`

**Hall of Fame:** planned but deferred until the organisers supply the winners' names and schools; do not add the section or guess names.

**Sections Included:**
- Hero with event overview, quick actions and warm-up flash cards
- About with competition benefits and 2025 recap
- Format with stages, eligibility and rules
- Dates scoreboard (launch and quiz day, with venues)
- Prizes with podium (a trophy for each of the three places) and one special award (Certificates of Excellence); Best School Delegation was removed at the user's request, do not add it back
- Archives with 2025 prelims PDFs, video and Instagram embeds
- Register band with the two-participant registration form
- Partners with GECBTA and AKCAF information, 2025 sponsors and sponsorship CTA
- FAQ with common questions and answers (mirrored in the JSON-LD `FAQPage`; keep both in sync)
- Contact with multiple contact methods and message form

**Form Handling:**
- Two forms: registration (`#registrationForm`, in the register band) and contact (`#contactForm`)
- Client-side validation with visual feedback and inline error messages; status messages are announced through live regions
- Registration posts `FormData` to `registrationEndpoint`, recovered from the `2025` branch; contact posts JSON (sent as `text/plain`, `redirect: "follow"`) to `formEndpoint`. Both use `mode: "no-cors"`. The response is opaque, so the page can only detect a network failure, not a rejection by either script
- Contact form rules: name 2–50 characters, subject 3–100, message 10–1000, with a remaining-characters counter under subject and message
- No test may send a real request to that endpoint — it writes to the organisers' live sheet/inbox. The Playwright tests stub `fetch` in the page

**Registration:**
- Restored from the parent of `5b5f24c` (the commit that closed 2025 registration); there are no Git tags. The historical edition is the `2025` branch
- Each participant supplies first/last name, email, UAE phone, date of birth, Emirates ID, school, curriculum and grade. Other curricula require specification. British grades display Years 9–13; their submitted grade values remain 8–12 alongside the curriculum
- Eligibility follows the published grade range. Do not reintroduce the old 2007–2012 birth-date limits without confirmed organiser requirements
- UAE phone input accepts local and international formats and is submitted as normalized +971. Emirates IDs accept spaces or hyphens, are submitted as 15 plain digits, and are not checksum-validated (EIDs do carry a check digit; enforcing it is possible later if verified against real IDs). Date-of-birth checks enforce only an 8–25-year sanity range — it is not an eligibility rule and requires organiser confirmation
- Permission consent is required; duplicate Emirates IDs are rejected. When a field is corrected, its inline error and its entry in the validation summary clear immediately. The honeypot silently drops the submission and shows a neutral message that does not claim it was sent. Submission is guarded against double clicks and has a 30-second timeout
- The payload keeps the 2025 participant field names, includes `edition`, and adds legacy `school` and `grade` fields. When participants differ, those legacy fields join their values with ` / `. Verify that the deployed script accepts these aggregates and retains both participants’ school/curriculum data
- The `appscript-*.js` files beside this repo are historical copies, not proof of the active deployment. One copy rejects dates outside 2007–2011 and reads only shared `school`/`grade` fields. Before publishing registration, the organiser must confirm or update the deployment, its sheet destination, eligibility validation and column mapping for MindQuest 2.0. No live submission has been made from this codebase
- A completed network request shows "Submission sent" and asks visitors to wait for organiser confirmation; it does not claim the sheet accepted the entry. Failures preserve the form and offer email. Without JavaScript the form uses a `mailto:` action
- Registration is OPEN (user decision, November 2026): the form is the live action in `#register`, every CTA says "Register now", and the page says nothing like "not open yet" or "get notified". Still unverified: that the deployed Apps Script accepts the aggregate fields, its sheet destination and its eligibility validation. Before deploying, an organiser must submit ONE clearly labelled test registration with fake data from the live page and confirm the row arrives in the sheet
- "Register now" buttons scroll to `#register` and focus its heading. Submission tracking runs only with accepted analytics consent

**Analytics & Consent:**
- Google Analytics 4 (`G-NVLZZP28ME`) is loaded by `loadAnalytics()` in `assets/script.js` only after the visitor clicks "Accept" in the cookie banner, or on later visits when `localStorage.cookieConsent` is `"accepted"`
- First-time visitors who ignore or decline the banner send nothing to Google; there is no `gtag.js` script tag in `index.html`
- `trackCTAClick()` and the warm-up card events only push to `dataLayer`; they are sent if and when analytics loads during that page view

**Service Worker (sw.js):**
- Network-first for HTML, stale-while-revalidate for CSS/JS/images/fonts; old caches are deleted on activation
- Versioning: on every release run `make bump-version` (interactive patch/minor/major) or `make bump-version-to VERSION=x.y.z`. `sw.js` is the single source of the version (`// Version` comment and `CACHE_NAME`; the precache URLs derive from it), and the target writes the same value to the `?v=` query on `styles.css` and `script.js` in `index.html` and on `styles.css` in `docs/2026-design.html` (it fails if any of them was not updated). Do not edit one without the other: the query is what stops returning visitors from getting new HTML with stale cached CSS/JS
- Every path in `STATIC_CACHE_URLS` must exist, otherwise the worker fails to install

**SEO:**
- One `h1` (hero), one `h2` per section, `h3` below
- Title, meta description (keep it ≤ 160 characters), canonical, `og:url`, `sitemap.xml` and `robots.txt` all use `https://mindquestquiz.com/`
- Update `<lastmod>` in `sitemap.xml` when content changes
- `og:image` / `twitter:image` point to `assets/og-image.png` (1200×630)
- JSON-LD (`WebSite`, two `Organization` nodes, two `Event` nodes for the launch and the quiz, `FAQPage`): the Event dates and venues are confirmed; do not add an end date, offers or performers, and keep them in step with the visible Dates section. `startDate` carries the +04:00 offset
- `ad.html` and `docs/2026-design.html` are `noindex`

**Performance:**
- Target: Lighthouse Performance ≥ 95 on both the mobile and desktop presets, with Accessibility, Best Practices and SEO at 100
- Fonts load without blocking render (`rel="preload" as="style"` + `onload`) with `display=swap`; the three above-the-fold font files are preloaded by URL, so re-check those URLs against the Google Fonts CSS if the font families or weights change
- Third-party scripts (Analytics, Instagram, YouTube) are never loaded during initial render

## Testing

- Playwright smoke suite in `tests/e2e/`, configured by `playwright.config.js` (desktop and mobile device matrix, always starts its own static server on port 8001 and fails if the port is already in use, rather than reusing a server that may be serving another directory). Run `npm install`, `npx playwright install chromium firefox webkit`, then `npm test` (or `make test`, `npm run test:mobile`, `npm run test:desktop`)
- `tests/e2e/site.spec.js` covers the page, registration flow and logo assets; `tests/e2e/forms.spec.js` covers field-level validation for both forms (phone and Emirates ID normalisation, date-of-birth range, error clearing, honeypot, contact limits)
- Reports and screenshots are written to `tests/artifacts/`
- `tests/specs/` holds the older Mocha/Selenium suite for the 2025 registration form (`npm run test:legacy`); that form no longer exists on the page
- See `tests/README.md` for details

## Styling Guidelines

- Uses CSS custom properties for consistent theming across all components; never use raw hex values in rules
- Mobile-first responsive design with optimized layouts for all screen sizes
- Consistent spacing and typography scale throughout
- Card-based components with 2px outlines, hard offset shadows and hover lift
- Minion Yellow is the highlighter: one primary yellow action per view; text on yellow is always Oxford Blue
- Organizer logo branding with yellow rounded background styling
- Dot-grid texture on the hero, dark sections and the register band
- Color-coded sections for visual hierarchy (paper → sky soft → paper → ink)
- Buttons and menu items are at least 44px tall; all interactive elements have a visible focus style

## External Dependencies

- Google Fonts: Montserrat (600–900) and Lato (400, 700, 900)
- Google Analytics 4 (`gtag.js`), loaded only after cookie consent
- Instagram `embed.js` for the archives, lazy-loaded
- YouTube (`youtube-nocookie.com` iframe and `i.ytimg.com` thumbnail) for archive videos, loaded only on click
- Separate Google Apps Script endpoints for registration and contact
- No icon font (Font Awesome was removed), no JavaScript frameworks and no build tools required
- The Content-Security-Policy meta tag in `index.html` lists every allowed origin; update it when adding a dependency
