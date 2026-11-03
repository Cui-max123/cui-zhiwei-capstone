import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// base is empty on Vercel/Netlify and /<repo>/ on GitHub Pages.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: env.VITE_BASE || '/',
    server: {
      port: 5173,
      proxy: {
        // Narrow to `/api/` so the client route `/api-docs` is not forwarded.
        '/api/': {
          target: env.VITE_DEV_API || 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      globals: true,
      css: false
    }
  };
});
