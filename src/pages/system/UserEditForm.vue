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
    
    <el-form-item label="用户角色" prop="authorityIds">
      <el-select 
        v-model="form.authorityIds" 
        multiple 
        placeholder="请选择用户角色"
        style="width: 100%"
      >
        <el-option
          key="888"
          label="普通用户"
          value="888"
        />
        <el-option
          key="9528"
          label="测试角色"
          value="9528"
        />
      </el-select>
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
import { ref, reactive, defineExpose, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import service from '@/api/system/service'

// 定义props接收用户数据
const props = defineProps({
  userData: {  // 确保这个名称与 users.vue 中的 :user-data 属性一致
    type: Object,
    default: () => ({})
  }
})

// 表单数据
const form = reactive({
  ID: 0,
  nickName: '',
  phone: '',
  email: '',
  authorityIds: [] as string[],
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
    form.authorityIds = userData.authorityIds.map((id: string | number) => String(id))
  } 
  // 如果有 authorities 数组
  else if (userData.authorities && Array.isArray(userData.authorities)) {
    form.authorityIds = userData.authorities.map((auth: any) => String(auth.authorityId))
  }
  // 如果只有单个 authority 对象
  else if (userData.authority && userData.authority.authorityId) {
    form.authorityIds = [String(userData.authority.authorityId)]
  }
  // 如果只有 authorityId 字段
  else if (userData.authorityId) {
    form.authorityIds = [String(userData.authorityId)]
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
        // 发送更新用户请求
        const response = await service({
          url: '/user/setUserInfo',
          method: 'put',
          data: {
            ID: form.ID,
            nickName: form.nickName,
            phone: form.phone,
            email: form.email,
            authorityIds: form.authorityIds,
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

// 暴露方法给父组件调用
defineExpose({
  setFormData,
  submitForm,
  resetForm,
  form
})
</script>

<style lang="scss" scoped>
/* 替换原有导入 */
@import './modules/users/styles/userStyles.scss';
</style>

