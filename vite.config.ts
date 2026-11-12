import { fileURLToPath, URL } from 'node:url';
import { execFileSync } from 'node:child_process';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const path = (file: string) => fileURLToPath(new URL(file, import.meta.url));
const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? (() => {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return 'local'; }
})();

// The workbench in apps/preview serves the app; `@/` imports reach the skin in src/.
export default defineConfig({
  root: path('./apps/preview'),
  // Root deployment; all nested workbench/media URLs share this base.
  base: '/',
  plugins: [tailwindcss(), react(), {
    name: 'ma-build-revision',
    // Invisible deployment provenance, so Preview QA cannot accidentally test an older branch build.
    transformIndexHtml: () => [{
      tag: 'meta',
      attrs: { name: 'ma-revision', content: revision },
      injectTo: 'head',
    }],
  }],
  resolve: {
    alias: {
      '@preview': path('./apps/preview/src'),
      '@': path('./src'),
    },
  },
  server: {
    fs: { allow: [path('.')] },
  },
  build: {
    outDir: path('./dist'),
    emptyOutDir: true,
    rolldownOptions: {
      // The workbench shell, and the preview page it frames.
      input: { home: path('./apps/preview/index.html'), workbench: path('./apps/preview/workbench/index.html'), preview: path('./apps/preview/preview.html'), ma: path('./apps/preview/ma.html') },
    },
  },
});
