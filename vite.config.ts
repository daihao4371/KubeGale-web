import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000, // 已经设置为3000
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080', // 修改为正确的后端服务器地址
        changeOrigin: true,
      }
    }
  }
})
