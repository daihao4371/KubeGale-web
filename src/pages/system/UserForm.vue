<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
    <el-form-item label="用户名" prop="userName">
      <el-input v-model="formData.userName" placeholder="请输入用户名" />
    </el-form-item>
    
    <el-form-item label="密码" prop="password">
      <el-input v-model="formData.password" placeholder="请输入密码" type="password" show-password />
    </el-form-item>
    
    <el-form-item label="昵称" prop="nickName">
      <el-input v-model="formData.nickName" placeholder="请输入昵称" />
    </el-form-item>
    
    <el-form-item label="手机号" prop="phone">
      <el-input v-model="formData.phone" placeholder="请输入手机号" />
    </el-form-item>
    
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="formData.email" placeholder="请输入邮箱" />
    </el-form-item>
    
    <!-- 用户角色 -->
    <el-form-item label="用户角色" prop="authorityId">
      <el-cascader
        v-model="formData.authorityIds"
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
        v-model="formData.enable"
        :active-value="1"
        :inactive-value="2"
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { defineExpose } from 'vue'
import { useUserForm } from './modules/users/components/useUserForm'
import { registerUser } from '@/api/system/userManage'
import { ElMessage } from 'element-plus'

// 使用表单逻辑
const {
  formRef,
  formData,
  roleOptions,
  cascaderRoleOptions, // 添加级联选择器选项
  roleLoading,
  rules,
  resetForm,
  validate
} = useUserForm()

// 提交表单
const submitForm = async () => {
  const result = await validate()
  
  // 检查结果是否为false或者valid为false
  if (!result || !result.valid || !result.data) {
    return Promise.reject(new Error('表单验证失败'))
  }
  
  try {
    // 确保有选择角色
    if (!formData.authorityIds || formData.authorityIds.length === 0) {
      ElMessage.warning('请至少选择一个用户角色')
      return Promise.reject(new Error('未选择用户角色'))
    }
    
    // 设置主角色为第一个选择的角色
    formData.authorityId = formData.authorityIds[0]
    
    // 发送注册用户请求
    const response = await registerUser({
      ...formData,
      authorityIds: formData.authorityIds.map(id => Number(id)) // 确保是数字数组
    })
    
    if (response.data && response.data.code === 0) {
      ElMessage.success('用户添加成功')
      return Promise.resolve(response.data)
    } else {
      ElMessage.error(response.data?.msg || '用户添加失败')
      return Promise.reject(new Error(response.data?.msg || '用户添加失败'))
    }
  } catch (error) {
    console.error('添加用户失败:', error)
    ElMessage.error('添加用户失败，请重试')
    return Promise.reject(error)
  }
}

// 暴露方法给父组件
defineExpose({
  formRef,
  resetForm,
  validate,
  submitForm
})
</script>

<style lang="scss" scoped>
/* 替换原有的导入 */
@import './modules/users/styles/userStyles.scss';
</style>