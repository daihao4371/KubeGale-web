// 在文件开头的导入部分添加
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getAuthorityList, type AuthorityInfo } from '@/api/system/userManage'

// 定义表单数据类型
export interface UserFormData {
  userName: string;
  password: string;
  nickName: string;
  phone: string;
  email: string;
  authorityId: number;
  authorityIds: number[]; // 添加多角色支持
  enable: number;
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
    authorityId: 0,
    authorityIds: [], // 初始化为空数组
    enable: 1
  })

  // 角色选项
  const roleOptions = ref<AuthorityInfo[]>([])
  const cascaderRoleOptions = ref<any[]>([]) // 添加级联选择器选项
  const roleLoading = ref(false)

  // 获取角色列表
  const fetchRoleList = async () => {
    roleLoading.value = true
    try {
      const res = await getAuthorityList()
      if (res.data && res.data.code === 0 && Array.isArray(res.data.data)) {
        roleOptions.value = res.data.data
        // 处理级联选择器数据
        cascaderRoleOptions.value = processRolesForCascader(res.data.data)
        console.log('获取角色列表成功:', roleOptions.value)
        console.log('级联角色选项:', cascaderRoleOptions.value)
      } else {
        console.error('获取角色列表失败:', res.data)
        ElMessage.error('获取角色列表失败')
      }
    } catch (error) {
      console.error('获取角色列表异常:', error)
      ElMessage.error('获取角色列表失败')
    } finally {
      roleLoading.value = false
    }
  }

  // 处理角色数据为级联选择器格式
  const processRolesForCascader = (roles: AuthorityInfo[]): any[] => {
    return roles.map(role => {
      const result: any = {
        authorityId: role.authorityId,
        authorityName: role.authorityName,
      };
      
      if (role.children && role.children.length > 0) {
        result.children = processRolesForCascader(role.children);
      }
      
      return result;
    });
  };

  // 表单验证规则
  const rules = reactive<FormRules>({
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
    ],
    nickName: [
      { required: false, message: '请输入昵称', trigger: 'blur' }
    ],
    phone: [
      { required: false, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    email: [
      { required: false, type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    authorityIds: [
      { 
        required: true, 
        message: '请选择用户角色', 
        trigger: 'change',
        validator: (rule: any, value: any, callback: any) => {
          if (!value || (Array.isArray(value) && value.length === 0)) {
            callback(new Error('请至少选择一个用户角色'))
          } else {
            callback()
          }
        }
      }
    ]
  })

  // 重置表单
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields()
      // 重置为默认值
      Object.assign(formData, {
        userName: '',
        password: '',
        nickName: '',
        phone: '',
        email: '',
        authorityId: 0,
        authorityIds: [],
        enable: 1
      })
    }
  }

  // 表单验证
  const validate = async () => {
    if (!formRef.value) {
      return { valid: false, data: null }
    }
    
    try {
      await formRef.value.validate()
      return { valid: true, data: { ...formData } }
    } catch (error) {
      console.error('表单验证失败:', error)
      return { valid: false, data: null }
    }
  }

  // 在组件挂载时获取角色列表
  onMounted(() => {
    fetchRoleList()
  })

  return {
    formRef,
    formData,
    roleOptions,
    cascaderRoleOptions, // 导出级联选择器选项
    roleLoading,
    rules,
    resetForm,
    validate,
    fetchRoleList
  }
}