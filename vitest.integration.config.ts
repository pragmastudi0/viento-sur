import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { loadLocalTestEnvironment } from './tests/local-env';
loadLocalTestEnvironment();
export default defineConfig({ resolve: { alias: { '@': resolve(__dirname), 'server-only': resolve(__dirname, 'tests/server-only.ts') } }, test: { include: ['tests/integration/**/*.test.ts'], environment: 'node', testTimeout: 30000, hookTimeout: 30000, fileParallelism: false } });
