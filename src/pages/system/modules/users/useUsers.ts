import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, deleteUser, resetPassword, disableUser, enableUser } from '@/api/system/userManage'
import type { UserInfo, UserListParams } from '@/api/system/userManage'

export function useUsers() {
  // 搜索表单
  const searchForm = reactive<UserListParams>({
    page: 1,
    pageSize: 10,
    username: '',
    nickName: '',
    phone: '',
    email: ''
  })

  // 用户列表
  const userList = ref<UserInfo[]>([])
  
  // 加载状态
  const loading = ref(false)
  
  // 分页信息
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  })
  
  // 用户对话框状态
  const userDialogVisible = ref(false)
  const userDialogLoading = ref(false)
  const isEdit = ref(false)
  const currentUser = ref<UserInfo | null>(null)
  
  // 获取用户列表
  const fetchUserList = async () => {
    loading.value = true
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        username: searchForm.username || undefined,
        nickName: searchForm.nickName || undefined,
        phone: searchForm.phone || undefined,
        email: searchForm.email || undefined
      }
      
      const response = await getUserList(params)
      
      if (response.data.code === 0) {
        // 在fetchUserList函数中修改数据映射部分
        const { list, total } = response.data.data
        // 确保数据格式正确
        userList.value = list.map((user: any) => ({
          ...user,
          // 确保关键字段存在，如果不存在则提供默认值
          id: user.id || user.ID, // 添加ID字段的映射
          userName: user.userName || user.username,
          nickName: user.nickName || user.realName,
          phone: user.phone || user.mobile,
          email: user.email,
          headerImg: user.headerImg,
          authorityId: user.authorityId
        }))
        pagination.total = total
      } else {
        ElMessage.error(response.data.msg || '获取用户列表失败')
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
    searchForm.username = ''
    searchForm.nickName = ''
    searchForm.phone = ''
    searchForm.email = ''
    pagination.page = 1
    fetchUserList()
  }
  
  // 处理页码变化
  const handleCurrentChange = (page: number) => {
    pagination.page = page
    fetchUserList()
  }
  
  // 处理每页条数变化
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.page = 1
    fetchUserList()
  }
  
  // 添加用户
  const handleAdd = () => {
    isEdit.value = false
    currentUser.value = null
    userDialogVisible.value = true
  }
  
  // 编辑用户
  const handleEdit = (row: UserInfo) => {
    isEdit.value = true
    currentUser.value = { ...row }
    userDialogVisible.value = true
  }
  
  // 分配角色
  const handleAssignRole = (row: UserInfo) => {
    ElMessage.info('角色分配功能正在开发中')
  }
  
  // 切换用户状态
  const handleToggleStatus = async (row: UserInfo, value: number) => {
    try {
      const action = value === 1 ? '启用' : '禁用';
      const toggleFunc = value === 1 ? enableUser : disableUser;
      const response = await toggleFunc(row.id);
      
      if (response.data.code === 0) {
        ElMessage.success(`${action}用户成功`);
        // 不需要重新获取列表，直接更新本地状态
        row.enable = value;
      } else {
        // 如果失败，恢复原来的状态
        row.enable = value === 1 ? 0 : 1;
        ElMessage.error(response.data.msg || `${action}用户失败`);
      }
    } catch (error) {
      // 如果出错，恢复原来的状态
      row.enable = row.enable === 1 ? 0 : 1;
      console.error('切换用户状态失败:', error);
      ElMessage.error('操作失败，请重试');
    }
  };
  
  // 删除用户
  const handleDelete = (row: UserInfo) => {
    ElMessageBox.confirm(`确定要删除用户 ${row.userName || row.nickName} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        const response = await deleteUser(row.id)
        
        if (response.data.code === 0) {
          ElMessage.success('删除用户成功')
          fetchUserList()
        } else {
          ElMessage.error(response.data.msg || '删除用户失败')
        }
      } catch (error) {
        console.error('删除用户失败:', error)
        ElMessage.error('删除用户失败，请重试')
      }
    }).catch(() => {
      // 用户取消操作
    })
  }
  
  // 重设密码
  const handleResetPassword = (row: UserInfo) => {
    ElMessageBox.confirm(`确定要重设用户 ${row.userName || row.nickName} 的密码吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        const response = await resetPassword(row.id)
        
        if (response.data.code === 0) {
          ElMessage.success('重设密码成功')
        } else {
          ElMessage.error(response.data.msg || '重设密码失败')
        }
      } catch (error) {
        console.error('重设密码失败:', error)
        ElMessage.error('重设密码失败，请重试')
      }
    }).catch(() => {
      // 用户取消操作
    })
  }
  
  // 用户对话框成功回调
  const handleUserDialogSuccess = () => {
    fetchUserList()
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
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  // 表格行样式
  const tableRowClassName = ({ row }: { row: UserInfo }) => {
    return row.enable === 0 ? 'disabled-row' : ''
  }
  
  // 计算属性：管理员数量
  const getAdminCount = computed(() => {
    return userList.value.filter(user => user.authorityId === 1).length
  })
  
  // 计算属性：启用用户数量
  const getEnabledCount = computed(() => {
    return userList.value.filter(user => user.enable === 1).length
  })
  
  // 计算属性：禁用用户数量
  const getDisabledCount = computed(() => {
    return userList.value.filter(user => user.enable === 0).length
  })
  
  // 组件挂载时加载数据
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
    handleSearch,
    resetSearch,
    handleSizeChange,
    handleCurrentChange,
    handleAdd,
    handleEdit,
    handleAssignRole,
    handleToggleStatus,
    handleDelete,
    handleResetPassword,
    handleUserDialogSuccess,
    formatDate,
    tableRowClassName
  }
}