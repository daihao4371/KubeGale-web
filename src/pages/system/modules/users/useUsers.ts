import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getUserList, 
  type UserInfo, 
  type ApiResponse, 
  type PageResponse, 
  disableUser,
  enableUser,
  deleteUser
} from '@/api/system/userManage';

export function useUsers() {
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

  // 添加删除用户函数
  const handleDelete = (row: UserInfo) => {
    console.log('删除用户:', row);
    
    ElMessageBox.confirm(`确定要永久删除用户 ${row.username} 吗? 此操作不可恢复!`, '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }).then(async () => {
      try {
        console.log('发送删除请求，用户ID:', row.id);
        const response = await deleteUser(row.id);
        console.log('删除用户响应:', response);
        
        if (response.data.code === 0) {
          ElMessage.success('用户已永久删除');
          fetchUserList(); // 刷新用户列表
        } else {
          ElMessage.error(response.data.msg || '删除用户失败');
        }
      } catch (error) {
        console.error('删除用户失败:', error);
        ElMessage.error('删除用户失败，请重试');
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

  // 表格行样式
  const tableRowClassName = ({ row }: { row: UserInfo }) => {
    if (row.enable === 0) {
      return 'disabled-row'
    }
    return ''
  }

  // 获取管理员数量 - 修正判断逻辑，与表格显示保持一致
  const getAdminCount = computed(() => {
    return userList.value.filter(user => user.accountType !== 1).length
  })

  // 获取启用用户数量
  const getEnabledCount = computed(() => {
    return userList.value.filter(user => user.enable === 1).length
  })

  // 获取禁用用户数量
  const getDisabledCount = computed(() => {
    return userList.value.filter(user => user.enable === 0).length
  })

  // 页面加载时获取用户列表
  onMounted(() => {
    fetchUserList()
  })

  return {
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
    fetchUserList,
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
  }
}