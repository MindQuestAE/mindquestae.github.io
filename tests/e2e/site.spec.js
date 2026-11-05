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

  // Safety net: nothing in this suite may reach the organisers' live Apps Script endpoints.
  // Tests that need to observe a submission register a later route, which takes precedence.
  await page.route(/^https:\/\/script\.google(usercontent)?\.com\//, (route) => route.abort());
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
  // The page honours reduced motion with an instant jump, which keeps this test independent of
  // smooth-scroll timing in WebKit when the machine is busy.
  await page.emulateMedia({ reducedMotion: 'reduce' });
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
    // Wait for the scroll to settle (two identical readings in a row), then assert where it landed.
    // This replaces a single IntersectionObserver read that could race an unfinished scroll.
    let previous = null;
    await expect.poll(async () => {
      const y = await page.evaluate(() => Math.round(window.scrollY));
      const settled = y === previous;
      previous = y;
      return settled;
    }, { timeout: 15_000, intervals: [150] }).toBe(true);
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
  const primaryButton = page.getByRole('link', { name: /Register now/ }).first();
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
  // The thumbnail is decorative (alt=""), so the link's name is just its visible caption.
  await expect(facade).toHaveAccessibleName('Play video: MindQuest 2025 — event highlights');
  await expect(facade.locator('img')).toHaveAttribute('alt', '');
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

async function openRegistrationForm(page, { fail = false, delay = 0 } = {}) {
  await page.route('https://script.google.com/**', (route) => route.abort());
  await page.addInitScript(({ fail, delay }) => {
    window.__registrationCalls = [];
    const realFetch = window.fetch.bind(window);
    window.fetch = (url, options = {}) => {
      if (!String(url).startsWith('https://script.google.com/')) return realFetch(url, options);
      window.__registrationCalls.push({
        url: String(url), method: options.method, mode: options.mode,
        body: Object.fromEntries(options.body),
      });
      return new Promise((resolve, reject) => {
        setTimeout(() => (fail ? reject(new TypeError('Failed to fetch')) : resolve(new Response(''))), delay);
      });
    };
  }, { fail, delay });
  await page.reload();
  const decline = page.getByRole('button', { name: 'Decline' });
  if (await decline.isVisible()) await decline.click();
  await page.locator('#registrationForm').scrollIntoViewIfNeeded();
  return page.locator('#registrationForm');
}

async function fillRegistration(page) {
  for (const i of [1, 2]) {
    await page.locator('#firstName' + i).fill(i === 1 ? 'Asha' : 'Ravi');
    await page.locator('#lastName' + i).fill('Menon');
    await page.locator('#email' + i).fill('parent@example.com');
    await page.locator('#phone' + i).fill('+971501234567');
    await page.locator('#dob' + i).fill('2012-03-10');
    await page.locator('#emiratesId' + i).fill('78420121234567' + i);
    await page.locator('#school' + i).fill('A UAE school outside the suggestions - AJMAN');
    await page.locator('#curriculum' + i).selectOption('Indian (CBSE)');
    await page.locator('#grade' + i).selectOption('8');
  }
  await page.locator('#consent').check();
}

test('registration focuses the first missing field and sends nothing', async ({ page }) => {
  const form = await openRegistrationForm(page);
  await form.getByRole('button', { name: 'Submit registration' }).click();
  await expect(page.locator('#firstName1')).toBeFocused();
  await expect(page.locator('#firstName1')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#firstName1Error')).toBeVisible();
  await expect(page.locator('#registrationStatus')).toHaveClass(/error/);
  expect(await page.evaluate(() => window.__registrationCalls)).toEqual([]);
});

test('registration waits for one submission and sends both participants to the registration deployment', async ({ page }) => {
  const form = await openRegistrationForm(page, { delay: 800 });
  await fillRegistration(page);
  const submit = form.locator('button[type="submit"]');
  const initialBox = await submit.boundingBox();
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect(page.locator('#registrationStatus')).not.toHaveClass(/success/);
  const sendingBox = await submit.boundingBox();
  expect(sendingBox.width).toBeCloseTo(initialBox.width, 1);
  expect(sendingBox.height).toBeCloseTo(initialBox.height, 1);
  await form.evaluate((element) => element.requestSubmit());
  await expect(page.locator('#registrationStatus')).toHaveClass(/success/);
  await expect(page.locator('#registrationStatus')).toContainText('wait for confirmation');
  await expect(page.locator('#firstName1')).toHaveValue('');
  const calls = await page.evaluate(() => window.__registrationCalls);
  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({
    url: 'https://script.google.com/macros/s/AKfycbz0dCZwiRDXEtQoiEgSKZyPW5uMcWM62mkJInbvX1dxfx27Fn0-Ob6ksFnH3NpesggK/exec',
    method: 'POST', mode: 'no-cors',
    body: {
      firstName1: 'Asha', firstName2: 'Ravi',
      email1: 'parent@example.com', email2: 'parent@example.com',
      school1: 'A UAE school outside the suggestions - AJMAN',
      school2: 'A UAE school outside the suggestions - AJMAN',
      school: 'A UAE school outside the suggestions - AJMAN',
      grade: '8', grade1: '8', grade2: '8',
      curriculum1: 'Indian (CBSE)', curriculum2: 'Indian (CBSE)',
      consent: 'yes', edition: 'MindQuest 2.0',
    },
  });
  expect(calls[0].body).not.toHaveProperty('website');
});

test('registration preserves entries and offers email when submission fails', async ({ page }) => {
  const form = await openRegistrationForm(page, { fail: true });
  await fillRegistration(page);
  await form.getByRole('button', { name: 'Submit registration' }).click();
  await expect(page.locator('#registrationStatus')).toHaveClass(/error/);
  await expect(page.locator('#registrationStatus')).toContainText('Your details are still here');
  await expect(page.locator('#firstName1')).toHaveValue('Asha');
  await expect(form.getByRole('button', { name: 'Submit registration' })).toBeEnabled();
  await expect(form.getByRole('link', { name: 'Email the organisers' })).toHaveAttribute('href', /^mailto:register\.mindquest@gmail\.com/);
});

for (const [field, value] of [
  ['email1', 'bad-email'],
  ['phone2', '+97112'],
  ['emiratesId1', '123'],
  ['dob2', '2099-01-01'],
  ['consent', false],
]) {
  test('registration rejects invalid ' + field, async ({ page }) => {
    const form = await openRegistrationForm(page);
    await fillRegistration(page);
    if (value === false) await page.locator('#' + field).uncheck();
    else await page.locator('#' + field).fill(value);
    await form.getByRole('button', { name: 'Submit registration' }).click();
    await expect(page.locator('#' + field)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#' + field + 'Error')).toBeVisible();
    expect(await page.evaluate(() => window.__registrationCalls)).toEqual([]);
  });
}

test('registration requires different participants', async ({ page }) => {
  const form = await openRegistrationForm(page);
  await fillRegistration(page);
  await page.locator('#emiratesId2').fill('784201212345671');
  await form.getByRole('button', { name: 'Submit registration' }).click();
  await expect(page.locator('#registrationStatus')).toContainText('two different participants');
  expect(await page.evaluate(() => window.__registrationCalls)).toEqual([]);
});

test('registration loads school suggestions on focus and adapts curriculum fields', async ({ page }) => {
  await page.addInitScript(() => {
    window.__schoolLoads = 0;
    const realFetch = window.fetch.bind(window);
    window.fetch = (url, options) => {
      if (!String(url).endsWith('/assets/schools.json')) return realFetch(url, options);
      window.__schoolLoads += 1;
      return Promise.resolve(new Response(JSON.stringify(['A School - Dubai - DUBAI'])));
    };
  });
  await openRegistrationForm(page);
  expect(await page.evaluate(() => window.__schoolLoads)).toBe(0);
  await page.locator('#school1').focus();
  await expect(page.locator('#registrationSchools option')).toHaveCount(1);
  await page.locator('#school2').focus();
  expect(await page.evaluate(() => window.__schoolLoads)).toBe(1);
  await page.locator('#curriculum1').selectOption('British');
  await expect(page.locator('#grade1 option[value="8"]')).toHaveText('Year 9');
  await expect(page.locator('#grade1 option[value="12"]')).toHaveText('Year 13');
  await page.locator('#curriculum1').selectOption('Other');
  await expect(page.locator('#curriculumOther1')).toBeVisible();
  await expect(page.locator('#curriculumOther1')).toHaveAttribute('required', '');
  await page.locator('#curriculum1').selectOption('Indian (CBSE)');
  await expect(page.locator('#curriculumOther1')).toBeDisabled();
  await expect(page.locator('#curriculumOther1')).toBeHidden();
});

test('registration honeypot sends nothing', async ({ page }) => {
  const form = await openRegistrationForm(page);
  await page.locator('#registrationWebsite').evaluate((element) => { element.value = 'spam'; });
  await form.getByRole('button', { name: 'Submit registration' }).click();
  expect(await page.evaluate(() => window.__registrationCalls)).toEqual([]);
});

test('Register now moves focus to the registration heading', async ({ page }) => {
  const decline = page.getByRole('button', { name: 'Decline' });
  if (await decline.isVisible()) await decline.click();
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

function pngSize(buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test.describe('MindQuest 2.0 logo set', () => {
  test('nav and footer logos are loaded, undistorted, named and carry no separate 2.0 badge', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('.brand-year')).toHaveCount(0);
    await page.waitForFunction(() => [...document.querySelectorAll('.brand img, .footer-brand img')].every((img) => img.complete && img.naturalWidth > 0));
    const logos = await page.locator('.brand img, .footer-brand img').evaluateAll((imgs) =>
      imgs.map((img) => ({
        src: img.getAttribute('src'), alt: img.alt, complete: img.complete,
        nw: img.naturalWidth, nh: img.naturalHeight,
        rw: parseFloat(getComputedStyle(img).width) - (getComputedStyle(img).boxSizing === 'border-box' ? parseFloat(getComputedStyle(img).paddingLeft) + parseFloat(getComputedStyle(img).paddingRight) : 0),
        rh: parseFloat(getComputedStyle(img).height) - (getComputedStyle(img).boxSizing === 'border-box' ? parseFloat(getComputedStyle(img).paddingTop) + parseFloat(getComputedStyle(img).paddingBottom) : 0),
        attrW: Number(img.getAttribute('width')), attrH: Number(img.getAttribute('height')),
        effects: getComputedStyle(img).filter + getComputedStyle(img).boxShadow,
      })));
    expect(logos).toHaveLength(2);
    for (const logo of logos) {
      expect(logo.complete && logo.nw > 0, logo.src).toBe(true);
      expect(logo.alt).toMatch(/^MindQuest 2\.0/);
      expect(Math.abs(logo.rw / logo.rh - logo.nw / logo.nh) * logo.rh, 'rendered ratio').toBeLessThan(1);
      expect(Math.abs(logo.attrW / logo.attrH - logo.nw / logo.nh) * logo.attrH, 'attribute ratio').toBeLessThan(1);
      expect(logo.effects).toBe('nonenone');
    }
    expect(logos[0].rh).toBeGreaterThanOrEqual(24);
    await expect(page.locator('.brand')).toHaveAttribute('href', '#home');
  });

  test('nav logo does not collide with the menu or the hamburger and the page does not overflow', async ({ page }) => {
    await page.goto('/');
    const box = await page.locator('.brand img').boundingBox();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const toggle = page.locator('#navToggle, .nav-toggle, button[aria-controls="navMenu"]').first();
    if (await toggle.isVisible()) {
      const t = await toggle.boundingBox();
      expect(box.x + box.width).toBeLessThan(t.x);
    } else {
      const first = await page.locator('.nav-menu a').first().boundingBox();
      expect(box.x + box.width).toBeLessThan(first.x);
    }
  });

  test('nav logo stays visible and undistorted at 320, 360 and 375 wide', async ({ page }) => {
    for (const width of [320, 360, 375]) {
      await page.setViewportSize({ width, height: 700 });
      await page.goto('/');
      const m = await page.evaluate(() => {
        const r = document.querySelector('.brand img').getBoundingClientRect();
        const t = document.querySelector('button[aria-controls="navMenu"]');
        return { right: r.right, h: r.height, toggle: t ? t.getBoundingClientRect().left : Infinity,
          overflow: document.documentElement.scrollWidth - innerWidth };
      });
      expect(m.overflow).toBeLessThanOrEqual(0);
      expect(m.right).toBeLessThan(m.toggle);
      expect(m.h).toBeGreaterThanOrEqual(24);
    }
  });

  test('footer logo sits on an opaque white tile over the dark band', async ({ page }) => {
    await page.goto('/');
    const bg = await page.locator('.footer-brand img').evaluate((img) => getComputedStyle(img).backgroundColor);
    expect(bg).toBe('rgb(255, 255, 255)');
  });

  test('favicons, manifest icons, touch icon and og:image are served with the right type and size', async ({ request, page }) => {
    await page.goto('/');
    const expectPng = async (url, width, height) => {
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
      expect(response.headers()['content-type'], url).toMatch(/image\/png/);
      expect(pngSize(await response.body()), url).toEqual({ width, height });
    };
    await expectPng('/assets/favicon/favicon-96x96.png', 96, 96);
    await expectPng('/assets/favicon/apple-touch-icon.png', 180, 180);
    await expectPng('/assets/og-image.png', 1200, 630);
    const manifest = await (await request.get('/assets/favicon/site.webmanifest')).json();
    for (const icon of manifest.icons) {
      const [w, h] = icon.sizes.split('x').map(Number);
      await expectPng(icon.src, w, h);
    }
    for (const url of ['/assets/favicon/favicon.svg', '/assets/mindquest-logo-nav.svg', '/assets/mindquest-wordmark.svg']) {
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
      expect(response.headers()['content-type'], url).toMatch(/image\/svg\+xml/);
    }
    const ico = await request.get('/assets/favicon/favicon.ico');
    expect(ico.status()).toBe(200);
    const ogUrl = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogUrl).toBe('https://mindquestquiz.com/assets/og-image.png');
  });

  test('every service worker precache entry exists', async ({ request }) => {
    // Read the source worker: the deployed copy is minified and its list is mangled.
    const source = await fs.readFile(path.join(__dirname, '../../sw.js'), 'utf8');
    const block = source.match(/STATIC_CACHE_URLS\s*=\s*\[([\s\S]*?)\]/)[1];
    const urls = [...block.matchAll(/'(\/[^']*)'/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(5);
    for (const url of urls) {
      expect((await request.get(url.split('?')[0])).status(), url).toBe(200);
    }
  });
});

test.describe('Event details', () => {
  const weekday = (iso) => new Date(iso).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Dubai' });

  test('dates section shows the launch and the quiz with times and venues', async ({ page }) => {
    await page.goto('/');
    const dates = page.locator('#dates');
    await expect(dates).toContainText('Sunday 29 November 2026');
    await expect(dates).toContainText('from 2:00 PM');
    await expect(dates).toContainText('The Millennium School, Al Qusais');
    await expect(dates).toContainText('Sunday 8 November 2026');
    await expect(dates).toContainText('3:00 PM');
    await expect(dates).toContainText('Sharjah Expo Centre');
    await expect(dates).toContainText('Hall 07');
    await expect(dates).toContainText('Stall ZD4');
    await expect(dates).toContainText('Limited to 120 teams');
  });

  test('no placeholder or unannounced wording remains on the page', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    expect(html).not.toMatch(/to be announced|not yet been announced|will be announced|TODO\(|being finalised|isn.t open yet|not open|opens soon|get notified|notify me/i);
    await expect(page.locator('.sb-value.tba')).toHaveCount(0);
  });

  test('JSON-LD has the two Event nodes with exact dates and Sunday weekdays', async ({ page }) => {
    await page.goto('/');
    const graph = await page.evaluate(() =>
      JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph']);
    const events = Object.fromEntries(graph.filter((n) => n['@type'] === 'Event').map((n) => [n['@id'].split('#')[1], n]));
    expect(events['event-quiz'].startDate).toBe('2026-11-29T14:00:00+04:00');
    expect(events['event-launch'].startDate).toBe('2026-11-08T15:00:00+04:00');
    for (const event of Object.values(events)) {
      expect(weekday(event.startDate)).toBe('Sunday');
      expect(event.name).toBeTruthy();
      expect(event.location.name).toBeTruthy();
      expect(event.location.address.addressCountry).toBe('AE');
      expect(event).not.toHaveProperty('endDate');
      expect(event).not.toHaveProperty('offers');
    }
    expect(events['event-quiz'].location.name).toBe('The Millennium School');
    expect(events['event-quiz'].location.address.addressLocality).toBe('Al Qusais');
    expect(events['event-quiz'].location.address.addressRegion).toBe('Dubai');
    expect(events['event-launch'].location.name).toBe('Sharjah Expo Centre');
    expect(events['event-launch'].description).toContain('Hall 07, Stall ZD4');
  });

  test('visible FAQ answers equal their JSON-LD twins', async ({ page }) => {
    await page.goto('/');
    const pairs = await page.evaluate(() => {
      const graph = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
      const norm = (text) => text.replace(/\s+/g, ' ').trim();
      const visible = Object.fromEntries([...document.querySelectorAll('.faq-item')].map((item) =>
        [norm(item.querySelector('summary').textContent), norm(item.querySelector('p').textContent)]));
      return graph.find((n) => n['@type'] === 'FAQPage').mainEntity.map((q) => [q.name, norm(q.acceptedAnswer.text), visible[norm(q.name)]]);
    });
    expect(pairs.length).toBeGreaterThan(5);
    for (const [name, json, html] of pairs) expect(html, name).toBe(json);
  });

  test('sitemap lastmod is the content update date', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toMatch(/<lastmod>2026-11-04<\/lastmod>/);
  });

  test('registration is presented as open with the 120-team notice', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#registrationForm')).toBeVisible();
    await expect(page.locator('#register .registration-limit')).toHaveText('Limited to 120 teams. First come, first served.');
    // Count in the DOM: the desktop nav button and the mobile menu entry are hidden on one layout or the other.
    expect(await page.locator('a[href="#register"]', { hasText: 'Register now' }).count()).toBeGreaterThanOrEqual(4);
    await expect(page.getByText(/get notified|not open|opens soon/i)).toHaveCount(0);
    await expect(page.locator('#faq summary', { hasText: 'How do I register?' })).toHaveCount(1);
  });

  test('page title and descriptions carry the poster tagline', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/^MindQuest 2\.0 — UAE’s Biggest High School Quiz/);
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      const content = await page.locator(selector).getAttribute('content');
      expect(content, selector).toContain('UAE’s Biggest High School Quiz for the Indian Diaspora');
      expect(content.length, selector).toBeLessThanOrEqual(160);
    }
    await expect(page.locator('.hero-lead')).toContainText('UAE’s Biggest High School Quiz for the Indian Diaspora');
  });
});
