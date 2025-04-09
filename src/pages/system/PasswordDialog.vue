<template>
  <el-dialog
    :modelValue="visible"
    @update:modelValue="$emit('update:visible', $event)"
    title="修改密码"
    width="400px"
    :close-on-click-modal="false"
    destroy-on-close
    class="password-dialog"
  >
    <el-form
      ref="formRef"
      :model="passwordForm"
      :rules="passwordRules"
      label-width="80px"
      class="password-form"
    >
      <el-form-item label="原密码" prop="password">
        <el-input
          v-model="passwordForm.password"
          type="password"
          placeholder="请输入原密码"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          placeholder="请确认新密码"
          show-password
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { usePasswordDialog } from '@/api/system/usePasswordDialog'

// 接收props
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

// 定义事件
const emit = defineEmits(['update:visible', 'submit'])

// 使用密码对话框逻辑
const {
  passwordFormRef,
  passwordForm,
  passwordRules,
  submitChangePassword
} = usePasswordDialog()

// 表单引用
const formRef = ref(passwordFormRef)

// 处理取消
const handleCancel = () => {
  emit('update:visible', false)
}

// 处理提交
const handleSubmit = async () => {
  await submitChangePassword()
  emit('submit')
}

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (!newVal && formRef.value) {
    formRef.value.resetFields()
  }
})
</script>

<style lang="scss" scoped>
.password-dialog {
  .password-form {
    padding: 10px;
    
    .el-form-item {
      margin-bottom: 20px;
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
    
    .el-button {
      margin-left: 10px;
    }
  }
}
</style>