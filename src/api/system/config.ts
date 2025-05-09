// API基础配置
export const API_BASE_URL = ''  // 移除基础URL前缀，避免路径重复

// API路径配置
export const API_URLS = {
  // 用户相关
  login: '/api/base/login',
  logout: '/api/jwt/jsonInBlacklist', // JWT加入黑名单（退出登录）
  
  getUserList: '/api/user/getUserList', // 获取用户列表
  getUserInfo: '/api/user/getUserInfo', // 获取用户信息
  changePassword: '/api/user/changePassword', // 用户修改密码
  adminRegister: '/api/user/admin_register', //  管理员注册账号
  setUserAuthorities: '/api/user/setUserAuthorities', // 设置用户角色的API
  setUserInfo: '/api/user/setUserInfo', // 添加设置用户信息的API
  setSelfInfo: '/api/user/setSelfInfo', // 添加设置个人信息的API
  deleteUser: '/api/user/deleteUser', // 添加删除用户的API
  resetPassword: '/api/user/resetPassword', // 添加重置密码的API
  
  // 角色相关
  getAuthorityList: '/api/authority/getAuthorityList', // 获取角色列表
  createAuthority: '/api/authority/createAuthority', // 创建角色
  updateAuthority: '/api/authority/updateAuthority', // 更新角色
  deleteAuthority: '/api/authority/deleteAuthority', // 删除角色
  copyAuthority: '/api/authority/copyAuthority', // 拷贝角色
  setDataAuthority: '/api/authority/setDataAuthority', // 设置数据权限

  // API管理相关
  getApiList: '/api/api/getApiList', // 获取API列表
  getAllApis: '/api/api/getAllApis', // 获取所有API
  createApi: '/api/api/createApi', // 创建API
  updateApi: '/api/api/updateApi', // 更新API
  deleteApi: '/api/api/deleteApi', // 删除API
  deleteApisByIds: '/api/api/deleteApisByIds', // 批量删除API
  getApiGroups: '/api/api/getApiGroups', // 获取API分组列表
  getApiById: '/api/api/getApiById', // 获取API详情
  refreshCasbin: '/api/api/freshCasbin', // 添加刷新缓存的URL
  
  // 权限相关
  getBaseMenuTree: '/api/menu/getBaseMenuTree', // 获取菜单树
  getMenuAuthority: '/api/menu/getMenuAuthority', // 获取指定角色menu
  getPolicyPathByAuthorityId: '/api/casbin/getPolicyPathByAuthorityId', // 获取角色API权限路径
  addBaseMenu: '/api/menu/addBaseMenu', // 添加菜单
  updateCasbin: '/api/casbin/updateCasbin', // 更新Casbin策略
  
  // 菜单相关
  getMenuList: '/api/menu/getMenuList', // 获取菜单列表
  updateBaseMenu: '/api/menu/updateBaseMenu', // 更新菜单
  deleteBaseMenu: '/api/menu/deleteBaseMenu', // 删除菜单
  
  // 操作记录相关
  getSysOperationRecordList: '/api/sysOperationRecord/getSysOperationRecordList', // 获取操作记录列表
  deleteSysOperationRecord: '/api/sysOperationRecord/deleteSysOperationRecord', // 删除一条操作记录
  deleteSysOperationRecordByIds: '/api/sysOperationRecord/deleteSysOperationRecordByIds', // 删除多条操作记录
  findSysOperationRecord: '/api/sysOperationRecord/findSysOperationRecord', // 通过ID查询操作记录
}
