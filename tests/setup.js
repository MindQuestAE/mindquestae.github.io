// Global test setup
const { expect } = require('chai');

// Global test configuration
global.expect = expect;

// Set longer timeout for all tests
if (typeof process !== 'undefined' && process.env.CI) {
  // In CI environment, use longer timeouts
  const originalTimeout = setTimeout;
  global.setTimeout = function(fn, delay) {
    return originalTimeout(fn, Math.max(delay, 1000));
  };
}

// Handle uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Cleanup function for tests
global.cleanup = function() {
  // Add any global cleanup logic here
  console.log('🧹 Cleaning up test resources');
};

// Log test suite start
console.log('🚀 Starting MindQuest Form Test Suite');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Headless mode:', process.env.HEADLESS === 'true' || process.env.CI === 'true');
