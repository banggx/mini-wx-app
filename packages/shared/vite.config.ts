import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({
    outDir: path.resolve(__dirname, 'types'),
  })],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      name: 'shared',
      formats: ['es', 'umd'],
      fileName: (format) => `shared.${format}.js` // 
    },
    sourcemap: true,
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
});
