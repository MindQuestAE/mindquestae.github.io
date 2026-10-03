# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. `AGENTS.md` is a symlink to this file.

## Project Overview

This is a static website for MindQuest, a General Knowledge Quiz Competition for Indian-diaspora high school students in the UAE, now in its second season (2026, branded "MindQuest 2.0"). The project is a single-page HTML application with separated CSS and JavaScript files, deployed to GitHub Pages at https://mindquestquiz.com (`CNAME`).

## Architecture

**Modular File Structure:**
- `index.html` - Main HTML structure with semantic sections, SEO meta, JSON-LD and the inline SVG icon sprite
- `assets/styles.css` - External CSS file with complete styling (the implementation of the design system)
- `assets/script.js` - External JavaScript file with all functionality
- `sw.js` - Service worker (caching for repeat visits, see "Service Worker" below)
- `robots.txt`, `sitemap.xml`, `CNAME` - SEO / hosting files
- `docs/2026-design.html` - Living design system reference for the 2026 theme (rendered with the live stylesheet, `noindex`)
- `ad.html` + `widget/mq-widget.v1.js` - Embeddable banner snippet (documented in `WIDGET.md`); `widget/` is not copied by the deploy workflow today
- `assets/` - Images and favicon resources
  - `mindquest-logomark.png` - Navigation logo (preloaded)
  - `mindquest-wordmark.png` - Cropped wordmark used in the footer
  - `og-image.png` - 1200×630 social sharing card (`og:image` / `twitter:image`)
  - `schools.json` - UAE school list for the future registration form's school autocomplete (not read by the site yet, see "School List")
  - `gecbta-loga.png` - GECBTA organizer logo
  - `ackaf-logo.png` - AKCAF organizer logo
  - `carrefour.png`, `almarai.png`, `romana-water.png`, `kidsventure.png`, `aster.png` - Season 1 sponsor logos
  - `favicon/` - Favicon package and `site.webmanifest`
  - `mindquestlogowithtag-01.png`, `pattern-01.png`, `gecbta-loga.jpg` - Brand source files, not referenced by the site
- `tests/`, `playwright.config.js`, `package.json`, `Makefile` - Browser tests and helper commands (see "Testing")
- `.github/workflows/deploy.yml` - Minifies HTML/CSS/JS and deploys to GitHub Pages on push to `main`. It copies only `assets/*.png`, `assets/*.jpg` and `assets/favicon/`; any other asset type (JSON, fonts, SVG, `widget/`) needs a new copy step

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
- Hero (`#home`) with event overview, CTA buttons and the interactive warm-up quiz card
- Category ticker
- About (`#about`) with a bento of feature highlights and the Season 1 recap strip
- Format (`#format`) with the three step cards, eligibility and house rules
- Dates (`#dates`) scoreboard — every value is still "To be announced"
- Prizes (`#prizes`) with the podium and special awards
- Gallery (`#gallery`) with Instagram embeds
- Register (`#register`) call-to-action band — registration is not open, so there is no registration form; the band links to email and Instagram
- Partners (`#partners`) with GECBTA and AKCAF information and the Season 1 sponsor wall
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
- Lazy loading of Instagram `embed.js` when the gallery nears the viewport
- Warm-up quiz card (`warmupQuestions`)
- Contact form validation and submission to a Google Apps Script endpoint
- Error handling for images

**CSS Features (assets/styles.css):**
- CSS custom properties for all colors, type, radii, borders and shadows
- Metric-matched fallback `@font-face` rules ("Montserrat Fallback", "Lato Fallback") so web font swaps do not shift the layout
- CSS Grid and Flexbox layouts for responsive design
- Responsive breakpoints at 1080px, 900px and 600px
- Hard offset shadows and 2px outlines (no gradients other than the dot grid, no blur, no soft shadows)
- Hover lift / press effects on buttons, cards and quiz options
- Keyframes for the highlighter stroke, ticker, eyebrow pulse, buzzer bob and loading spinner
- `prefers-reduced-motion` support
- Scoreboard, podium, step card, ticker, FAQ, form and footer styling

## Content Management

**Event Information (2026 / Season 2):**
- No cash prizes in 2026 (trophies, medals, certificates only); 2025 cash prizes (AED 5,000/3,000/2,000) are shown as history only
- Dates and venue: to be announced (marked `TODO(2026)` in `index.html`; add an Event node to the JSON-LD once confirmed)
- Organizers: GECBTA in association with AKCAF
- Target audience: Indian diaspora high school students (Grade 8-12 Indian / Year 9-13 British) in UAE
- Season 1 (2025) was held Oct 19, 2025 at The Millennium School, Al Qusais, Dubai

**2026 Theme ("Quiz Board"):** light paper background, 2px Oxford Blue outlines with hard offset shadows, sections framed as quiz "Rounds", interactive warm-up question card in the hero (questions live in `warmupQuestions` in `assets/script.js`). `docs/2026-design.html` documents colour, typography, shape, layout, buttons, labels, cards, signature components, forms, motion, voice and accessibility; check it before adding or changing UI, and update it when the stylesheet changes.

**Icons:** inline SVG sprite, no icon font. Symbols are defined once in `<svg class="icon-library">` at the top of `<body>` in `index.html` and used as `<svg class="icon" aria-hidden="true"><use href="#icon-name"></use></svg>`. Icons inherit `currentColor` and size with `font-size`. To add an icon, add a `<symbol id="icon-…" viewBox="0 0 24 24">` to the sprite (and to the copy in `docs/2026-design.html` if the design doc needs it).

**School List (`assets/schools.json`):**
- JSON array of 225 UAE schools as strings, each exactly `School Name - Area - EMIRATE` (emirate in capitals, one of the seven), unique and sorted case-insensitively; keep that format and order when editing
- Nothing on the site reads it yet: 2026 registration is not open and there is no school field. It is the data source for the school autocomplete when the registration form returns (in 2025 this was an inline `schoolsList` array in `assets/script.js`)
- The list is not exhaustive, especially outside Dubai, so the autocomplete must still accept a free-text school that is not on the list
- Fetch it lazily when wiring it up, and add it to `STATIC_CACHE_URLS` in `sw.js` only once it is actually used
- `.github/workflows/deploy.yml` does not copy it today (see Architecture); add a copy step for `assets/schools.json` before the site fetches it in production

**Gallery:** `#gallery` uses official Instagram post embeds (`blockquote.instagram-media` with a permalink); `embed.js` is lazy-loaded by `assets/script.js`. To swap photos, change the permalinks — no image files are stored locally. Instagram must stay allowed in the CSP `script-src` and `frame-src`.

**Sections Included:**
- Hero with event overview, quick actions and warm-up quiz
- About with competition benefits and Season 1 recap
- Format with stages, eligibility and rules
- Dates scoreboard (to be announced)
- Prizes with podium and special awards
- Gallery with Instagram embeds
- Register band (notify by email / Instagram; no form yet)
- Partners with GECBTA and AKCAF information, Season 1 sponsors and sponsorship CTA
- FAQ with common questions and answers (mirrored in the JSON-LD `FAQPage`; keep both in sync)
- Contact with multiple contact methods and message form

**Form Handling:**
- Contact form for inquiries and support (the only form on the page)
- Client-side validation with visual feedback and inline error messages
- Success/error status messaging
- Required field validation before submission

**Analytics & Consent:**
- Google Analytics 4 (`G-NVLZZP28ME`) is loaded by `loadAnalytics()` in `assets/script.js` only after the visitor clicks "Accept" in the cookie banner, or on later visits when `localStorage.cookieConsent` is `"accepted"`
- First-time visitors who ignore or decline the banner send nothing to Google; there is no `gtag.js` script tag in `index.html`
- `trackCTAClick()` and the warm-up quiz events only push to `dataLayer`; they are sent if and when analytics loads during that page view

**Service Worker (sw.js):**
- Network-first for HTML, stale-while-revalidate for CSS/JS/images/fonts; old caches are deleted on activation
- Versioning: on every release run `make bump-version` (interactive patch/minor/major) or `make bump-version-to VERSION=x.y.z`. `sw.js` is the single source of the version (`// Version` comment and `CACHE_NAME`; the precache URLs derive from it), and the target writes the same value to the `?v=` query on `styles.css` and `script.js` in `index.html`. Do not edit one without the other: the query is what stops returning visitors from getting new HTML with stale cached CSS/JS
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
- Third-party scripts (Analytics, Instagram) are never loaded during initial render

## Testing

- Playwright smoke suite in `tests/e2e/`, configured by `playwright.config.js` (desktop and mobile device matrix, starts its own static server on port 8001). Run `npm install`, `npx playwright install chromium firefox webkit`, then `npm test` (or `make test`, `npm run test:mobile`, `npm run test:desktop`)
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
- Instagram `embed.js` for the gallery, lazy-loaded
- Google Apps Script endpoint for the contact form
- No icon font (Font Awesome was removed), no JavaScript frameworks and no build tools required
- The Content-Security-Policy meta tag in `index.html` lists every allowed origin; update it when adding a dependency
