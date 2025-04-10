import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

// 定义表单数据类型
export interface UserFormData {
  userName: string;
  password: string;
  nickName: string;
  phone: string;
  email: string;
  authorityId: number;
  enable: number;
}

// 定义角色选项类型
export interface RoleOption {
  authorityId: number;
  authorityName: string;
}

export function useUserForm(initialData: any = {}) {
  // 表单引用
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive<UserFormData>({
    userName: '',
    password: '',
    nickName: '',
    phone: '',
    email: '',
    authorityId: 9528, // 设置默认值为测试角色，确保不为空
    enable: 1
  })

  // 角色选项
  const roleOptions = ref<RoleOption[]>([
    { authorityId: 888, authorityName: '超级管理员' },
    { authorityId: 8881, authorityName: '管理员' },
    { authorityId: 9528, authorityName: '测试角色' }
  ])

  // 表单验证规则
  const rules = reactive<FormRules>({
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度应在3到20个字符之间', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
    ],
    nickName: [
      { max: 20, message: '昵称长度不能超过20个字符', trigger: 'blur' }
    ],
    phone: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    email: [
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    authorityId: [
      { required: true, message: '请选择用户角色', trigger: 'change' },
      { type: 'number', message: '角色ID必须是数字', trigger: 'change' },
      { validator: (rule, value, callback) => {
          if (!value || value === 0) {
            callback(new Error('请选择用户角色'));
          } else {
            callback();
          }
        }, trigger: 'change' 
      }
    ]
  })

  // 组件挂载时初始化
  onMounted(() => {
    // 确保 authorityId 有默认值
    if (!formData.authorityId) {
      formData.authorityId = 9528; // 默认设置为测试角色
    }
  })

  // 重置表单
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
    
    // 重置为默认值，确保 authorityId 有值
    Object.assign(formData, {
      userName: '',
      password: '',
      nickName: '',
      phone: '',
      email: '',
      authorityId: 9528, // 设置默认值
      enable: 1
    })
  }

  // 验证表单
  const validate = async () => {
    if (!formRef.value) return false
    
    return await formRef.value.validate()
      .then(() => {
        // 确保 authorityId 是数字类型
        const data = { ...formData };
        data.authorityId = Number(data.authorityId);
        
        return {
          valid: true,
          data
        }
      })
      .catch(() => {
        return {
          valid: false,
          data: null
        }
      })
  }

  return {
    formRef,
    formData,
    roleOptions,
    rules,
    resetForm,
    validate
  }
}