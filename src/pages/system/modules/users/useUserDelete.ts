import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteUser } from '@/api/system/userManage'
import type { UserInfo } from '@/api/system/userManage'

export function useUserDelete() {
  // 处理用户删除
  const handleDeleteUser = async (user: UserInfo) => {
    try {
      // 显示确认对话框
      await ElMessageBox.confirm(
        `确定要删除用户 "${user.userName || '未命名用户'}" 吗？此操作不可恢复！`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      // 用户确认删除，调用删除API
      const response = await deleteUser(user.id)
      
      if (response.data && response.data.code === 0) {
        ElMessage.success('用户删除成功')
        // 触发刷新用户列表事件
        window.dispatchEvent(new CustomEvent('refresh-user-list'))
        return true
      } else {
        ElMessage.error(response.data?.msg || '删除用户失败')
        return false
      }
    } catch (error: any) {
      // 用户取消删除或发生错误
      if (error === 'cancel' || error?.message === 'cancel') {
        // 用户取消操作，不显示错误
        return false
      }
      
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败，请重试')
      return false
    }
  }

  return {
    handleDeleteUser
  }
}