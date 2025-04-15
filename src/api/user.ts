import axios from 'axios'
import { API_URLS } from '@/api/system/config'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: '', // API 的 base_url
  timeout: 15000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = getToken()
    if (token) {
      // 让每个请求携带token
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response
  },
  error => {
    // 对响应错误做点什么
    console.error('响应错误:', error)
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

// 退出登录函数，调用后端接口
export function logout() {
  console.log('调用退出登录API:', API_URLS.logout)
  return service({
    url: API_URLS.logout,
    method: 'post'
  })
}

export default service