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
        </div>
        
        <!-- 移除了右上角个人信息按钮 -->
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
      <div v-if="userList.length === 0 && !loading" class="empty-data">
        <el-empty description="暂无用户数据" />
      </div>
      
      <el-table
        v-else
        v-loading="loading"
        :data="userList"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <!-- ID列 -->
        <el-table-column prop="id" label="ID" width="60" align="center" />
        
        <!-- 头像和用户名列 -->
        <el-table-column label="用户信息" min-width="180">
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
        
        <!-- 手机号列 -->
        <el-table-column prop="phone" label="手机号" min-width="80">
          <template #default="scope">
            {{ scope.row.phone || '-' }}
          </template>
        </el-table-column>
        
        <!-- 邮箱列 -->
        <el-table-column prop="email" label="邮箱" min-width="80">
          <template #default="scope">
            {{ scope.row.email || '-' }}
          </template>
        </el-table-column>
        
        <!-- 用户角色列 -->
        <el-table-column label="用户角色" width="180">
          <template #default="scope">
            <!-- 显示多角色 -->
            <div v-if="scope.row.authorities && scope.row.authorities.length">
              <el-tag 
                v-for="(authority, index) in scope.row.authorities" 
                :key="authority.authorityId"
                :type="authority.authorityId === 888 ? 'info' : 'success'" 
                size="small" 
                effect="plain"
                style="margin-right: 4px; margin-bottom: 4px;"
              >
                {{ authority.authorityName }}
              </el-tag>
            </div>
            <!-- 兼容单角色显示 -->
            <div v-else-if="scope.row.authority">
              <el-tag 
                :type="scope.row.authorityId === 888 ? 'info' : 'success'" 
                size="small" 
                effect="plain"
              >
                {{ scope.row.authority.authorityName }}
              </el-tag>
            </div>
            <div v-else>
              <el-tag type="info" size="small" effect="plain">
                普通用户
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <!-- 状态列 -->
        <el-table-column label="状态" width="80" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enable"
              :active-value="1"
              :inactive-value="0"
              disabled
            />
          </template>
        </el-table-column>
        
        <!-- 操作列 -->
        <el-table-column label="操作" fixed="right" width="280" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button type="primary" size="small" plain @click.stop="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button type="warning" size="small" plain @click.stop="handleResetPassword(scope.row)">
                <el-icon><Key /></el-icon>密码
              </el-button>
              <el-button type="danger" size="small" plain @click.stop="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
              <!-- 移除了详情按钮 -->
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="userList.length > 0">
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
    
    <!-- 用户信息对话框 -->
    <el-dialog
      v-model="showUserInfoDialog"
      :title="currentUserName ? `${currentUserName} 的个人信息` : '个人信息'"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      class="user-dialog"
    >
      <UserInfoCard :userId="currentUserId" ref="userInfoCardRef" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="SystemUsers">
import { Search, Refresh, Plus, Edit, Delete, Key, User } from '@element-plus/icons-vue'
import { useUsers } from './modules/users/useUsers'
import { useUserDialog } from './modules/users/components/useUserDialog'
import UserInfoCard from '../system/UserInfoCard.vue'

// 使用解耦后的用户列表逻辑
const {
  searchForm,
  userList,
  loading,
  pagination,
  fetchUserList,
  handleSearch,
  resetSearch,
  handleSizeChange,
  handleCurrentChange
} = useUsers()

// 使用解耦后的对话框逻辑
const {
  showUserInfoDialog,
  userInfoCardRef,
  currentUserId,
  currentUserName,
  handleViewUserInfo,
  toggleUserInfo,
  handleAdd,
  handleEdit,
  handleResetPassword,
  handleDelete
} = useUserDialog()

// 导出方法供外部调用 - 保留此方法以便布局组件可以调用
defineExpose({
  toggleUserInfo
})

// 确保组件挂载时加载数据
fetchUserList()
</script>

<style lang="scss" scoped>
@import './modules/users/users.scss';
@import './modules/users/components/userDialog.scss';
</style>
