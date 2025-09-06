#!/bin/bash

# MindQuest Form Test Runner Script
# Usage: ./tests/run-tests.sh [test-type] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
HEADLESS=${HEADLESS:-true}
SERVER_PORT=${SERVER_PORT:-8000}
TEST_TIMEOUT=${TEST_TIMEOUT:-60000}
SERVER_PID=""

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ and try again."
        exit 1
    fi

    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3 and try again."
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi

    print_success "All prerequisites are available"
}

# Function to setup test environment
setup_environment() {
    print_status "Setting up test environment..."

    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
    fi

    # Setup ChromeDriver
    print_status "Setting up ChromeDriver..."
    npx selenium-manager --driver chromedriver || print_warning "ChromeDriver setup may have failed"

    print_success "Test environment setup complete"
}

# Function to start development server
start_server() {
    print_status "Starting development server on port $SERVER_PORT..."

    # Check if port is already in use
    if lsof -Pi :$SERVER_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $SERVER_PORT is already in use. Attempting to kill existing process..."
        lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi

    # Start server
    python3 -m http.server $SERVER_PORT &
    SERVER_PID=$!

    # Wait for server to start
    print_status "Waiting for server to start..."
    for i in {1..10}; do
        if curl -f http://localhost:$SERVER_PORT >/dev/null 2>&1; then
            print_success "Server is running (PID: $SERVER_PID)"
            return 0
        fi
        sleep 1
    done

    print_error "Failed to start server"
    return 1
}

# Function to stop development server
stop_server() {
    if [ ! -z "$SERVER_PID" ]; then
        print_status "Stopping server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
        print_success "Server stopped"
    fi

    # Cleanup any remaining processes
    pkill -f "python3 -m http.server" 2>/dev/null || true
}

# Function to run specific test suite
run_test_suite() {
    local test_type=$1
    local test_file=""
    local timeout=$TEST_TIMEOUT

    case $test_type in
        "success")
            test_file="tests/specs/formSuccess.test.js"
            ;;
        "validation")
            test_file="tests/specs/formValidation.test.js"
            ;;
        "performance")
            test_file="tests/specs/formPerformance.test.js"
            timeout=120000
            ;;
        "all"|"")
            test_file="tests/specs/**/*.test.js"
            ;;
        *)
            print_error "Unknown test type: $test_type"
            print_status "Available test types: success, validation, performance, all"
            return 1
            ;;
    esac

    print_status "Running $test_type tests..."

    # Set environment variables
    export HEADLESS=$HEADLESS
    export CI=${CI:-false}

    # Run tests
    if [ "$test_file" = "tests/specs/**/*.test.js" ]; then
        npm test
    else
        npx mocha "$test_file" --timeout $timeout
    fi
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    stop_server

    # Remove screenshots from failed tests older than 7 days
    if [ -d "tests/screenshots" ]; then
        find tests/screenshots -name "*.png" -mtime +7 -delete 2>/dev/null || true
    fi
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Function to show usage
show_usage() {
    echo "Usage: $0 [test-type] [options]"
    echo ""
    echo "Test Types:"
    echo "  success      - Run success scenario tests"
    echo "  validation   - Run validation and edge case tests"
    echo "  performance  - Run performance and stress tests"
    echo "  all          - Run all tests (default)"
    echo ""
    echo "Options:"
    echo "  --headless   - Run in headless mode (default: true)"
    echo "  --visible    - Run with visible browser"
    echo "  --port PORT  - Server port (default: 8000)"
    echo "  --timeout MS - Test timeout in milliseconds (default: 60000)"
    echo "  --help       - Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  HEADLESS=true|false    - Browser visibility"
    echo "  CI=true|false          - CI mode"
    echo "  SERVER_PORT=8000       - Development server port"
    echo "  TEST_TIMEOUT=60000     - Test timeout"
    echo ""
    echo "Examples:"
    echo "  $0                     - Run all tests"
    echo "  $0 success             - Run success tests only"
    echo "  $0 validation --visible - Run validation tests with visible browser"
    echo "  $0 performance --port 3000 - Run performance tests on port 3000"
}

# Parse command line arguments
TEST_TYPE="all"
while [[ $# -gt 0 ]]; do
    case $1 in
        success|validation|performance|all)
            TEST_TYPE=$1
            shift
            ;;
        --headless)
            HEADLESS=true
            shift
            ;;
        --visible)
            HEADLESS=false
            shift
            ;;
        --port)
            SERVER_PORT="$2"
            shift 2
            ;;
        --timeout)
            TEST_TIMEOUT="$2"
            shift 2
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_status "Starting MindQuest Form Test Suite"
    print_status "Test type: $TEST_TYPE"
    print_status "Headless mode: $HEADLESS"
    print_status "Server port: $SERVER_PORT"

    check_prerequisites
    setup_environment
    start_server

    # Run tests
    if run_test_suite "$TEST_TYPE"; then
        print_success "All tests completed successfully!"
        exit 0
    else
        print_error "Some tests failed!"
        exit 1
    fi
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
