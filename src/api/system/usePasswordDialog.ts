import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import service from './service'
import { API_URLS } from './config' // 导入 API_URLS

// 定义修改密码的请求参数接口
interface ChangePasswordParams {
  password: string;
  newPassword: string;
}

// 修改密码API
const changePassword = (data: ChangePasswordParams) => {
  const url = API_URLS.changePassword // 使用API_URLS中的路径
  console.log('调用修改密码API:', url, data)
  return service({
    url,
    method: 'post',
    data
  })
}

export function usePasswordDialog() {
  // 控制对话框显示
  const passwordDialogVisible = ref(false)
  
  // 加载状态
  const passwordLoading = ref(false)
  
  // 表单引用
  const passwordFormRef = ref<FormInstance>()
  
  // 表单数据 - 修改字段名
  const passwordForm = reactive({
    password: '',      // 修改为 password
    newPassword: '',
    confirmPassword: ''
  })
  
  // 表单验证规则 - 修改字段名
  const passwordRules = reactive<FormRules>({
    password: [        // 修改为 password
      { required: true, message: '请输入原密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value === passwordForm.password) {  // 修改为 password
            callback(new Error('新密码不能与原密码相同'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== passwordForm.newPassword) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  })
  
  // 打开密码对话框
  const openPasswordDialog = () => {
    passwordDialogVisible.value = true
    // 重置表单
    if (passwordFormRef.value) {
      passwordFormRef.value.resetFields()
    }
  }
  
  // 关闭密码对话框
  const closePasswordDialog = () => {
    passwordDialogVisible.value = false
    // 重置表单
    if (passwordFormRef.value) {
      passwordFormRef.value.resetFields()
    }
  }
  
  // 提交修改密码
  const submitChangePassword = async () => {
    if (!passwordFormRef.value) return
    
    await passwordFormRef.value.validate(async (valid) => {
      if (valid) {
        passwordLoading.value = true
        try {
          // 调用修改密码API - 修改参数名
          const response = await changePassword({
            password: passwordForm.password,      // 修改为 password
            newPassword: passwordForm.newPassword
          })
          
          if (response.data && response.data.code === 0) {
            ElMessage.success('密码修改成功')
            closePasswordDialog()
          } else {
            ElMessage.error(response.data?.msg || '密码修改失败')
          }
        } catch (error) {
          console.error('密码修改失败:', error)
          ElMessage.error('密码修改失败，请重试')
        } finally {
          passwordLoading.value = false
        }
      }
    })
  }
  
  return {
    passwordDialogVisible,
    passwordLoading,
    passwordFormRef,
    passwordForm,
    passwordRules,
    openPasswordDialog,
    closePasswordDialog,
    submitChangePassword
  }
}