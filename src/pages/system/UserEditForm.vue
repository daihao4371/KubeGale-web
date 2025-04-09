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
import { ref, reactive, defineExpose } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'  // 添加这一行，导入 ElMessage

// 表单数据
const form = reactive({
  ID: 0,  // 确保字段名为 ID 而不是 id
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

// 设置表单数据
const setFormData = (userData: any) => {
  console.log('设置表单数据开始:', userData) // 添加日志，便于调试
  
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
  
  // 处理用户角色 - 根据后端 ChangeUserInfo 结构体调整
  form.authorityIds = [] // 先清空
  
  // 直接使用 authorityIds 字段（如果存在）
  if (userData.authorityIds && Array.isArray(userData.authorityIds)) {
    form.authorityIds = userData.authorityIds.map((id: any) => id.toString())
  } 
  // 如果没有 authorityIds，尝试从 authorities 中提取
  else if (userData.authorities && Array.isArray(userData.authorities) && userData.authorities.length > 0) {
    form.authorityIds = userData.authorities.map((auth: any) => {
      // 尝试获取 authorityId
      const authId = auth.authorityId || auth.ID || auth.id
      return authId ? authId.toString() : null
    }).filter(Boolean) // 过滤掉空值
  } 
  // 如果有单个 authority 对象
  else if (userData.authority && userData.authority.authorityId) {
    form.authorityIds = [userData.authority.authorityId.toString()]
  } 
  // 如果有单个 authorityId
  else if (userData.authorityId) {
    form.authorityIds = [userData.authorityId.toString()]
  }
  
  console.log('表单数据设置完成:', { ...form }) // 添加日志，便于调试
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.ID = 0
  form.nickName = ''
  form.phone = ''
  form.email = ''
  form.authorityIds = []
  form.enable = 1
}

// 验证表单
const validate = async () => {
  if (!formRef.value) return { valid: false, data: null }
  
  // 先检查ID是否存在
  if (!form.ID) {
    console.error('表单验证失败: ID不能为空')
    ElMessage.error('用户ID不能为空')  // 现在可以正常使用 ElMessage
    return { valid: false, data: null }
  }
  
  return formRef.value.validate()
    .then(() => {
      // 转换 authorityIds 为数字数组
      const formData = {
        ...form,
        ID: Number(form.ID), // 确保ID是数字类型
        authorityIds: form.authorityIds.map(id => Number(id))
      }
      
      console.log('提交的表单数据:', formData) // 添加日志，便于调试
      return { valid: true, data: formData }
    })
    .catch((err) => {
      console.error('表单验证错误:', err)
      return { valid: false, data: null }
    })
}

// 暴露方法给父组件
defineExpose({
  setFormData,
  resetForm,
  validate,
  form
})
</script>
