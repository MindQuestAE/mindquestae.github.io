const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const runtimeFailures = new WeakMap();
const instagramRequests = new WeakMap();
const isMobileProject = (name) => /iPad|iPhone|Pixel|Galaxy/.test(name);

function isFilteredThirdPartyConsoleNoise(message) {
  const url = message.location().url || '';
  // Third-party requests can fail because of consent, throttling, or the test network;
  // those vendor-owned diagnostics do not indicate an uncaught error in our page code.
  return /instagram\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|googletagmanager\.com|google-analytics\.com/i.test(url);
}

test.beforeEach(async ({ page }) => {
  const failures = [];
  const instagram = [];
  runtimeFailures.set(page, failures);
  instagramRequests.set(page, instagram);
  page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' && !isFilteredThirdPartyConsoleNoise(message)) {
      failures.push(`console: ${message.text()} (${message.location().url || 'unknown URL'})`);
    }
  });
  page.on('request', (request) => {
    if (request.url() === 'https://www.instagram.com/embed.js') instagram.push(request.url());
  });

  // Keep embed behavior observable without depending on Instagram's availability or content.
  await page.route('https://www.instagram.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  );
  const response = await page.goto('/');
  expect(response && response.status()).toBe(200);
});

test('document has the expected SEO and language basics', async ({ page }) => {
  await expect(page).toHaveTitle(/\S/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//);
  await expect(page.locator('html')).toHaveAttribute('lang', /\S/);
});

test('loads without uncaught runtime or first-party console errors', async ({ page }) => {
  await page.waitForTimeout(1000);
  expect(runtimeFailures.get(page)).toEqual([]);
});

test('has no horizontal overflow', async ({ page }) => {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document, `document width ${dimensions.document}px exceeds viewport ${dimensions.viewport}px`).toBeLessThanOrEqual(dimensions.viewport);
});

test('all images have alt text and load after entering view', async ({ page }) => {
  const images = page.locator('img');
  const count = await images.count();
  for (let index = 0; index < count; index += 1) {
    const image = images.nth(index);
    const description = await image.getAttribute('alt');
    expect(description, `img ${index} (${await image.getAttribute('src')}) has no alt attribute`).not.toBeNull();
    await image.scrollIntoViewIfNeeded();
    await expect.poll(async () => image.evaluate((element) => element.complete && element.naturalWidth > 0), {
      message: `img ${index} (${await image.getAttribute('src')}) did not load`,
    }).toBe(true);
  }
});

test('all in-page links target an existing id', async ({ page }) => {
  const missing = await page.locator('a[href^="#"]').evaluateAll((links) =>
    links
      .map((link) => link.getAttribute('href'))
      .filter((href) => href && href !== '#' && !document.getElementById(decodeURIComponent(href.slice(1)))),
  );
  expect(missing).toEqual([]);
});

test('primary navigation links bring their sections into view', async ({ page }, testInfo) => {
  const links = page.locator('#navMenu a[href^="#"]:not([href="#register"])');
  const hrefs = await links.evaluateAll((elements) => elements.map((element) => element.getAttribute('href')));
  // The consent dialog is intentionally interactive; dismiss it before exercising every nav item.
  const declineCookies = page.getByRole('button', { name: 'Decline' });
  if (await declineCookies.isVisible()) await declineCookies.click();
  for (const href of hrefs) {
    if (!href || href === '#') continue;
    if (isMobileProject(testInfo.project.name)) {
      const toggle = page.locator('#hamburger');
      if (await toggle.isVisible()) await toggle.click();
    }
    await page.locator(`#navMenu a[href="${href}"]`).click();
    await expect(page.locator(decodeURIComponent(href))).toBeInViewport({ ratio: 0.05 });
  }
});

test('mobile menu opens, closes, and updates its expanded state', async ({ page }, testInfo) => {
  test.skip(!isMobileProject(testInfo.project.name));
  const toggle = page.locator('#hamburger');
  const menu = page.locator('#navMenu');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(menu.getByRole('link', { name: 'About' })).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await menu.getByRole('link', { name: 'About' }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('desktop navigation is visible without a toggle', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name));
  await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'About' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
});

test('mobile navigation and primary actions meet 44px tap target minimums', async ({ page }, testInfo) => {
  test.skip(!isMobileProject(testInfo.project.name));
  const menuButton = page.locator('#hamburger');
  const primaryButton = page.getByRole('link', { name: /Get notified/ }).first();
  for (const target of [menuButton, primaryButton]) {
    const box = await target.boundingBox();
    expect(box, 'tap target should have a visible box').not.toBeNull();
    expect(box.width, 'tap target width').toBeGreaterThanOrEqual(44);
    expect(box.height, 'tap target height').toBeGreaterThanOrEqual(44);
  }
});

test('flash card flips to the answer and back, and Next/Previous move through the deck', async ({ page }) => {
  const question = page.locator('#qText');
  const card = page.locator('#qFlip');
  const back = page.locator('#qBack');
  await expect(page.locator('#quizCard')).toContainText('MindQuest 2025');
  await expect(page.locator('#quizCard .quiz-opt')).toHaveCount(0);
  await expect(question).toHaveText('Under what professional name is rapper Sooraj Cherukat known in the music and entertainment industry?');
  await expect(page.locator('#quizCard')).not.toContainText('Hanumankind');
  await expect(card).toHaveAttribute('aria-expanded', 'false');
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(card).toHaveAttribute('aria-expanded', 'true');
  await expect(back).toContainText('Hanumankind');
  await expect(back).toBeVisible();
  await expect(page.locator('#qLive')).toHaveText('Answer: Hanumankind');
  await expect(page.locator('#qLive')).toHaveAttribute('aria-live', 'polite');
  await page.keyboard.press('Space');
  await expect(card).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#quizCard')).not.toContainText('Hanumankind');
  await card.click();
  await expect(back).toContainText('Hanumankind');
  await page.locator('#qNext').click();
  await expect(page.locator('#qNum')).toHaveText('2');
  await expect(card).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#quizCard')).not.toContainText('Hanumankind');
  await expect(page.locator('#quizCard')).not.toContainText('Mickey');
  await card.click();
  await expect(back).toContainText('Mickey');
  await page.locator('#qPrev').click();
  await expect(page.locator('#qNum')).toHaveText('1');
  await page.locator('#qPrev').click();
  await expect(page.locator('#qNum')).toHaveText('29');
});

test('flash card deck cycles through every question, keeps its height and never shows an answer before the flip', async ({ page }) => {
  const seen = new Set();
  const heights = new Set();
  for (let index = 0; index < 24; index += 1) {
    seen.add(await page.locator('#qNum').innerText());
    await expect(page.locator('#qAnswerText')).toHaveText('');
    heights.add(Math.round((await page.locator('#quizCard').boundingBox()).height));
    await page.locator('#qFlip').click();
    await expect(page.locator('#qAnswerText')).not.toHaveText('');
    heights.add(Math.round((await page.locator('#quizCard').boundingBox()).height));
    await page.locator('#qNext').click();
  }
  expect(seen.size).toBe(24);
  expect(Math.max(...heights) - Math.min(...heights), `card heights ${[...heights]}`).toBeLessThanOrEqual(1);
  await expect(page.locator('#qNum')).toHaveText('1');
});

test('flash card swaps faces without rotating when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#qFlip').click();
  await expect(page.locator('#qBack')).toBeVisible();
  await expect(page.locator('#qFlip .flashcard-front')).toBeHidden();
  expect(await page.locator('#qFlip .flashcard-inner').evaluate((element) => getComputedStyle(element).transform)).toBe('none');
});

test('2025 prelims PDFs are linked from the card and the Archives and resolve as PDFs', async ({ page, request }) => {
  const cardLinks = await page.locator('#quizCard a[href$=".pdf"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  const archiveLinks = await page.locator('#archives a[href$=".pdf"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(cardLinks).toHaveLength(2);
  expect([...archiveLinks].sort()).toEqual([...cardLinks].sort());
  for (const href of cardLinks) {
    const response = await request.get(href.replace(/^\.\//, '/'));
    expect(response.status(), href).toBe(200);
    expect(response.headers()['content-type'], href).toContain('application/pdf');
    expect((await response.body()).subarray(0, 5).toString(), href).toBe('%PDF-');
  }
});

test('Archives is in the primary navigation', async ({ page }) => {
  const link = page.locator('#navMenu a[href="#archives"]');
  await expect(link).toHaveCount(1);
  await expect(link).toHaveText('Archives');
  await expect(page.locator('#archives h2')).toHaveText('The archives.');
  await expect(page.locator('#archives .instagram-media')).toHaveCount(6);
});

test('archive video makes no YouTube request until it is clicked, then loads the privacy-enhanced player', async ({ page }) => {
  const youtubeRequests = [];
  await page.route(/youtube(-nocookie)?\.com|ytimg\.com/, (route) => {
    const url = route.request().url();
    if (!/ytimg\.com/.test(url)) youtubeRequests.push(url);
    return route.fulfill({ status: 200, contentType: /ytimg/.test(url) ? 'image/jpeg' : 'text/html', body: '' });
  });
  await page.reload();
  const declineCookies = page.getByRole('button', { name: 'Decline' });
  if (await declineCookies.isVisible()) await declineCookies.click();
  const facade = page.locator('#archives .video-facade');
  await expect(facade).toHaveCount(1);
  await expect(facade).toHaveAccessibleName('Play video: MindQuest 2025 — event highlights');
  await expect(facade).toHaveAttribute('title', /^MindQuest Quiz Competition 2025 \| High School Students UAE/);
  const caption = facade.locator('.video-title');
  expect(await caption.evaluate((element) => element.scrollWidth <= element.clientWidth), 'caption fits on one line without truncation').toBe(true);
  await expect(facade.locator('img')).toHaveAttribute('loading', 'lazy');
  await expect(facade.locator('img')).toHaveAttribute('width', '1280');
  await facade.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
  expect(youtubeRequests).toEqual([]);
  await facade.click();
  const frame = page.locator('#archives iframe.video-frame');
  await expect(frame).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/bsFui7ugtK4?autoplay=1');
  await expect(frame).toHaveAttribute('title', /MindQuest Quiz Competition 2025/);
  await expect(facade).toHaveCount(0);
  await expect.poll(() => youtubeRequests.length).toBeGreaterThan(0);
  expect(youtubeRequests.every((url) => url.startsWith('https://www.youtube-nocookie.com/'))).toBe(true);
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toMatch(/frame-src[^;]*https:\/\/www\.youtube-nocookie\.com/);
});

test('desktop navigation fits on one line', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name));
  const tops = await page.locator('#navMenu > li:not(.nav-cta-mobile) > a').evaluateAll((links) => links.map((link) => Math.round(link.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  const nav = await page.locator('.nav-container').evaluate((element) => ({ scroll: element.scrollWidth, client: element.clientWidth }));
  expect(nav.scroll).toBeLessThanOrEqual(nav.client);
});

test('FAQ can open one answer at a time', async ({ page }) => {
  const answers = page.locator('#faq details');
  const first = answers.nth(0);
  const second = answers.nth(1);
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
  await second.locator('summary').click();
  await expect(second).toHaveAttribute('open', '');
  await expect(first).not.toHaveAttribute('open', '');
});

test('empty required fields show validation without contacting the form endpoint', async ({ page }) => {
  const endpointRequests = [];
  await page.route('https://script.google.com/**', async (route) => {
    endpointRequests.push(route.request().url());
    await route.fulfill({ status: 200, body: '' });
  });
  const form = page.locator('#contactForm');
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(4);
  await expect(page.locator('#contactStatus')).toContainText('Please fix');
  expect(endpointRequests).toEqual([]);
});

// The sign-up posts to a live Google Apps Script that writes to the organisers' sheet, so these
// tests never let a request leave the page: fetch is stubbed in the page (WebKit exposes neither the
// body of a no-cors request nor an aborted route to page.route) and page.route is kept as a backstop.
async function openNotifyForm(page, { fail = false, delay = 0 } = {}) {
  await page.route('https://script.google.com/**', (route) => route.fulfill({ status: 200, body: '' }));
  await page.addInitScript(({ fail, delay }) => {
    window.__notifyCalls = [];
    const realFetch = window.fetch.bind(window);
    window.fetch = (url, options = {}) => {
      if (!String(url).startsWith('https://script.google.com/')) return realFetch(url, options);
      window.__notifyCalls.push({ method: options.method, mode: options.mode, body: JSON.parse(options.body) });
      return new Promise((resolve, reject) => {
        setTimeout(() => (fail ? reject(new TypeError('Failed to fetch')) : resolve(new Response(''))), delay);
      });
    };
  }, { fail, delay });
  await page.reload();
  const declineCookies = page.getByRole('button', { name: 'Decline' });
  if (await declineCookies.isVisible()) await declineCookies.click();
  await page.locator('#notifyForm').scrollIntoViewIfNeeded();
  return page.locator('#notifyForm');
}
const notifyCalls = (page) => page.evaluate(() => window.__notifyCalls);

test('sign-up form blocks an empty or invalid email with a visible, announced error and sends nothing', async ({ page }) => {
  const form = await openNotifyForm(page);
  const email = form.locator('#notifyEmail');
  const error = page.locator('#notifyEmailError');
  await expect(email).toHaveAttribute('aria-describedby', 'notifyEmailError');
  await expect(email).toHaveAttribute('autocomplete', 'email');
  await expect(page.locator('#notifyStatus')).toHaveAttribute('aria-live', 'polite');
  await form.locator('button[type="submit"]').click();
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('Email is required.');
  await expect(page.locator('#notifyStatus')).toContainText('Please fix');
  await expect(email).toBeFocused();
  await email.fill('not-an-email');
  await form.locator('button[type="submit"]').click();
  await expect(error).toHaveText('Please enter a valid email address.');
  expect(await notifyCalls(page)).toEqual([]);
});

test('sign-up form sends exactly one request with the expected payload and shows success', async ({ page }) => {
  const form = await openNotifyForm(page, { delay: 400 });
  const submit = form.locator('button[type="submit"]');
  await form.locator('#notifyEmail').fill('parent@example.com');
  await form.locator('#notifyName').fill('Asha Menon');
  await form.locator('#notifySchool').fill('The Indian High School');
  await submit.click();
  await expect(submit).toBeDisabled();
  // A second submit while the first is in flight must not send again
  await form.evaluate((element) => element.requestSubmit());
  await expect(page.locator('#notifyStatus')).toHaveText('Thanks! We’ll email you when registration opens.');
  await expect(page.locator('#notifyStatus')).toHaveClass(/success/);
  await expect(submit).toBeEnabled();
  await expect(form.locator('#notifyEmail')).toHaveValue('');
  expect(await notifyCalls(page)).toEqual([
    {
      method: 'POST',
      mode: 'no-cors',
      body: {
        name: 'Asha Menon',
        email: 'parent@example.com',
        subject: 'Notify me — MindQuest 2.0 registration',
        message: 'Please notify me when MindQuest 2.0 registration opens. School: The Indian High School',
      },
    },
  ]);
});

test('sign-up form works with only an email', async ({ page }) => {
  const form = await openNotifyForm(page);
  await form.locator('#notifyEmail').fill('student@example.com');
  await form.locator('#notifyEmail').press('Enter');
  await expect(page.locator('#notifyStatus')).toHaveClass(/success/);
  expect((await notifyCalls(page)).map((call) => call.body)).toEqual([
    {
      name: 'Not given',
      email: 'student@example.com',
      subject: 'Notify me — MindQuest 2.0 registration',
      message: 'Please notify me when MindQuest 2.0 registration opens.',
    },
  ]);
});

test('sign-up form shows an error with a mailto fallback when the request fails', async ({ page }) => {
  const form = await openNotifyForm(page, { fail: true });
  await form.locator('#notifyEmail').fill('parent@example.com');
  await form.locator('button[type="submit"]').click();
  const status = page.locator('#notifyStatus');
  await expect(status).toHaveClass(/error/);
  await expect(status).toContainText('We could not sign you up');
  await expect(status.locator('a')).toHaveAttribute('href', /^mailto:register\.mindquest@gmail\.com\?subject=/);
  await expect(form.locator('#notifyEmail')).toHaveValue('parent@example.com');
  await expect(form.locator('button[type="submit"]')).toBeEnabled();
  // Without JavaScript the form itself still posts to the same mailto address
  await expect(form).toHaveAttribute('action', /^mailto:register\.mindquest@gmail\.com/);
});

test('sign-up form sends nothing when the honeypot field is filled', async ({ page }) => {
  const form = await openNotifyForm(page);
  await expect(form.locator('#notifyWebsite')).not.toBeInViewport();
  await form.locator('#notifyEmail').fill('bot@example.com');
  await form.locator('#notifyWebsite').evaluate((element) => { element.value = 'https://spam.example'; });
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('#notifyStatus')).toHaveClass(/success/);
  await page.waitForTimeout(300);
  expect(await notifyCalls(page)).toEqual([]);
});

test('"Get notified" brings the sign-up form into view and moves focus to its heading', async ({ page }) => {
  const declineCookies = page.getByRole('button', { name: 'Decline' });
  if (await declineCookies.isVisible()) await declineCookies.click();
  await page.locator('.cta-group a[href="#register"]').click();
  await expect(page.locator('#registerTitle')).toBeFocused();
  await expect(page.locator('#register')).toBeInViewport({ ratio: 0.05 });
});

test('skip link is first in keyboard order and works; focus styling is visible', async ({ page }) => {
  const firstFocusable = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    return candidates.find((element) => element.tabIndex >= 0 && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden')?.getAttribute('href');
  });
  expect(firstFocusable).toBe('#main');
  const focused = page.locator('a[href="#main"]').first();
  await focused.focus();
  await expect(focused).toBeVisible();
  await expect.poll(() => focused.evaluate((element) => getComputedStyle(element).top)).toBe('16px');
  const focusStyle = await focused.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, top: style.top };
  });
  expect(focusStyle.top).toBe('16px');
  expect(focusStyle.outlineStyle).not.toBe('none');
  expect(parseFloat(focusStyle.outlineWidth)).toBeGreaterThan(0);
  const quizButton = page.locator('#qFlip');
  await quizButton.focus();
  const buttonFocus = await quizButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(buttonFocus.outlineStyle).not.toBe('none');
  expect(parseFloat(buttonFocus.outlineWidth)).toBeGreaterThan(0);
  await focused.focus();
  await focused.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator('#main')).toBeInViewport();
});

test('reduced-motion mode still exposes all page sections', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const sections = page.locator('main section');
  const count = await sections.count();
  for (let index = 0; index < count; index += 1) await expect(sections.nth(index)).toBeVisible();
});

test('Instagram embed loads only when the archives near the viewport', async ({ page }) => {
  const requests = instagramRequests.get(page);
  expect(requests).toEqual([]);
  await page.locator('#archives').scrollIntoViewIfNeeded();
  await expect.poll(() => requests.length).toBe(1);
});

test('robots.txt and sitemap.xml are served with a valid sitemap and crawlable assets', async ({ request, page }) => {
  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.status()).toBe(200);
  const robots = await robotsResponse.text();
  expect(robots).not.toMatch(/Disallow:\s*\/.*\.(?:js|css)/i);
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toMatch(/^\s*<\?xml\b/);
  expect(sitemap).toMatch(/<urlset\b[^>]*>[\s\S]*<\/urlset>/);
  expect(sitemap.match(/<url>/g)?.length || 0).toBeGreaterThan(0);
  const parsed = await page.evaluate((xml) => {
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    return { root: document.documentElement.tagName, hasParserError: !!document.querySelector('parsererror') };
  }, sitemap);
  expect(parsed.hasParserError).toBe(false);
  expect(parsed.root).toBe('urlset');
});

test('captures one full-page review screenshot for this project', async ({ page }, testInfo) => {
  const screenshotDir = path.join(process.cwd(), 'tests/artifacts/screenshots');
  await fs.mkdir(screenshotDir, { recursive: true });
  const name = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), fullPage: true, animations: 'disabled' });
});
