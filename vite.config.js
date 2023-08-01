import Path from 'node:path'
import UnoCSS from 'unocss/vite'
import vuePlugin from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const config = defineConfig({
  root: Path.join(__dirname, 'src', 'renderer'),
  publicDir: 'public',
  server: {
    port: 8080,
  },
  open: false,
  build: {
    outDir: Path.join(__dirname, 'build', 'renderer'),
    emptyOutDir: true,
  },
  plugins: [
    vuePlugin(),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      '~': Path.resolve(__dirname, './src/renderer'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
})

export default config
