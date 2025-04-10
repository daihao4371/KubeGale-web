import Cookies from 'js-cookie'

const TokenKey = 'kubegale_token'

// 获取 token
export function getToken() {
  return Cookies.get('token')
}

// 设置 token
export function setToken(token: string) {
  return Cookies.set('token', token)
}

// 清除 token
export function removeToken() {
  return Cookies.remove('token')
}
