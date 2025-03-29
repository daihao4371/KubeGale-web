// API基础配置
export const API_BASE_URL = ''  // 移除基础URL前缀，避免路径重复

// API路径配置
export const API_URLS = {
  login: '/api/user/login',  // 移除末尾的斜杠，避免潜在问题
  logout: '/api/user/logout', // 添加退出登录接口
  // 可以添加更多API路径...
}