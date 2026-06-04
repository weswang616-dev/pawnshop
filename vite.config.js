import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// In production we serve from a GitHub Pages project path (/pawnshop/); locally we stay at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/pawnshop/' : '/',
  plugins: [react()],
}))
