import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        HandlePasswordForms: path.resolve(__dirname, "src/BackgroundWorkers/HandlePasswordForms.ts"),
        TriggerPopupListener: path.resolve(__dirname, "src/BackgroundWorkers/TriggerPopupListener.ts")
      },
      output: {
        entryFileNames: "[name].js"
      }
    },
    outDir: "dist"
  }
})
