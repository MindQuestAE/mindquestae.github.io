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
  - `mindquest-logo-nav.png` - Full MindQuest logo sized for the navbar (178×112, shown at 56px tall, preloaded); a resized copy of `mindquest-wordmark.png`, artwork unchanged
  - `mindquest-logomark.png` - Logomark; no longer used by the page
  - `mindquest-wordmark.png` - Cropped wordmark used in the footer
  - `og-image.png` - 1200×630 social sharing card (`og:image` / `twitter:image`)
  - `2025/` - Downloadable 2025 prelims question paper and answer key (PDF)
  - `schools.json` - UAE school list for the future registration form's school autocomplete (not read by the site yet, see "School List")
  - `gecbta-loga.png` - GECBTA organizer logo
  - `ackaf-logo.png` - AKCAF organizer logo
  - `carrefour.png`, `almarai.png`, `romana-water.png`, `kidsventure.png`, `aster.png` - 2025 sponsor logos
  - `favicon/` - Favicon package and `site.webmanifest`
  - `mindquestlogowithtag-01.png`, `pattern-01.png`, `gecbta-loga.jpg` - Brand source files, not referenced by the site
- `tests/`, `playwright.config.js`, `package.json`, `Makefile` - Browser tests and helper commands (see "Testing")
- `.github/workflows/deploy.yml` - Builds `dist` and deploys it to GitHub Pages on push to `main`. GitHub Pages publishes `index.html` and `ad.html` explicitly, the `assets/` tree, `widget/mq-widget.v1.js`, `CNAME`, `robots.txt`, `sitemap.xml` and `sw.js`. Assets are copied recursively, then `styles.css`, `script.js` and `sw.js` are minified into `dist`. Do not go back to a recursive HTML input; add public HTML pages explicitly after confirming they should be published. PDFs and `assets/schools.json` deploy under `assets/`. `docs/2026-design.html` is published explicitly by the workflow at `/docs/2026-design.html`; it is `noindex` and stays out of the sitemap
- `scripts/verify_dist.py` - Run by the deploy workflow: validates same-origin HTML / manifest / CSS / JS / service-worker precache references against `dist` and fails the deployment on missing files, so any new same-origin file the site references must exist under `assets/`

**Key Design System:**
- Brand colors: Oxford Blue (#0A2155), Minion Yellow (#F9D84B), Slate Gray (#4F4F4F), Sky Blue (#B3D4FC)
- Typography: Montserrat (headings, labels, buttons), Lato (body text)
- Responsive design with mobile-first approach
- Logo styling: Organizer logos sit on #F9D84B rounded squares for branding consistency; sponsor logos sit on plain white tiles
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
- Dates (`#dates`) scoreboard — every value is still "To be announced"
- Prizes (`#prizes`) with the podium and special awards
- Archives (`#archives`) with the 2025 prelims PDFs, a click-to-load YouTube video and Instagram embeds
- Register (`#register`) call-to-action band — registration is not open, so there is no registration form; the band holds the "Get notified" email sign-up form, with email and Instagram links as alternatives
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
- "Get notified" sign-up form and contact form: validation and submission to a Google Apps Script endpoint
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
- Dates and venue: to be announced (marked `TODO(2026)` in `index.html`; add an Event node to the JSON-LD once confirmed)
- Organizers: GECBTA in association with AKCAF
- Target audience: Indian diaspora high school students (Grade 8-12 Indian / Year 9-13 British) in UAE
- MindQuest 2025 was held Oct 19, 2025 at The Millennium School, Al Qusais, Dubai

**Naming:** this edition is "MindQuest 2.0" everywhere in visible copy, including sentences that used to say "MindQuest 2026" (champions, registration, sponsorship). "2026" appears only as a plain year: the page title's trailing "2026", "the 2026 champions", the © line and the search keywords. Last year's edition is "MindQuest 2025". Do not use "Season 1 / Season 2" or "'26". The navbar shows the full logo plus the yellow "2.0" badge.

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
- Nothing on the site reads it yet: 2026 registration is not open and there is no school field. It is the data source for the school autocomplete when the registration form returns (in 2025 this was an inline `schoolsList` array in `assets/script.js`)
- The list is not exhaustive, especially outside Dubai, so the autocomplete must still accept a free-text school that is not on the list
- Fetch it lazily when wiring it up, and add it to `STATIC_CACHE_URLS` in `sw.js` only once it is actually used
- It deploys with the rest of `assets/`, so the site can fetch it in production once it is wired up

**Archives:** `#archives` holds three things.
- Downloads: `assets/2025/mindquest-2025-prelims-question-paper.pdf` and `mindquest-2025-prelims-answer-key.pdf`, also linked from the warm-up card
- Videos: each video is an `<a class="video-facade">` in `index.html` — a plain link to YouTube with a lazy-loaded thumbnail. `assets/script.js` replaces it with a `youtube-nocookie.com` iframe on click, so no YouTube code loads before that. To add a video, copy the block and change the video ID in `href`, `data-video-id` and the thumbnail URL, set `data-video-title` and `title` to the video's real title (from `https://www.youtube.com/oembed?url=…&format=json`), and write a short one-line caption as the visible text. A single video is shown wide and centred; two or more fall into the three-column grid. `https://www.youtube-nocookie.com` must stay in the CSP `frame-src`
- Photos: official Instagram post embeds (`blockquote.instagram-media` with a permalink); `embed.js` is lazy-loaded by `assets/script.js`. To swap photos, change the permalinks — no image files are stored locally. Instagram must stay allowed in the CSP `script-src` and `frame-src`

**Hall of Fame:** planned but deferred until the organisers supply the winners' names and schools; do not add the section or guess names.

**Sections Included:**
- Hero with event overview, quick actions and warm-up flash cards
- About with competition benefits and 2025 recap
- Format with stages, eligibility and rules
- Dates scoreboard (to be announced)
- Prizes with podium (a trophy for each of the three places) and two special awards (Best School Delegation, Certificates of Excellence)
- Archives with 2025 prelims PDFs, video and Instagram embeds
- Register band with the "Get notified" email sign-up
- Partners with GECBTA and AKCAF information, 2025 sponsors and sponsorship CTA
- FAQ with common questions and answers (mirrored in the JSON-LD `FAQPage`; keep both in sync)
- Contact with multiple contact methods and message form

**Form Handling:**
- Two forms: the "Get notified" sign-up (`#notifyForm`, in the register band) and the contact form (`#contactForm`)
- Client-side validation with visual feedback and inline error messages; status messages are announced through live regions
- Both post JSON to the same Google Apps Script web app (`formEndpoint` in `assets/script.js`) with `mode: "no-cors"`. The response is opaque, so the page can only detect a network failure, not a rejection by the script
- No test may send a real request to that endpoint — it writes to the organisers' live sheet/inbox. The Playwright tests stub `fetch` in the page

**"Get notified" sign-up:**
- Fields: email (required), name and school (optional), plus a hidden honeypot (`website`); a filled honeypot shows success and sends nothing
- It is sent as an ordinary contact message so the deployed script needs no change: `{ name, email, subject: "Notify me — MindQuest 2.0 registration", message: "Please notify me when MindQuest 2.0 registration opens. School: …" }`. `name` is `"Not given"` when left empty. Sign-ups therefore land wherever contact messages land; filter on that subject to build the mailing list
- The Apps Script source for this endpoint is not in the repo (the `appscript-*.js` files kept beside the repo are the 2025 registration script, a different deployment), so what it validates server-side is unknown and the live round-trip has not been tested from this codebase. After deploying, submit the form once and confirm the entry arrives
- If the request fails, the status shows a `mailto:` fallback; without JavaScript the form's `action` is the same `mailto:` address
- "Get notified" buttons scroll to `#register` and move focus to its heading
- The success event is sent to Analytics only when cookie consent was accepted

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
- JSON-LD (`WebSite`, two `Organization` nodes, `FAQPage`) must not state 2026 dates or venue until they are confirmed
- `ad.html` and `docs/2026-design.html` are `noindex`

**Performance:**
- Target: Lighthouse Performance ≥ 95 on both the mobile and desktop presets, with Accessibility, Best Practices and SEO at 100
- Fonts load without blocking render (`rel="preload" as="style"` + `onload`) with `display=swap`; the three above-the-fold font files are preloaded by URL, so re-check those URLs against the Google Fonts CSS if the font families or weights change
- Third-party scripts (Analytics, Instagram, YouTube) are never loaded during initial render

## Testing

- Playwright smoke suite in `tests/e2e/`, configured by `playwright.config.js` (desktop and mobile device matrix, always starts its own static server on port 8001 and fails if the port is already in use, rather than reusing a server that may be serving another directory). Run `npm install`, `npx playwright install chromium firefox webkit`, then `npm test` (or `make test`, `npm run test:mobile`, `npm run test:desktop`)
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
- Google Apps Script endpoint for the sign-up and contact forms
- No icon font (Font Awesome was removed), no JavaScript frameworks and no build tools required
- The Content-Security-Policy meta tag in `index.html` lists every allowed origin; update it when adding a dependency
