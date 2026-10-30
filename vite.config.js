import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// `base: './'` keeps every asset URL relative, so the build works from any
// GitHub Pages sub-path (https://user.github.io/<repo>/) without extra config.
// Routing uses HashRouter, so deep links never 404 on static hosting.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
