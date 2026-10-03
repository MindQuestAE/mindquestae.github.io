# MindQuest Site Management Makefile

# Development server
serve:
	python3 -m http.server 8000

# Playwright starts its own static server on port 8001.
install-test-deps:
	npm install

test:
	npm test

test-mobile:
	npm run test:mobile

test-desktop:
	npm run test:desktop

test-headed:
	npm run test:headed

test-legacy:
	npm run test:legacy

test-ci:
	CI=true npm test

# Version management
# sw.js is the single source of the release version (the "// Version" comment
# and CACHE_NAME; its precache URLs derive from CACHE_NAME). The same value is
# written to the ?v= query on styles.css and script.js in index.html so
# returning visitors never get new HTML with stale cached CSS/JS.
VERSION_RE = [0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*
CURRENT_VERSION = $(shell sed -n "s/^const CACHE_NAME = 'mindquest-v\(.*\)';/\1/p" sw.js)

bump-version:
	@echo "Current version: $(CURRENT_VERSION)"
	@echo "Bump type: [patch/minor/major] (default: patch)"
	@read BUMP_TYPE; \
	BUMP_TYPE=$${BUMP_TYPE:-patch}; \
	MAJOR=$$(echo "$(CURRENT_VERSION)" | cut -d. -f1); \
	MINOR=$$(echo "$(CURRENT_VERSION)" | cut -d. -f2); \
	PATCH=$$(echo "$(CURRENT_VERSION)" | cut -d. -f3); \
	case $$BUMP_TYPE in \
		major) NEW_VERSION="$$(expr $$MAJOR + 1).0.0" ;; \
		minor) NEW_VERSION="$$MAJOR.$$(expr $$MINOR + 1).0" ;; \
		patch) NEW_VERSION="$$MAJOR.$$MINOR.$$(expr $$PATCH + 1)" ;; \
		*) echo "Invalid bump type. Use patch, minor, or major."; exit 1 ;; \
	esac; \
	$(MAKE) --no-print-directory bump-version-to VERSION=$$NEW_VERSION

bump-version-to:
	@if ! echo "$(VERSION)" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$$'; then \
		echo "Usage: make bump-version-to VERSION=1.2.3"; \
		exit 1; \
	fi
	@sed -i.bak "s/Version $(VERSION_RE)/Version $(VERSION)/; s/mindquest-v$(VERSION_RE)/mindquest-v$(VERSION)/" sw.js
	@sed -i.bak "s/\(assets\/styles\.css?v=\)$(VERSION_RE)/\1$(VERSION)/; s/\(assets\/script\.js?v=\)$(VERSION_RE)/\1$(VERSION)/" index.html
	@rm -f sw.js.bak index.html.bak
	@test "$$(grep -c "mindquest-v$(VERSION)'" sw.js)" = 1 || { echo "sw.js CACHE_NAME was not updated"; exit 1; }
	@test "$$(grep -c "?v=$(VERSION)\"" index.html)" = 2 || { echo "index.html ?v= values were not updated"; exit 1; }
	@echo "✓ sw.js and index.html asset URLs set to version $(VERSION)"

# Cleanup
clean-test:
	rm -rf tests/artifacts
	rm -rf tests/screenshots

# Help
help:
	@echo "MindQuest Site Management Commands:"
	@echo ""
	@echo "Development:"
	@echo "  serve              - Start development server on port 8000"
	@echo ""
	@echo "Testing:"
	@echo "  install-test-deps  - Install test dependencies"
	@echo "  test               - Run all tests"
	@echo "  test-mobile        - Run mobile Playwright projects"
	@echo "  test-desktop       - Run desktop Playwright projects"
	@echo "  test-headed        - Run with visible browsers"
	@echo "  test-legacy        - Run retained Mocha/Selenium tests"
	@echo "  test-ci            - Run Playwright in CI mode"
	@echo ""
	@echo "Version Management:"
	@echo "  bump-version       - Interactively bump the release version in sw.js and index.html (patch/minor/major)"
	@echo "  bump-version-to    - Set specific version: make bump-version-to VERSION=1.2.3"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean-test         - Clean test artifacts and dependencies"
	@echo "  help               - Show this help message"
	@echo ""

.PHONY: serve install-test-deps test test-mobile test-desktop test-headed test-legacy test-ci bump-version bump-version-to clean-test help
