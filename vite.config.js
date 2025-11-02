import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/BodogeTimer/', // GitHub Pages用（リポジトリ名に合わせて変更）
})
