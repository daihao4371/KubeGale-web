import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UserInfo, UserListParams } from '@/api/system/userManage'
import { getUserList, getUserInfo } from '@/api/system/userManage'

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
  
  // 当前选中的用户
  const currentUser = ref<UserInfo | null>(null)
  
  // 加载状态
  const loading = ref(false)
  const userInfoLoading = ref(false)
  
  // 分页信息
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  })
  
  // 添加计算属性，统计启用和禁用的用户数量
  const enabledUserCount = computed(() => {
    return userList.value.filter(user => user.enable === 1).length
  })
  
  const disabledUserCount = computed(() => {
    return userList.value.filter(user => user.enable === 2).length
  })
  
  // 初始化用户角色选择函数
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
    
    // 标记为已初始化
    user._rolesInitialized = true
  }
  
  // 获取用户列表
  const fetchUserList = async () => {
    loading.value = true
    try {
      const response = await getUserList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...searchForm
      })
      
      console.log('获取用户列表响应:', response)
      
      if (response.data && response.data.code === 0) {
        // 确保 response.data.data 存在且包含 list 属性
        if (response.data.data && Array.isArray(response.data.data.list)) {
          userList.value = response.data.data.list
          pagination.total = response.data.data.total || 0
          
          // 初始化用户角色选择
          userList.value.forEach(user => {
            // 确保 ID 字段一致
            if (!user.id && user.ID) {
              user.id = user.ID
            } else if (!user.ID && user.id) {
              user.ID = user.id
            }
            
            // 初始化角色选择
            if (!user._rolesInitialized) {
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
              } else {
                user.selectedRoles = []
              }
              
              // 标记为已初始化
              user._rolesInitialized = true
            }
          })
          
          // 确保即使列表为空也正确处理
          if (userList.value.length === 0) {
            console.log('用户列表为空')
          }
        } else {
          console.error('用户列表数据格式不正确:', response.data)
          userList.value = []
          pagination.total = 0
        }
      } else {
        console.error('获取用户列表失败:', response.data)
        ElMessage.error(response.data?.msg || '获取用户列表失败')
        userList.value = []
        pagination.total = 0
      }
    } catch (error) {
      console.error('获取用户列表异常:', error)
      ElMessage.error('获取用户列表失败')
      userList.value = []
      pagination.total = 0
    } finally {
      loading.value = false
    }
  }

  // 获取单个用户信息
  const fetchUserInfo = async (userId?: number) => {
    userInfoLoading.value = true
    try {
      const response = await getUserInfo(userId)
      console.log('获取用户详情响应:', response)
      
      if (response.data && response.data.code === 0) {
        // 根据后端返回的数据结构进行处理
        const data = response.data.data
        
        if (data.userInfo) {
          // 直接使用 userInfo 对象
          currentUser.value = formatUserData(data.userInfo)
        } else {
          // 如果没有 userInfo 字段，尝试直接使用 data
          currentUser.value = formatUserData(data)
        }
        
        return currentUser.value
      } else {
        ElMessage.error(response.data?.msg || '获取用户信息失败')
        return null
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      ElMessage.error('获取用户信息失败，请重试')
      return null
    } finally {
      userInfoLoading.value = false
    }
  }

  // 格式化用户数据，适配不同的字段名
  const formatUserData = (user: any): UserInfo => {
    return {
      id: user.ID || user.id || 0,
      uuid: user.uuid || user.UUID || '',
      userName: user.userName || user.username || user.user_name || '',
      nickName: user.nickName || user.nickname || user.nick_name || '',
      headerImg: user.headerImg || user.header_img || user.avatar || '',
      authorityId: user.authorityId || user.authority_id || 0,
      authority: user.authority || { authorityId: 0, authorityName: '普通用户' },
      authorities: user.authorities || [],
      phone: user.phone || user.mobile || '',
      email: user.email || '',
      enable: user.enable !== undefined ? user.enable : (user.status === 'active' ? 1 : 2)
    }
  }

  // 搜索处理
  const handleSearch = () => {
    pagination.page = 1
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

  // 选择用户 - 只保留一个定义
  const selectUser = (user: UserInfo) => {
    currentUser.value = user
    console.log('选择用户:', user)
  }

  // 监听刷新用户列表事件
  onMounted(() => {
    window.addEventListener('refresh-user-list', fetchUserList)
  })
  
  // 组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('refresh-user-list', fetchUserList)
  })

  return {
    searchForm,
    userList,
    currentUser,
    loading,
    userInfoLoading,
    pagination,
    fetchUserList,
    fetchUserInfo,
    handleSearch,
    resetSearch,
    handleSizeChange,
    handleCurrentChange,
    selectUser,
    enabledUserCount,
    disabledUserCount
  }
}