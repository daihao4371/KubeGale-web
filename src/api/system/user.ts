import service from './service'
import { API_URLS } from './config'

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

// 可以添加更多用户相关API...