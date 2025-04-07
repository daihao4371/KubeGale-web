// API基础配置
export const API_BASE_URL = ''  // 移除基础URL前缀，避免路径重复

// API路径配置
export const API_URLS = {
  // 修改登录接口路径
  login: '/api/base/login',  // 更新为新的登录接口
  // 不再需要logout接口
  changePassword: '/api/user/change_password', // 添加修改密码接口
  
  // 用户管理相关接口
  getUserList: '/api/user/list', // 获取用户列表
  createUser: '/api/user/create', // 添加创建用户接口
  signup: '/api/user/signup', // 添加用户注册接口
  updateUser: '/api/user/profile/update', // 添加更新用户接口
  disableUser: '/api/user', // 禁用用户接口
  enableUser: '/api/user/enable', // 启用用户接口
  deleteUser: '/api/user', // 真正删除用户接口
  
  // 角色管理相关接口
  getRoleList: '/api/roles/list', // 获取角色列表
  createRole: '/api/roles/create', // 创建角色
  updateRole: '/api/roles/update', // 更新角色
  deleteRole: '/api/roles', // 删除角色
  
  // 菜单管理相关接口
  getMenuList: '/api/menus/list', // 获取菜单列表
  createMenu: '/api/menus/create', // 创建菜单
  updateMenu: '/api/menus/update', // 更新菜单
  deleteMenu: '/api/menus', // 删除菜单
  
  // 系统操作记录相关接口
  getSysOperationRecordList: '/api/sysOperationRecord/getSysOperationRecordList', // 获取系统操作记录列表
  findSysOperationRecord: '/api/sysOperationRecord/findSysOperationRecord', // 根据ID获取系统操作记录
  deleteSysOperationRecord: '/api/sysOperationRecord/deleteSysOperationRecord', // 删除系统操作记录
  batchDeleteSysOperationRecord: '/api/sysOperationRecord/deleteSysOperationRecordByIds', // 修改为正确的批量删除接口
  
  // 可以添加更多API路径...
}
