import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  // 修复环境变量读取问题
  baseURL: '',  // 使用空字符串作为基础URL
  timeout: 30000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 确保请求头包含正确的内容类型
    if (config.method?.toLowerCase() === 'post' || config.method?.toLowerCase() === 'put') {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 直接返回响应，在业务逻辑中处理
    return response
  },
  (error) => {
    console.error('响应错误:', error)
    
    // 处理HTTP错误状态码
    const status = error.response?.status
    let message = '请求失败，请重试'
    
    if (status === 401) {
      message = '未授权，请重新登录'
      // 清除token并重定向到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (status === 403) {
      message = '拒绝访问'
    } else if (status === 404) {
      message = '请求的资源不存在'
    } else if (status === 500) {
      message = '服务器错误'
    }
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service