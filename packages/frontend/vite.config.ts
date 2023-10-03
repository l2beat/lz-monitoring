import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@lz/libs'],
  },
  build: {
    commonjsOptions: {
      include: [/@lz\/libs/, /node_modules/],
    },
  },
})
