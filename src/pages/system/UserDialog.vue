<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="100px"
      :disabled="submitting"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
      </el-form-item>
      
      <template v-if="!isEdit">
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            :type="passwordVisible ? 'text' : 'password'"
          >
            <template #suffix>
              <el-icon class="password-eye" @click="passwordVisible = !passwordVisible">
                <el-icon-view v-if="passwordVisible"/>
                <el-icon-hide v-else/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            placeholder="请再次输入密码"
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
      </template>
      
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="form.realName" placeholder="请输入真实姓名" />
      </el-form-item>
      
      <el-form-item label="手机号码" prop="mobile">
        <el-input v-model="form.mobile" placeholder="请输入手机号码" />
      </el-form-item>
      
      <el-form-item label="飞书ID" prop="feiShuUserId">
        <el-input v-model="form.feiShuUserId" placeholder="请输入飞书ID" />
      </el-form-item>
      
      <!-- 移除了首页路径选项 -->
      
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="请输入描述"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" :disabled="submitting">取消</el-button>
        <el-button v-if="!isEdit" type="primary" @click="handleCreate" :loading="submitting">
          创建
        </el-button>
        <el-button v-else type="primary" @click="handleUpdate" :loading="submitting">
          更新
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { View as ElIconView, Hide as ElIconHide } from '@element-plus/icons-vue'
import { useUserDialog } from '@/api/system/useUserDialog'

// 定义Props
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
    default: () => ({})
  }
})

// 定义Emits
const emit = defineEmits(['update:visible', 'cancel', 'success'])

// 使用useUserDialog钩子函数
const {
  formRef,
  form,
  rules,
  passwordVisible,
  confirmVisible,
  submitting,
  handleCancel,
  handleCreate,
  handleUpdate
} = useUserDialog(props, emit)
</script>

<style lang="scss" scoped>
.password-eye {
  cursor: pointer;
  color: #909399;
  
  &:hover {
    color: #409EFF;
  }
}

.el-form-item {
  margin-bottom: 18px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>