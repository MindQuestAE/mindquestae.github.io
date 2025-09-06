# MindQuest Registration Form Test Suite

This directory contains comprehensive automated tests for the MindQuest registration form using Node.js, Selenium WebDriver, and Mocha.

## Test Structure

```
tests/
├── README.md                 # This file
├── setup.js                  # Global test setup and configuration
├── helpers/
│   └── testUtils.js          # Utility functions for test automation
├── specs/
│   ├── formSuccess.test.js   # Success scenario tests
│   ├── formValidation.test.js # Validation and edge case tests
│   └── formPerformance.test.js # Performance and stress tests
└── screenshots/              # Generated screenshots on test failures
```

## Test Categories

### 1. Success Tests (`formSuccess.test.js`)
Tests successful form submission scenarios:
- Complete valid form submission
- Different curriculum selections (British, American, IB, Indian)
- Different grade selections (8-12)
- Valid date range boundaries (2007-2012)
- Various school name inputs
- Email format validation with valid emails
- Phone number validation with valid UAE numbers

### 2. Validation Tests (`formValidation.test.js`)
Tests form validation and error handling:
- Required field validation
- Real-time validation on blur events
- Email format validation with invalid inputs
- Phone number format validation
- Emirates ID format validation (15 digits)
- Date of birth range validation
- Form interaction edge cases
- Accessibility and UX validation

### 3. Performance Tests (`formPerformance.test.js`)
Tests performance and stress scenarios:
- Form loading performance
- Validation response times
- Form submission performance
- Stress testing with multiple submissions
- Memory usage and resource management
- Concurrent validation handling

## Prerequisites

### System Requirements
- Node.js 16.x or higher
- Python 3.x (for development server)
- Chrome browser (for Selenium tests)
- npm or yarn package manager

### Environment Setup
```bash
# Install test dependencies
make install-test-deps

# Setup test environment (includes ChromeDriver)
make setup-tests
```

## Running Tests

### Quick Start
```bash
# Run all tests with server auto-start
make test-full

# Run all tests (requires server to be running separately)
make test

# Run tests in headless mode
make test-headless
```

### Specific Test Suites
```bash
# Run only success scenario tests
make test-success

# Run only validation tests
make test-validation

# Run only performance tests
make test-performance
```

### Development Mode
```bash
# Run tests in watch mode (auto-restart on file changes)
make test-watch

# Start development server
make serve

# Then in another terminal
make test-headless
```

### CI/CD Mode
```bash
# Run tests in CI mode (headless, with CI flags)
make test-ci
```

## Test Configuration

### Environment Variables
- `HEADLESS=true` - Run browser in headless mode
- `CI=true` - Enable CI-specific settings
- `NODE_ENV=test` - Set environment to test mode

### Browser Configuration
Tests run in Chrome by default with these options:
- `--headless` (when HEADLESS=true)
- `--no-sandbox`
- `--disable-dev-shm-usage`
- `--disable-gpu`
- `--window-size=1920,1080`

## Test Data

### Valid Test Data
```javascript
// Example valid participant data
{
  firstName: 'Ahmed',
  lastName: 'Al-Rashid',
  email: 'ahmed.rashid@example.com',
  dob: '2008-03-15',
  phone: '+971501234567',
  emiratesId: '784200812345678',
  school: 'GEMS Wellington International School',
  curriculum: 'British',
  grade: '10'
}
```

### Test Edge Cases
- **Invalid Emails**: `invalid-email`, `test@`, `@example.com`
- **Invalid Phones**: `+971123`, `971501234567`, `+1234567890`
- **Invalid Emirates IDs**: `12345`, `784200812345678901`, `abcd1234567890e`
- **Invalid Dates**: `2005-01-01` (too early), `2015-12-31` (too late)

## Debugging

### Screenshots
Failed tests automatically capture screenshots saved to `tests/screenshots/`

### Manual Screenshot Capture
```javascript
// In test file
await testUtils.takeScreenshot('test-scenario-name');
```

### Verbose Logging
```bash
# Run tests with debug output
DEBUG=* npm test
```

### Non-Headless Mode
```bash
# Run tests with visible browser for debugging
npm test
```

## CI/CD Integration

### GitHub Actions
The test suite is configured to run on:
- Push to main, develop, or form-registration-fix branches
- Pull requests to main or develop
- Daily scheduled runs at 2 AM UTC

### Test Matrix
- **Node.js versions**: 16.x, 18.x, 20.x
- **Browsers**: Chrome (primary), Firefox (cross-browser testing)
- **Test types**: Success, Validation, Performance, Security

### Artifacts
- Test screenshots on failure (retained 7 days)
- Test results and coverage (retained 30 days)

## Test Maintenance

### Adding New Tests
1. Create test in appropriate spec file
2. Use `TestUtils` helper methods for common operations
3. Follow existing naming and structure conventions
4. Update this README if adding new test categories

### Updating Test Data
- Modify `TestUtils.getValidTestData()` for valid scenarios
- Modify `TestUtils.getInvalidTestData()` for edge cases
- Ensure data reflects current form requirements

### Performance Benchmarks
Current performance expectations:
- Form load time: < 5 seconds
- Validation response: < 1 second
- Form submission: < 5 seconds
- Field switching: < 10 seconds for rapid succession

## Troubleshooting

### Common Issues

1. **ChromeDriver not found**
   ```bash
   make setup-tests
   ```

2. **Server not running**
   ```bash
   make test-with-server
   ```

3. **Port 8000 already in use**
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

4. **Tests timing out**
   - Increase timeout in test files
   - Check if server is responsive: `curl http://localhost:8000`

5. **Flaky tests**
   - Add appropriate `await testUtils.driver.sleep()` delays
   - Use `waitForElement()` instead of fixed delays
   - Check for race conditions in validation timing

### Getting Help
- Check test output for specific error messages
- Review screenshots in `tests/screenshots/` for visual debugging
- Enable non-headless mode to watch test execution
- Verify form functionality manually at http://localhost:8000

## Contributing

When contributing tests:
1. Follow existing patterns and naming conventions
2. Include both positive and negative test cases
3. Add appropriate timeouts and waits
4. Document any new test utilities
5. Ensure tests pass in both headless and non-headless modes
6. Update this README for significant changes
