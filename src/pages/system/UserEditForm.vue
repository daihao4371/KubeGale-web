<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="昵称" prop="nickName">
      <el-input v-model="form.nickName" placeholder="请输入昵称" />
    </el-form-item>
    
    <el-form-item label="手机号" prop="phone">
      <el-input v-model="form.phone" placeholder="请输入手机号" />
    </el-form-item>
    
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" placeholder="请输入邮箱" />
    </el-form-item>
    
    <!-- 用户角色 - 替换为级联选择器 -->
    <el-form-item label="用户角色" prop="authorityIds">
      <el-cascader
        v-model="form.authorityIds"
        :options="cascaderRoleOptions"
        :props="{
          multiple: true,
          checkStrictly: true,
          emitPath: false,
          value: 'authorityId',
          label: 'authorityName'
        }"
        :show-all-levels="false"
        collapse-tags
        collapse-tags-tooltip
        clearable
        placeholder="请选择用户角色"
        style="width: 100%"
        :loading="roleLoading"
      />
    </el-form-item>
    
    <el-form-item label="启用状态" prop="enable">
      <el-switch
        v-model="form.enable"
        :active-value="1"
        :inactive-value="2"
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive, defineExpose, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import service from '@/api/system/service'
import { getAuthorityList, type AuthorityInfo } from '@/api/system/userManage'

// 定义props接收用户数据
const props = defineProps({
  userData: {  // 确保这个名称与 users.vue 中的 :user-data 属性一致
    type: Object,
    default: () => ({})
  }
})

// 角色数据
const roleOptions = ref<AuthorityInfo[]>([])
const cascaderRoleOptions = ref<any[]>([]) // 添加级联选择器选项
const roleLoading = ref(false)

// 处理角色数据为级联选择器格式
const processRolesForCascader = (roles: AuthorityInfo[]): any[] => {
  return roles.map(role => {
    const result: any = {
      authorityId: role.authorityId,
      authorityName: role.authorityName,
      value: role.authorityId,
      label: role.authorityName
    };
    
    if (role.children && role.children.length > 0) {
      result.children = processRolesForCascader(role.children);
    }
    
    return result;
  });
};

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

// 组件挂载时获取角色列表
onMounted(() => {
  fetchRoleList()
})

// 表单数据
const form = reactive({
  ID: 0,
  nickName: '',
  phone: '',
  email: '',
  authorityIds: [] as number[], // 修改为数字数组
  enable: 1
})

// 表单验证规则
const rules = reactive<FormRules>({
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
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

const formRef = ref<FormInstance>()

// 定义用户数据接口
interface UserData {
  ID?: number;
  id?: number;
  nickName?: string;
  nick_name?: string;
  phone?: string;
  email?: string;
  enable?: number;
  authorityIds?: Array<string | number>;
  authorities?: Array<{authorityId: string | number}>;
  authority?: {authorityId: string | number};
  authorityId?: string | number;
  [key: string]: any; // 允许其他属性
}

// 设置表单数据
const setFormData = (userData: UserData) => {
  console.log('设置表单数据开始:', userData)
  
  if (!userData || Object.keys(userData).length === 0) {
    console.warn('警告: 传入的用户数据为空')
    return
  }
  
  // 确保ID字段正确设置
  if (userData.ID !== undefined) {
    form.ID = Number(userData.ID)
  } else if (userData.id !== undefined) {
    form.ID = Number(userData.id)
  } else {
    console.error('警告: 用户数据中没有ID字段', userData)
    form.ID = 0
  }
  
  // 设置其他字段，使用可选链和默认值确保不会出现undefined
  form.nickName = userData.nickName ?? userData.nick_name ?? ''
  form.phone = userData.phone ?? ''
  form.email = userData.email ?? ''
  form.enable = userData.enable !== undefined ? userData.enable : 1
  
  // 处理用户角色
  form.authorityIds = [] // 先清空
  
  // 直接使用 authorityIds 字段（如果存在）
  if (userData.authorityIds && Array.isArray(userData.authorityIds)) {
    form.authorityIds = userData.authorityIds.map((id: string | number) => Number(id))
  } 
  // 如果有 authorities 数组
  else if (userData.authorities && Array.isArray(userData.authorities)) {
    form.authorityIds = userData.authorities.map((auth: any) => Number(auth.authorityId))
  }
  // 如果只有单个 authority 对象
  else if (userData.authority && userData.authority.authorityId) {
    form.authorityIds = [Number(userData.authority.authorityId)]
  }
  // 如果只有 authorityId 字段
  else if (userData.authorityId) {
    form.authorityIds = [Number(userData.authorityId)]
  }
  
  console.log('表单数据设置完成:', form)
}

// 监听props变化，自动设置表单数据
watch(() => props.userData, (newVal) => {
  console.log('userData 变化:', newVal)
  if (newVal && Object.keys(newVal).length > 0) {
    setFormData(newVal)
  }
}, { immediate: true, deep: true })

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return Promise.reject(new Error('表单实例不存在'))
  
  return new Promise((resolve, reject) => {
    formRef.value!.validate(async (valid) => {
      if (!valid) {
        reject(new Error('表单验证失败'))
        return
      }
      
      try {
        // 确保至少选择了一个角色
        if (!form.authorityIds || form.authorityIds.length === 0) {
          ElMessage.warning('请至少选择一个用户角色')
          reject(new Error('未选择用户角色'))
          return
        }
        
        // 发送更新用户请求
        const response = await service({
          url: '/api/user/setUserInfo',
          method: 'put',
          data: {
            ID: form.ID,
            nickName: form.nickName,
            phone: form.phone,
            email: form.email,
            authorityIds: form.authorityIds.map(id => Number(id)), // 确保是数字数组
            enable: form.enable
          }
        })
        
        if (response.data && response.data.code === 0) {
          ElMessage.success('更新用户成功')
          resolve(true)
        } else {
          ElMessage.error(response.data?.msg || '更新用户失败')
          reject(new Error(response.data?.msg || '更新用户失败'))
        }
      } catch (error) {
        console.error('更新用户失败:', error)
        ElMessage.error('更新用户失败')
        reject(error)
      }
    })
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  // 重置表单数据
  form.ID = 0
  form.nickName = ''
  form.phone = ''
  form.email = ''
  form.authorityIds = []
  form.enable = 1
}

// 添加validate方法
const validate = async () => {
  if (!formRef.value) return { valid: false, data: null }
  
  try {
    await formRef.value.validate()
    return {
      valid: true,
      data: {
        ID: form.ID,
        nickName: form.nickName,
        phone: form.phone,
        email: form.email,
        authorityIds: form.authorityIds.map(id => Number(id)), // 确保是数字数组
        enable: form.enable
      }
    }
  } catch (error) {
    return {
      valid: false,
      data: null
    }
  }
}

// 暴露方法给父组件调用
defineExpose({
  setFormData,
  submitForm,
  resetForm,
  validate  // 添加validate方法
})
</script>

<style lang="scss" scoped>
/* 替换原有导入 */
@import './modules/users/styles/userStyles.scss';
</style>

