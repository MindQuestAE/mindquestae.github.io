# Browser tests

The default Playwright smoke suite starts its own static server on port 8001. Install dependencies and browsers once, then run the full device matrix:

```sh
npm install
npx playwright install chromium firefox webkit
npm test
```

Use `npm run test:mobile`, `npm run test:desktop`, or `npm run test:headed` to narrow or view a run. The previous Mocha/Selenium form suite remains available with `npm run test:legacy`.

Playwright reports, traces, videos, test results, and one full-page review screenshot per project are written under `tests/artifacts/`. Screenshots are review artifacts, not comparison baselines. The project matrix is defined in `playwright.config.js`.
