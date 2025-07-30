// Test setup file
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;

// Mock console.log to reduce test noise
const originalConsoleLog = console.log;
console.log = (...args) => {
  // Only log in test if explicitly needed
  if (process.env.TEST_VERBOSE) {
    originalConsoleLog(...args);
  }
};

// Global test timeout
jest.setTimeout(10000);
