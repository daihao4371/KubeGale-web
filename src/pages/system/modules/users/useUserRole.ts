import { ElMessage } from 'element-plus'
import { setUserAuthorities } from '@/api/system/userManage'

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
  // 检查用户是否已有某个角色
  const hasRole = (authorities: any[], roleId: number) => {
    return authorities.some(auth => auth.authorityId === roleId)
  }

  // 根据角色ID获取角色名称
  const getRoleName = (roleId: number): string => {
    const roleMap: Record<number, string> = {
      888: '普通用户',
      9528: '测试角色'
    };
    return roleMap[roleId] || '未知角色';
  }

  // 处理角色变更
  const handleRoleChange = async (user: UserWithRole, newRoleId: number) => {
    // 保存原始角色ID，以便在失败时恢复
    const originalAuthorityId = user.authorityId;
    
    try {
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
    }
  }

  return {
    hasRole,
    getRoleName,
    handleRoleChange
  }
}