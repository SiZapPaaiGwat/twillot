import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig as any,
  defineConfig({
    test: {
      setupFiles: ['vitest.setup.ts'],
      server: {
        deps: {
          include: ['@webext-core/storage', '@webext-core/fake-browser'],
        },
      },
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
  } as any),
)
