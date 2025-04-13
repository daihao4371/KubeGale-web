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
  // 移除name字段，因为后端没有这个字段
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