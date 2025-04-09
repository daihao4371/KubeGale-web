import { ref, reactive, onMounted, onUnmounted } from 'vue'
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
      console.log('获取用户列表响应:', response)
      
      // 检查响应结构，适配不同的后端返回格式
      if (response.data && (response.data.code === 0 || response.data.code === 200)) {
        // 标准响应格式
        let listData = response.data.data
        
        // 处理不同的数据结构
        if (Array.isArray(listData)) {
          // 直接返回数组
          userList.value = listData.map(formatUserData)
          pagination.total = listData.length
        } else if (listData && typeof listData === 'object') {
          // 分页数据结构
          if (listData.list && Array.isArray(listData.list)) {
            userList.value = listData.list.map(formatUserData)
            pagination.total = listData.total || listData.list.length
          } else if (listData.records && Array.isArray(listData.records)) {
            // 适配另一种常见的分页结构
            userList.value = listData.records.map(formatUserData)
            pagination.total = listData.total || listData.records.length
          } else {
            // 尝试将整个对象作为列表
            const entries = Object.values(listData)
            if (entries.length > 0 && typeof entries[0] === 'object') {
              userList.value = entries.map(formatUserData)
              pagination.total = entries.length
            } else {
              userList.value = []
              pagination.total = 0
              console.error('未识别的数据结构:', listData)
            }
          }
        } else {
          userList.value = []
          pagination.total = 0
          console.error('未识别的数据结构:', listData)
        }
      } else {
        // 处理错误响应
        ElMessage.error(response.data?.msg || '获取用户列表失败')
        userList.value = []
        pagination.total = 0
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      ElMessage.error('获取用户列表失败，请重试')
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
      enable: user.enable !== undefined ? user.enable : (user.status === 'active' ? 1 : 0)
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

  // 选择用户
  const selectUser = (user: UserInfo) => {
    currentUser.value = user
  }

  // 组件挂载时加载数据
  // 在 fetchUserList 函数后添加以下代码
  
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
    selectUser
  }
}