<template>
  <div class="menus-container">
    <div class="menus-header">
      <h2>菜单管理</h2>
      <div class="operation-bar">
        <!-- 搜索区域 -->
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="菜单名称">
            <el-input v-model="searchForm.name" placeholder="请输入菜单名称" clearable />
          </el-form-item>
          <el-form-item label="菜单路径">
            <el-input v-model="searchForm.path" placeholder="请输入菜单路径" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 操作按钮 -->
        <div class="button-group">
          <el-button type="primary" @click="handleAdd">添加菜单</el-button>
        </div>
      </div>
    </div>
    
    <!-- 菜单列表 -->
    <el-table
      v-loading="loading"
      :data="menuList"
      border
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      style="width: 100%"
    >
      <el-table-column prop="id" label="菜单ID" width="80" />
      <el-table-column prop="name" label="菜单名称" width="150" />
      <el-table-column prop="path" label="菜单路径" min-width="150" />
      <el-table-column prop="component" label="组件路径" min-width="150" />
      <el-table-column prop="icon" label="图标" width="100">
        <template #default="scope">
          <el-icon v-if="scope.row.icon">
            <component :is="scope.row.icon" />
          </el-icon>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column prop="hidden" label="是否隐藏" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.hidden === 0 ? 'success' : 'info'">
            {{ scope.row.hidden === 0 ? '显示' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="180">
        <template #default="scope">
          {{ scope.row.create_time ? formatDate(scope.row.create_time) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 菜单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="上级菜单" prop="parent_id">
          <el-select v-model="form.parent_id" placeholder="请选择上级菜单">
            <el-option label="顶级菜单" :value="0" />
            <el-option 
              v-for="item in parentMenuOptions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        
        <el-form-item label="菜单路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入菜单路径" />
        </el-form-item>
        
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="form.component" placeholder="请输入组件路径" />
        </el-form-item>
        
        <el-form-item label="图标" prop="icon">
          <div class="icon-selector">
            <el-input v-model="form.icon" placeholder="请输入图标名称">
              <template #append>
                <el-popover
                  placement="bottom"
                  :width="400"
                  trigger="click"
                >
                  <template #reference>
                    <el-button>选择图标</el-button>
                  </template>
                  <div class="icon-list">
                    <div 
                      v-for="icon in iconList" 
                      :key="icon" 
                      class="icon-item"
                      @click="selectIcon(icon)"
                    >
                      <el-icon>
                        <component :is="icon" />
                      </el-icon>
                      <span class="icon-name">{{ icon }}</span>
                    </div>
                  </div>
                </el-popover>
              </template>
            </el-input>
            <div class="icon-preview" v-if="form.icon">
              <el-icon>
                <component :is="form.icon" />
              </el-icon>
              <span>预览</span>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        
        <el-form-item label="路由名称" prop="route_name">
          <el-input v-model="form.route_name" placeholder="请输入路由名称" />
        </el-form-item>
        
        <el-form-item label="是否隐藏" prop="hidden">
          <el-radio-group v-model="form.hidden">
            <el-radio :label="0">显示</el-radio>
            <el-radio :label="1">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="重定向路径" prop="redirect">
          <el-input v-model="form.redirect" placeholder="请输入重定向路径" />
        </el-form-item>
        
        <el-form-item label="菜单标题" prop="meta.title">
          <el-input v-model="form.meta.title" placeholder="请输入菜单标题" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义菜单元数据类型
interface MetaField {
  title: string;
  icon?: string;
  keepAlive?: boolean;
  hidden?: boolean;
}

// 定义菜单信息类型
interface MenuInfo {
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

// 搜索表单
const searchForm = reactive({
  name: '',
  path: ''
})

// 菜单列表数据
const menuList = ref<MenuInfo[]>([])
const loading = ref(false)

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentMenu = ref<MenuInfo | null>(null)

// 表单数据
const form = reactive({
  id: 0,
  name: '',
  path: '',
  parent_id: 0,
  component: '',
  icon: '',
  sort_order: 0,
  route_name: '',
  hidden: 0,
  redirect: '',
  meta: {
    title: '',
    icon: '',
    keepAlive: false,
    hidden: false
  } as MetaField
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入菜单路径', trigger: 'blur' }
  ],
  parent_id: [
    { required: true, message: '请选择上级菜单', trigger: 'change' }
  ],
  sort_order: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ],
  'meta.title': [
    { required: true, message: '请输入菜单标题', trigger: 'blur' }
  ]
}

// 表单引用
const formRef = ref()

// 父级菜单选项
const parentMenuOptions = ref<MenuInfo[]>([])

// Element Plus 常用图标列表
const iconList = [
  'Edit', 'Share', 'Delete', 'Search', 'Setting', 'User', 
  'Menu', 'Message', 'Star', 'Location', 'Document', 
  'Odometer', 'Files', 'Key', 'Lock', 'Folder', 'Calendar', 
  'Bell', 'Link', 'House', 'Picture', 'ChatDotRound', 
  'Notification', 'Monitor', 'Goods', 'Tickets', 'OfficeBuilding',
  'School', 'Shop', 'Briefcase', 'Platform', 'Promotion', 'TrendCharts'
]

// 选择图标
const selectIcon = (icon: string) => {
  form.icon = icon
  form.meta.icon = icon
}

// 模拟数据
const mockMenus: MenuInfo[] = [
  {
    id: 1,
    name: 'Dashboard',
    path: '/dashboard',
    parent_id: 0,
    component: 'pages/dashboard/index',
    icon: 'Odometer',
    sort_order: 1,
    route_name: 'Dashboard',
    hidden: 0,
    redirect: '',
    meta: {
      title: '仪表盘',
      icon: 'Odometer',
      keepAlive: true
    },
    create_time: Date.now() / 1000 - 86400 * 7,
    update_time: Date.now() / 1000 - 86400 * 3
  },
  {
    id: 2,
    name: 'System',
    path: '/system',
    parent_id: 0,
    component: 'layouts/MainLayout',
    icon: 'Setting',
    sort_order: 2,
    route_name: 'System',
    hidden: 0,
    redirect: '/system/users',
    meta: {
      title: '系统管理',
      icon: 'Setting'
    },
    create_time: Date.now() / 1000 - 86400 * 6,
    update_time: Date.now() / 1000 - 86400 * 2,
    children: [
      {
        id: 3,
        name: 'Users',
        path: '/system/users',
        parent_id: 2,
        component: 'pages/system/users',
        icon: 'User',
        sort_order: 1,
        route_name: 'Users',
        hidden: 0,
        redirect: '',
        meta: {
          title: '用户管理',
          icon: 'User'
        },
        create_time: Date.now() / 1000 - 86400 * 5,
        update_time: Date.now() / 1000 - 86400 * 1
      },
      {
        id: 4,
        name: 'Roles',
        path: '/system/roles',
        parent_id: 2,
        component: 'pages/system/roles',
        icon: 'Key',
        sort_order: 2,
        route_name: 'Roles',
        hidden: 0,
        redirect: '',
        meta: {
          title: '角色管理',
          icon: 'Key'
        },
        create_time: Date.now() / 1000 - 86400 * 4,
        update_time: Date.now() / 1000
      }
    ]
  },
  {
    id: 5,
    name: 'CMDB',
    path: '/cmdb',
    parent_id: 0,
    component: 'pages/cmdb/index',
    icon: 'Files',
    sort_order: 3,
    route_name: 'CMDB',
    hidden: 0,
    redirect: '',
    meta: {
      title: 'CMDB配置管理',
      icon: 'Files'
    },
    create_time: Date.now() / 1000 - 86400 * 2,
    update_time: Date.now() / 1000
  }
]

// 获取菜单列表
const fetchMenuList = async () => {
  loading.value = true
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 使用模拟数据
    menuList.value = JSON.parse(JSON.stringify(mockMenus))
    console.log('菜单列表数据:', menuList.value)
    
    // 更新父级菜单选项
    updateParentMenuOptions()
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    ElMessage.error('获取菜单列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 更新父级菜单选项
const updateParentMenuOptions = () => {
  // 提取顶级菜单和一级菜单作为父级菜单选项
  const options: MenuInfo[] = []
  
  // 添加顶级菜单
  menuList.value.forEach(menu => {
    options.push({
      id: menu.id,
      name: menu.name,
      path: menu.path,
      parent_id: menu.parent_id,
      component: menu.component,
      icon: menu.icon,
      sort_order: menu.sort_order,
      route_name: menu.route_name,
      hidden: menu.hidden,
      redirect: menu.redirect,
      meta: menu.meta
    })
  })
  
  parentMenuOptions.value = options
}

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000) // 转换为毫秒
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 搜索
const handleSearch = () => {
  fetchMenuList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.path = ''
  fetchMenuList()
}

// 添加菜单
const handleAdd = () => {
  isEdit.value = false
  // 重置表单
  form.id = 0
  form.name = ''
  form.path = ''
  form.parent_id = 0
  form.component = ''
  form.icon = ''
  form.sort_order = 0
  form.route_name = ''
  form.hidden = 0
  form.redirect = ''
  form.meta = {
    title: '',
    icon: '',
    keepAlive: false,
    hidden: false
  }
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = (row: MenuInfo) => {
  isEdit.value = true
  // 填充表单
  form.id = row.id
  form.name = row.name
  form.path = row.path
  form.parent_id = row.parent_id
  form.component = row.component
  form.icon = row.icon
  form.sort_order = row.sort_order
  form.route_name = row.route_name
  form.hidden = row.hidden
  form.redirect = row.redirect
  form.meta = { ...row.meta }
  
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      console.log('表单数据:', form)
      dialogVisible.value = false
      ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
      fetchMenuList()
    }
  })
}

// 删除菜单
const handleDelete = (row: MenuInfo) => {
  ElMessageBox.confirm(`确定要删除菜单 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('删除菜单:', row)
    ElMessage.success('删除成功')
    fetchMenuList()
  }).catch(() => {
    // 取消删除
  })
}

// 组件挂载时加载数据
onMounted(() => {
  fetchMenuList()
})
</script>

<style lang="scss" scoped>
.menus-container {
  padding: 20px;
  
  .menus-header {
    margin-bottom: 20px;
    
    h2 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 20px;
      font-weight: 500;
    }
    
    /* 添加仓库信息样式 */
    .repository-info {
      margin-bottom: 16px;
      
      .el-tag {
        font-size: 14px;
      }
    }
    
    .operation-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      
      .search-form {
        margin-bottom: 10px;
      }
      
      .button-group {
        margin-bottom: 10px;
      }
    }
  }
  
  .icon-selector {
    display: flex;
    align-items: center;
    
    .icon-preview {
      margin-left: 10px;
      display: flex;
      align-items: center;
      
      .el-icon {
        font-size: 20px;
        margin-right: 5px;
      }
    }
  }
  
  .icon-list {
    display: flex;
    flex-wrap: wrap;
    max-height: 300px;
    overflow-y: auto;
    
    .icon-item {
      width: 80px;
      height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border-radius: 4px;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      .el-icon {
        font-size: 24px;
        margin-bottom: 5px;
      }
      
      .icon-name {
        font-size: 12px;
        color: #606266;
        text-align: center;
        word-break: break-all;
      }
    }
  }
}
</style>