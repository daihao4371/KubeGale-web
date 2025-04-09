import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { setUserInfo } from '@/api/system/userManage'
import type { UserInfo } from '@/api/system/userManage'

export function useUserStatus() {
  // 处理用户状态变更
  const handleStatusChange = async (user: UserInfo, status: number) => {
    // 添加状态加载标志
    if (!user.statusLoading) {
      user.statusLoading = ref(false)
    }
    
    user.statusLoading = true
    
    try {
      // 使用 setUserInfo API 更新用户状态
      const response = await setUserInfo({
        ID: user.id,
        enable: status
      })
      
      if (response.data && response.data.code === 0) {
        ElMessage.success(`用户${status === 1 ? '启用' : '禁用'}成功`)
        // 更新本地状态
        user.enable = status
      } else {
        ElMessage.error(response.data?.msg || `用户${status === 1 ? '启用' : '禁用'}失败`)
        // 恢复原状态
        user.enable = status === 1 ? 0 : 1
      }
    } catch (error) {
      console.error('更新用户状态失败:', error)
      ElMessage.error(`用户${status === 1 ? '启用' : '禁用'}失败，请重试`)
      // 恢复原状态
      user.enable = status === 1 ? 0 : 1
    } finally {
      user.statusLoading = false
    }
  }

  return {
    handleStatusChange
  }
}