const { test, expect } = require('@playwright/test');

const expectedFiles = [
  'al-nahda-auto', 'almarai', 'aster', 'aster-volunteers', 'autosmart', 'ct-engineers', 'liwa-ac-systems',
  'middleeast-general-trading', 'noova', 'origa-designs', 'star-academies', 'uae-vartha', 'verdastones',
].map((name) => `/assets/2026/${name}.png`);

test.beforeEach(async ({ page }) => {
  // Nothing in this suite may reach the organisers' live Apps Script endpoints or third parties.
  await page.route(/^https:\/\/script\.google(usercontent)?\.com\//, (route) => route.abort());
  await page.route('https://www.instagram.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.goto('/');
  const decline = page.getByRole('button', { name: 'Decline' });
  if (await decline.isVisible()) await decline.click();
});

test('sponsor wall shows the 13 sponsors of 2026 with unique names and no 2025 content', async ({ page }) => {
  const wall = page.locator('#partners .sponsors');
  await wall.scrollIntoViewIfNeeded();
  await expect(wall.getByRole('heading', { name: 'Our sponsors' })).toBeVisible();
  await expect(wall).toContainText('Thank you to the sponsors backing MindQuest 2.0.');
  await expect(wall).not.toContainText('2025 partners');
  await expect(wall).not.toContainText(/title sponsor|medical partner/i);
  await expect(wall.locator('.sponsor-wall a')).toHaveCount(0);
  const images = wall.locator('.sponsor-wall img');
  await expect(images).toHaveCount(13);
  const info = await images.evaluateAll((imgs) => imgs.map((img) => ({ src: new URL(img.src).pathname, alt: img.alt })));
  expect(info.map((i) => i.src).sort()).toEqual([...expectedFiles].sort());
  expect(info.every((i) => !i.src.includes('/assets/2025/'))).toBe(true);
  const alts = info.map((i) => i.alt);
  expect(alts.every((alt) => alt.trim().length > 0)).toBe(true);
  expect(new Set(alts).size).toBe(alts.length);
  expect([...alts].sort((a, b) => a.localeCompare(b))).toEqual(alts);
  await expect(page.locator('body')).not.toContainText(/carrefour|romana|kidsventure/i);
});

test('every sponsor logo loads, renders at the same size and does not overflow', async ({ page }) => {
  const images = page.locator('#partners .sponsor-wall img');
  const count = await images.count();
  for (let i = 0; i < count; i += 1) await images.nth(i).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.sponsor-wall img')].every((img) => img.complete && img.naturalWidth > 0));
  const sizes = await page.locator('#partners .sponsor-wall li').evaluateAll((items) =>
    items.map((item) => { const r = item.getBoundingClientRect(); return [r.width, r.height]; }));
  expect(sizes).toHaveLength(13);
  const [firstW, firstH] = sizes[0];
  for (const [w, h] of sizes) {
    expect(Math.abs(w - firstW)).toBeLessThanOrEqual(1);
    expect(Math.abs(h - firstH)).toBeLessThanOrEqual(1);
    expect(Math.abs(w - h)).toBeLessThanOrEqual(1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});
