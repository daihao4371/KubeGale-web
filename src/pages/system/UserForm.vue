<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="80px"
    class="user-form"
  >
    <el-form-item label="用户名" prop="userName">
      <el-input v-model="formData.userName" placeholder="请输入用户名" />
    </el-form-item>
    
    <el-form-item label="密码" prop="password">
      <el-input 
        v-model="formData.password" 
        type="password" 
        placeholder="请输入密码" 
        show-password
      />
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
    
    <el-form-item label="用户角色" prop="authorityId">
      <el-select v-model="formData.authorityId" placeholder="请选择用户角色" style="width: 100%">
        <el-option
          v-for="role in roleOptions"
          :key="role.authorityId"
          :label="role.authorityName"
          :value="role.authorityId"
        />
      </el-select>
    </el-form-item>
    
    <el-form-item label="启用状态" prop="enable">
      <el-switch
        v-model="formData.enable"
        :active-value="1"
        :inactive-value="0"
        active-text="启用"
        inactive-text="禁用"
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { defineProps, defineExpose } from 'vue'
import { useUserForm } from './modules/users/components/useUserForm'

// 接收props
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  }
})

// 使用解耦后的表单逻辑
const {
  formRef,
  formData,
  roleOptions,
  rules,
  resetForm,
  validate
} = useUserForm(props.initialData)

// 暴露方法给父组件
defineExpose({
  formData,
  resetForm,
  validate
})
</script>

<style lang="scss" scoped>
@import './modules/users/components/userForm.scss';
</style>