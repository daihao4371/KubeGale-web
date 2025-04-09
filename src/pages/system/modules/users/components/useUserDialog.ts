import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserInfo } from '@/api/system/userManage'
import { registerUser } from '@/api/system/userManage' // 需要在userManage.ts中添加此API
// 将导入移到顶部
import { UserFormData } from './useUserForm'

export function useUserDialog() {
  // 控制用户信息对话框显示
  const showUserInfoDialog = ref(false)
  const userInfoCardRef = ref<{ refreshUserInfo: () => void } | null>(null)
  const currentUserId = ref<number | undefined>(undefined)
  const currentUserName = ref<string>('')

  // 控制用户表单对话框显示
  const showUserFormDialog = ref(false)
  const userFormRef = ref<{ resetForm: () => void, validate: () => Promise<{ valid: boolean, data: any }> } | null>(null)
  const formTitle = ref('新增用户')
  const formLoading = ref(false)

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

  // 添加用户
  const handleAdd = () => {
    formTitle.value = '新增用户'
    showUserFormDialog.value = true
    // 重置表单
    if (userFormRef.value) {
      setTimeout(() => {
        userFormRef.value?.resetForm()
      }, 0)
    }
  }

  // 提交用户表单
  // 删除这里的导入语句
  // 提交用户表单
  const submitUserForm = async () => {
    if (!userFormRef.value) return
    
    const { valid, data } = await userFormRef.value.validate()
    
    if (valid && data) {
      formLoading.value = true
      try {
        // 确保 authorityId 是数字类型且不为空
        const userData = data as UserFormData;
        if (!userData.authorityId) {
          userData.authorityId = 9528; // 默认设置为测试角色
        }
        
        // 调用注册用户API
        const response = await registerUser(userData)
        
        if (response.data && response.data.code === 0) {
          ElMessage.success('用户添加成功')
          showUserFormDialog.value = false
          // 触发刷新用户列表事件
          window.dispatchEvent(new CustomEvent('refresh-user-list'))
        } else {
          ElMessage.error(response.data?.msg || '用户添加失败')
        }
      } catch (error) {
        console.error('添加用户失败:', error)
        ElMessage.error('添加用户失败，请重试')
      } finally {
        formLoading.value = false
      }
    }
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
    // 用户信息对话框相关
    showUserInfoDialog,
    userInfoCardRef,
    currentUserId,
    currentUserName,
    handleViewUserInfo,
    toggleUserInfo,
    
    // 用户表单对话框相关
    showUserFormDialog,
    userFormRef,
    formTitle,
    formLoading,
    submitUserForm,
    
    // 操作方法
    handleAdd,
    handleEdit,
    handleResetPassword,
    handleDelete
  }
}