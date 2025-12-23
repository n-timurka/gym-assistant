/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'assets/*'],
      manifest: {
        name: 'Gym Assistant',
        short_name: 'GymApp',
        description: 'Your personal gym workout tracker',
        theme_color: '#3880ff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'assets/icon/icon.png', // We need to check if these exist or use placeholders
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
