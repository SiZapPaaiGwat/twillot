/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import solidPlugin from 'vite-plugin-solid'
import manifest from './src/manifest.jsx'

export default defineConfig(({ mode }) => {
  return {
    server: {
      hmr: {
        host: 'localhost',
        port: 9527,
      },
    },
    test: {
      globals: true, // makes `describe`, `expect`, `it` etc. available globally
      transformMode: {
        web: [/\.[jt]sx?$/], // transforms .js, .jsx, .ts, .tsx files
      },
      coverage: {
        resolve: {
          conditions: ['development', 'browser'],
        },
        provider: 'v8', // or 'istanbul'
        reporter: ['text', 'html'], // or 'json', 'lcov'
      },
      environment: 'jsdom', // or 'happy-dom', 'node'
      pool: 'forks',
      poolOptions: {
        forks: {
          isolate: false,
        },
      },
      deps: {
        optimizer: {
          web: {
            exclude: ['solid-js'],
          },
        },
      },
    },
    resolve: {
      conditions: ['development', 'browser'],
    },
    build: {
      emptyOutDir: true,
      outDir: 'build',
      target: 'esnext',
      polyfillDynamicImport: false,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },
    plugins: [crx({ manifest }), solidPlugin()],
  }
})
