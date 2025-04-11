import service from '../service'
import { API_URLS } from '../config'

// 角色列表接口返回类型
export interface AuthorityData {
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: null | string
  authorityId: number
  authorityName: string
  parentId: number
  dataAuthorityId: AuthorityData[] | null
  children: AuthorityData[] | null
  menus: any | null
  defaultRouter: string
}

// 接口返回数据类型
export interface ResponseData<T> {
  code: number
  data: T
  msg: string
}

// 创建角色请求参数接口
export interface CreateAuthorityParams {
  authorityId: number;
  authorityName: string;
  parentId: number;
}

// 更新角色请求参数接口
export interface UpdateAuthorityParams {
  authorityId: number;
  authorityName: string;
  parentId: number;
}

// 获取角色列表
export const getAuthorityList = () => {
  return service.post<ResponseData<AuthorityData[]>>(
    API_URLS.getAuthorityList
  ).then(res => res.data)
}

// 创建角色
export const createAuthority = (data: CreateAuthorityParams) => {
  return service.post<ResponseData<AuthorityData>>(
    API_URLS.createAuthority,
    data
  ).then(res => res.data)
}

// 更新角色
export const updateAuthority = (data: UpdateAuthorityParams) => {
  return service.put<ResponseData<AuthorityData>>(
    API_URLS.updateAuthority,
    data
  ).then(res => res.data)
}

// 删除角色
export const deleteAuthority = (authorityId: number) => {
  return service.post<ResponseData<AuthorityData>>(
    API_URLS.deleteAuthority,
    { authorityId }
  ).then(res => res.data)
}

// 拷贝角色请求参数接口
export interface CopyAuthorityParams {
  authority: {
    authorityId: number;
    authorityName: string;
    parentId: number;
    defaultRouter: string;
  };
  oldAuthorityId: number; // 原角色ID
}

// 拷贝角色
export const copyAuthority = (data: CopyAuthorityParams) => {
  return service.post<ResponseData<AuthorityData>>(
    API_URLS.copyAuthority,
    data
  ).then(res => res.data)
}