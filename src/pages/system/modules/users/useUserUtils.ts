import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { setUserInfo, deleteUser, getAuthorityList, type AuthorityInfo } from '@/api/system/userManage'
import type { UserInfo } from '@/api/system/userManage'

/**
 * 用户删除相关逻辑
 */
export function useUserDelete() {
  // 处理用户删除
  const handleDeleteUser = async (user: UserInfo) => {
    try {
      // 显示确认对话框
      await ElMessageBox.confirm(
        `确定要删除用户 "${user.userName || '未命名用户'}" 吗？此操作不可恢复！`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      // 用户确认删除，调用删除API
      const response = await deleteUser(Number(user.id))
      
      if (response.data && response.data.code === 0) {
        ElMessage.success('用户删除成功')
        // 触发刷新用户列表事件
        window.dispatchEvent(new CustomEvent('refresh-user-list'))
        return true
      } else {
        ElMessage.error(response.data?.msg || '删除用户失败')
        return false
      }
    } catch (error: any) {
      // 用户取消删除或发生错误
      if (error === 'cancel' || error?.message === 'cancel') {
        // 用户取消操作，不显示错误
        return false
      }
      
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败，请重试')
      return false
    }
  }

  return {
    handleDeleteUser
  }
}

/**
 * 用户事件相关逻辑
 */
export function useUserEvents(fetchUserList: () => void) {
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
}

/**
 * 用户角色相关逻辑
 */
export function useUserRole() {
  // 角色列表数据
  const roleList = ref<AuthorityInfo[]>([])
  // 角色加载状态
  const roleLoading = ref(false)
  
  // 获取角色列表
  const fetchRoleList = async () => {
    roleLoading.value = true
    try {
      const res = await getAuthorityList()
      if (res.data && res.data.code === 0 && Array.isArray(res.data.data)) {
        roleList.value = res.data.data
        console.log('获取角色列表成功:', roleList.value)
      } else {
        console.error('获取角色列表失败:', res.data)
        ElMessage.error('获取角色列表失败')
      }
    } catch (error) {
      console.error('获取角色列表异常:', error)
      ElMessage.error('获取角色列表失败')
    } finally {
      roleLoading.value = false
    }
  }
  
  // 检查用户是否拥有指定角色
  const hasRole = (authorities: any[], roleId: number | string) => {
    if (!authorities || !Array.isArray(authorities)) return false
    
    return authorities.some(auth => 
      String(auth.authorityId) === String(roleId)
    )
  }

  // 获取角色名称 - 从实际角色列表中获取
  const getRoleName = (roleId: number | string) => {
    // 在角色列表中查找匹配的角色
    const role = roleList.value.find(r => String(r.authorityId) === String(roleId))
    if (role) {
      return role.authorityName
    }
    
    // 如果在顶级角色中找不到，尝试在子角色中查找
    for (const parentRole of roleList.value) {
      if (parentRole.children) {
        const childRole = parentRole.children.find(
          child => String(child.authorityId) === String(roleId)
        )
        if (childRole) {
          return childRole.authorityName
        }
      }
    }
    
    return `角色(${roleId})`
  }

  // 处理角色变更
  const handleRoleChange = async (user: UserInfo, roleId: number | string) => {
    try {
      // 修复：使用 authorityIds 并确保是数字类型
      const response = await setUserInfo({
        ID: user.id,
        authorityIds: [Number(roleId)] // 转换为数字类型
      })
      
      if (response.data && response.data.code === 0) {
        ElMessage.success('用户角色更新成功')
        
        // 更新本地数据
        if (user.authority) {
          // 修复：确保转换为数字类型
          user.authority.authorityId = Number(roleId)
          
          // 更新角色名称
          user.authority.authorityName = getRoleName(roleId)
        } else {
          user.authority = {
            // 修复：确保转换为数字类型
            authorityId: Number(roleId),
            authorityName: getRoleName(roleId)
          }
        }
        
        // 更新 authorityId 字段
        // 修复：确保转换为数字类型
        user.authorityId = Number(roleId)
      } else {
        ElMessage.error(response.data?.msg || '用户角色更新失败')
        // 恢复原角色
        if (user.authority) {
          user.authorityId = user.authority.authorityId
        }
      }
    } catch (error) {
      console.error('更新用户角色失败:', error)
      ElMessage.error('更新用户角色失败，请重试')
      // 恢复原角色
      if (user.authority) {
        user.authorityId = user.authority.authorityId
      }
    }
  }

  // 组件挂载时获取角色列表
  onMounted(() => {
    fetchRoleList()
  })

  return {
    roleList,
    roleLoading,
    fetchRoleList,
    hasRole,
    getRoleName,
    handleRoleChange
  }
}

/**
 * 用户状态相关逻辑
 */
export function useUserStatus() {
  // 处理用户状态变更
  const handleStatusChange = async (user: UserInfo, status: number) => {
    // 添加状态加载标志
    if (!user.statusLoading) {
      user.statusLoading = ref(false)
    }
    
    user.statusLoading = true
    
    try {
      // 使用 setUserInfo API 更新用户状态
      const response = await setUserInfo({
        ID: user.id,
        enable: status
      })
      
      if (response.data && response.data.code === 0) {
        ElMessage.success(`用户${status === 1 ? '启用' : '禁用'}成功`)
        // 更新本地状态
        user.enable = status
      } else {
        ElMessage.error(response.data?.msg || `用户${status === 1 ? '启用' : '禁用'}失败`)
        // 恢复原状态
        user.enable = status === 1 ? 0 : 1
      }
    } catch (error) {
      console.error('更新用户状态失败:', error)
      ElMessage.error(`用户${status === 1 ? '启用' : '禁用'}失败，请重试`)
      // 恢复原状态
      user.enable = status === 1 ? 0 : 1
    } finally {
      user.statusLoading = false
    }
  }

  return {
    handleStatusChange
  }
}