import dns from 'node:dns';
import { defineConfig } from 'vite';
dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3012,
  },
  build: {
    outDir: './build',
  },
  base: '/lucerna-lecto/',
  resolve: {
    alias: {
      src: '/src',
    },
  },
});
