import { defineConfig } from 'vite';

export default defineConfig({
  base: '/calculator/',
  test: {
    environment: 'jsdom',
  },
});
