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

// 用户信息类型
export interface UserInfo {
  id: number;
  userName: string;
  nickName?: string;
  headerImg?: string;
  phone?: string;
  email?: string;
  enable: number;  // 确保包含 enable 属性
  authorityId?: number;
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
  console.log('调用获取用户列表API:', API_URLS.getUserList, params)
  return service({
    url: API_URLS.getUserList,
    method: 'post',  // 修改为 POST 方法
    data: params     // 使用 data 而不是 params，因为是 POST 请求
  })
}

// 获取用户信息
export function getUserInfo(id?: number) {
  console.log('调用获取用户信息API:', API_URLS.getUserInfo, id ? { id } : {})
  return service({
    url: API_URLS.getUserInfo,
    method: 'get',
    params: id ? { id } : {} // 如果提供了ID，则作为参数传递
  })
}

// 注册用户接口参数类型
export interface RegisterUserParams {
  userName: string;
  password: string;
  nickName?: string;
  phone?: string;
  email?: string;
  authorityId: number;
  enable: number;
}

// 注册用户
export function registerUser(data: RegisterUserParams) {
  // 确保 authorityId 是数字类型
  const postData = {
    ...data,
    authorityId: Number(data.authorityId)
  };
  
  console.log('调用注册用户API:', API_URLS.adminRegister, postData)
  return service({
    url: API_URLS.adminRegister,
    method: 'post',
    data: postData
  })
}

// 设置用户角色参数类型
export interface SetUserAuthoritiesParams {
  ID: number;  // 用户ID
  authorityIds: number[];  // 角色ID数组 - 支持多个角色
  enable?: number;  // 可选的状态参数
}

// 设置用户角色
export function setUserAuthorities(data: SetUserAuthoritiesParams) {
  // 确保 authorityIds 是数字数组
  const postData = {
    ...data,
    authorityIds: Array.isArray(data.authorityIds) 
      ? data.authorityIds.map(id => Number(id)) 
      : [Number(data.authorityIds)]
  };
  
  console.log('调用设置用户角色API:', API_URLS.setUserAuthorities, postData)
  return service({
    url: API_URLS.setUserAuthorities,
    method: 'post',
    data: postData
  })
}

// 更新用户信息参数类型
export interface ChangeUserInfoParams {
  ID: number;
  nickName?: string;
  phone?: string;
  authorityIds?: number[];
  email?: string;
  headerImg?: string;
  sideMode?: string;
  enable?: number;
}

// 更新用户信息
export function setUserInfo(data: ChangeUserInfoParams) {
  console.log('调用更新用户信息API:', API_URLS.setUserInfo, data)
  return service({
    url: API_URLS.setUserInfo,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id: number) {
  console.log('调用删除用户API:', API_URLS.deleteUser, id)
  return service({
    url: API_URLS.deleteUser,
    method: 'delete',
    data: { id }
  })
}

// 更新个人信息参数类型
export interface SetSelfInfoParams {
  ID: number;
  userName?: string;
  nickName?: string;
  phone?: string;
  authorityIds?: number[];
  email?: string;
  headerImg?: string;
  sideMode?: string;
  enable?: number;
}

// 更新个人信息
export function setSelfInfo(data: SetSelfInfoParams) {
  console.log('调用更新个人信息API:', API_URLS.setSelfInfo, data)
  return service({
    url: API_URLS.setSelfInfo,
    method: 'put',
    data
  })
}

// 重置用户密码
export const resetUserPassword = (data: { ID: number }) => {
  return service({
    url: API_URLS.resetPassword,
    method: 'post',
    data
  })
}