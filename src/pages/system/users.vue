<template>
  <div class="users-container">
    <div class="users-header">
      <h2>用户管理</h2>
      <div class="operation-bar">
        <!-- 搜索区域 -->
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="真实姓名">
            <el-input v-model="searchForm.realName" placeholder="请输入真实姓名" clearable />
          </el-form-item>
          <el-form-item label="手机号码">
            <el-input v-model="searchForm.mobile" placeholder="请输入手机号码" clearable />
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
        
        <!-- 操作按钮 -->
        <div class="button-group">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>添加用户
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 数据概览卡片 -->
    <div class="data-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="data-card">
            <div class="data-card-content">
              <div class="data-icon user-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="data-info">
                <div class="data-title">总用户数</div>
                <div class="data-value">{{ pagination.total }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="data-card">
            <div class="data-card-content">
              <div class="data-icon admin-icon">
                <el-icon><Avatar /></el-icon>
              </div>
              <div class="data-info">
                <div class="data-title">管理员数</div>
                <div class="data-value">
                  <span v-if="loading">加载中...</span>
                  <span v-else>{{ getAdminCount }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="data-card">
            <div class="data-card-content">
              <div class="data-icon active-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="data-info">
                <div class="data-title">启用用户</div>
                <div class="data-value">{{ getEnabledCount }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="data-card">
            <div class="data-card-content">
              <div class="data-icon disabled-icon">
                <el-icon><CircleClose /></el-icon>
              </div>
              <div class="data-info">
                <div class="data-title">禁用用户</div>
                <div class="data-value">{{ getDisabledCount }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
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
        <el-table-column prop="id" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" width="240" />
        <el-table-column prop="realName" label="真实姓名" width="300" />
        <el-table-column prop="mobile" label="手机号码" width="240">
          <template #default="scope">
            {{ scope.row.mobile || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column prop="feiShuUserId" label="飞书ID" width="300">
          <template #default="scope">
            {{ scope.row.feiShuUserId || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column prop="accountType" label="账户类型" width="200">
          <template #default="scope">
            <el-tag :type="scope.row.accountType === 1 ? 'success' : 'primary'">
              {{ scope.row.accountType === 1 ? '普通用户' : '管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enable" label="状态" width="200">
          <template #default="scope">
            <el-tag :type="scope.row.enable === 1 ? 'success' : 'danger'">
              {{ scope.row.enable === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="280">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="400">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="warning" size="small" @click="handleAssignRole(scope.row)">
              <el-icon><Key /></el-icon>分配角色
            </el-button>
            <el-button 
              :type="scope.row.enable === 1 ? 'danger' : 'success'" 
              size="small" 
              @click="handleToggleStatus(scope.row)"
            >
              <el-icon v-if="scope.row.enable === 1"><Lock /></el-icon>
              <el-icon v-else><Unlock /></el-icon>
              {{ scope.row.enable === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(scope.row)"
            >
              <el-icon><Delete /></el-icon>删除
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
    </el-card>
    
    <!-- 添加用户对话框 -->
    <UserDialog
      v-model:visible="userDialogVisible"
      :loading="userDialogLoading"
      :is-edit="isEdit"
      :user-data="currentUser"
      @success="handleUserDialogSuccess"
    />
  </div>
</template>

<script lang="ts" setup name="SystemUsers">
import UserDialog from './UserDialog.vue'
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
  Lock, 
  Unlock, 
  Delete 
} from '@element-plus/icons-vue'
import { useUsers } from './modules/users/useUsers'

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
  handleAssignRole,
  handleToggleStatus,
  handleDelete,
  handleUserDialogSuccess,
  formatDate,
  tableRowClassName
} = useUsers()
</script>

<style lang="scss" scoped>
@import './modules/users/users.scss';

/* 为按钮图标添加右侧间距 */
.el-button .el-icon {
  margin-right: 4px;
}
</style>
