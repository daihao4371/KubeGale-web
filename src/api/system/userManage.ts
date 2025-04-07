import service from './service'
import { API_URLS } from './config'

// 用户列表接口参数类型
export interface UserListParams {
  page?: number;
  pageSize?: number;
  username?: string;
  nickName?: string;
  phone?: string;
  email?: string;
}

// 用户信息类型 - 更新为匹配后端结构
export interface UserInfo {
  id: number;
  uuid?: string;
  userName: string;  // 与后端字段匹配
  nickName: string;  // 与后端字段匹配
  headerImg: string; // 头像
  authorityId: number; // 角色ID
  authorityIds?: number[]; // 角色ID列表
  authorityNames?: string[]; // 角色名称列表
  phone: string;    // 电话
  email: string;    // 邮箱
  enable: number;   // 是否启用
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}

// 分页响应类型
export interface PageResponse<T> {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
}

// 标准响应类型
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

// 获取用户列表
export function getUserList(params: UserListParams) {
  return service({
    url: API_URLS.getUserList,
    method: 'post', // 根据后端API要求调整
    data: params
  })
}

// 创建用户参数类型
export interface CreateUserParams {
  // 添加后端实际需要的字段
  username: string;
  password: string;
  confirmPassword: string;
  realName?: string;
  mobile?: string;
  email?: string;
  headerImg?: string;
  feiShuUserId?: string;
  description?: string;
  authorityId?: number;
  enable?: number;
  // 保留原有字段以兼容现有代码
  userName?: string;
  passWord?: string;
  nickName?: string;
}

// 创建用户
export function signup(data: CreateUserParams) {
  return service({
    url: API_URLS.signup,
    method: 'post',
    data
  })
}

// 更新用户参数类型
export interface UpdateUserParams {
  // 添加后端实际需要的字段
  user_id?: number;
  username?: string;
  real_name?: string;
  mobile?: string;
  email?: string;
  fei_shu_user_id?: string;
  desc?: string;
  account_type?: number;
  enable?: number;
  header_img?: string;
  // 保留原有字段以兼容现有代码
  id?: number;
  userName?: string;
  nickName?: string;
  headerImg?: string;
  authorityId?: number;
  phone?: string;
}

// 更新用户
export function updateUser(data: UpdateUserParams) {
  return service({
    url: API_URLS.updateUser,
    method: 'post',
    data
  })
}

// 删除用户
export function deleteUser(userId: number) {
  return service({
    url: `${API_URLS.deleteUser}/${userId}`,
    method: 'delete'
  });
}

// 重设密码
export function resetPassword(userId: number) {
  return service({
    url: `${API_URLS.resetPassword}/${userId}`,
    method: 'post'
  });
}

// 禁用用户
export function disableUser(userId: number) {
  return service({
    url: `${API_URLS.disableUser}/${userId}`,
    method: 'post'
  });
}

// 启用用户
export function enableUser(userId: number) {
  return service({
    url: `${API_URLS.enableUser}/${userId}`,
    method: 'post'
  });
}

