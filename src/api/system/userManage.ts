import service from './service'
import { API_URLS } from './config'

// 用户列表接口参数类型
export interface UserListParams {
  page?: number;
  pageSize?: number;
  username?: string;
  realName?: string;
  mobile?: string;
}

// 用户信息类型
export interface UserInfo {
  id: number;
  username: string;
  realName: string;
  mobile: string;
  feiShuUserId: string;
  accountType: number;
  enable: number;
  created_at: string;
  updated_at: string;
  roles: any[];
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
    method: 'get',
    params
  })
}