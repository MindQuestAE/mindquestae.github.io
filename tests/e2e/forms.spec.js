const { test, expect } = require('@playwright/test');

const endpointHosts = ['script.google.com', 'script.googleusercontent.com'];

test.beforeEach(async ({ page }) => {
  for (const host of endpointHosts) {
    await page.route(`https://${host}/**`, (route) => route.abort());
  }
  await page.addInitScript(() => {
    window.__formRequests = [];
    const realFetch = window.fetch.bind(window);
    window.fetch = (input, options = {}) => {
      const url = String(input);
      if (!/^https:\/\/script\.google(?:usercontent)?\.com\//.test(url)) return realFetch(input, options);
      const body = options.body;
      const fields = body instanceof FormData ? Object.fromEntries(body.entries()) : JSON.parse(body || '{}');
      window.__formRequests.push({ url, method: options.method, body: fields });
      return Promise.resolve(new Response('', { status: 200 }));
    };
  });
  await page.goto('/');
  const decline = page.getByRole('button', { name: 'Decline' });
  if (await decline.isVisible()) await decline.click();
});

async function fillRegistration(page) {
  for (const i of [1, 2]) {
    await page.locator(`#firstName${i}`).fill(i === 1 ? 'Aïsha' : 'D\'Souza');
    await page.locator(`#lastName${i}`).fill(i === 1 ? 'Al-Mansoori' : 'Menon');
    await page.locator(`#email${i}`).fill(`parent${i}@example.com`);
    await page.locator(`#phone${i}`).fill('0501234567');
    await page.locator(`#dob${i}`).fill('2012-03-10');
    await page.locator(`#emiratesId${i}`).fill(`78420121234567${i}`);
    await page.locator(`#school${i}`).fill(`School ${i}`);
    await page.locator(`#curriculum${i}`).selectOption('British');
    await page.locator(`#grade${i}`).selectOption('8');
  }
  const consent = page.locator('#consent');
  if (!(await consent.isChecked())) {
    await consent.evaluate((input) => { input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true })); });
  }
  await expect(consent).toBeChecked();
}

async function submitRegistration(page) {
  await page.locator('#registrationForm button[type="submit"]').click();
}

const acceptedPhones = [
  ['0501234567', '+971501234567'],
  ['050 123 4567', '+971501234567'],
  ['+971501234567', '+971501234567'],
  ['+971 50 123 4567', '+971501234567'],
  ['+971-50-123-4567', '+971501234567'],
  ['00971 50 123 4567', '+971501234567'],
  ['(050) 123-4567', '+971501234567'],
  ['971501234567', '+971501234567'],
];

test('UAE phone formats normalize in the field and submitted payload', async ({ page }) => {
  for (const [raw, expected] of acceptedPhones) {
    await fillRegistration(page);
    await page.locator('#phone1').fill(raw);
    await page.locator('#firstName1').focus();
    await expect(page.locator('#phone1')).toHaveValue('+971 50 123 4567');
    await submitRegistration(page);
    await expect(page.locator('#registrationStatus')).toHaveClass(/success/);
    const sent = await page.evaluate(() => window.__formRequests.at(-1));
    expect(sent.body.phone1).toBe(expected);
  }
  await fillRegistration(page);
  await page.locator('#phone1').fill('02 123 4567');
  await submitRegistration(page);
  await expect(page.locator('#registrationStatus')).toHaveClass(/success/);
  expect((await page.evaluate(() => window.__formRequests.at(-1))).body.phone1).toBe('+97121234567');
});

test('invalid UAE phone formats show their specific errors and do not submit', async ({ page }) => {
  const cases = [
    ['letters', 'abc123', 'Phone numbers can only contain digits, spaces, dashes and a leading +.'],
    ['short local number', '12345', 'Enter a UAE number such as 050 123 4567 or +971 50 123 4567.'],
    ['wrong country', '+44 20 7946 0958', 'Enter a UAE number such as 050 123 4567 or +971 50 123 4567.'],
    ['too short', '+971 50 123 45', 'Enter a UAE number such as 050 123 4567 or +971 50 123 4567. You entered 7 digits after the country code; this number needs 9.'],
    ['too long', '+971 50 123 45678', 'Enter a UAE number such as 050 123 4567 or +971 50 123 4567. You entered 10 digits after the country code; this number needs 9.'],
    ['unallocated mobile prefix', '+971 99 123 4567', 'Enter a UAE number such as 050 123 4567 or +971 50 123 4567. You entered 9 digits after the country code; this number needs 8.'],
    ['empty', '', 'Enter a phone number we can reach you on.'],
  ];
  for (const [label, input, error] of cases) {
    await fillRegistration(page);
    await page.locator('#phone1').fill(input);
    await submitRegistration(page);
    await expect(page.locator('#phone1Error'), label).toHaveText(error);
    expect(await page.evaluate(() => window.__formRequests)).toHaveLength(0);
  }
});

test('Emirates ID formats normalize for display and payload; malformed IDs are rejected', async ({ page }) => {
  for (const value of ['784-2000-1234567-1', '784 2000 1234567 1', '784200012345671']) {
    await fillRegistration(page);
    await page.locator('#emiratesId1').fill(value);
    await page.locator('#school1').focus();
    await expect(page.locator('#emiratesId1')).toHaveValue('784-2000-1234567-1');
    await submitRegistration(page);
    await expect(page.locator('#registrationStatus')).toHaveClass(/success/);
    expect((await page.evaluate(() => window.__formRequests.at(-1))).body.emiratesId1).toBe('784200012345671');
  }

  const cases = [
    ['short', '784-2000', 'An Emirates ID has 15 digits (784-YYYY-NNNNNNN-C). You entered 7.'],
    ['long', '78420001234567199', 'An Emirates ID has 15 digits (784-YYYY-NNNNNNN-C). You entered 17.'],
    ['wrong prefix', '123200012345671', 'UAE Emirates IDs start with 784.'],
    ['letters', '784-2000-1234ABC-1', 'Use digits only; dashes and spaces are fine.'],
    ['empty', '', 'Enter the Emirates ID number printed on the card.'],
  ];
  const successfulRequestCount = await page.evaluate(() => window.__formRequests.length);
  for (const [label, input, error] of cases) {
    await fillRegistration(page);
    await page.locator('#emiratesId1').fill(input);
    await submitRegistration(page);
    await expect(page.locator('#emiratesId1Error'), label).toHaveText(error);
    expect(await page.evaluate(() => window.__formRequests.length), label).toBe(successfulRequestCount);
  }
});

test('duplicate Emirates IDs are rejected after normalizing mixed formats', async ({ page }) => {
  await fillRegistration(page);
  await page.locator('#emiratesId1').fill('784-2000-1234567-1');
  await page.locator('#emiratesId2').fill('784 2000 1234567 1');
  await submitRegistration(page);
  await expect(page.locator('#emiratesId2Error')).toHaveText('Participant 2 has the same Emirates ID as participant 1. Each student needs their own.');
  expect(await page.evaluate(() => window.__formRequests)).toHaveLength(0);
});

test('DOB sanity validation rejects future, implausible and impossible dates but not eligibility years', async ({ page }) => {
  const today = new Date();
  const dateAtAge = (age) => {
    const date = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const future = dateAtAge(-1);
  const cases = [
    [future, "Date of birth can't be in the future."],
    [dateAtAge(5), `Please check the year — that date gives an age of 5.`],
    [dateAtAge(40), `Please check the year — that date gives an age of 40.`],
  ];
  for (const [date, error] of cases) {
    await fillRegistration(page);
    await page.locator('#dob1').fill(date);
    await submitRegistration(page);
    await expect(page.locator('#dob1Error')).toHaveText(error);
    expect(await page.evaluate(() => window.__formRequests)).toHaveLength(0);
  }

  await fillRegistration(page);
  const dob = page.locator('#dob1');
  await dob.evaluate((input) => { input.type = 'text'; });
  await dob.fill('31/02/2010');
  await submitRegistration(page);
  await expect(page.locator('#dob1Error')).toHaveText('Enter a valid date of birth.');

  for (const date of ['2012-03-10', '2005-03-10', '2013-03-10']) {
    await fillRegistration(page);
    await page.locator('#dob1').fill(date);
    await submitRegistration(page);
    await expect(page.locator('#registrationStatus')).toHaveClass(/success/);
  }
});

test('age and grade mismatch is advisory only; date bounds and Unicode names are supported', async ({ page }) => {
  await fillRegistration(page);
  await page.locator('#firstName1').fill('Aïsha');
  await page.locator('#lastName1').fill("D'Souza");
  await page.locator('#dob1').fill('2007-03-10');
  await page.locator('#grade1').selectOption('8');
  await expect(page.locator('#dob1Hint')).toHaveText('Double-check the date of birth or grade.');
  const bounds = await page.locator('#dob1').evaluate((input) => ({ min: input.min, max: input.max }));
  expect(bounds.min).not.toBe('');
  expect(bounds.max).toBe(new Date().toLocaleDateString('en-CA'));
  await submitRegistration(page);
  await expect(page.locator('#registrationStatus')).toHaveClass(/success/);
});

test('registration validation focuses the first invalid field, describes errors, and keeps entered values', async ({ page }) => {
  const form = page.locator('#registrationForm');
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('#firstName1')).toBeFocused();
  await expect(page.locator('#registrationStatus')).toHaveText(/^\d+ problems to fix: Participant 1 — First name/);
  await expect(page.locator('#firstName1')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#firstName1')).toHaveAttribute('aria-describedby', 'firstName1Error');
  await page.locator('#firstName1').fill('Asha');
  await expect(page.locator('#firstName1')).toHaveAttribute('aria-invalid', 'false');
  await expect(page.locator('#firstName1Error')).toBeEmpty();
  await expect(page.locator('#registrationStatus')).toHaveText(/\d+ problems to fix: Participant 1 — Last name/);
  await expect(page.locator('#registrationStatus')).not.toContainText('Participant 1 — First name');
  await page.locator('#lastName1').fill('Menon');
  await page.locator('#email1').fill('not-an-email');
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('#email1Error')).toHaveText("That doesn't look like an email address — check for a missing @ or domain.");
  await expect(page.locator('#email1')).toHaveValue('not-an-email');
});

test('required registration fields have specific errors and Other curriculum is required', async ({ page }) => {
  await fillRegistration(page);
  await page.locator('#school1').fill('');
  await page.locator('#curriculum1').selectOption('Other');
  await page.locator('#grade1').selectOption('');
  await page.locator('#curriculumOther1').fill('');
  await page.locator('#consent').evaluate((input) => { input.checked = false; input.dispatchEvent(new Event('change', { bubbles: true })); });
  await submitRegistration(page);
  await expect(page.locator('#school1Error')).toHaveText("Enter or choose the student's school.");
  await expect(page.locator('#curriculumOther1Error')).toHaveText('Tell us which curriculum.');
  await expect(page.locator('#grade1Error')).toHaveText('Choose a grade.');
  await expect(page.locator('#consentError')).toHaveText('Tick the box to confirm a parent or guardian has given permission.');
});

test('student names accept Unicode punctuation and reject digits', async ({ page }) => {
  await fillRegistration(page);
  await expect(page.locator('#firstName1')).toHaveValue('Aïsha');
  await expect(page.locator('#lastName1')).toHaveValue('Al-Mansoori');
  await page.locator('#firstName1').fill('Asha2');
  await submitRegistration(page);
  await expect(page.locator('#firstName1Error')).toHaveText('Names can only contain letters, spaces, hyphens and apostrophes.');
  expect(await page.evaluate(() => window.__formRequests)).toHaveLength(0);
});

test('contact fields validate lengths with counters and prevent submission', async ({ page }) => {
  await page.locator('#subject').fill('ab');
  await expect(page.locator('#subjectCount')).toHaveText('98 characters remaining');
  await page.locator('#message').fill('short');
  await expect(page.locator('#messageCount')).toHaveText('995 characters remaining');
  await page.locator('#contactName').fill('A');
  await page.locator('#contactEmail').fill('bad');
  await page.locator('#contactForm').evaluate((form) => form.requestSubmit());
  await expect(page.locator('#contactNameError')).toHaveText('Name must be between 2 and 50 characters.');
  await expect(page.locator('#contactEmailError')).toHaveText("That doesn't look like an email address — check for a missing @ or domain.");
  await expect(page.locator('#subjectError')).toHaveText('Subject must be at least 3 characters, you have 2.');
  await expect(page.locator('#messageError')).toHaveText('Message must be at least 10 characters, you have 5.');
  await page.locator('#contactName').fill('Asha');
  await expect(page.locator('#contactStatus')).toHaveText(/\d+ problems to fix: Email/);
  await expect(page.locator('#contactStatus')).not.toContainText('Your name');
  expect(await page.evaluate(() => window.__formRequests)).toHaveLength(0);
  await page.locator('#subject').fill('x'.repeat(101));
  await page.locator('#message').fill('x'.repeat(1001));
  await page.locator('#contactForm').evaluate((form) => form.requestSubmit());
  await expect(page.locator('#subjectError')).toHaveText('Subject must be at most 100 characters, you have 1 too many.');
  await expect(page.locator('#messageError')).toHaveText('Message must be at most 1000 characters, you have 1 too many.');
});

test('valid contact message sends one trimmed request', async ({ page }) => {
  await page.locator('#contactName').fill('  Aïsha  ');
  await page.locator('#contactEmail').fill(' parent@example.com ');
  await page.locator('#subject').fill('  Registration question  ');
  await page.locator('#message').fill('  Please confirm the event dates.  ');
  await page.locator('#contactForm button[type="submit"]').click();
  await expect(page.locator('#contactStatus')).toHaveClass(/success/);
  const requests = await page.evaluate(() => window.__formRequests);
  expect(requests).toHaveLength(1);
  expect(requests[0].body).toEqual({ name: 'Aïsha', email: 'parent@example.com', subject: 'Registration question', message: 'Please confirm the event dates.' });
});

test('valid registration sends one normalized request and preserves British year values', async ({ page }) => {
  await fillRegistration(page);
  await page.locator('#phone1').fill('050 123 4567');
  await page.locator('#emiratesId1').fill('784-2000-1234567-1');
  await page.locator('#curriculum1').selectOption('British');
  await page.locator('#grade1').selectOption('8');
  await expect(page.locator('#grade1 option:checked')).toHaveText('Year 9');
  await submitRegistration(page);
  await expect(page.locator('#registrationStatus')).toHaveClass(/success/);
  const calls = await page.evaluate(() => window.__formRequests);
  expect(calls).toHaveLength(1);
  expect(calls[0].body).toMatchObject({ phone1: '+971501234567', emiratesId1: '784200012345671', grade1: '8', edition: 'MindQuest 2.0' });
});

test('registration retains its mailto action and fields without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  for (const host of endpointHosts) await context.route(`https://${host}/**`, (route) => route.abort());
  const page = await context.newPage();
  const response = await page.goto(baseURL);
  expect(response?.status()).toBe(200);
  await expect(page.locator('#registrationForm')).toHaveAttribute('action', /^mailto:/);
  await expect(page.locator('#firstName1')).toBeVisible();
  await expect(page.locator('#consent')).toBeVisible();
  await context.close();
});

test('honeypot drops the registration without claiming it was sent', async ({ page }) => {
  await page.locator('#registrationWebsite').fill('automated entry');
  await submitRegistration(page);
  await expect(page.locator('#registrationStatus')).toHaveClass(/success/);
  await expect(page.locator('#registrationStatus')).toHaveText('Thanks. Please wait for confirmation from the organisers.');
  await expect(page.locator('#registrationStatus')).not.toContainText('Submission sent');
  expect(await page.evaluate(() => window.__formRequests)).toHaveLength(0);
});
