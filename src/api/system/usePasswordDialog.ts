import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { changePassword } from '@/api/user' // 假设有这个API

// 定义密码表单数据类型
interface PasswordFormData {
  password: string;
  newPassword: string;
  confirmPassword: string;
}

export function usePasswordDialog() {
  const passwordDialogVisible = ref(false)
  const passwordLoading = ref(false)
  
  // 打开密码对话框
  const openPasswordDialog = () => {
    passwordDialogVisible.value = true
  }
  
  // 提交修改密码
  const submitChangePassword = async (formData: PasswordFormData) => {
    passwordLoading.value = true
    
    try {
      // 调用修改密码API，确保参数名称与API期望的一致
      const res = await changePassword({
        username: '', // 如果需要，可以从用户状态获取
        password: formData.password,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })
      
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
    } catch (error) {
      console.error('修改密码失败:', error)
      ElMessage.error('修改密码失败，请重试')
    } finally {
      passwordLoading.value = false
    }
  }
  
  return {
    passwordDialogVisible,
    passwordLoading,
    openPasswordDialog,
    submitChangePassword
  }
}