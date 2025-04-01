import service from './service'
import { API_URLS } from './config'

// 角色信息类型定义
export interface RoleInfo {
  id: number;
  name: string;
  description: string;
  role_type: number; // 1: 普通用户, 2: 管理员
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

// 分页响应类型
export interface PageResponse<T> {
  list: T[];
  total: number;
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

// 获取角色列表
export function getRoleList(params: RoleListParams) {
  return service({
    url: API_URLS.getRoleList,
    method: 'post',
    data: params
  })
}

// 更新角色参数类型
export interface UpdateRoleParams {
  id: number;
  name: string;
  description: string;
  role_type: number;
  is_default: 0 | 1; // 是否默认角色
  apis?: number[]; // API权限ID列表，可选
}

// 创建角色参数类型
export interface CreateRoleParams {
  name: string;
  description: string;
  role_type: number;
  is_default: 0 | 1; // 修改为更精确的类型
  apis?: number[]; // API权限ID列表，可选
}

// 创建角色
export function createRole(data: CreateRoleParams) {
  return service({
    url: API_URLS.createRole,
    method: 'post',
    data
  })
}

// 更新角色
export function updateRole(data: UpdateRoleParams) {
  return service({
    url: API_URLS.updateRole,
    method: 'post',
    data
  })
}

// 删除角色
export function deleteRole(id: number) {
  return service({
    url: `${API_URLS.deleteRole}/${id}`,
    method: 'delete'
  })
}