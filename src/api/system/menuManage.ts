import service from './service'
import { API_URLS } from './config'

// 菜单列表参数类型
export interface MenuListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  path?: string;
}

// 菜单元数据类型
export interface MetaField {
  title: string;
  icon?: string;
  keepAlive?: boolean;
  hidden?: boolean;
}

// 菜单信息类型
export interface MenuInfo {
  id: number;
  name: string;
  path: string;
  parent_id: number;
  component: string;
  icon: string;
  sort_order: number;
  route_name: string;
  hidden: number;
  redirect: string;
  meta: MetaField;
  children?: MenuInfo[];
  create_time?: number;
  update_time?: number;
}

// 分页响应类型
export interface PageResponse<T> {
  list: T[];
  total: number;
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

// 获取菜单列表
export function getMenuList(params: MenuListParams) {
  return service({
    url: API_URLS.getMenuList,
    method: 'post',
    data: params
  })
}

// 创建菜单
export function createMenu(data: Omit<MenuInfo, 'id' | 'create_time' | 'update_time'>) {
  return service({
    url: API_URLS.createMenu,
    method: 'post',
    data
  })
}

// 更新菜单
export function updateMenu(data: Partial<MenuInfo> & { id: number }) {
  return service({
    url: API_URLS.updateMenu,
    method: 'post',
    data
  });
}

// 删除菜单
export function deleteMenu(id: number) {
  return service({
    url: `${API_URLS.deleteMenu}/${id}`,
    method: 'delete'
  })
}