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
    
  </div> <!-- 添加这个结束标签 -->
</template>

<script lang="ts" setup name="SystemUsers">
import { Search, Refresh, Plus, Edit, Delete, Key, User } from '@element-plus/icons-vue'
import { useUsers } from './modules/users/useUsers'
import { useUserDialog } from './modules/users/components/useUserDialog'
import UserInfoCard from './UserInfoCard.vue'
import UserForm from './UserForm.vue'
import { onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { setUserAuthorities } from '@/api/system/userManage' // 导入设置用户角色的函数

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
  
  // 操作方法
  handleAdd,
  handleEdit,
  handleResetPassword,
  handleDelete
} = useUserDialog()

// 检查用户是否已有某个角色
const hasRole = (authorities: any[], roleId: number) => {
  return authorities.some(auth => auth.authorityId === roleId)
}

// 处理角色变更
const handleRoleChange = async (user: { 
  id: number; 
  authorityId: number; 
  authority?: { 
    authorityId: number; 
    authorityName: string 
  }; 
  authorities?: Array<{ 
    authorityId: number; 
    authorityName: string 
  }> 
}, newRoleId: number) => {
  // 保存原始角色ID，以便在失败时恢复
  const originalAuthorityId = user.authorityId;
  
  try {
    loading.value = true
    
    // 确保 newRoleId 是数字类型
    const authorityId = Number(newRoleId);
    
    // 修改为符合后端要求的参数格式
    const response = await setUserAuthorities({
      ID: user.id,  // 使用大写的 ID
      authorityIds: [authorityId]  // 使用 authorityIds 数组
    })
    
    if (response.data && response.data.code === 0) {
      ElMessage.success('用户角色更新成功')
      
      // 更新本地数据
      user.authorityId = authorityId;
      
      // 更新 authority 对象
      if (user.authority) {
        user.authority.authorityId = authorityId;
        user.authority.authorityName = getRoleName(authorityId);
      } else {
        user.authority = {
          authorityId: authorityId,
          authorityName: getRoleName(authorityId)
        };
      }
      
      // 如果有 authorities 数组，也更新它
      if (user.authorities && user.authorities.length) {
        // 检查是否已存在该角色
        const existingAuthIndex = user.authorities.findIndex(
          (auth: any) => auth.authorityId === authorityId
        );
        
        if (existingAuthIndex === -1) {
          // 如果不存在，添加新角色
          user.authorities.push({
            authorityId: authorityId,
            authorityName: getRoleName(authorityId)
          });
        }
      }
    } else {
      // 恢复原始值
      user.authorityId = originalAuthorityId;
      ElMessage.error(response.data?.msg || '角色更新失败');
    }
  } catch (error) {
    console.error('更新用户角色失败:', error);
    // 恢复原始值
    user.authorityId = originalAuthorityId;
    ElMessage.error('更新用户角色失败，请重试');
  } finally {
    loading.value = false;
  }
}

// 根据角色ID获取角色名称
const getRoleName = (roleId: number): string => {
  // 这里应该从数据库获取角色名称，但为了简化，我们使用硬编码的映射
  const roleMap: Record<number, string> = {
    888: '普通用户',
    9528: '测试角色'
  };
  return roleMap[roleId] || '未知角色';
}

// 监听刷新用户列表事件
const handleRefreshUserList = () => {
  fetchUserList()
}

// 组件挂载时添加事件监听
onMounted(() => {
  window.addEventListener('refresh-user-list', handleRefreshUserList)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('refresh-user-list', handleRefreshUserList)
})

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
@import './modules/users/components/userForm.scss';

/* 角色选择下拉框样式 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-select .el-input__inner) {
  height: 24px;
  line-height: 24px;
}
</style>
