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

# Version management
bump-version:
	@echo "Current version in sw.js:"
	@grep "Version" sw.js | head -1
	@echo ""
	@echo "Bump type: [patch/minor/major] (default: patch)"
	@read BUMP_TYPE; \
	BUMP_TYPE=$${BUMP_TYPE:-patch}; \
	CURRENT_VERSION=$$(grep -o "Version [0-9]*\.[0-9]*\.[0-9]*" sw.js | head -1 | awk '{print $$2}'); \
	IFS='.' read -r MAJOR MINOR PATCH <<< "$$CURRENT_VERSION"; \
	case $$BUMP_TYPE in \
		major) NEW_VERSION="$$((MAJOR + 1)).0.0" ;; \
		minor) NEW_VERSION="$$MAJOR.$$((MINOR + 1)).0" ;; \
		patch) NEW_VERSION="$$MAJOR.$$MINOR.$$((PATCH + 1))" ;; \
		*) echo "Invalid bump type. Use patch, minor, or major."; exit 1 ;; \
	esac; \
	echo "Updating version from $$CURRENT_VERSION to $$NEW_VERSION..."; \
	sed -i.bak "s/Version [0-9]*\.[0-9]*\.[0-9]*/Version $$NEW_VERSION/g" sw.js; \
	sed -i.bak "s/mindquest-v[0-9]*\.[0-9]*\.[0-9]*/mindquest-v$$NEW_VERSION/g" sw.js; \
	rm -f sw.js.bak; \
	echo "✓ Service worker updated to version $$NEW_VERSION"

bump-version-to:
	@if [ -z "$(VERSION)" ]; then \
		echo "Usage: make bump-version-to VERSION=1.2.3"; \
		exit 1; \
	fi; \
	echo "Updating service worker to version $(VERSION)..."; \
	sed -i.bak "s/Version [0-9]*\.[0-9]*\.[0-9]*/Version $(VERSION)/g" sw.js; \
	sed -i.bak "s/mindquest-v[0-9]*\.[0-9]*\.[0-9]*/mindquest-v$(VERSION)/g" sw.js; \
	rm -f sw.js.bak; \
	echo "✓ Service worker updated to version $(VERSION)"

# Cleanup
clean-test:
	rm -rf tests/screenshots
	rm -rf node_modules
	rm -f package-lock.json

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
	@echo "Version Management:"
	@echo "  bump-version       - Interactively bump service worker version (patch/minor/major)"
	@echo "  bump-version-to    - Set specific version: make bump-version-to VERSION=1.2.3"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean-test         - Clean test artifacts and dependencies"
	@echo "  help               - Show this help message"
	@echo ""

.PHONY: serve install-test-deps setup-tests test test-headless test-success test-validation test-performance test-watch test-ci test-with-server test-full bump-version bump-version-to clean-test help