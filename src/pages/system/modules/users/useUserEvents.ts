import { onMounted, onUnmounted } from 'vue'

/**
 * 用户事件相关逻辑
 */
export function useUserEvents(fetchUserList: () => void) {
  // 监听刷新用户列表事件
  const handleRefreshUserList = () => {
    console.log('收到刷新用户列表事件')
    // 增加延时确保数据库操作完成
    setTimeout(() => {
      fetchUserList()
    }, 500) // 增加延时时间
  }

  // 组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('refresh-user-list', handleRefreshUserList)
  })

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('refresh-user-list', handleRefreshUserList)
  })
}