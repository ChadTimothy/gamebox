import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite configuration for widget development
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Use relative paths for assets
  server: {
    port: 4444,
    host: '0.0.0.0', // Allow external access
    strictPort: true,
    hmr: {
      clientPort: 4444,
    },
    cors: true, // Enable CORS
    allowedHosts: [
      'localhost',
      '.serveousercontent.com',
      '.ngrok.app',
      '.ngrok-free.app',
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
});
