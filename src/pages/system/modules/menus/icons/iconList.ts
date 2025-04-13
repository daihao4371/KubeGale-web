// 定义图标项接口
export interface IconItem {
  name: string;
  label: string;
  category?: string; // 可选的分类字段，方便后续按类别展示
}

// 系统管理相关图标
const systemIcons: IconItem[] = [
  { name: 'User', label: '用户管理', category: '系统' },
  { name: 'UserFilled', label: '用户', category: '系统' },
  { name: 'Avatar', label: '头像', category: '系统' },
  { name: 'Menu', label: '菜单管理', category: '系统' },
  { name: 'Setting', label: '系统设置', category: '系统' },
  { name: 'Tools', label: '系统工具', category: '系统' },
  { name: 'Role', label: '角色管理', category: '系统' },
  { name: 'Lock', label: '权限管理', category: '系统' },
  { name: 'Key', label: '密钥管理', category: '系统' },
  { name: 'Operation', label: '操作记录', category: '系统' },
  { name: 'Monitor', label: '系统监控', category: '系统' },
  { name: 'Management', label: '系统管理', category: '系统' },
  { name: 'SetUp', label: '系统配置', category: '系统' },
  { name: 'Switch', label: '系统开关', category: '系统' },
  { name: 'Guide', label: '系统引导', category: '系统' },
  { name: 'Unlock', label: '解锁', category: '系统' },
  { name: 'Notebook', label: '系统日志', category: '系统' },
  { name: 'Document', label: '系统文档', category: '系统' },
  { name: 'Warning', label: '系统告警', category: '系统' },
  { name: 'Bell', label: '系统通知', category: '系统' }
];

// 仪表盘相关图标
const dashboardIcons: IconItem[] = [
  { name: 'Odometer', label: '仪表盘', category: '仪表盘' },
  { name: 'DataBoard', label: '数据面板', category: '仪表盘' },
  { name: 'TrendCharts', label: '趋势图', category: '仪表盘' },
  { name: 'PieChart', label: '饼图', category: '仪表盘' },
  { name: 'DataLine', label: '数据线', category: '仪表盘' },
  { name: 'DataAnalysis', label: '数据分析', category: '仪表盘' },
  { name: 'Histogram', label: '柱状图', category: '仪表盘' },
  { name: 'LineChart', label: '折线图', category: '仪表盘' },
  { name: 'Chart', label: '图表', category: '仪表盘' },
  { name: 'Rank', label: '排行榜', category: '仪表盘' },
  { name: 'Pointer', label: '指针', category: '仪表盘' },
  { name: 'Stopwatch', label: '计时器', category: '仪表盘' },
  { name: 'Clock', label: '时钟', category: '仪表盘' },
  { name: 'Timer', label: '定时器', category: '仪表盘' },
  { name: 'Calendar', label: '日历', category: '仪表盘' }
];

// CMDB云资产配置管理相关图标
const cmdbIcons: IconItem[] = [
  { name: 'Cloud', label: '云管理', category: 'CMDB' },
  { name: 'CloudUpload', label: '云上传', category: 'CMDB' },
  { name: 'CloudDownload', label: '云下载', category: 'CMDB' },
  { name: 'Connection', label: '连接管理', category: 'CMDB' },
  { name: 'Cpu', label: 'CPU资源', category: 'CMDB' },
  { name: 'Coin', label: '成本管理', category: 'CMDB' },
  { name: 'Money', label: '费用管理', category: 'CMDB' },
  { name: 'Wallet', label: '资金管理', category: 'CMDB' },
  { name: 'Opportunity', label: '资源优化', category: 'CMDB' },
  { name: 'Coordinate', label: '资源定位', category: 'CMDB' },
  { name: 'Aim', label: '资源目标', category: 'CMDB' },
  { name: 'List', label: '资源列表', category: 'CMDB' },
  { name: 'Grid', label: '资源网格', category: 'CMDB' },
  { name: 'Table', label: '资源表格', category: 'CMDB' },
  { name: 'Folder', label: '资源目录', category: 'CMDB' },
  { name: 'Files', label: '资源文件', category: 'CMDB' },
  { name: 'Document', label: '资源文档', category: 'CMDB' },
  { name: 'Suitcase', label: '资源包', category: 'CMDB' },
  { name: 'Box', label: '资源盒', category: 'CMDB' },
  { name: 'Collection', label: '资源集合', category: 'CMDB' },
  { name: 'Briefcase', label: '资源管理', category: 'CMDB' },
  { name: 'Tickets', label: '资源工单', category: 'CMDB' }
];

// Kubernetes相关图标
const kubernetesIcons: IconItem[] = [
  { name: 'Platform', label: 'K8s平台', category: 'Kubernetes' },
  { name: 'Ship', label: '容器', category: 'Kubernetes' },
  { name: 'SetUp', label: '部署', category: 'Kubernetes' },
  { name: 'Compass', label: '服务发现', category: 'Kubernetes' },
  { name: 'Link', label: '服务连接', category: 'Kubernetes' },
  { name: 'Position', label: '节点位置', category: 'Kubernetes' },
  { name: 'Operation', label: '集群操作', category: 'Kubernetes' },
  { name: 'Refresh', label: '集群刷新', category: 'Kubernetes' },
  { name: 'Monitor', label: '集群监控', category: 'Kubernetes' },
  { name: 'Cpu', label: '集群资源', category: 'Kubernetes' },
  { name: 'Odometer', label: '集群仪表', category: 'Kubernetes' },
  { name: 'Histogram', label: '集群统计', category: 'Kubernetes' },
  { name: 'DataLine', label: '集群数据', category: 'Kubernetes' },
  { name: 'Connection', label: '集群连接', category: 'Kubernetes' },
  { name: 'Management', label: '集群管理', category: 'Kubernetes' },
  { name: 'Opportunity', label: '集群扩展', category: 'Kubernetes' },
  { name: 'Coordinate', label: '集群拓扑', category: 'Kubernetes' },
  { name: 'Aim', label: '集群目标', category: 'Kubernetes' },
  { name: 'List', label: '集群列表', category: 'Kubernetes' },
  { name: 'Grid', label: '集群网格', category: 'Kubernetes' },
  { name: 'Table', label: '集群表格', category: 'Kubernetes' },
  { name: 'Folder', label: '集群目录', category: 'Kubernetes' },
  { name: 'Files', label: '集群文件', category: 'Kubernetes' },
  { name: 'Document', label: '集群文档', category: 'Kubernetes' }
];

// 监控(Prometheus)相关图标
const monitoringIcons: IconItem[] = [
  { name: 'Alarm', label: '告警', category: '监控' },
  { name: 'Bell', label: '通知', category: '监控' },
  { name: 'Warning', label: '警告', category: '监控' },
  { name: 'Notification', label: '通知管理', category: '监控' },
  { name: 'ChatLineRound', label: '消息', category: '监控' },
  { name: 'Message', label: '短信告警', category: '监控' },
  { name: 'ChatDotRound', label: '聊天告警', category: '监控' },
  { name: 'Phone', label: '电话告警', category: '监控' },
  { name: 'Monitor', label: '监控面板', category: '监控' },
  { name: 'View', label: '监控视图', category: '监控' },
  { name: 'Odometer', label: '监控仪表', category: '监控' },
  { name: 'Histogram', label: '监控统计', category: '监控' },
  { name: 'TrendCharts', label: '监控趋势', category: '监控' },
  { name: 'PieChart', label: '监控分布', category: '监控' },
  { name: 'DataLine', label: '监控数据', category: '监控' },
  { name: 'DataAnalysis', label: '监控分析', category: '监控' },
  { name: 'Cpu', label: '资源监控', category: '监控' },
  { name: 'Stopwatch', label: '性能监控', category: '监控' },
  { name: 'Timer', label: '定时监控', category: '监控' },
  { name: 'Clock', label: '时间监控', category: '监控' }
];

// CICD相关图标
const cicdIcons: IconItem[] = [
  { name: 'Promotion', label: 'CICD', category: 'CICD' },
  { name: 'SetUp', label: '部署管理', category: 'CICD' },
  { name: 'Connection', label: '流水线', category: 'CICD' },
  { name: 'Refresh', label: '构建刷新', category: 'CICD' },
  { name: 'Operation', label: '构建操作', category: 'CICD' },
  { name: 'Plus', label: '新增构建', category: 'CICD' },
  { name: 'Edit', label: '编辑构建', category: 'CICD' },
  { name: 'Delete', label: '删除构建', category: 'CICD' },
  { name: 'Search', label: '搜索构建', category: 'CICD' },
  { name: 'View', label: '查看构建', category: 'CICD' },
  { name: 'More', label: '更多操作', category: 'CICD' },
  { name: 'Document', label: '构建文档', category: 'CICD' },
  { name: 'Notebook', label: '构建日志', category: 'CICD' },
  { name: 'Terminal', label: '构建终端', category: 'CICD' },
  { name: 'Monitor', label: '构建监控', category: 'CICD' },
  { name: 'Histogram', label: '构建统计', category: 'CICD' },
  { name: 'TrendCharts', label: '构建趋势', category: 'CICD' },
  { name: 'DataLine', label: '构建数据', category: 'CICD' },
  { name: 'DataAnalysis', label: '构建分析', category: 'CICD' },
  { name: 'Timer', label: '定时构建', category: 'CICD' },
  { name: 'Calendar', label: '构建计划', category: 'CICD' }
];

// 常用操作图标
const actionIcons: IconItem[] = [
  { name: 'Refresh', label: '刷新', category: '操作' },
  { name: 'Plus', label: '添加', category: '操作' },
  { name: 'Edit', label: '编辑', category: '操作' },
  { name: 'Delete', label: '删除', category: '操作' },
  { name: 'Search', label: '搜索', category: '操作' },
  { name: 'View', label: '查看', category: '操作' },
  { name: 'More', label: '更多', category: '操作' },
  { name: 'Upload', label: '上传', category: '操作' },
  { name: 'Download', label: '下载', category: '操作' },
  { name: 'Top', label: '置顶', category: '操作' },
  { name: 'Bottom', label: '置底', category: '操作' },
  { name: 'Back', label: '返回', category: '操作' },
  { name: 'Right', label: '前进', category: '操作' },
  { name: 'Sort', label: '排序', category: '操作' },
  { name: 'Filter', label: '筛选', category: '操作' },
  { name: 'Select', label: '选择', category: '操作' },
  { name: 'Switch', label: '切换', category: '操作' },
  { name: 'Operation', label: '操作', category: '操作' },
  { name: 'Finished', label: '完成', category: '操作' },
  { name: 'Check', label: '检查', category: '操作' }
];

// 导航相关图标
const navigationIcons: IconItem[] = [
  { name: 'HomeFilled', label: '首页', category: '导航' },
  { name: 'Compass', label: '导航', category: '导航' },
  { name: 'Menu', label: '菜单', category: '导航' },
  { name: 'Link', label: '链接', category: '导航' },
  { name: 'Position', label: '位置', category: '导航' },
  { name: 'Location', label: '定位', category: '导航' },
  { name: 'LocationInformation', label: '位置信息', category: '导航' },
  { name: 'Guide', label: '引导', category: '导航' },
  { name: 'Back', label: '返回', category: '导航' },
  { name: 'Right', label: '前进', category: '导航' },
  { name: 'Top', label: '顶部', category: '导航' },
  { name: 'Bottom', label: '底部', category: '导航' }
];

// 合并所有图标列表
export const allIcons: IconItem[] = [
  ...systemIcons,
  ...dashboardIcons,
  ...cmdbIcons,
  ...kubernetesIcons,
  ...monitoringIcons,
  ...cicdIcons,
  ...actionIcons,
  ...navigationIcons
];

// 添加索引签名的接口
interface IconCategoryMap {
  [key: string]: IconItem[];
  系统: IconItem[];
  仪表盘: IconItem[];
  CMDB: IconItem[];
  Kubernetes: IconItem[];
  监控: IconItem[];
  CICD: IconItem[];
  操作: IconItem[];
  导航: IconItem[];
}

// 按类别分组的图标
export const iconsByCategory: IconCategoryMap = {
  系统: systemIcons,
  仪表盘: dashboardIcons,
  CMDB: cmdbIcons,
  Kubernetes: kubernetesIcons,
  监控: monitoringIcons,
  CICD: cicdIcons,
  操作: actionIcons,
  导航: navigationIcons
};

// 导出默认图标列表（兼容现有代码）
export default allIcons;