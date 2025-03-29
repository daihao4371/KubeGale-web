import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: '',  // 不设置基础URL，使用完整路径
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    console.log('发送请求:', config.url)
    
    // 添加token到请求头
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('收到响应:', response.data)
    return response
  },
  error => {
    console.error('请求错误:', error)
    if (error.response) {
      console.error('错误状态码:', error.response.status)
      console.error('错误数据:', error.response.data)
    }
    ElMessage.error(error.message || '网络请求失败')
    return Promise.reject(error)
  }
)

export default service