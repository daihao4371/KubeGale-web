<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="修改密码"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="100px"
    >
      <el-form-item label="原密码" prop="password">
        <el-input
          v-model="form.password"
          placeholder="请输入原密码"
          :type="oldVisible ? 'text' : 'password'"
        >
          <template #suffix>
            <el-icon class="password-eye" @click="oldVisible = !oldVisible">
              <el-icon-view v-if="oldVisible"/>
              <el-icon-hide v-else/>
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          placeholder="请输入新密码"
          :type="newVisible ? 'text' : 'password'"
        >
          <template #suffix>
            <el-icon class="password-eye" @click="newVisible = !newVisible">
              <el-icon-view v-if="newVisible"/>
              <el-icon-hide v-else/>
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          placeholder="请再次输入新密码"
          :type="confirmVisible ? 'text' : 'password'"
        >
          <template #suffix>
            <el-icon class="password-eye" @click="confirmVisible = !confirmVisible">
              <el-icon-view v-if="confirmVisible"/>
              <el-icon-hide v-else/>
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { View as ElIconView, Hide as ElIconHide } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

// 使用 defineProps 宏而不是导入
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 使用 defineEmits 宏而不是导入
const emit = defineEmits(['update:visible', 'cancel', 'submit'])

// 表单引用
const formRef = ref<FormInstance>()

// 密码可见性
const oldVisible = ref(false)
const newVisible = ref(false)
const confirmVisible = ref(false)

// 表单数据
const form = ref({
  password: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = {
  password: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== form.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 取消
const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
  resetForm()
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      emit('submit', form.value)
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.value = {
    password: '',
    newPassword: '',
    confirmPassword: ''
  }
  oldVisible.value = false
  newVisible.value = false
  confirmVisible.value = false
}
</script>

<style lang="scss" scoped>
.password-eye {
  cursor: pointer;
  color: #909399;
  
  &:hover {
    color: #409EFF;
  }
}
</style>