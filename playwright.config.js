const { defineConfig, devices } = require('@playwright/test');

const mobileProjects = [
  {
    name: 'iPad Portrait',
    use: { ...devices['iPad (gen 11)'] },
  },
  {
    name: 'iPhone SE',
    use: { ...devices['iPhone SE (3rd gen)'] },
  },
  {
    name: 'Recent iPhone',
    use: { ...devices['iPhone 17'] },
  },
  {
    name: 'Pixel 7',
    use: { ...devices['Pixel 7'] },
  },
  {
    name: 'Galaxy S-class Android',
    use: { ...devices['Galaxy S24'] },
  },
];

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  outputDir: 'tests/artifacts/test-results',
  reporter: [['html', { outputFolder: 'tests/artifacts/html-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8001',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Small Laptop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    ...mobileProjects,
  ],
  webServer: {
    command: 'python3 -m http.server 8001 --bind 127.0.0.1',
    url: 'http://127.0.0.1:8001',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
    stdout: 'ignore',
    stderr: 'ignore',
  },
});
