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
        <el-table-column label="用户角色" width="220">
          <template #default="scope">
            <!-- 使用级联选择器替换多选框 -->
            <el-cascader
              v-model="scope.row.selectedRoles"
              :options="cascaderRoleOptions"
              :props="{
                multiple: true,
                checkStrictly: true,
                emitPath: false
              }"
              :show-all-levels="false"
              collapse-tags
              collapse-tags-tooltip
              clearable
              placeholder="选择角色"
              @change="(val: number[]) => handleMultiRoleChange(scope.row, val)"
              size="small"
              style="width: 100%;"
            />
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
              <el-button
                type="primary"
                link
                @click.stop="handleEdit(scope.row)"
              >
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button
                type="warning"
                link
                @click.stop="handleResetPassword(scope.row)"
              >
                <el-icon><Key /></el-icon>重设密码
              </el-button>
              <el-button
                type="danger"
                link
                @click.stop="handleDelete(scope.row)"
              >
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
    <!-- 用户信息对话框 -->
    <el-dialog
      v-model="showUserInfoDialog"
      :title="currentUserName ? `${currentUserName} 的个人信息` : '个人信息'"
      width="400px"
      :close-on-click-modal="false"
      destroy-on-close
      class="user-dialog"
    >
      <div class="user-info-container">
        <UserInfoCard :userId="currentUserId" ref="userInfoCardRef">
          <!-- 添加图标插槽 -->
          <template #userNameIcon>
            <el-icon class="item-icon"><User /></el-icon>
          </template>
          <template #nickNameIcon>
            <el-icon class="item-icon"><Avatar /></el-icon>
          </template>
          <template #phoneIcon>
            <el-icon class="item-icon"><Phone /></el-icon>
          </template>
          <template #emailIcon>
            <el-icon class="item-icon"><Message /></el-icon>
          </template>
        </UserInfoCard>
      </div>
    </el-dialog>
    
    <!-- 用户表单对话框 -->
    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="showUserFormDialog"
      :title="formTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
      class="user-form-dialog"
    >
      <div v-loading="formLoading" style="min-height: 200px;">
        <UserForm ref="userFormRef" />
      </div>
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
import { Search, Refresh, Plus, Edit, Delete, Key, User, Avatar, Phone, Message } from '@element-plus/icons-vue'
import { useUsers } from './modules/users/useUsers'
import { useUserDialog } from './modules/users/components/useUserDialog'
import UserInfoCard from './UserInfoCard.vue'
import UserForm from './UserForm.vue'
import UserEditForm from './UserEditForm.vue'
import { useUserRole } from './modules/users/useUserRole'
import { useUserStatus } from './modules/users/useUserStatus'
import { useUserEvents } from './modules/users/useUserEvents'
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { setUserAuthorities } from '@/api/system/userManage'

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
  enabledUserCount,
  disabledUserCount
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
  handleEdit: originalHandleEdit,
  handleResetPassword,
  handleDelete
} = useUserDialog()

// 使用解耦后的用户角色管理逻辑
const { 
  roleList, 
  cascaderRoleOptions, 
  roleLoading, 
  fetchRoleList, 
  getRoleName, 
  handleRoleChange 
} = useUserRole()

// 使用解耦后的用户状态管理逻辑
const { handleStatusChange } = useUserStatus()

// 使用解耦合后的用户事件管理逻辑
useUserEvents(fetchUserList)

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

// 处理多角色选择变更
const handleMultiRoleChange = async (user: any, selectedRoles: number[]) => {
  try {
    // 防止触发 watch
    user._updatingRoles = true
    
    // 调用API更新用户角色
    const response = await setUserAuthorities({
      ID: user.id,
      authorityIds: selectedRoles.map(role => Number(role)) // 确保是数字数组
    })
    
    if (response.data && response.data.code === 0) {
      ElMessage.success('用户角色更新成功')
      
      // 更新本地数据
      // 1. 更新 authorities 数组
      user.authorities = selectedRoles.map(roleId => ({
        authorityId: Number(roleId),
        authorityName: getRoleName(roleId)
      }))
      
      // 2. 如果有单个 authority 字段，使用第一个选中的角色更新
      if (selectedRoles.length > 0) {
        const primaryRole = selectedRoles[0]
        user.authorityId = Number(primaryRole)
        user.authority = {
          authorityId: Number(primaryRole),
          authorityName: getRoleName(primaryRole)
        }
      }
    } else {
      ElMessage.error(response.data?.msg || '用户角色更新失败')
      // 恢复原始选择
      initUserRoles(user)
    }
  } catch (error) {
    console.error('更新用户角色失败:', error)
    ElMessage.error('更新用户角色失败，请重试')
    // 恢复原始选择
    initUserRoles(user)
  } finally {
    // 重置标记
    user._updatingRoles = false
  }
}

// 初始化用户角色选择
const initUserRoles = (user: any) => {
  if (!user) return;
  
  if (!user.selectedRoles) {
    user.selectedRoles = []
  }
  
  // 从 authorities 数组获取角色
  if (user.authorities && Array.isArray(user.authorities)) {
    user.selectedRoles = user.authorities.map((auth: any) => Number(auth.authorityId))
  } 
  // 如果只有单个 authority 对象
  else if (user.authority && user.authority.authorityId) {
    user.selectedRoles = [Number(user.authority.authorityId)]
  }
  // 如果只有 authorityId 字段
  else if (user.authorityId) {
    user.selectedRoles = [Number(user.authorityId)]
  }
  
  // 确保 ID 字段一致性
  if (!user.id && user.ID) {
    user.id = user.ID
  }
  
  // 标记为已初始化
  user._rolesInitialized = true
}

// 添加额外的监听，确保用户列表更新后重新初始化角色
watch(() => userList.value, (newList) => {
  if (newList) {
    console.log('用户列表更新，当前数量:', newList.length)
    // 使用一个标记来防止递归更新
    newList.forEach(user => {
      if (!user._rolesInitialized) {
        initUserRoles(user)
      }
    })
  }
}, { immediate: true, deep: true })

// 确保组件挂载时加载数据
onMounted(() => {
  console.log('用户管理组件挂载，开始加载数据')
  fetchUserList()
  fetchRoleList() // 获取角色列表
})
</script>

<style lang="scss" scoped>
/* 替换原有的导入 */
@import './modules/users/styles/userStyles.scss';
</style>
