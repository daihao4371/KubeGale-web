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
          min-width="380"
          fixed="right"
        >
          <template #default="scope">
            <div class="operation-buttons">
              <!-- 移除了查看按钮 -->
              
              <el-button
                type="primary"
                link
                @click="editRole(scope.row)"
              >
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              
              <!-- 新增的设置权限按钮 -->
              <el-button
                type="primary"
                link
                @click="showDevelopingMessage('设置权限')"
              >
                <el-icon><Setting /></el-icon>设置权限
              </el-button>
              
              <!-- 新增的新增子角色按钮 -->
              <el-button
                type="primary"
                link
                @click="showDevelopingMessage('新增子角色')"
              >
                <el-icon><Plus /></el-icon>新增子角色
              </el-button>
              
              <!-- 新增的拷贝按钮 -->
              <el-button
                type="primary"
                link
                @click="showDevelopingMessage('拷贝角色')"
              >
                <el-icon><CopyDocument /></el-icon>拷贝
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
import { Plus, Edit, Delete, Setting, CopyDocument } from '@element-plus/icons-vue'
import { useRoleManagement } from '../modules/roles/useRoleManagement'
import { AuthorityData } from '@/api/system/roles/authority'
import { ElMessage } from 'element-plus'

// 使用角色管理逻辑
const {
  roleList,
  loading,
  tableConfig,
  fetchRoleList,
  editRole,
  deleteRole
} = useRoleManagement()

// 显示功能开发中的消息
const showDevelopingMessage = (feature: string) => {
  ElMessage({
    message: `${feature}功能正在开发中，敬请期待！`,
    type: 'info'
  })
}

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

/* 调整操作按钮样式 */
.operation-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
</style>