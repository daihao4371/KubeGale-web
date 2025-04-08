import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfo } from '@/api/system/userManage'
import type { UserInfo } from '@/api/system/userManage'

export function useUserInfoCard(userId?: number) {
  const loading = ref(false)
  const userInfo = ref<UserInfo | null>(null)

  // 获取用户信息
  const fetchUserInfo = async () => {
    loading.value = true
    try {
      const response = await getUserInfo(userId)
      console.log('获取用户信息响应:', response)
      
      if (response.data && response.data.code === 0) {
        // 根据后端返回的数据结构进行处理
        const data = response.data.data
        
        if (data.userInfo) {
          // 直接使用 userInfo 对象
          userInfo.value = {
            id: data.userInfo.ID,
            uuid: data.userInfo.uuid,
            userName: data.userInfo.userName,
            nickName: data.userInfo.nickName,
            headerImg: data.userInfo.headerImg,
            authorityId: data.userInfo.authorityId,
            authority: data.userInfo.authority,
            authorities: data.userInfo.authorities || [],
            phone: data.userInfo.phone,
            email: data.userInfo.email,
            enable: data.userInfo.enable
          }
        } else {
          // 如果没有 userInfo 字段，尝试直接使用 data
          userInfo.value = {
            id: data.ID || data.id,
            uuid: data.uuid,
            userName: data.userName,
            nickName: data.nickName,
            headerImg: data.headerImg,
            authorityId: data.authorityId,
            authority: data.authority,
            authorities: data.authorities || [],
            phone: data.phone,
            email: data.email,
            enable: data.enable
          }
        }
      } else {
        ElMessage.error(response.data?.msg || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      ElMessage.error('获取用户信息失败，请重试')
    } finally {
      loading.value = false
    }
  }

  // 刷新用户信息
  const refreshUserInfo = () => {
    fetchUserInfo()
  }

  // 获取角色标签类型
  const getRoleTagType = (authorityId: number) => {
    const types: Record<number, string> = {
      888: 'info',
      8881: 'warning',
      9528: 'success'
    }
    return types[authorityId] || 'info'
  }

  onMounted(() => {
    fetchUserInfo()
  })

  return {
    loading,
    userInfo,
    fetchUserInfo,
    refreshUserInfo,
    getRoleTagType
  }
}