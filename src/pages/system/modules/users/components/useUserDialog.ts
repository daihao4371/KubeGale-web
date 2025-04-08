import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfo } from '@/api/system/userManage'

export function useUserDialog() {
  // 控制用户信息对话框显示
  const showUserInfoDialog = ref(false)
  const userInfoCardRef = ref<{ refreshUserInfo: () => void } | null>(null)
  const currentUserId = ref<number | undefined>(undefined)
  const currentUserName = ref<string>('')

  // 查看用户详情
  const handleViewUserInfo = (row: any) => {
    currentUserId.value = row.id
    currentUserName.value = row.userName || ''
    showUserInfoDialog.value = true
    // 如果打开对话框，刷新用户信息
    if (userInfoCardRef.value) {
      const cardRef = userInfoCardRef.value // 保存引用到局部变量
      setTimeout(() => {
        cardRef?.refreshUserInfo() // 使用可选链操作符
      }, 100)
    }
  }

  // 切换用户信息对话框显示状态 - 用于显示当前登录用户的信息
  const toggleUserInfo = () => {
    // 当通过设置图标打开时，不设置特定用户ID，显示当前登录用户信息
    currentUserId.value = undefined
    
    // 尝试从本地存储获取当前用户名
    try {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr)
        currentUserName.value = userInfo.userName || userInfo.username || '当前用户'
      } else {
        currentUserName.value = '当前用户'
      }
    } catch (e) {
      currentUserName.value = '当前用户'
    }
    
    showUserInfoDialog.value = !showUserInfoDialog.value
    // 如果打开对话框，刷新用户信息
    if (showUserInfoDialog.value && userInfoCardRef.value) {
      const cardRef = userInfoCardRef.value // 保存引用到局部变量
      setTimeout(() => {
        cardRef?.refreshUserInfo() // 使用可选链操作符
      }, 100)
    }
  }

  // 监听全局事件
  const handleOpenUserInfoDialog = () => {
    toggleUserInfo()
  }

  // 组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('open-user-info-dialog', handleOpenUserInfoDialog)
  })

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('open-user-info-dialog', handleOpenUserInfoDialog)
  })

  // 添加用户（暂不实现具体逻辑）
  const handleAdd = () => {
    ElMessage.info('新增用户功能待实现')
  }

  // 编辑用户（暂不实现具体逻辑）
  const handleEdit = (row: any) => {
    ElMessage.info(`编辑用户功能待实现，用户ID: ${row.id}`)
  }

  // 重置密码（暂不实现具体逻辑）
  const handleResetPassword = (row: any) => {
    ElMessage.info(`重置密码功能待实现，用户ID: ${row.id}`)
  }

  // 删除用户（暂不实现具体逻辑）
  const handleDelete = (row: any) => {
    ElMessage.info(`删除用户功能待实现，用户ID: ${row.id}`)
  }

  return {
    showUserInfoDialog,
    userInfoCardRef,
    currentUserId,
    currentUserName,
    handleViewUserInfo,
    toggleUserInfo,
    handleAdd,
    handleEdit,
    handleResetPassword,
    handleDelete
  }
}