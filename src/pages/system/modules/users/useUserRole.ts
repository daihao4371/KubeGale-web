import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { setUserAuthorities } from '@/api/system/userManage'
import service from '@/api/system/service'
import { API_URLS } from '@/api/system/config'

// 角色数据接口定义
interface AuthorityData {
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: null | string
  authorityId: number
  authorityName: string
  parentId: number
  dataAuthorityId: AuthorityData[] | null
  children: AuthorityData[] | null
  menus: any | null
  defaultRouter: string
}

// 接口返回数据类型
interface ResponseData<T> {
  code: number
  data: T
  msg: string
}

// 用户角色类型定义
export interface UserWithRole {
  id: number;
  authorityId: number;
  authority?: {
    authorityId: number;
    authorityName: string;
  };
  authorities?: Array<{
    authorityId: number;
    authorityName: string;
  }>;
  [key: string]: any;
}

export function useUserRole() {
  // 角色列表
  const roleList = ref<AuthorityData[]>([])
  // 级联选择器选项
  const cascaderRoleOptions = ref<any[]>([])
  // 加载状态
  const roleLoading = ref(false)

  // 获取角色列表
  const fetchRoleList = async () => {
    roleLoading.value = true
    try {
      const response = await service.post<ResponseData<AuthorityData[]>>(
        API_URLS.getAuthorityList
      )
      const res = response.data
      if (res.code === 0) {
        // 保存角色列表
        roleList.value = res.data
        
        // 处理级联选择器数据
        cascaderRoleOptions.value = processRolesForCascader(res.data)
      } else {
        ElMessage.error(res.msg || '获取角色列表失败')
      }
    } catch (error) {
      console.error('获取角色列表出错:', error)
    } finally {
      roleLoading.value = false
    }
  }

  // 处理角色数据为级联选择器格式
  const processRolesForCascader = (roles: AuthorityData[]): any[] => {
    return roles.map(role => {
      const result: any = {
        value: role.authorityId,
        label: role.authorityName,
      };
      
      if (role.children && role.children.length > 0) {
        result.children = processRolesForCascader(role.children);
      }
      
      return result;
    });
  };

  // 检查用户是否已有某个角色
  const hasRole = (authorities: any[], roleId: number) => {
    return authorities.some(auth => auth.authorityId === roleId)
  }

  // 根据角色ID获取角色名称
  const getRoleName = (roleId: number): string => {
    // 递归查找角色名称
    const findRoleName = (roles: AuthorityData[], id: number): string => {
      for (const role of roles) {
        if (role.authorityId === id) {
          return role.authorityName;
        }
        if (role.children && role.children.length > 0) {
          const name = findRoleName(role.children, id);
          if (name) return name;
        }
      }
      return '未知角色';
    };
    
    return findRoleName(roleList.value, roleId);
  }

  // 处理角色变更
  const handleRoleChange = async (user: UserWithRole, newRoleIds: number[]) => {
    try {
      // 确保是数字数组
      const authorityIds = newRoleIds.map(id => Number(id));
      
      // 修改为符合后端要求的参数格式
      const response = await setUserAuthorities({
        ID: user.id,
        authorityIds: authorityIds
      })
      
      if (response.data && response.data.code === 0) {
        ElMessage.success('用户角色更新成功')
        
        // 更新本地数据
        // 1. 更新 authorities 数组
        user.authorities = authorityIds.map(roleId => ({
          authorityId: roleId,
          authorityName: getRoleName(roleId)
        }));
        
        // 2. 如果有单个 authority 字段，使用第一个选中的角色更新
        if (authorityIds.length > 0) {
          const primaryRole = authorityIds[0];
          user.authorityId = primaryRole;
          user.authority = {
            authorityId: primaryRole,
            authorityName: getRoleName(primaryRole)
          };
        }
      } else {
        ElMessage.error(response.data?.msg || '角色更新失败');
      }
    } catch (error) {
      console.error('更新用户角色失败:', error);
      ElMessage.error('更新用户角色失败，请重试');
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
    hasRole,
    getRoleName,
    handleRoleChange
  }
}