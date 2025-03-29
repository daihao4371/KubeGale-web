const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 添加开发服务器配置
  devServer: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://192.168.1.197:3000',
        changeOrigin: true
      }
    }
  },
  // 添加页面标题配置
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'KubeGale平台'
        return args
      })
  }
})
