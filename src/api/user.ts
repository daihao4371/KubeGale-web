import axios from 'axios'
import { API_URLS } from './system/config'

// 创建axios实例
const service = axios.create({
  baseURL: '',  // 不设置基础URL，使用完整路径
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    console.log('发送请求:', config.url)
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
    return Promise.reject(error)
  }
)

// 用户登录
export function login(data: { username: string; password: string }) {
  console.log('调用登录API:', API_URLS.login, data)
  return service({
    url: API_URLS.login,
    method: 'post',
    data
  })
}

// 可以添加更多用户相关API...