import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, './build'),
    rollupOptions: {
      input: {
        logic: path.resolve(__dirname, './src/index.ts')
      },
      output: {
        entryFileNames: 'core.js'
      }
    }
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
});
