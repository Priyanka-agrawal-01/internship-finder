import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Two pages: the static landing page (index.html, built with the design kit in
// public/assets, which is copied to dist/assets unchanged: the kit's checks require
// its files to ship as they are) and the React app (app.html: job feed, company
// guides, alerts). Vite's own bundles go to dist/static so they never mix with the kit.
export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: 'static',
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        app: path.resolve(import.meta.dirname, 'app.html'),
      },
    },
  },
})
