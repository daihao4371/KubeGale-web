import { onMounted, onUnmounted } from 'vue'

export function useUserEvents(fetchUserList: () => void) {
  // 监听刷新用户列表事件
  const handleRefreshUserList = () => {
    fetchUserList()
  }

  // 组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('refresh-user-list', handleRefreshUserList)
  })

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('refresh-user-list', handleRefreshUserList)
  })

  return {
    handleRefreshUserList
  }
}