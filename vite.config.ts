/// <reference types="vitest/config" />

import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
    tsconfigPaths(),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      name: 'contentful-ai-sdk',
      formats: ['es', 'umd'],
      fileName: (format) => `contentful-ai-sdk.${format}.js`,
    },
  },
  test: {},
}));
