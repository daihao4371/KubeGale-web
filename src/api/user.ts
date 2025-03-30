import axios from 'axios'
import { API_URLS } from './system/config'
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

// 用户退出登录
export function logout() {
  console.log('调用退出登录API')
  return service({
    url: API_URLS.logout,
    method: 'post'
  })
}

// 修改密码
export function changePassword(data: { 
  username: string; 
  password: string; 
  newPassword: string;
  confirmPassword: string;
}) {
  console.log('调用修改密码API')
  return service({
    url: API_URLS.changePassword,
    method: 'post',
    data
  })
}