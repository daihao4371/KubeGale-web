<template>
  <el-dialog
    :title="isEdit ? '编辑用户' : '添加用户'"
    v-model="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      :disabled="loading"
    >
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="form.userName" placeholder="请输入用户名" />
      </el-form-item>
      
      <template v-if="!isEdit">
        <el-form-item label="密码" prop="passWord">
          <el-input
            v-model="form.passWord"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
      </template>
      
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="form.nickName" placeholder="请输入昵称" />
      </el-form-item>
      
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号码" />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      
      <el-form-item label="头像" prop="headerImg">
        <el-input v-model="form.headerImg" placeholder="请输入头像URL" />
        <div class="avatar-preview" v-if="form.headerImg">
          <img :src="form.headerImg" alt="头像预览" />
        </div>
      </el-form-item>
      
      <el-form-item label="角色" prop="authorityId">
        <el-select v-model="form.authorityId" placeholder="请选择角色">
          <el-option :value="1" label="管理员" />
          <el-option :value="2" label="普通用户" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="状态" prop="enable">
        <el-switch
          v-model="form.enable"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { signup, updateUser } from '@/api/system/userManage'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  userData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  id: 0,
  userName: '',
  passWord: '',
  nickName: '',
  headerImg: '',
  authorityId: 2, // 默认普通用户
  enable: 1, // 默认启用
  phone: '',
  email: ''
})

// 监听userData变化，用于编辑模式
watch(() => props.userData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    form.id = newVal.id
    form.userName = newVal.userName || ''
    form.nickName = newVal.nickName || ''
    form.headerImg = newVal.headerImg || ''
    form.authorityId = newVal.authorityId || 2
    form.enable = newVal.enable === undefined ? 1 : newVal.enable
    form.phone = newVal.phone || ''
    form.email = newVal.email || ''
  }
}, { immediate: true, deep: true })

// 表单验证规则
const rules = reactive<FormRules>({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  passWord: [
    { required: !props.isEdit, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  authorityId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (props.isEdit) {
          // 编辑用户
          const response = await updateUser({
            id: form.id,
            userName: form.userName,
            nickName: form.nickName,
            phone: form.phone,
            email: form.email,
            headerImg: form.headerImg,
            authorityId: form.authorityId,
            enable: form.enable
          })
          
          if (response.data.code === 0) {
            ElMessage.success('更新用户成功')
            dialogVisible.value = false
            emit('success')
          } else {
            ElMessage.error(response.data.msg || '更新用户失败')
          }
        } else {
          // 创建用户
          const response = await signup({
            userName: form.userName,
            passWord: form.passWord,
            nickName: form.nickName,
            phone: form.phone,
            email: form.email,
            headerImg: form.headerImg,
            authorityId: form.authorityId,
            enable: form.enable
          })
          
          if (response.data.code === 0) {
            ElMessage.success('创建用户成功')
            dialogVisible.value = false
            emit('success')
          } else {
            ElMessage.error(response.data.msg || '创建用户失败')
          }
        }
      } catch (error) {
        console.error('提交用户表单失败:', error)
        ElMessage.error('操作失败，请重试')
      }
    }
  })
}

// 对话框关闭时重置表单
const handleClosed = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: 0,
    userName: '',
    passWord: '',
    nickName: '',
    headerImg: '',
    authorityId: 2,
    enable: 1,
    phone: '',
    email: ''
  })
}
</script>

<style lang="scss" scoped>
.el-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.el-select {
  width: 100%;
}

.avatar-preview {
  margin-top: 10px;
  text-align: center;
  
  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #dcdfe6;
  }
}
</style>