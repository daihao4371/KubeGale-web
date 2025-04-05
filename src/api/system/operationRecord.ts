import service from './service'
import { API_URLS } from './config'

// 用户信息类型
export interface User {
  id: number;
  username: string;
  realName?: string;  // 修改为 realName 以匹配后端字段
  nickname?: string;  // 添加昵称字段
}

// 系统操作记录类型 - 更新以匹配后端结构
export interface SysOperationRecord {
  id: number;
  created_at: string;
  updated_at: string;
  ip: string;
  method: string;
  path: string;
  status: number;
  latency: string; // 后端是time.Duration，前端接收为字符串
  agent: string;
  error_message: string;
  body: string;
  resp: string;
  user_id: number; // 注意这里是user_id而不是UserID
  user: User;
  // 添加新字段
  operator_name?: string;    // 操作人用户名
  operator_real_name?: string; // 操作人真实姓名
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

// 分页响应类型
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 系统操作记录参数类型
export interface OperationRecordParams {
  page?: number;
  pageSize?: number;
  path?: string;
  method?: string;
  status?: number;
  ip?: string;
  userId?: number;
  startTime?: string;
  endTime?: string;
}

// 获取系统操作记录列表 - 修改为GET请求
export function getSysOperationRecordList(params: OperationRecordParams) {
  return service({
    url: API_URLS.getSysOperationRecordList,
    method: 'get',
    params: params  // 使用params而不是data，因为是GET请求
  })
}

// 删除系统操作记录
export function deleteSysOperationRecord(id: number) {
  return service({
    url: API_URLS.deleteSysOperationRecord,
    method: 'delete',
    data: { id } // 通过请求体传递ID
  })
}

// 批量删除系统操作记录
export function batchDeleteSysOperationRecord(ids: number[]) {
  return service({
    url: API_URLS.batchDeleteSysOperationRecord,
    method: 'delete',
    data: { ids } // 通过请求体传递ID数组
  })
}

// 根据ID获取系统操作记录
export function findSysOperationRecord(id: number) {
  return service({
    url: `${API_URLS.findSysOperationRecord}/${id}`,
    method: 'get'
  })
}