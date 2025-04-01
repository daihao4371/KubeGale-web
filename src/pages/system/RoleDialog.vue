<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="isEdit ? '编辑角色' : '新增角色'"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="100px"
      :disabled="submitting"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入角色名称" />
      </el-form-item>
      
      <el-form-item label="角色描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="请输入角色描述"
          :rows="3"
        />
      </el-form-item>
      
      <el-form-item label="角色类型" prop="role_type">
        <el-select v-model="form.role_type" placeholder="请选择角色类型" style="width: 100%">
          <el-option :value="1" label="普通用户" />
          <el-option :value="2" label="管理员" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="默认角色" prop="is_default">
        <el-switch v-model="form.is_default" :active-value="1" :inactive-value="0" />
      </el-form-item>
      
      <el-form-item label="API权限" prop="apis">
        <el-tree
          ref="apiTreeRef"
          :data="apiOptions"
          show-checkbox
          node-key="id"
          :props="{ label: 'name', children: 'children' }"
          :default-checked-keys="selectedApis"
          @check="handleApiCheck"
          class="api-tree"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" :disabled="submitting">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { RoleInfo } from '@/api/system/roleManage'
import { createRole, updateRole } from '@/api/system/roleManage'

// 定义Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  roleData: {
    type: Object,
    default: () => ({})
  }
})

// 定义Emits
const emit = defineEmits(['update:visible', 'submit'])

// 表单引用
const formRef = ref<FormInstance>()
const apiTreeRef = ref()

// 提交状态
const submitting = ref(false)

// 表单数据
const form = reactive({
  id: 0,
  name: '',
  description: '',
  role_type: 2, // 默认为管理员
  is_default: 0, // 默认不是默认角色
  apis: [] as number[]
})

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度应为2-50个字符', trigger: 'blur' }
  ],
  description: [
    { max: 255, message: '角色描述最多255个字符', trigger: 'blur' }
  ],
  role_type: [
    { required: true, message: '请选择角色类型', trigger: 'change' }
  ]
})

// 模拟API选项数据
const apiOptions = ref([
  {
    id: 1,
    name: '系统管理',
    children: [
      { id: 101, name: '用户管理' },
      { id: 102, name: '角色管理' },
      { id: 103, name: '权限管理' }
    ]
  },
  {
    id: 2,
    name: 'CMDB管理',
    children: [
      { id: 201, name: '资源管理' },
      { id: 202, name: '配置管理' }
    ]
  },
  {
    id: 3,
    name: 'Kubernetes管理',
    children: [
      { id: 301, name: '集群管理' },
      { id: 302, name: '应用管理' },
      { id: 303, name: '服务管理' }
    ]
  }
])

// 已选择的API ID列表
const selectedApis = ref<number[]>([])

// 重置表单 - 将函数定义移到这里，在watch之前
const resetForm = () => {
  form.id = 0
  form.name = ''
  form.description = ''
  form.role_type = 2
  form.is_default = 0
  form.apis = []
  selectedApis.value = []
  
  // 重置表单验证
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  // 重置API树选择
  if (apiTreeRef.value) {
    form.apis = apiTreeRef.value.getCheckedKeys()
  }
}

// 监听roleData变化，初始化表单
watch(() => props.roleData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    const role = newVal as RoleInfo
    form.id = role.id
    form.name = role.name
    form.description = role.description
    form.role_type = role.role_type
    form.is_default = role.is_default
    
    // 设置已选择的API权限
    if (role.apis && role.apis.length > 0) {
      selectedApis.value = role.apis.map(api => api.id)
    } else {
      selectedApis.value = []
    }
    
    // 等待DOM更新后设置选中状态
    nextTick(() => {
      if (apiTreeRef.value) {
        apiTreeRef.value.setCheckedKeys(selectedApis.value)
      }
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 获取最终选中的API ID列表
        if (apiTreeRef.value) {
          form.apis = apiTreeRef.value.getCheckedKeys()
        }
        
        // 准备提交的数据
        const submitData = {
          name: form.name,
          description: form.description,
          role_type: form.role_type,
          is_default: form.is_default,
          apis: form.apis
        }
        
        // 如果是编辑模式，添加ID
        if (props.isEdit) {
          Object.assign(submitData, { id: form.id })
        }
        
        let response;
        // 创建或更新角色
        if (!props.isEdit) {
          response = await createRole(submitData)
          console.log('创建角色响应:', response.data)
        } else {
          response = await updateRole(submitData)
          console.log('更新角色响应:', response.data)
        }
        
        if (response.data.code === 0) {
          ElMessage.success(props.isEdit ? '角色更新成功' : '角色创建成功')
          
          // 提交表单数据到父组件
          emit('submit', submitData)
          
          // 关闭对话框
          emit('update:visible', false)
        } else {
          ElMessage.error(response.data.msg || (props.isEdit ? '更新角色失败' : '创建角色失败'))
        }
      } catch (error) {
        console.error('提交角色表单失败:', error)
        ElMessage.error('操作失败，请重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

// API树节点选择变化处理
const handleApiCheck = () => {
  if (apiTreeRef.value) {
    form.apis = apiTreeRef.value.getCheckedKeys()
  }
}
</script>

<style lang="scss" scoped>
.el-tree {
  height: 120px; // 设置固定高度，与角色描述输入框的3行文本高度相近
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
}

.api-tree {
  width: 100%; // 确保宽度与其他输入框一致
}
</style>