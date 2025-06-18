import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'clover'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.d.ts', '**/*.test.ts'],
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70
      }
    },
    setupFiles: ['./test/setup.ts']
  }
});