<template>
  <div class="users-container">
    <div class="users-header">
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增用户
        </el-button>
        
        <!-- 添加统计卡片 -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-title">总用户数</div>
            <div class="stat-value">{{ pagination.total }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">管理员</div>
            <div class="stat-value">{{ getAdminCount }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">启用用户</div>
            <div class="stat-value">{{ getEnabledCount }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">禁用用户</div>
            <div class="stat-value">{{ getDisabledCount }}</div>
          </div>
        </div>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="searchForm.nickName" placeholder="请输入昵称" clearable />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 用户列表 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        v-loading="loading"
        :data="userList"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        :row-class-name="tableRowClassName"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="scope">
            <div style="display: flex; align-items: center;">
              <el-avatar :size="36" :src="scope.row.headerImg" style="margin-right: 10px;">
                {{ scope.row.userName ? scope.row.userName.substring(0, 1).toUpperCase() : 'U' }}
              </el-avatar>
              <div>
                <div style="font-weight: 500;">{{ scope.row.userName }}</div>
                <div style="font-size: 12px; color: #909399;">{{ scope.row.nickName || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="110">
          <template #default="scope">
            {{ scope.row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="150">
          <template #default="scope">
            {{ scope.row.email || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="用户角色" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.authorityId === 1" type="success" size="small" effect="plain">
              管理用户
            </el-tag>
            <el-tag v-else type="info" size="small" effect="plain">
              普通用户
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enable"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleToggleStatus(scope.row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="240" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button type="primary" size="small" plain @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button type="success" size="small" plain @click="handleAssignRole(scope.row)">
                <el-icon><User /></el-icon>角色
              </el-button>
              <el-button type="warning" size="small" plain @click="handleResetPassword(scope.row)">
                <el-icon><Key /></el-icon>密码
              </el-button>
              <el-button type="danger" size="small" plain @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </div>
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
          background
        />
      </div>
    </el-card>
    
    <!-- 添加用户对话框 -->
    <UserDialog
      v-if="userDialogVisible"
      v-model:visible="userDialogVisible"
      :loading="userDialogLoading"
      :is-edit="isEdit"
      :user-data="currentUser"
      @success="handleUserDialogSuccess"
    />
  </div>
</template>

<script lang="ts" setup name="SystemUsers">
import { 
  User, 
  Avatar, 
  CircleCheck, 
  CircleClose, 
  Search, 
  Refresh, 
  Plus, 
  Edit, 
  Key, 
  Delete,
  ArrowDown
} from '@element-plus/icons-vue'
import { useUsers } from './modules/users/useUsers'
import UserDialog from './components/UserDialog.vue'

// 使用解耦后的逻辑
const {
  searchForm,
  userList,
  loading,
  pagination,
  userDialogVisible,
  userDialogLoading,
  isEdit,
  currentUser,
  getAdminCount,
  getEnabledCount,
  getDisabledCount,
  handleSearch,
  resetSearch,
  handleSizeChange,
  handleCurrentChange,
  handleAdd,
  handleEdit,
  handleToggleStatus,
  handleDelete,
  handleResetPassword,
  handleUserDialogSuccess,
  formatDate,
  tableRowClassName
} = useUsers()
</script>

<style lang="scss" scoped>
@import './modules/users/users.scss';
</style>
