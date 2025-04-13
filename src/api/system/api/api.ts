import service from '../service'
import { API_URLS } from '../config'

// API数据类型定义
export interface ApiInfo {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  path: string;
  description: string;
  apiGroup: string;
  method: string;
  name: string; // 添加name字段
}

// API响应数据类型
export interface ApiResponse {
  code: number;
  data: {
    apis: ApiInfo[];
  };
  msg: string;
}

// 分页响应类型
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 分页请求参数类型
export interface PageParams {
  page: number;
  pageSize: number;
  [key: string]: any;
}

// 获取所有API
export function getAllApis() {
  return service({
    url: API_URLS.getAllApis,
    method: 'post'
  })
}

// 获取API列表（分页）
export function getApiList(params: PageParams) {
  return service({
    url: API_URLS.getApiList,
    method: 'post',
    data: params
  })
}

// 创建API
export function createApi(data: Partial<ApiInfo>) {
  return service({
    url: API_URLS.createApi,
    method: 'post',
    data
  })
}

// 更新API
export function updateApi(data: Partial<ApiInfo>) {
  return service({
    url: API_URLS.updateApi,
    method: 'post',
    data
  })
}

// 删除API
export function deleteApi(id: number) {
  return service({
    url: API_URLS.deleteApi,
    method: 'post',
    data: { ID: id }
  })
}

// 批量删除API
export function deleteApisByIds(ids: number[]) {
  return service({
    url: API_URLS.deleteApisByIds,
    method: 'delete',
    data: { ids }
  })
}

// 获取API分组列表
// 添加新的接口类型定义，用于API分组响应
// 修改API分组响应接口定义，匹配实际返回的数据结构
export interface ApiGroupResponse {
  code: number;
  data: {
    apiGroupMap: Record<string, string>; // API分组映射表
    groups: string[]; // API分组列表
  };
  msg: string;
}

// API详情响应类型
export interface ApiDetailResponse {
  code: number;
  data: {
    api: ApiInfo;
  };
  msg: string;
}

// 确保getApiGroups函数返回类型正确
export function getApiGroups() {
  return service<ApiGroupResponse>({
    url: API_URLS.getApiGroups,
    method: 'get'
  })
}

// 获取API详情
export function getApiById(id: number) {
  return service<ApiDetailResponse>({
    url: API_URLS.getApiById,
    method: 'post',
    data: { id }
  })
}

// 刷新Casbin缓存
export function refreshCasbin() {
  return service({
    url: API_URLS.refreshCasbin,
    method: 'get'
  })
}
