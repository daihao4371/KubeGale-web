import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getAllApis, 
  getApiList, 
  createApi, 
  updateApi, 
  deleteApi,
  type ApiInfo,
  type PageResponse
} from '@/api/system/api/api'

export function useApi() {
  // 搜索表单
  const searchForm = reactive({
    path: '',
    method: '',
    apiGroup: '',
    description: ''
  })

  // API列表数据
  const apiList = ref<ApiInfo[]>([])
  const loading = ref(false)
  
  // 分页配置
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // 对话框控制
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增API')
  const dialogLoading = ref(false)
  
  // 当前编辑的API
  const currentApi = reactive<Partial<ApiInfo>>({
    ID: 0,
    path: '',
    description: '',
    apiGroup: '',
    method: 'GET'
    // 不需要name字段
  })
  
  // 是否为编辑模式
  const isEdit = ref(false)

  // 获取API列表
  const fetchApiList = async () => {
    loading.value = true
    try {
      // 构建请求参数
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...searchForm
      }
      
      // 调用API获取列表
      const response = await getApiList(params)
      
      if (response.data.code === 0) {
        // 请求成功
        const responseData = response.data.data as PageResponse<ApiInfo>
        apiList.value = responseData.list || []
        pagination.total = responseData.total
      } else {
        // 请求失败
        ElMessage.error(response.data.msg || '获取API列表失败')
      }
    } catch (error) {
      console.error('获取API列表失败:', error)
      ElMessage.error('获取API列表失败，请重试')
    } finally {
      loading.value = false
    }
  }

  // 获取所有API（不分页）
  const fetchAllApis = async () => {
    loading.value = true
    try {
      const response = await getAllApis()
      
      if (response.data.code === 0) {
        // 请求成功
        apiList.value = response.data.data.apis || []
        pagination.total = apiList.value.length
      } else {
        // 请求失败
        ElMessage.error(response.data.msg || '获取API列表失败')
      }
    } catch (error) {
      console.error('获取API列表失败:', error)
      ElMessage.error('获取API列表失败，请重试')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.page = 1 // 重置到第一页
    fetchApiList()
  }

  // 重置搜索
  const resetSearch = () => {
    // 重置搜索表单
    searchForm.path = ''
    searchForm.method = ''
    searchForm.apiGroup = ''
    searchForm.description = ''
    
    pagination.page = 1 // 重置到第一页
    fetchApiList()
  }

  // 处理分页变化
  const handlePageChange = (page: number) => {
    pagination.page = page
    fetchApiList()
  }

  // 处理每页条数变化
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.page = 1 // 重置到第一页
    fetchApiList()
  }

  // 打开新增对话框
  const openAddDialog = () => {
    isEdit.value = false
    dialogTitle.value = '新增API'
    
    // 重置表单
    currentApi.ID = 0
    currentApi.path = ''
    currentApi.description = ''
    currentApi.apiGroup = ''
    currentApi.method = 'GET'
    
    dialogVisible.value = true
  }

  // 打开编辑对话框
  const openEditDialog = (api: ApiInfo) => {
    isEdit.value = true
    dialogTitle.value = '编辑API'
    
    // 填充表单
    currentApi.ID = api.ID
    currentApi.path = api.path
    currentApi.description = api.description
    currentApi.apiGroup = api.apiGroup
    currentApi.method = api.method
    
    dialogVisible.value = true
  }

  // 关闭对话框
  const closeDialog = () => {
    dialogVisible.value = false
  }

  // 提交表单
  const submitForm = async () => {
    // 表单验证
    if (!currentApi.path) {
      ElMessage.warning('请输入API路径')
      return
    }
    
    if (!currentApi.method) {
      ElMessage.warning('请选择请求方法')
      return
    }
    
    if (!currentApi.apiGroup) {
      ElMessage.warning('请输入API分组')
      return
    }
    
    dialogLoading.value = true
    
    try {
      let response
      
      if (isEdit.value) {
        // 编辑模式
        response = await updateApi(currentApi)
      } else {
        // 新增模式
        response = await createApi(currentApi)
      }
      
      if (response.data.code === 0) {
        ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
        closeDialog()
        fetchApiList() // 刷新列表
      } else {
        ElMessage.error(response.data.msg || (isEdit.value ? '更新失败' : '添加失败'))
      }
    } catch (error) {
      console.error(isEdit.value ? '更新API失败:' : '添加API失败:', error)
      ElMessage.error(isEdit.value ? '更新API失败，请重试' : '添加API失败，请重试')
    } finally {
      dialogLoading.value = false
    }
  }

  // 删除API
  const handleDelete = (api: ApiInfo) => {
    ElMessageBox.confirm(
      `确定要删除API "${api.path}" 吗？此操作不可恢复`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        const response = await deleteApi(api.ID)
        
        if (response.data.code === 0) {
          ElMessage.success('删除成功')
          fetchApiList() // 刷新列表
        } else {
          ElMessage.error(response.data.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除API失败:', error)
        ElMessage.error('删除API失败，请重试')
      }
    }).catch(() => {
      // 用户取消删除，不做任何操作
    })
  }

  // 获取请求方法类型（用于显示不同颜色的标签）
  const getMethodType = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'success'
      case 'POST': return 'primary'
      case 'PUT': return 'warning'
      case 'DELETE': return 'danger'
      default: return 'info'
    }
  }

  // 在组件挂载时获取API列表
  onMounted(() => {
    fetchApiList()
  })

  return {
    // 数据
    searchForm,
    apiList,
    loading,
    pagination,
    dialogVisible,
    dialogTitle,
    dialogLoading,
    currentApi,
    isEdit,
    
    // 方法
    fetchApiList,
    fetchAllApis,
    handleSearch,
    resetSearch,
    handlePageChange,
    handleSizeChange,
    openAddDialog,
    openEditDialog,
    closeDialog,
    submitForm,
    handleDelete,
    
    // 辅助函数
    getMethodType
  }
}