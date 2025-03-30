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
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 操作按钮 -->
        <div class="button-group">
          <el-button type="primary" @click="handleAdd">添加用户</el-button>
        </div>
      </div>
    </div>
    
    <!-- 用户列表 -->
    <el-table
      v-loading="loading"
      :data="userList"
      border
      style="width: 100%"
    >
      <!-- 表格列保持不变 -->
      <el-table-column prop="id" label="用户ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="realName" label="真实姓名" width="120" />
      <el-table-column prop="mobile" label="手机号码" width="120">
        <template #default="scope">
          {{ scope.row.mobile || '未设置' }}
        </template>
      </el-table-column>
      <el-table-column prop="feiShuUserId" label="飞书ID" width="120">
        <template #default="scope">
          {{ scope.row.feiShuUserId || '未设置' }}
        </template>
      </el-table-column>
      <el-table-column prop="accountType" label="账户类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.accountType === 1 ? 'success' : 'primary'">
            {{ scope.row.accountType === 1 ? '普通用户' : '管理员' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="enable" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.enable === 1 ? 'success' : 'danger'">
            {{ scope.row.enable === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="250">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="warning" size="small" @click="handleAssignRole(scope.row)">分配角色</el-button>
          <!-- 根据用户当前状态显示不同的按钮 -->
          <el-button 
            :type="scope.row.enable === 1 ? 'danger' : 'success'" 
            size="small" 
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.enable === 1 ? '禁用' : '启用' }}
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getUserList, 
  type UserInfo, 
  type ApiResponse, 
  type PageResponse, 
  disableUser,
  enableUser 
} from '@/api/system/userManage';
import UserDialog from './UserDialog.vue'

// 搜索表单
const searchForm = reactive({
  username: '',
  realName: '',
  mobile: ''
})

// 用户列表数据
const userList = ref<UserInfo[]>([])
const loading = ref(false)

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 用户对话框控制
const userDialogVisible = ref(false)
const userDialogLoading = ref(false)
const isEdit = ref(false)
const currentUser = ref<Partial<UserInfo>>({})

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    const response = await getUserList(params)
    console.log('用户列表响应:', response.data)
    
    // 处理响应数据
    const apiResponse = response.data as ApiResponse<PageResponse<UserInfo>>
    
    if (apiResponse.code === 0 && apiResponse.data) {
      userList.value = apiResponse.data.list
      pagination.total = apiResponse.data.total
      console.log('用户列表数据:', userList.value)
    } else {
      ElMessage.error(apiResponse.msg || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1 // 重置到第一页
  fetchUserList()
}

// 重置搜索
const resetSearch = () => {
  // 重置搜索表单
  searchForm.username = ''
  searchForm.realName = ''
  searchForm.mobile = ''
  
  // 重新加载数据
  pagination.page = 1
  fetchUserList()
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchUserList()
}

// 页码变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchUserList()
}

// 添加用户
const handleAdd = () => {
  isEdit.value = false
  currentUser.value = {}
  userDialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: UserInfo) => {
  console.log('编辑用户:', row)
  isEdit.value = true
  currentUser.value = { ...row }
  userDialogVisible.value = true
}

// 分配角色
const handleAssignRole = (row: UserInfo) => {
  console.log('分配角色:', row)
  ElMessage.info('分配角色功能开发中')
}

// 修改用户状态切换函数
const handleToggleStatus = (row: UserInfo) => {
  const action = row.enable === 1 ? '禁用' : '启用';
  console.log(`${action}用户:`, row);
  
  ElMessageBox.confirm(`确定要${action}用户 ${row.username} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 根据当前状态调用不同的API
      let response;
      if (row.enable === 1) {
        // 当前为启用状态，调用禁用接口
        console.log('发送禁用请求，用户ID:', row.id);
        response = await disableUser(row.id);
      } else {
        // 当前为禁用状态，调用启用接口
        console.log('发送启用请求，用户ID:', row.id);
        response = await enableUser(row.id);
      }
      
      console.log('用户状态切换响应:', response);
      
      if (response.data.code === 0) {
        ElMessage.success(`${action}用户成功`);
        fetchUserList(); // 刷新用户列表
      } else {
        ElMessage.error(response.data.msg || `${action}用户失败`);
      }
    } catch (error) {
      console.error(`${action}用户失败:`, error);
      ElMessage.error(`${action}用户失败，请重试`);
    }
  }).catch(() => {
    // 用户取消操作
  });
};

// 用户对话框成功回调
const handleUserDialogSuccess = () => {
  fetchUserList() // 刷新用户列表
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

// 页面加载时获取用户列表
onMounted(() => {
  fetchUserList()
})
</script>

<style lang="scss" scoped>
.users-container {
  padding: 20px;
  
  .users-header {
    margin-bottom: 20px;
    
    h2 {
      margin-bottom: 20px;
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
