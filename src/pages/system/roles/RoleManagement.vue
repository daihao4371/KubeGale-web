<template>
  <div class="role-management-container">
    <el-card class="role-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">角色管理</span>
          <el-button type="primary" @click="handleAddRole">
            <el-icon><Plus /></el-icon>新增角色
          </el-button>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="roleList"
        v-bind="tableConfig"
        class="role-table"
      >
        <!-- 角色ID列 -->
        <el-table-column
          prop="authorityId"
          label="角色ID"
          min-width="100"
        />
        
        <!-- 角色名称列 -->
        <el-table-column
          prop="authorityName"
          label="角色名称"
          min-width="150"
        />
        

        
        <!-- 创建时间列 -->
        <el-table-column
          prop="CreatedAt"
          label="创建时间"
          min-width="180"
        >
          <template #default="scope">
            {{ formatDate(scope.row.CreatedAt) }}
          </template>
        </el-table-column>
        
        <!-- 操作列 -->
        <el-table-column
          label="操作"
          min-width="200"
          fixed="right"
        >
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                type="primary"
                link
                @click="viewRoleDetail(scope.row)"
              >
                <el-icon><View /></el-icon>查看
              </el-button>
              
              <el-button
                type="primary"
                link
                @click="editRole(scope.row)"
              >
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              
              <el-button
                type="danger"
                link
                @click="deleteRole(scope.row)"
              >
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import { useRoleManagement } from '../modules/roles/useRoleManagement'
import { AuthorityData } from '@/api/system/roles/authority'

// 使用角色管理逻辑
const {
  roleList,
  loading,
  tableConfig,
  fetchRoleList,
  viewRoleDetail,
  editRole,
  deleteRole
} = useRoleManagement()



// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 添加角色处理函数
const handleAddRole = () => {
  console.log('添加新角色')
  // 这里可以实现添加角色的逻辑，如打开添加对话框等
}

// 组件挂载时获取角色列表
onMounted(() => {
  fetchRoleList()
})
</script>

<style lang="scss" scoped>
@import '../modules/roles/styles/roleStyles.scss';
</style>