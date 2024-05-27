import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import solidPlugin from 'vite-plugin-solid'
import manifest from './src/manifest.jsx'

export default defineConfig({
  server: {
    hmr: {
      host: 'localhost',
      port: 9527,
    },
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
  build: {
    emptyOutDir: true,
    outDir: 'build',
    target: 'esnext',
    // polyfillDynamicImport: false,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/chunk-[hash].js',
      },
    },
  },
  plugins: [crx({ manifest }), solidPlugin()],
})
