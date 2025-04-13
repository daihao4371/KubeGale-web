import service from '../service'
import { API_URLS } from '../config'

// 角色列表接口返回类型
// 角色数据接口定义
// 修改 AuthorityData 接口，使其与实际数据结构匹配
// 确保 AuthorityData 接口包含所有必要的字段
export interface AuthorityData {
  authorityId: number
  authorityName: string
  parentId: number
  dataAuthorityId?: AuthorityData[]
  children?: AuthorityData[]
  defaultRouter?: string
  CreatedAt?: string
  UpdatedAt?: string
  DeletedAt?: string | null
  menus?: any[]
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

// 设置数据权限请求参数接口
export interface SetDataAuthorityParams {
  authorityId: number;
  dataAuthorityId: { authorityId: number }[]; // 使用对象数组格式
}

// 设置数据权限
export const setDataAuthority = (data: SetDataAuthorityParams) => {
  return service.post<ResponseData<AuthorityData>>(
    API_URLS.setDataAuthority,
    data
  ).then(res => res.data)
}

// 添加或修改菜单权限的接口参数定义
export interface AddMenuAuthorityParams {
  authorityId: number;
  menus: {
    ID: number | string;
    path: string;  // 确保path是必需的
    name: string;
    meta: {
      title: string;
    };
  }[];
}

// 修改相应的API函数
export const addMenuAuthority = (params: AddMenuAuthorityParams) => {
  return service.post<ResponseData<any>>(API_URLS.addBaseMenu, params);
};
