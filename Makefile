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
	@echo "  help               - Show this help message"
	@echo ""

.PHONY: serve install-test-deps setup-tests test test-headless test-success test-validation test-performance test-watch test-ci test-with-server test-full clean-test help