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

// 获取角色列表
export const getAuthorityList = () => {
  return service.post<ResponseData<AuthorityData[]>>(
    API_URLS.getAuthorityList
  ).then(res => res.data)
}