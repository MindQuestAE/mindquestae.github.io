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

test('warm-up answer gives feedback and Next advances to a different question', async ({ page }) => {
  const question = page.locator('#qText');
  const firstQuestion = await question.innerText();
  await page.locator('#qOptions').getByRole('button').first().click();
  await expect(page.locator('#qFeedback')).not.toContainText('Tap an answer');
  await page.locator('#qNext').click();
  await expect(question).not.toHaveText(firstQuestion);
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
  const form = page.locator('form').first();
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(4);
  await expect(page.locator('#contactStatus')).toContainText('Please fix');
  expect(endpointRequests).toEqual([]);
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
  const quizButton = page.locator('#qOptions button').first();
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

test('Instagram embed loads only when the gallery nears the viewport', async ({ page }) => {
  const requests = instagramRequests.get(page);
  expect(requests).toEqual([]);
  await page.locator('#gallery').scrollIntoViewIfNeeded();
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
