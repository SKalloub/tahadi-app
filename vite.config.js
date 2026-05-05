import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // تأكد إن الـ base path مطابق لاسم المستودع عندك على GitHub
  base: '/tahadi-app/', 
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-group.svg'],
      manifest: {
        name: 'Tahadi App - Football Stats',
        short_name: 'Tahadi',
        description: 'أرشيف جداول وإحصائيات كرة القدم أوفلاين',
        theme_color: '#9333ea',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/tahadi-app/',
        start_url: '/tahadi-app/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // تخزين كافة الملفات لضمان العمل بدون إنترنت
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // ضمان عمل الراوتر الداخلي (Client-side routing) وأنت أوفلاين
        navigateFallback: '/tahadi-app/index.html'
      }
    })
  ],
})