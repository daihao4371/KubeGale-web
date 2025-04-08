import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

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
  

  
  return {
    passwordDialogVisible,
    passwordLoading,
    openPasswordDialog,
  }
}