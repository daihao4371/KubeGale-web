import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { changePassword } from '@/api/user'

export function usePasswordDialog() {
  // 密码相关状态
  const passwordDialogVisible = ref(false)
  const passwordLoading = ref(false)
  const passwordFormRef = ref<FormInstance>()
  const oldPasswordVisible = ref(false)
  const newPasswordVisible = ref(false)
  const confirmPasswordVisible = ref(false)

  // 密码表单数据 - 修改为符合后端API的格式
  const passwordForm = reactive({
    username: '', // 添加username字段
    password: '', // 重命名oldPassword为password
    newPassword: '',
    confirmPassword: ''
  })

  // 密码验证规则
  const validateConfirmPassword = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error('请再次输入新密码'))
    } else if (value !== passwordForm.newPassword) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }

  // 密码规则 - 更新字段名
  const passwordRules = reactive<FormRules>({
    password: [
      { required: true, message: '请输入原密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, validator: validateConfirmPassword, trigger: 'blur' }
    ]
  })

  // 打开密码对话框
  const openPasswordDialog = () => {
    resetPasswordForm()
    // 获取当前登录用户名
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    passwordForm.username = userInfo.username || ''
    passwordDialogVisible.value = true
  }

  // 重置密码表单
  const resetPasswordForm = () => {
    passwordForm.username = ''
    passwordForm.password = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    oldPasswordVisible.value = false
    newPasswordVisible.value = false
    confirmPasswordVisible.value = false
    
    // 重置表单验证
    if (passwordFormRef.value) {
      passwordFormRef.value.resetFields()
    }
  }

  // 提交修改密码 - 修改为符合后端API的格式
  const submitChangePassword = () => {
    if (!passwordFormRef.value) return
    
    passwordFormRef.value.validate((valid) => {
      if (valid) {
        // 确保新密码和确认密码一致
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          ElMessage.error('新密码和确认密码不一致')
          return
        }
        
        passwordLoading.value = true
        
        // 发送符合后端要求的数据格式
        changePassword({
          username: passwordForm.username,
          password: passwordForm.password,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        })
        .then(res => {
          console.log('修改密码响应:', res)
          
          if (res.data && res.data.code === 0) {
            ElMessage.success(res.data.msg || '密码修改成功')
            passwordDialogVisible.value = false
            resetPasswordForm() // 重置表单
          } else {
            ElMessage.error(res.data?.msg || '密码修改失败')
          }
        })
        .catch(error => {
          console.error('修改密码失败:', error)
          ElMessage.error('修改密码失败，请重试')
        })
        .finally(() => {
          passwordLoading.value = false
        })
      }
    })
  }

  return {
    passwordDialogVisible,
    passwordLoading,
    passwordFormRef,
    oldPasswordVisible,
    newPasswordVisible,
    confirmPasswordVisible,
    passwordForm,
    passwordRules,
    openPasswordDialog,
    resetPasswordForm,
    submitChangePassword
  }
}