import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { contentPlugin } from './scripts/content-plugin.ts';

export default defineConfig({
  plugins: [react(), contentPlugin()],
  // Relative paths, so the site works from any web address (e.g. a GitHub Pages sub-folder).
  base: './',
  server: { port: 5173 },
});
