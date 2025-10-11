# MindQuest Site Management Makefile

# Development server
serve:
	python3 -m http.server 8000

# Test setup and execution
install-test-deps:
	npm install

setup-tests: install-test-deps
	npx selenium-manager --driver chromedriver || echo "ChromeDriver setup attempted"

# Test execution commands
test: setup-tests
	npm test

test-headless: setup-tests
	HEADLESS=true npm test

test-success: setup-tests
	npx mocha tests/specs/formSuccess.test.js --timeout 60000

test-validation: setup-tests
	npx mocha tests/specs/formValidation.test.js --timeout 60000

test-performance: setup-tests
	npx mocha tests/specs/formPerformance.test.js --timeout 120000

test-watch: setup-tests
	npm run test:watch

# CI/CD integration
test-ci: install-test-deps
	HEADLESS=true CI=true npm test

# Test with server
test-with-server:
	@echo "Starting server and running tests..."
	python3 -m http.server 8000 & \
	SERVER_PID=$$!; \
	sleep 3; \
	echo "Server started with PID $$SERVER_PID"; \
	HEADLESS=true npm test; \
	TEST_RESULT=$$?; \
	echo "Stopping server with PID $$SERVER_PID"; \
	kill $$SERVER_PID 2>/dev/null || true; \
	exit $$TEST_RESULT

# Full test suite with server
test-full: test-with-server

# Cleanup
clean-test:
	rm -rf tests/screenshots
	rm -rf node_modules
	rm -f package-lock.json

# Version management
bump-version:
	@echo "Current version:"
	@grep "const CACHE_VERSION" sw.js | sed "s/.*'\(.*\)'.*/\1/"
	@echo ""
	@read -p "Enter new version (e.g., v1.0.1): " version; \
	if [ -z "$$version" ]; then \
		echo "Error: Version cannot be empty"; \
		exit 1; \
	fi; \
	sed -i.bak "s/const CACHE_VERSION = 'v[0-9]*\.[0-9]*\.[0-9]*'/const CACHE_VERSION = '$$version'/" sw.js && \
	rm -f sw.js.bak && \
	echo "✓ Service Worker version updated to $$version" && \
	echo "✓ Changes made to sw.js - remember to commit!"

bump-version-patch:
	@current=$$(grep "const CACHE_VERSION" sw.js | sed "s/.*'v\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)'.*/\1.\2.\3/"); \
	major=$$(echo $$current | cut -d. -f1); \
	minor=$$(echo $$current | cut -d. -f2); \
	patch=$$(echo $$current | cut -d. -f3); \
	new_patch=$$((patch + 1)); \
	new_version="v$$major.$$minor.$$new_patch"; \
	echo "Bumping version from v$$current to $$new_version"; \
	sed -i.bak "s/const CACHE_VERSION = 'v[0-9]*\.[0-9]*\.[0-9]*'/const CACHE_VERSION = '$$new_version'/" sw.js && \
	rm -f sw.js.bak && \
	echo "✓ Service Worker version updated to $$new_version"

bump-version-minor:
	@current=$$(grep "const CACHE_VERSION" sw.js | sed "s/.*'v\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)'.*/\1.\2.\3/"); \
	major=$$(echo $$current | cut -d. -f1); \
	minor=$$(echo $$current | cut -d. -f2); \
	new_minor=$$((minor + 1)); \
	new_version="v$$major.$$new_minor.0"; \
	echo "Bumping version from v$$current to $$new_version"; \
	sed -i.bak "s/const CACHE_VERSION = 'v[0-9]*\.[0-9]*\.[0-9]*'/const CACHE_VERSION = '$$new_version'/" sw.js && \
	rm -f sw.js.bak && \
	echo "✓ Service Worker version updated to $$new_version"

bump-version-major:
	@current=$$(grep "const CACHE_VERSION" sw.js | sed "s/.*'v\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)'.*/\1.\2.\3/"); \
	major=$$(echo $$current | cut -d. -f1); \
	new_major=$$((major + 1)); \
	new_version="v$$new_major.0.0"; \
	echo "Bumping version from v$$current to $$new_version"; \
	sed -i.bak "s/const CACHE_VERSION = 'v[0-9]*\.[0-9]*\.[0-9]*'/const CACHE_VERSION = '$$new_version'/" sw.js && \
	rm -f sw.js.bak && \
	echo "✓ Service Worker version updated to $$new_version"

show-version:
	@echo "Current Service Worker version:"
	@grep "const CACHE_VERSION" sw.js | sed "s/.*'\(.*\)'.*/\1/"

# Help
help:
	@echo "MindQuest Site Management Commands:"
	@echo ""
	@echo "Development:"
	@echo "  serve              - Start development server on port 8000"
	@echo ""
	@echo "Testing:"
	@echo "  install-test-deps  - Install test dependencies"
	@echo "  setup-tests        - Setup test environment"
	@echo "  test               - Run all tests"
	@echo "  test-headless      - Run tests in headless mode"
	@echo "  test-success       - Run success scenario tests only"
	@echo "  test-validation    - Run validation tests only"
	@echo "  test-performance   - Run performance tests only"
	@echo "  test-watch         - Run tests in watch mode"
	@echo "  test-ci            - Run tests in CI mode"
	@echo "  test-with-server   - Start server and run tests"
	@echo "  test-full          - Run complete test suite with server"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean-test         - Clean test artifacts and dependencies"
	@echo ""
	@echo "Version Management:"
	@echo "  show-version       - Display current service worker version"
	@echo "  bump-version       - Manually set service worker version"
	@echo "  bump-version-patch - Auto-increment patch version (1.0.0 -> 1.0.1)"
	@echo "  bump-version-minor - Auto-increment minor version (1.0.0 -> 1.1.0)"
	@echo "  bump-version-major - Auto-increment major version (1.0.0 -> 2.0.0)"
	@echo ""
	@echo "Help:"
	@echo "  help               - Show this help message"
	@echo ""

.PHONY: serve install-test-deps setup-tests test test-headless test-success test-validation test-performance test-watch test-ci test-with-server test-full clean-test bump-version bump-version-patch bump-version-minor bump-version-major show-version help