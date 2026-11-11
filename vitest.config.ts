import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const alias = { '@': path.resolve(__dirname, './src') }

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    globals: true,
    css: false,
    projects: [
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'app',
          environment: 'jsdom',
          globals: true,
          css: false,
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'node',
          environment: 'node',
          globals: true,
          include: ['worker/**/*.test.ts', 'scripts/**/*.test.ts'],
        },
      },
    ],
  },
})
