import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "StudyMate AI",
        short_name: "StudyMate",
        description: "AI-powered study platform",
        theme_color: "#6C63FF",
        background_color: "#0F0F1A",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api":      { target: "http://localhost:3001", changeOrigin: true },
      "/uploads":  { target: "http://localhost:3001", changeOrigin: true },
      "/socket.io":{ target: "http://localhost:3001", ws: true, changeOrigin: true },
    },
  },
  build: { outDir: "dist" },
});
