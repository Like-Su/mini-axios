import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'mini-axios',
      fileName: 'mini-axios'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'lib'),
    }
  }
})
