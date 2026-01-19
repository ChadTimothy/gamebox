import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for widget development
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4444,
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/widgets/WordChallenge.tsx',
      name: 'WordChallengeWidget',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
