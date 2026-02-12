import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Use '/Mood-Tracker/' for GitHub Pages, './' for Android app
const isAndroid = process.env.BUILD_ANDROID === 'true'

export default defineConfig({
  base: isAndroid ? './' : '/Mood-Tracker/',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
