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
      globals: true,
      transformMode: {
        web: [/\.[jt]sx?$/],
      },
      coverage: {
        resolve: {
          conditions: ['development', 'browser'],
        },
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        provider: 'v8', // or 'istanbul'
        reporter: ['text', 'html'], // or 'json', 'lcov'
      },
      environment: 'jsdom',
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
