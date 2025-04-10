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
  
  // 临时添加以解决编译错误，后续可移除
  getSysOperationRecordList: '/api/sysOperationRecord/getSysOperationRecordList',
  deleteSysOperationRecord: '/api/sysOperationRecord/deleteSysOperationRecord',
  batchDeleteSysOperationRecord: '/api/sysOperationRecord/batchDeleteSysOperationRecord',
  findSysOperationRecord: '/api/sysOperationRecord/findSysOperationRecord',
}
