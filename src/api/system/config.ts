// API基础配置
export const API_BASE_URL = ''  // 移除基础URL前缀，避免路径重复

// API路径配置
export const API_URLS = {
  // 用户相关
  login: '/api/base/login',
  
  getUserList: '/api/user/getUserList',
  getUserInfo: '/api/user/getUserInfo',
  changePassword: '/api/user/changePassword',
  adminRegister: '/api/user/admin_register',
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

  // 暂时没有使用
  getMenuAuthority: '/api/menu/getMenuAuthority', // 获取菜单权限
  getApiAuthority: '/api/api/getApiAuthority', // 获取API权限
  addMenuAuthority: '/api/menu/addMenuAuthority', // 添加菜单权限
  addApiAuthority: '/api/api/addApiAuthority', // 添加API权限
  
  // 菜单相关
  getMenuList: '/api/menu/getMenuList', // 获取菜单列表
  // 移除了创建菜单、更新菜单和删除菜单的API路径
  
  // 临时添加以解决编译错误，后续可移除
  getSysOperationRecordList: '/api/sysOperationRecord/getSysOperationRecordList',
  deleteSysOperationRecord: '/api/sysOperationRecord/deleteSysOperationRecord',
  batchDeleteSysOperationRecord: '/api/sysOperationRecord/batchDeleteSysOperationRecord',
  findSysOperationRecord: '/api/sysOperationRecord/findSysOperationRecord',
}
