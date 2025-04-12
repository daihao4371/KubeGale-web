// 修改导入路径，使用正确的service路径
import service from '../../system/service'
import { API_URLS } from '../config'

// 用户信息类型
export interface User {
  id: number;
  username: string;
  realName?: string;  // 修改为 realName 以匹配后端字段
  nickname?: string;  // 添加昵称字段
}

// 系统操作记录类型 - 更新以匹配后端结构
export interface SysOperationRecord {
  id: number;  // 前端使用小写，但会映射到后端的ID
  created_at: string;
  updated_at: string;
  ip: string;
  method: string;
  path: string;
  status: number;
  latency: string | number; // 后端是time.Duration，前端接收为字符串或数字
  agent: string;
  error_message: string;
  body: string;
  resp: string;
  user_id: number; // 注意这里是user_id而不是UserID
  user: User;
  // 添加新字段
  operator_name?: string;    // 操作人用户名
  operator_real_name?: string; // 操作人真实姓名
  // 添加后端返回的大写字段，用于映射
  ID?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
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

// 查询单条操作记录详情
export function findSysOperationRecord(id: number) {
  return service({
    url: `${API_URLS.findSysOperationRecord}/${id}`,
    method: 'get'
  })
}

// 删除单条操作记录
export function deleteSysOperationRecord(data: { ID: number }) {
  return service({
    url: API_URLS.deleteSysOperationRecord,
    method: 'delete',
    data
  })
}

// 批量删除操作记录
export function batchDeleteSysOperationRecord(data: { IDs: number[] }) {
  return service({
    url: API_URLS.deleteSysOperationRecordByIds,
    method: 'delete',
    data
  })
}

