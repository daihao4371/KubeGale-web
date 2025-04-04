import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getMenuList, 
  createMenu, 
  updateMenu, 
  deleteMenu,
  type MenuInfo, 
  type MetaField,
  type ApiResponse,
  type PageResponse
} from '@/api/system/menuManage'

export function useMenus() {
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

  // 获取菜单列表
  const fetchMenuList = async () => {
    loading.value = true
    try {
      // 构建请求参数
      const params = {
        name: searchForm.name,
        path: searchForm.path
      }
      
      // 调用API获取菜单列表
      const response = await getMenuList(params)
      
      if (response.data.code === 0) {
        // 请求成功
        const responseData = response.data.data as PageResponse<MenuInfo>
        menuList.value = responseData.list || []
        console.log('菜单列表数据:', menuList.value)
        
        // 更新父级菜单选项
        updateParentMenuOptions()
      } else {
        // 请求失败
        ElMessage.error(response.data.msg || '获取菜单列表失败')
      }
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

  return {
    searchForm,
    menuList,
    loading,
    dialogVisible,
    isEdit,
    form,
    rules,
    formRef,
    parentMenuOptions,
    iconList,
    selectIcon,
    formatDate,
    handleSearch,
    resetSearch,
    handleAdd,
    handleEdit,
    handleSubmit,
    handleDelete
  }
}