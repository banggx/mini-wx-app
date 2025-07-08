import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue2';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      formats: ['iife'],
      name: 'components',
    },
    outDir: path.resolve(__dirname, 'dist'),
    rollupOptions: {
      external: ['vue']
    },
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
});
