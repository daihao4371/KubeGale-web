import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAuthorityList, type AuthorityInfo } from '@/api/system/userManage'
import { setUserAuthorities } from '@/api/system/userManage'

export function useUserRole() {
  // 角色列表
  const roleList = ref<AuthorityInfo[]>([])
  // 级联选择器选项
  const cascaderRoleOptions = ref<any[]>([])
  // 加载状态
  const roleLoading = ref(false)
  
  // 获取角色列表
  const fetchRoleList = async () => {
    roleLoading.value = true
    try {
      const response = await getAuthorityList()
      
      if (response.data && response.data.code === 0) {
        roleList.value = response.data.data
        // 处理级联选择器数据
        cascaderRoleOptions.value = processRolesForCascader(response.data.data)
        console.log('角色列表获取成功:', roleList.value)
      } else {
        console.error('获取角色列表失败:', response.data)
        ElMessage.error(response.data?.msg || '获取角色列表失败')
      }
    } catch (error) {
      console.error('获取角色列表异常:', error)
      ElMessage.error('获取角色列表失败')
    } finally {
      roleLoading.value = false
    }
  }
  
  // 处理角色数据为级联选择器格式
  const processRolesForCascader = (roles: AuthorityInfo[]): any[] => {
    return roles.map(role => {
      const result: any = {
        authorityId: role.authorityId,
        authorityName: role.authorityName,
        value: role.authorityId,
        label: role.authorityName
      };
      
      if (role.children && role.children.length > 0) {
        result.children = processRolesForCascader(role.children);
      }
      
      return result;
    });
  };
  
  // 获取角色名称
  const getRoleName = (roleId: number | string) => {
    const findRoleName = (roles: any[], id: number | string): string => {
      for (const role of roles) {
        if (String(role.authorityId) === String(id)) {
          return role.authorityName
        }
        if (role.children && role.children.length > 0) {
          const childName = findRoleName(role.children, id)
          if (childName) return childName
        }
      }
      return '未知角色'
    }
    
    return findRoleName(cascaderRoleOptions.value, roleId)
  }
  
  // 处理角色变更
  const handleRoleChange = async (user: any, roleId: number) => {
    try {
      // 调用API更新用户角色
      const response = await setUserAuthorities({
        ID: user.id,
        authorityIds: [roleId]
      })
      
      if (response.data && response.data.code === 0) {
        ElMessage.success('用户角色更新成功')
        return true
      } else {
        ElMessage.error(response.data?.msg || '用户角色更新失败')
        return false
      }
    } catch (error) {
      console.error('更新用户角色失败:', error)
      ElMessage.error('更新用户角色失败')
      return false
    }
  }
  
  // 组件挂载时获取角色列表
  onMounted(() => {
    fetchRoleList()
  })
  
  return {
    roleList,
    cascaderRoleOptions,
    roleLoading,
    fetchRoleList,
    getRoleName,
    handleRoleChange
  }
}