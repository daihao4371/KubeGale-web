import { removeToken } from './auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

/**
 * 退出登录
 * 清除所有用户相关的数据并跳转到登录页
 */
export function logout() {
  // 清除 token
  removeToken()
  
  // 清除本地存储中的用户信息
  localStorage.removeItem('userInfo')
  
  // 清除其他可能存在的用户相关数据
  localStorage.removeItem('rememberMe')
  sessionStorage.clear()
  
  // 显示退出成功消息
  ElMessage.success('退出登录成功')
  
  // 跳转到登录页
  router.push('/login')
}