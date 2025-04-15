import { removeToken } from './auth'
import router from '@/router'
import store from '@/store'
import { ElMessage } from 'element-plus'

/**
 * 退出登录
 * 清除所有用户相关的数据并跳转到登录页
 */
export async function logout() {
  try {
    // 调用Vuex中的logout action
    await store.dispatch('logout')
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败，请重试')
  }
}