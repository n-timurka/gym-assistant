/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon.png",
        "assets/icon/*.png",
        "assets/icon/*.svg",
        "browserconfig.xml",
        "sounds/alarm.mp3",
      ],
      manifest: {
        name: "Gym Assistant",
        short_name: "GymApp",
        description: "Your personal gym workout tracker",
        id: "/",
        start_url: "/",
        scope: "/",
        theme_color: "#131720",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "assets/icon/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "assets/icon/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "assets/icon/maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "assets/icon/maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,svg,webp,woff2}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "audio",
            handler: "CacheFirst",
            options: { cacheName: "audio-cache" },
          },
          {
            urlPattern: ({ request, url }) =>
              request.destination === "image" ||
              url.pathname.startsWith("/assets/exercises/"),
            handler: "CacheFirst",
            options: {
              cacheName: "gym-assistant-images",
              expiration: {
                maxEntries: 160,
                maxAgeSeconds: 60 * 60 * 24 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
