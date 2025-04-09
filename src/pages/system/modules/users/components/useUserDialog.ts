import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserInfo } from '@/api/system/userManage'
import { registerUser } from '@/api/system/userManage' // 需要在userManage.ts中添加此API
// 将导入移到顶部
import { UserFormData } from './useUserForm'
import { useUserDelete } from '../useUserDelete' // 导入用户删除逻辑
import { resetUserPassword } from '@/api/system/userManage' // 导入重置密码API
import { setUserInfo } from '@/api/system/userManage' // 导入设置用户信息API

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

  // 控制用户编辑对话框显示
  const showUserEditDialog = ref(false)
  const userEditFormRef = ref<{ setFormData: (data: any) => void, resetForm: () => void, validate: () => Promise<{ valid: boolean, data: any }> } | null>(null)
  const editFormTitle = ref('编辑用户')
  const editFormLoading = ref(false)
  const currentEditUser = ref(null) // 添加当前编辑用户的引用

  // 编辑用户
  const handleEdit = async (row: any) => {
    // 确保row中有id字段
    if (!row.id && !row.ID) {
      ElMessage.error('用户数据缺少ID字段')
      return
    }
    
    const userId = row.ID || row.id
    editFormTitle.value = `编辑用户: ${row.userName || ''}`
    showUserEditDialog.value = true
    editFormLoading.value = true
    
    try {
      // 先查询用户完整信息
      const response = await getUserInfo(Number(userId))
      
      if (response.data && response.data.code === 0 && response.data.data) {
        const userData = response.data.data
        
        // 确保ID字段存在
        if (!userData.ID) {
          userData.ID = Number(userId)
        }
        
        console.log('获取到的用户详细信息:', userData)
        
        // 设置表单数据
        if (userEditFormRef.value) {
          setTimeout(() => {
            if (userEditFormRef.value) {
              userEditFormRef.value.setFormData(userData)
            }
            editFormLoading.value = false
          }, 200)
        } else {
          editFormLoading.value = false
        }
      } else {
        // 如果获取详细信息失败，则使用列表中的简略信息
        console.warn('获取用户详细信息失败，使用列表数据')
        if (userEditFormRef.value) {
          // 深拷贝用户数据，避免引用问题
          const userData = JSON.parse(JSON.stringify(row))
          
          // 确保ID字段存在
          if (!userData.ID && userData.id) {
            userData.ID = Number(userData.id)
          }
          
          setTimeout(() => {
            if (userEditFormRef.value) {
              userEditFormRef.value.setFormData(userData)
            }
            editFormLoading.value = false
          }, 200)
        } else {
          editFormLoading.value = false
        }
      }
    } catch (error) {
      console.error('获取用户详细信息失败:', error)
      ElMessage.error('获取用户信息失败')
      editFormLoading.value = false
      
      // 如果获取详细信息出错，则使用列表中的简略信息
      if (userEditFormRef.value) {
        const userData = JSON.parse(JSON.stringify(row))
        if (!userData.ID && userData.id) {
          userData.ID = Number(userData.id)
        }
        
        setTimeout(() => {
          if (userEditFormRef.value) {
            userEditFormRef.value.setFormData(userData)
          }
        }, 200)
      }
    }
  }

  // 提交用户编辑表单
  // 提交用户编辑表单
  const submitUserEditForm = async () => {
    if (!userEditFormRef.value) return
    
    try {
      const { valid, data } = await userEditFormRef.value.validate()
      
      if (valid && data) {
        // 检查ID是否存在
        if (!data.ID) {
          ElMessage.error('用户ID不能为空')
          return
        }
        
        editFormLoading.value = true
        try {
          // 确保数据格式正确
          const userData = {
            ...data,
            ID: Number(data.ID)  // 确保ID是数字类型
          }
          
          console.log('提交编辑表单数据:', userData) // 添加日志，便于调试
          
          // 调用更新用户信息API
          const response = await setUserInfo(userData)
          
          if (response.data && response.data.code === 0) {
            ElMessage({
              message: '用户信息更新成功',
              type: 'success'
            })
            showUserEditDialog.value = false
            // 触发刷新用户列表事件
            window.dispatchEvent(new CustomEvent('refresh-user-list'))
          } else {
            ElMessage({
              message: response.data?.msg || '用户信息更新失败',
              type: 'error'
            })
          }
        } catch (error) {
          console.error('更新用户信息失败:', error)
          ElMessage({
            message: '更新用户信息失败，请重试',
            type: 'error'
          })
        } finally {
          editFormLoading.value = false
        }
      }
    } catch (error) {
      console.error('表单验证出错:', error)
      ElMessage.error('表单验证失败，请检查输入')
    }
  }

  // 重置密码（暂不实现具体逻辑）
  // 重置密码
  const handleResetPassword = (row: any) => {
    ElMessageBox.confirm(
      `是否将此用户密码重置为123456?`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true,
      }
    )
      .then(async () => {
        try {
          const response = await resetUserPassword({ ID: row.id })
          
          if (response.data && response.data.code === 0) {
            ElMessage({
              message: '密码重置成功',
              type: 'success'
            })
          } else {
            ElMessage({
              message: response.data?.msg || '密码重置失败',
              type: 'error'
            })
          }
        } catch (error) {
          console.error('密码重置失败:', error)
          ElMessage({
            message: '密码重置失败，请重试',
            type: 'error'
          })
        }
      })
      .catch(() => {
        // 用户取消操作，不做任何处理
      })
  }

  // 删除用户（暂不实现具体逻辑）
  // 获取用户删除逻辑
  const { handleDeleteUser } = useUserDelete()
  
  // 修改删除用户方法
  const handleDelete = (row: any) => {
    handleDeleteUser(row)
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
    handleDelete,  // 这里添加了逗号
    
    // 用户编辑对话框相关
    showUserEditDialog,
    userEditFormRef,
    editFormTitle,
    editFormLoading,
    submitUserEditForm,
    currentEditUser, // 导出当前编辑用户数据
  }
}