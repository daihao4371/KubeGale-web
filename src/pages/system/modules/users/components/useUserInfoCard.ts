import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfo, setSelfInfo } from '@/api/system/userManage'

export interface UserInfoData {
  id: number;
  userName: string;
  nickName: string;
  headerImg: string;
  phone: string;
  email: string;
  authorityId: number;
  authorities: { authorityId: number, authorityName: string }[];
}

export function useUserInfoCard(userId?: number) {
  // 用户信息
  const userInfo = reactive<UserInfoData>({
    id: 0,
    userName: '',
    nickName: '',
    headerImg: '',
    phone: '',
    email: '',
    authorityId: 0,
    authorities: []
  })

  // 加载状态
  const loading = ref(false)

  // 编辑表单
  const editForm = reactive({
    userName: '',
    nickName: '',
    phone: '',
    email: ''
  })

  // 编辑状态
  const editingField = reactive({
    userName: false,
    nickName: false,
    phone: false,
    email: false
  })

  // 获取用户信息
  const refreshUserInfo = async () => {
    loading.value = true
    try {
      const response = await getUserInfo(userId)
      
      if (response.data && response.data.code === 0) {
        const data = response.data.data
        
        // 更新用户信息
        if (data.userInfo) {
          Object.assign(userInfo, data.userInfo)
        } else {
          Object.assign(userInfo, data)
        }
        
        // 初始化编辑表单
        editForm.userName = userInfo.userName || ''
        editForm.nickName = userInfo.nickName || ''
        editForm.phone = userInfo.phone || ''
        editForm.email = userInfo.email || ''
      } else {
        ElMessage.error(response.data?.msg || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      ElMessage.error('获取用户信息失败，请重试')
    } finally {
      loading.value = false
    }
  }

  // 开始编辑
  const startEdit = (field: string) => {
    // 重置所有编辑状态
    Object.keys(editingField).forEach(key => {
      editingField[key as keyof typeof editingField] = false
    })
    
    // 设置当前字段为编辑状态
    editingField[field as keyof typeof editingField] = true
    
    // 重置编辑表单 - 使用类型断言解决类型错误
    const currentValue = (userInfo as Record<string, any>)[field]
    ;(editForm as Record<string, any>)[field] = currentValue !== undefined ? currentValue : ''
  }

  // 取消编辑
  const cancelEdit = (field: string) => {
    editingField[field as keyof typeof editingField] = false
  }

  // 保存编辑
  const saveEdit = async (field: string) => {
    try {
      // 检查字段是否为空，避免提交空值
      const fieldValue = editForm[field as keyof typeof editForm]
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        ElMessage.warning(`${field} 不能为空`)
        return
      }
      
      // 构建更新数据 - 确保包含 ID 属性
      const updateData = {
        ID: userInfo.id,
        [field]: fieldValue
      }
      
      // 调用更新API
      const response = await setSelfInfo(updateData)
      
      if (response.data && response.data.code === 0) {
        ElMessage.success('更新成功');
        
        // 更新本地数据 - 使用类型断言解决类型错误
        (userInfo as Record<string, any>)[field] = fieldValue
        
        // 关闭编辑状态
        editingField[field as keyof typeof editingField] = false
      } else {
        ElMessage.error(response.data?.msg || '更新失败')
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      ElMessage.error('更新失败，请重试')
    }
  }

  // 上传头像
  const uploadAvatar = async (options: any) => {
    const file = options.file
    
    // 这里应该实现文件上传逻辑，然后更新用户头像
    // 为简化示例，这里仅显示消息
    ElMessage.info('头像上传功能待实现')
  }

  return {
    userInfo,
    loading,
    editForm,
    editingField,
    refreshUserInfo,
    startEdit,
    cancelEdit,
    saveEdit,
    uploadAvatar
  }
}