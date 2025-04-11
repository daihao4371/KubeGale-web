import service from '../service'
import { API_URLS } from '../config'

// 菜单元数据接口
export interface MenuMeta {
  activeName: string
  keepAlive: boolean
  defaultMenu: boolean
  title: string
  icon: string
  closeTab: boolean
}

// 菜单数据接口
export interface MenuData {
  ID: number
  CreatedAt?: string
  UpdatedAt?: string
  parentId: number
  path: string
  name: string
  hidden: boolean
  component: string
  sort: number
  meta: MenuMeta
  authoritys?: any[] | null
  menuBtn?: any[] | null
  children?: MenuData[] | null
  parameters?: any[]
  menuId?: number
}

// 接口返回数据类型
interface ResponseData<T> {
  code: number
  data: T
  msg: string
}

// 菜单列表响应数据
interface MenuListResponse {
  menus: MenuData[]
}

// 获取菜单列表
export const getMenuList = (data?: any) => {
  return service({
    url: API_URLS.getMenuList,
    method: 'post',
    data
  })
}

// 添加创建菜单API
export const createMenu = (data: MenuData) => {
  return service({
    url: '/api/menu/addBaseMenu',
    method: 'post',
    data
  })
}

// 添加更新菜单API
export const updateMenu = (data: MenuData) => {
  return service({
    url: '/api/menu/updateBaseMenu',
    method: 'post',
    data
  })
}

// 添加删除菜单API
export const deleteMenu = (id: number) => {
  return service({
    url: '/api/menu/deleteBaseMenu',
    method: 'post',
    data: { id }
  })
}