import service from './service'
import { API_URLS } from './config'

// 用户登录 - 更新为新的接口
export function login(data: { username: string; password: string }) {
  console.log('调用登录API:', API_URLS.login, data)
  return service({
    url: API_URLS.login,
    method: 'post',
    data
  })
}

// 移除后端退出登录函数，改为前端实现
// export function logout() {
//   console.log('调用退出登录API')
//   return service({
//     url: API_URLS.logout,
//     method: 'post'
//   })
// }