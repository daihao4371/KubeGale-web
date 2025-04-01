<template>
  <div class="roles-container">
    <div class="roles-header">
      <h2>角色管理</h2>
      <div class="operation-bar">
        <!-- 搜索区域 -->
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
          </el-form-item>
          <el-form-item label="角色类型">
            <el-select v-model="searchForm.role_type" placeholder="请选择角色类型" clearable>
              <el-option :value="1" label="系统角色" />
              <el-option :value="2" label="自定义角色" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 操作按钮 -->
        <div class="button-group">
          <el-button type="primary" @click="handleAdd">添加角色</el-button>
        </div>
      </div>
    </div>
    
    <!-- 角色列表 -->
    <el-table
      v-loading="loading"
      :data="roleList"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="角色ID" width="80" />
      <el-table-column prop="name" label="角色名称" width="120" />
      <el-table-column prop="description" label="角色描述" min-width="200">
        <template #default="scope">
          {{ scope.row.description || '暂无描述' }}
        </template>
      </el-table-column>
      <el-table-column prop="role_type" label="角色类型" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.role_type === 1 ? 'primary' : 'success'">
            {{ scope.row.role_type === 1 ? '普通用户' : '管理员' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="is_default" label="默认角色" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.is_default"
            :active-value="1"
            :inactive-value="0"
            @change="handleDefaultChange(scope.row)"
            :disabled="scope.row.role_type === 1"
          />
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.create_time) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDelete(scope.row)"
            :disabled="scope.row.role_type === 1" 
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 角色对话框 -->
    <RoleDialog
      v-model:visible="dialogVisible"
      :is-edit="isEdit"
      :role-data="currentRole"
      @submit="handleRoleSubmit"
    />
  </div>
</template>

<script lang="ts" setup name="SystemRoles">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { RoleInfo } from '@/api/system/roleManage'
import RoleDialog from './RoleDialog.vue'

// 搜索表单
const searchForm = reactive({
  name: '',
  role_type: undefined as number | undefined
})

// 角色列表数据 - 模拟数据
const roleList = ref<RoleInfo[]>([
  {
    id: 1,
    name: '超级管理员',
    description: '系统最高权限角色，拥有所有权限',
    role_type: 1,
    is_default: 0,
    create_time: Date.now() - 86400000 * 30,
    update_time: Date.now() - 86400000 * 10,
    is_deleted: 0
  },
  {
    id: 2,
    name: '普通用户',
    description: '普通用户角色，拥有基本操作权限',
    role_type: 1,
    is_default: 1,
    create_time: Date.now() - 86400000 * 20,
    update_time: Date.now() - 86400000 * 5,
    is_deleted: 0
  },
  {
    id: 3,
    name: '开发人员',
    description: '开发人员角色，拥有开发相关权限',
    role_type: 2,
    is_default: 0,
    create_time: Date.now() - 86400000 * 10,
    update_time: Date.now() - 86400000 * 2,
    is_deleted: 0
  }
])

const loading = ref(false)

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3 // 模拟数据总数
})

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 搜索
const handleSearch = () => {
  pagination.page = 1 // 重置到第一页
  // 模拟搜索功能
  ElMessage.success('搜索功能开发中')
}

// 重置搜索
const resetSearch = () => {
  // 重置搜索表单
  searchForm.name = ''
  searchForm.role_type = undefined
  
  // 重新加载数据
  pagination.page = 1
  // 模拟重置功能
  ElMessage.success('重置功能开发中')
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  // 模拟分页功能
  ElMessage.success('分页大小变化功能开发中')
}

// 页码变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  // 模拟分页功能
  ElMessage.success('页码变化功能开发中')
}

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentRole = ref<RoleInfo | {}>({})

// 添加角色
const handleAdd = () => {
  isEdit.value = false
  currentRole.value = {}
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (row: RoleInfo) => {
  isEdit.value = true
  currentRole.value = { ...row }
  dialogVisible.value = true
}

// 处理角色表单提交
const handleRoleSubmit = (formData: any) => {
  console.log('提交的角色数据:', formData)
  
  // 模拟提交成功后刷新列表
  if (isEdit.value) {
    // 更新现有角色
    const index = roleList.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      roleList.value[index] = {
        ...roleList.value[index],
        ...formData,
        update_time: Date.now()
      }
    }
  } else {
    // 添加新角色
    const newRole: RoleInfo = {
      id: roleList.value.length + 1,
      name: formData.name,
      description: formData.description,
      role_type: formData.role_type,
      is_default: formData.is_default,
      create_time: Date.now(),
      update_time: Date.now(),
      is_deleted: 0,
      apis: formData.apis.map((id: number) => ({ id }))
    }
    roleList.value.push(newRole)
    pagination.total += 1
  }
}

// 删除角色
const handleDelete = (row: RoleInfo) => {
  console.log('删除角色:', row)
  
  ElMessageBox.confirm(`确定要删除角色 ${row.name} 吗? 此操作不可恢复!`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 模拟删除功能
    ElMessage.success(`删除角色 ${row.name} 成功`)
  }).catch(() => {
    // 用户取消操作
  })
}

// 修改默认角色状态
const handleDefaultChange = (row: RoleInfo) => {
  console.log('修改默认角色状态:', row)
  // 模拟修改默认角色功能
  ElMessage.success(`${row.is_default === 1 ? '设置' : '取消'}默认角色成功`)
}

// 组件挂载时加载数据
onMounted(() => {
  // 模拟加载数据
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style lang="scss" scoped>
.roles-container {
  padding: 20px;
  
  .roles-header {
    margin-bottom: 20px;
    
    h2 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 20px;
      font-weight: 500;
    }
    
    .operation-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      
      .search-form {
        margin-bottom: 10px;
      }
      
      .button-group {
        margin-bottom: 10px;
      }
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
