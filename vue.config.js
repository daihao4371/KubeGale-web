const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 添加开发服务器配置
  devServer: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://192.168.1.197:8080',
        changeOrigin: true
      }
    }
  }
})
