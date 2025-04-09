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

// 用户信息类型 - 更新为匹配后端结构体
export interface UserInfo {
  id: number;
  uuid: string;
  userName: string;  // 对应后端的 Username
  nickName: string;  // 对应后端的 NickName
  headerImg: string; // 对应后端的 HeaderImg
  authorityId: number; // 对应后端的 AuthorityId
  authority: {
    authorityId: number;
    authorityName: string;
  };
  authorities: Array<{
    authorityId: number;
    authorityName: string;
  }>;
  phone: string;    // 对应后端的 Phone
  email: string;    // 对应后端的 Email
  enable: number;   // 对应后端的 Enable
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
  ID: number;  // 修改为大写的 ID，匹配后端
  authorityIds: number[];  // 修改为 authorityIds 数组
}

// 设置用户角色
export function setUserAuthorities(data: SetUserAuthoritiesParams) {
  console.log('调用设置用户角色API:', API_URLS.setUserAuthorities, data)
  return service({
    url: API_URLS.setUserAuthorities,
    method: 'post',
    data
  })
}