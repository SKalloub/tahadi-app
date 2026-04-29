import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // إذا كنت شغال v4

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/tahadi-app/', // اسم المستودع تبعك هون بين سلاشين
})