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
    port: 3000,  // 已经设置为3000
    proxy: {
      '/api': {
        target: 'http://192.168.1.197:8080',
        changeOrigin: true,
      }
    }
  }
})


// proxy: {
//   '/api': {
//     target: 'http://106.54.215.193:8010',
//     changeOrigin: true,
//   },
// }