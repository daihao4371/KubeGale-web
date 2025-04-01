// API基础配置
export const API_BASE_URL = ''  // 移除基础URL前缀，避免路径重复

// API路径配置
export const API_URLS = {
  login: '/api/user/login',  // 移除末尾的斜杠，避免潜在问题
  logout: '/api/user/logout', // 添加退出登录接口
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
  
  // 可以添加更多API路径...
}