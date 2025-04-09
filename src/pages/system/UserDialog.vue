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
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
// 修改导入路径，使用正确的服务模块
import service from '@/api/system/service'

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

// 创建本地状态和方法
const formRef = ref()
const passwordVisible = ref(false)
const confirmVisible = ref(false)
const submitting = ref(false)

// 表单数据
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  mobile: '',
  feiShuUserId: '',
  description: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: !props.isEdit, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { 
      required: !props.isEdit, 
      message: '请再次输入密码', 
      trigger: 'blur' 
    },
    { 
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== form.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  mobile: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 监听用户数据变化，填充表单
watch(() => props.userData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    Object.keys(form).forEach(key => {
      if (key !== 'password' && key !== 'confirmPassword') {
        // @ts-ignore
        form[key] = newVal[key] || ''
      }
    })
  }
}, { immediate: true, deep: true })

// 取消操作
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

// 创建用户
const handleCreate = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitting.value = true
    try {
      // 发送创建用户请求
      await service({
        url: '/user/create',
        method: 'post',
        data: {
          username: form.username,
          password: form.password,
          realName: form.realName,
          mobile: form.mobile,
          feiShuUserId: form.feiShuUserId,
          description: form.description
        }
      })
      
      ElMessage.success('创建用户成功')
      emit('success')
      emit('update:visible', false)
    } catch (error) {
      console.error('创建用户失败:', error)
      ElMessage.error('创建用户失败')
    } finally {
      submitting.value = false
    }
  })
}

// 更新用户
const handleUpdate = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitting.value = true
    try {
      // 发送更新用户请求
      await service({
        url: '/user/update',
        method: 'put',
        data: {
          id: props.userData.id,
          username: form.username,
          realName: form.realName,
          mobile: form.mobile,
          feiShuUserId: form.feiShuUserId,
          description: form.description
        }
      })
      
      ElMessage.success('更新用户成功')
      emit('success')
      emit('update:visible', false)
    } catch (error) {
      console.error('更新用户失败:', error)
      ElMessage.error('更新用户失败')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
/* 替换原有的导入 */
@import './modules/users/styles/userStyles.scss';
</style>