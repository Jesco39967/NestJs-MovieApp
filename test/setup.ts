import { vi } from 'vitest';

// Global test setup file
// Add any global test configurations or mocks here

// Example: Disable console logs during tests
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});