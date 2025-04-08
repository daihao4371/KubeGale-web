// API基础配置
export const API_BASE_URL = ''  // 移除基础URL前缀，避免路径重复

// API路径配置
export const API_URLS = {
  // 用户相关
  login: '/api/base/login',
  logout: '/api/user/logout',

  getUserList: '/api/user/getUserList',
  getUserInfo: '/api/user/getUserInfo', // 添加获取用户信息的接口
  
  // 临时添加以解决编译错误，后续可移除
  getSysOperationRecordList: '/api/sysOperationRecord/getSysOperationRecordList',
  deleteSysOperationRecord: '/api/sysOperationRecord/deleteSysOperationRecord',
  batchDeleteSysOperationRecord: '/api/sysOperationRecord/batchDeleteSysOperationRecord',
  findSysOperationRecord: '/api/sysOperationRecord/findSysOperationRecord',
}
