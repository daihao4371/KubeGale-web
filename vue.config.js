const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 添加开发服务器配置
  devServer: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080', // 修改为本地后端服务地址，端口根据实际情况调整
        changeOrigin: true,
        timeout: 60000, // 增加超时时间到60秒
        onError: (err, req, res) => {
          console.log('代理请求错误:', err);
        }
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
