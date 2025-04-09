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
            <div class="stat-title">启用用户</div>
            <div class="stat-value">{{ enabledUserCount }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">禁用用户</div>
            <div class="stat-value">{{ disabledUserCount }}</div>
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
      <div v-if="userList.length === 2 && !loading" class="empty-data">
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
              <el-select 
                v-model="scope.row.authorityId" 
                size="small" 
                placeholder="选择角色"
                @change="(val: number) => handleRoleChange(scope.row, val)"
              >
                <el-option
                  v-for="authority in scope.row.authorities"
                  :key="authority.authorityId"
                  :label="authority.authorityName"
                  :value="authority.authorityId"
                />
                <el-option
                  v-if="!hasRole(scope.row.authorities, 888)"
                  :key="888"
                  label="普通用户"
                  value="888"
                />
                <el-option
                  v-if="!hasRole(scope.row.authorities, 9528)"
                  :key="9528"
                  label="测试角色"
                  value="9528"
                />
              </el-select>
            </div>
            <!-- 兼容单角色显示 -->
            <div v-else-if="scope.row.authority">
              <el-select 
                v-model="scope.row.authorityId" 
                size="small" 
                placeholder="选择角色"
                @change="(val: number) => handleRoleChange(scope.row, val)"
              >
                <el-option
                  :key="scope.row.authority.authorityId"
                  :label="scope.row.authority.authorityName"
                  :value="scope.row.authority.authorityId"
                />
                <el-option
                  v-if="scope.row.authority.authorityId !== 888"
                  :key="888"
                  label="普通用户"
                  value="888"
                />
                <el-option
                  v-if="scope.row.authority.authorityId !== 9528"
                  :key="9528"
                  label="测试角色"
                  value="9528"
                />
              </el-select>
            </div>
            <div v-else>
              <el-select 
                v-model="scope.row.authorityId" 
                size="small" 
                placeholder="选择角色"
                @change="(val: number) => handleRoleChange(scope.row, val)"
              >
                <el-option
                  :key="888"
                  label="普通用户"
                  value="888"
                />
                <el-option
                  :key="9528"
                  label="测试角色"
                  value="9528"
                />
              </el-select>
            </div>
          </template>
        </el-table-column>
        
        <!-- 状态列 -->
        <el-table-column label="启用" width="80" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enable"
              :active-value="1"
              :inactive-value="2"
              @change="(val: number) => handleStatusChange(scope.row, val)"
              :loading="scope.row.statusLoading"
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
                <el-icon><Key /></el-icon>重设密码
              </el-button>
              <el-button type="danger" size="small" plain @click.stop="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
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
    
    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="showUserFormDialog"
      :title="formTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
      class="user-form-dialog"
    >
      <UserForm ref="userFormRef" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showUserFormDialog = false">取消</el-button>
          <el-button type="primary" :loading="formLoading" @click="submitUserForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="showUserEditDialog"
      :title="editFormTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
      class="user-edit-dialog"
    >
      <div v-loading="editFormLoading" style="min-height: 200px;">
        <!-- 这里不需要修改，因为我们已经修改了 currentUser 的类型 -->
        <UserEditForm ref="userEditFormRef" :user-data="currentUser" />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showUserEditDialog = false">取消</el-button>
          <el-button type="primary" :loading="editFormLoading" @click="submitUserEditForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
  </div> <!-- 添加这个结束标签 -->
</template>

<script lang="ts" setup name="SystemUsers">
import { Search, Refresh, Plus, Edit, Delete, Key, User } from '@element-plus/icons-vue'
import { useUsers } from './modules/users/useUsers'
import { useUserDialog } from './modules/users/components/useUserDialog'
import UserInfoCard from './UserInfoCard.vue'
import UserForm from './UserForm.vue'
import UserEditForm from './UserEditForm.vue'  // 保留这一行，使用新路径
import { useUserRole } from './modules/users/useUserRole'
import { useUserStatus } from './modules/users/useUserStatus'
import { useUserEvents } from './modules/users/useUserEvents'
import { ref } from 'vue'

// 修改当前编辑用户的引用，使用空对象而不是 null
const currentUser = ref<Record<string, any>>({})

// 使用解耦合后的用户列表逻辑
const {
  searchForm,
  userList,
  loading,
  pagination,
  fetchUserList,
  handleSearch,
  resetSearch,
  handleSizeChange,
  handleCurrentChange,
  enabledUserCount,  // 添加启用用户数量
  disabledUserCount  // 添加禁用用户数量
} = useUsers()

// 使用解耦合后的对话框逻辑
const {
  showUserInfoDialog,
  userInfoCardRef,
  currentUserId,
  currentUserName,
  handleViewUserInfo,
  toggleUserInfo,
  
  // 用户表单对话框相关
  showUserFormDialog,
  userFormRef,
  formTitle,
  formLoading,
  submitUserForm,
  
  // 用户编辑对话框相关
  showUserEditDialog,
  userEditFormRef,
  editFormTitle,
  editFormLoading,
  submitUserEditForm,
  
  // 操作方法
  handleAdd,
  handleEdit: originalHandleEdit,  // 重命名原始的handleEdit
  handleResetPassword,
  handleDelete
} = useUserDialog()

// 重新定义handleEdit函数，添加设置currentUser的逻辑
const handleEdit = async (row: any) => {
  try {
    // 先设置基本数据
    currentUser.value = { ...row }
    
    // 调用原始的handleEdit函数
    await originalHandleEdit(row)
    
    // 确保在对话框打开后，表单组件已经挂载
    setTimeout(() => {
      if (userEditFormRef.value) {
        // 确保表单组件使用最新的数据
        userEditFormRef.value.setFormData(currentUser.value)
      }
    }, 100)
  } catch (error) {
    console.error('编辑用户时出错:', error)
  }
}

// 使用解耦后的用户角色管理逻辑
const { hasRole, getRoleName, handleRoleChange } = useUserRole()

// 使用解耦后的用户状态管理逻辑
const { handleStatusChange } = useUserStatus()

// 使用解耦后的用户事件管理逻辑
useUserEvents(fetchUserList)

// 导出方法供外部调用 - 保留此方法以便布局组件可以调用
defineExpose({
  toggleUserInfo
})

// 确保组件挂载时加载数据
fetchUserList()
</script>

<style lang="scss" scoped>
/* 替换原有的导入 */
@import './modules/users/styles/userStyles.scss';
</style>
