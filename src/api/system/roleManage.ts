// 角色信息类型定义
export interface RoleInfo {
  id: number;
  name: string;
  description: string;
  role_type: number; // 1: 系统角色, 2: 自定义角色
  is_default: number; // 0: 否, 1: 是
  create_time: number;
  update_time: number;
  is_deleted: number; // 0: 否, 1: 是
  apis?: any[]; // API权限列表
}

// 角色列表参数类型
export interface RoleListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  role_type?: number;
}

// 创建角色参数类型
export interface CreateRoleParams {
  name: string;
  description: string;
  role_type: number;
  is_default: number;
}

// 更新角色参数类型
export interface UpdateRoleParams {
  id: number;
  name: string;
  description: string;
  role_type: number;
  is_default: number;
}